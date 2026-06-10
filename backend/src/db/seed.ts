import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { pool, tx } from "./pool";
import { auditLog } from "../services/auditLog.service";

const branches = [
  ["B2 Main Arena", "MAIN", "Main Arena"],
] as const;

const products = [
  ["Coca-Cola 0.5", "Drinks", "4780001000011", 9000, 6000, 48],
  ["Water 0.5", "Drinks", "4780001000028", 5000, 2500, 80],
  ["Burger", "Food", "4780001000035", 25000, 17000, 12],
  ["Energy Drink", "Drinks", "4780001000042", 15000, 10000, 25],
  ["Chips", "Snacks", "4780001000059", 12000, 8000, 35],
  ["Snickers", "Snacks", "4780001000066", 10000, 6500, 44],
] as const;

const tariffs = [
  ["Logitech 1 soat", "main", 60, 40000, 50000, null, null, "time"],
  ["Logitech 3 soat", "main", 180, 100000, 130000, null, null, "package"],
  ["Logitech 5 soat", "main", 300, 150000, 200000, null, "energetik", "package"],
  ["Logitech tungi zaezd", "main", 480, 250000, 350000, null, "energetik", "night"],
  ["Moza 1 soat", "vip", 60, 80000, 100000, null, null, "time"],
  ["Moza 3 soat", "vip", 180, 200000, 250000, null, "energetik", "package"],
  ["Moza 5 soat", "vip", 300, 300000, 300000, null, "energetik + chips", "package"],
  ["Moza tungi zaezd", "vip", 480, 500000, 500000, "energetik", "energetik", "night"],
] as const;

const removedBranchAdminEmails = [
  "admin.yunusabad@b2game.uz",
  "admin.chilonzor@b2game.uz",
  "admin.sergeli@b2game.uz",
  "admin.samarqand@b2game.uz",
] as const;

async function upsertUser(name: string, email: string, password: string, role: "admin" | "super_admin", branchId: string | null) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `insert into users(name,email,password_hash,role,branch_id)
     values($1,$2,$3,$4,$5)
     on conflict(email) do update set name=excluded.name, password_hash=excluded.password_hash, role=excluded.role, branch_id=excluded.branch_id, is_active=true
     returning *`,
    [name, email, hash, role, branchId],
  );
  return rows[0];
}

async function pruneNonMainBranches(client: PoolClient) {
  const extraBranchFilter = "select id from branches where code <> 'MAIN'";

  await client.query(`delete from sale_items where sale_id in (select id from sales where branch_id in (${extraBranchFilter}))`);
  await client.query(`delete from payments where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from sales where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from sessions where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from repair_requests where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from bookings where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from shifts where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from inventory_movements where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from inventory where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from rig_connections where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from simulators where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from tariffs where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from customers where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from logs where branch_id in (${extraBranchFilter})`);
  await client.query(`delete from settings where branch_id in (${extraBranchFilter})`);
  await client.query(
    `delete from users where branch_id in (${extraBranchFilter}) or email = any($1::text[])`,
    [removedBranchAdminEmails],
  );
  await client.query("delete from branches where code <> 'MAIN'");
}

