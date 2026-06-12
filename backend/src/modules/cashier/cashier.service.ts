import { Request } from "express";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/apiError";
import { auditLog } from "../../services/auditLog.service";
import { broadcastDashboard } from "../../websocket/dashboardConnection.manager";
import { requireOpenShift } from "../shifts/shift.guard";

function branchId(req: Request) {
  const value = req.user?.role === "admin" ? req.user.branch_id : req.body.branch_id ?? req.query.branch_id;
  return value === "all" ? null : value;
}
export async function products(req: Request) {
  return prisma.$queryRawUnsafe(
    "select p.*, i.stock_quantity, i.branch_id from products p join inventory i on i.product_id=p.id where ($1::uuid is null or i.branch_id=$1::uuid) and p.is_active=true order by p.name",
    branchId(req),
  );
}
export async function scan(req: Request) { const rows=await prisma.$queryRawUnsafe<any[]>("select p.*, i.stock_quantity, i.low_stock_threshold from products p join inventory i on i.product_id=p.id where p.barcode=$1 and i.branch_id=$2::uuid", req.body.barcode, branchId(req)); if(!rows.length) throw new ApiError(404,"Product or inventory not found"); await auditLog({actor:req.user,branch_id:branchId(req),action_type:"product_scanned",entity_type:"product",entity_id:rows[0].id,details:{barcode:req.body.barcode}}); return {product:rows[0],inventory:{stock_quantity:rows[0].stock_quantity},available:rows[0].stock_quantity>0}; }
export async function createSale(req: Request) {
  const b=branchId(req); let subtotal=0,totalCost=0; const detail=[] as any[];
  for(const item of req.body.items){ const rows=await prisma.$queryRawUnsafe<any[]>("select p.*, i.stock_quantity from products p join inventory i on i.product_id=p.id where p.id=$1::uuid and i.branch_id=$2::uuid", item.product_id,b); const p=rows[0]; if(!p) throw new ApiError(404,"Product not found"); if(p.stock_quantity<item.quantity) throw new ApiError(409,`Insufficient stock for ${p.name}`); subtotal+=Number(p.price)*item.quantity; totalCost+=Number(p.cost)*item.quantity; detail.push({p,quantity:item.quantity}); }
  const total=subtotal-Number(req.body.discount??0), profit=total-totalCost;
  const customer = req.body.customer_id ? (await prisma.$queryRawUnsafe<any[]>("select id,name,phone,balance from customers where id=$1::uuid and branch_id=$2::uuid", req.body.customer_id, b))[0] : null;
  if (req.body.customer_id && !customer) throw new ApiError(404, "Customer not found for sale");
  const sale=(await prisma.$queryRawUnsafe<any[]>("insert into sales(branch_id,session_id,customer_id,sold_by,subtotal,discount,total,total_cost,profit,payment_status) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,'pending') returning *",b,req.body.session_id??null,req.body.customer_id??null,req.user!.user_id,subtotal,req.body.discount??0,total,totalCost,profit))[0];
  for(const d of detail) await prisma.$executeRawUnsafe("insert into sale_items(sale_id,product_id,product_name,barcode,quantity,unit_price,unit_cost,total_price,total_cost,profit) values($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10)",sale.id,d.p.id,d.p.name,d.p.barcode,d.quantity,d.p.price,d.p.cost,Number(d.p.price)*d.quantity,Number(d.p.cost)*d.quantity,(Number(d.p.price)-Number(d.p.cost))*d.quantity);
  await auditLog({
    actor:req.user,
    branch_id:b,
    action_type:"sale_created",
    entity_type:"sale",
    entity_id:sale.id,
    session_id:req.body.session_id??null,
    amount:total,
    details:{
      customer_id:sale.customer_id,
      customer_name:customer?.name ?? null,
      customer_phone:customer?.phone ?? null,
      customer_type:sale.customer_id ? "registered" : "guest",
      subtotal,
      discount:Number(req.body.discount??0),
      profit,
      items:detail.map((d)=>({product_id:d.p.id,name:d.p.name,barcode:d.p.barcode,quantity:d.quantity,unit_price:Number(d.p.price),total_price:Number(d.p.price)*d.quantity})),
    },
  }); broadcastDashboard("sale_created",sale,b); return sale;
}
export async function paySale(req: Request) {
  const sale=(await prisma.$queryRawUnsafe<any[]>("select * from sales where id=$1::uuid",req.params.id))[0];
  if(!sale) throw new ApiError(404,"Sale not found");
  if(sale.payment_status==="paid") throw new ApiError(409,"Sale already paid");
  const total=Number(req.body.cash_amount)+Number(req.body.card_amount)+Number(req.body.qr_amount)+Number(req.body.balance_amount);
  if(total!==Number(sale.total)) throw new ApiError(400,"Payment total must match sale total");
  const shiftId = await requireOpenShift(sale.branch_id);
  const receivedAmount = req.body.received_amount === undefined ? null : Number(req.body.received_amount);
  const changeAmount = Number(req.body.change_amount ?? 0);
  if (receivedAmount !== null && receivedAmount < Number(req.body.cash_amount ?? 0)) throw new ApiError(400, "Received amount cannot be less than cash amount");

  const balanceAmount = Number(req.body.balance_amount ?? 0);
  let customerBeforeBalance: number | null = null;
  let customerAfterBalance: number | null = null;
  if (balanceAmount > 0) {
    if (!sale.customer_id) throw new ApiError(400, "Balance payment requires registered customer");
    const customer = (await prisma.$queryRawUnsafe<any[]>("select id,balance from customers where id=$1::uuid and branch_id=$2::uuid", sale.customer_id, sale.branch_id))[0];
    if (!customer) throw new ApiError(404, "Customer not found for sale");
    if (Number(customer.balance) < balanceAmount) throw new ApiError(409, "Insufficient customer balance");
    customerBeforeBalance = Number(customer.balance);
    customerAfterBalance = customerBeforeBalance - balanceAmount;
    await prisma.$executeRawUnsafe("update customers set balance=balance-$1, total_spent=total_spent+$2, updated_at=now() where id=$3::uuid", balanceAmount, total, sale.customer_id);
  } else if (sale.customer_id) {
    await prisma.$executeRawUnsafe("update customers set total_spent=total_spent+$1, updated_at=now() where id=$2::uuid", total, sale.customer_id);
  }

  const items=await prisma.$queryRawUnsafe<any[]>("select * from sale_items where sale_id=$1::uuid",sale.id);
  for(const item of items){ const inv=(await prisma.$queryRawUnsafe<any[]>("select * from inventory where branch_id=$1::uuid and product_id=$2::uuid",sale.branch_id,item.product_id))[0]; await prisma.$executeRawUnsafe("update inventory set stock_quantity=stock_quantity-$1 where id=$2::uuid",item.quantity,inv.id); await prisma.$executeRawUnsafe("insert into inventory_movements(branch_id,product_id,type,quantity,before_quantity,after_quantity,reason,created_by) values($1::uuid,$2::uuid,'sale',$3,$4,$5,'sale paid',$6::uuid)",sale.branch_id,item.product_id,item.quantity,inv.stock_quantity,inv.stock_quantity-item.quantity,req.user!.user_id); }
  await prisma.$executeRawUnsafe("update sales set payment_status='paid', payment_method=$1, paid_at=now() where id=$2::uuid",req.body.method,sale.id); const payment=(await prisma.$queryRawUnsafe<any[]>("insert into payments(branch_id,shift_id,sale_id,customer_id,amount,method,cash_amount,card_amount,qr_amount,balance_amount,received_amount,change_amount,paid_by_admin_id) values($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11,$12,$13::uuid) returning *",sale.branch_id,shiftId,sale.id,sale.customer_id,total,req.body.method,req.body.cash_amount,req.body.card_amount,req.body.qr_amount,req.body.balance_amount,receivedAmount,changeAmount,req.user!.user_id))[0]; await auditLog({actor:req.user,branch_id:sale.branch_id,action_type:"payment_created",entity_type:"sale",entity_id:sale.id,amount:total,details:{payment_id:payment.id,customer_id:sale.customer_id,customer_type:sale.customer_id?"registered":"guest",method:req.body.method,cash_amount:Number(req.body.cash_amount??0),card_amount:Number(req.body.card_amount??0),balance_amount:balanceAmount,received_amount:receivedAmount,change_amount:changeAmount,balance_before:customerBeforeBalance,balance_after:customerAfterBalance,items:items.map((item)=>({product_id:item.product_id,name:item.product_name,barcode:item.barcode,quantity:item.quantity,unit_price:Number(item.unit_price),total_price:Number(item.total_price)}))}}); broadcastDashboard("inventory_updated",{sale_id:sale.id,customer_id:sale.customer_id},sale.branch_id); return {paid:true};
}
export async function sales(req: Request) { return prisma.$queryRawUnsafe("select s.*, c.name customer_name, c.phone customer_phone, u.name sold_by_name from sales s left join customers c on c.id=s.customer_id left join users u on u.id=s.sold_by where ($1::uuid is null or s.branch_id=$1::uuid) order by s.created_at desc", req.user?.role==="admin"?req.user.branch_id:req.query.branch_id==="all"?null:req.query.branch_id??null); }
export async function sale(req: Request) { return prisma.$queryRawUnsafe("select s.*, c.name customer_name, c.phone customer_phone from sales s left join customers c on c.id=s.customer_id where s.id=$1::uuid", req.params.id); }