async function run() {
  await pool.query("create extension if not exists pgcrypto");
  await tx(async (client) => {
    await pruneNonMainBranches(client);

    const branchRows: Record<string, string> = {};
    for (const [name, code, address] of branches) {
      const { rows } = await client.query(
        `insert into branches(name, code, address, phone, status)
         values($1,$2,$3,$4,'active')
         on conflict(code) do update set name=excluded.name, address=excluded.address, phone=excluded.phone
         returning id, code`,
        [name, code, address, "+998900000000"],
      );
      branchRows[rows[0].code] = rows[0].id;
    }

    await upsertUser("Super Admin", "superadmin@b2game.uz", "12345678", "super_admin", null);
    await upsertUser("Main Admin", "admin.main@b2game.uz", "admin123", "admin", branchRows.MAIN);
    await upsertUser("Yunusabad Admin", "admin.yunusabad@b2game.uz", "admin123", "admin", branchRows.YUNUSABAD);
    await upsertUser("Chilonzor Admin", "admin.chilonzor@b2game.uz", "admin123", "admin", branchRows.CHILONZOR);
    await upsertUser("Sergeli Admin", "admin.sergeli@b2game.uz", "admin123", "admin", branchRows.SERGELI);
    const samarqandAdmin = await upsertUser("Samarqand Admin", "admin.samarqand@b2game.uz", "admin123", "admin", branchRows.SAMARQAND);

    for (const [code, branchId] of Object.entries(branchRows)) {
      await client.query("update tariffs set is_active=false where branch_id=$1", [branchId]);
      for (const [name, zone, duration, weekdayPrice, weekendPrice, weekdayBonus, weekendBonus, type] of tariffs) {
        await client.query(
          `insert into tariffs(branch_id,name,simulator_zone,duration_minutes,price,weekday_price,weekend_price,weekday_bonus,weekend_bonus,type,is_active)
           values($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,true)`,
          [branchId, name, zone, duration, weekdayPrice, weekendPrice, weekdayBonus, weekendBonus, type],
        );
      }

    for (let i = 1; i <= 16; i++) {
      const n = String(i).padStart(2, "0");
      await client.query(
        `insert into simulators(branch_id,name,code,zone,simulator_type,status,device_id,ip_address)
         values($1,$2,$2,'main','main','ready_to_play',$3,$4)
         on conflict(branch_id, code) do update set name=excluded.name, device_id=excluded.device_id`,
        [mainBranchId, `MAIN-${n}`, `MAIN-MAIN-${n}`, `192.168.${i}.10`],
      );
    }
    for (let i = 1; i <= 4; i++) {
      const n = String(i).padStart(2, "0");
      await client.query(
        `insert into simulators(branch_id,name,code,zone,simulator_type,status,device_id,ip_address)
         values($1,$2,$2,'vip','vip','ready_to_play',$3,$4)
         on conflict(branch_id, code) do update set name=excluded.name, device_id=excluded.device_id`,
        [mainBranchId, `VIP-${n}`, `MAIN-VIP-${n}`, `192.168.${i}.80`],
      );
    }

    const productIds: string[] = [];
    for (const [name, category, barcode, price, cost] of products) {
      const { rows } = await client.query(
        `insert into products(name,category,barcode,price,cost,is_active)
         values($1,$2,$3,$4,$5,true)
         on conflict(barcode) do update set name=excluded.name, category=excluded.category, price=excluded.price, cost=excluded.cost
         returning id`,
        [name, category, barcode, price, cost],
      );
      productIds.push(rows[0].id);
    }

    for (let i = 0; i < productIds.length; i++) {
      await client.query(
        `insert into inventory(branch_id,product_id,stock_quantity,low_stock_threshold)
         values($1,$2,$3,5)
         on conflict(branch_id, product_id) do update set stock_quantity=excluded.stock_quantity`,
        [mainBranchId, productIds[i], products[i][5]],
      );
    }

    const admin = (await client.query("select * from users where email='admin.main@b2game.uz'")).rows[0];
    const sim = (await client.query("select * from simulators where branch_id=$1 and code='MAIN-01'", [mainBranchId])).rows[0];
    const tariff = (await client.query("select * from tariffs where branch_id=$1 and name='Logitech 1 soat'", [mainBranchId])).rows[0];
    const customer = (await client.query(
      `insert into customers(branch_id,name,phone,total_spent,sessions_count,status,last_visit_at)
       values($1,'Aziz','998901112233',50000,1,'active',now())
       on conflict do nothing returning *`,
      [mainBranchId],
    )).rows[0] ?? (await client.query("select * from customers where branch_id=$1 limit 1", [mainBranchId])).rows[0];

    const session = (await client.query(
      `insert into sessions(branch_id, simulator_id, customer_id, customer_name, phone, tariff_id, status, payment_mode, duration_minutes, remaining_seconds, session_amount, total_amount, paid_amount, debt_amount, created_by)
       values($1,$2,$3,$4,$5,$6,'active','prepaid',60,3600,40000,40000,40000,0,$7)
       returning *`,
      [mainBranchId, sim.id, customer.id, customer.name, customer.phone, tariff.id, admin.id],
    )).rows[0];
    await client.query("update simulators set status='busy', current_session_id=$1 where id=$2", [session.id, sim.id]);
    await client.query(
      `insert into payments(branch_id, session_id, customer_id, amount, method, card_amount, paid_by_admin_id)
       values($1,$2,$3,40000,'card',40000,$4)`,
      [mainBranchId, session.id, customer.id, admin.id],
    );

    const product = (await client.query("select * from products where barcode='4780001000011'")).rows[0];
    const sale = (await client.query(
      `insert into sales(branch_id, session_id, customer_id, sold_by, subtotal, discount, total, total_cost, profit, payment_status, payment_method, paid_at)
       values($1,$2,$3,$4,18000,0,18000,12000,6000,'paid','cash',now()) returning *`,
      [mainBranchId, session.id, customer.id, admin.id],
    )).rows[0];
    await client.query(
      `insert into sale_items(sale_id,product_id,product_name,barcode,quantity,unit_price,unit_cost,total_price,total_cost,profit)
       values($1,$2,$3,$4,2,9000,6000,18000,12000,6000)`,
      [sale.id, product.id, product.name, product.barcode],
    );
    await client.query(
      `insert into payments(branch_id, sale_id, customer_id, amount, method, cash_amount, paid_by_admin_id)
       values($1,$2,$3,18000,'cash',18000,$4)`,
      [mainBranchId, sale.id, customer.id, admin.id],
    );

    const sim2 = (await client.query("select * from simulators where branch_id=$1 and code='MAIN-05'", [mainBranchId])).rows[0];
    const repair = (await client.query(
      `insert into repair_requests(branch_id,simulator_id,requested_by,title,description,error_type,priority,status,revenue_impact)
       values($1,$2,$3,'Wheel calibration error','Wheel calibration fails on launch','device_error','high','requested',50000)
       returning *`,
      [mainBranchId, sim2.id, admin.id],
    )).rows[0];
    await client.query("update simulators set status='repair_requested' where id=$1", [sim2.id]);
    await client.query(
      `insert into bookings(branch_id,simulator_id,booking_type,customer_name,phone,start_time,end_time,status,note,created_by)
       values($1,$2,'customer_booking','Bekzod','998901234567',now() + interval '2 hours',now() + interval '3 hours','confirmed','Two players',$3)`,
      [mainBranchId, sim2.id, admin.id],
    );
    await client.query(
      `insert into shifts(branch_id, opened_by, status, starting_cash, expected_cash, card_total, product_sales, session_sales, opened_at)
       values($1,$2,'open',200000,218000,50000,18000,50000,now()) on conflict do nothing`,
      [mainBranchId, admin.id],
    );

    await auditLog({ branch_id: mainBranchId, actor: { user_id: admin.id, role: admin.role, branch_id: admin.branch_id, email: admin.email, name: admin.name }, action_type: "start_session", entity_type: "session", entity_id: session.id, simulator_id: sim.id, session_id: session.id, amount: 50000, details: { seeded: true } }, client);
    await auditLog({ branch_id: mainBranchId, actor: { user_id: admin.id, role: admin.role, branch_id: admin.branch_id, email: admin.email, name: admin.name }, action_type: "repair_requested", entity_type: "repair_request", entity_id: repair.id, simulator_id: sim2.id, details: { seeded: true } }, client);
  });

  const flight = await pool.query("select count(*)::int as count from simulators where code ilike '%flight%' or name ilike '%flight%'");
  if (flight.rows[0].count !== 0) throw new Error("FLIGHT simulator seed violation");
  console.log("seed complete");
}

run().then(() => pool.end()).catch((error) => {
  console.error(error);
  pool.end().finally(() => process.exit(1));
});
