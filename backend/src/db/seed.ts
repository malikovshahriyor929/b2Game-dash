import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { pool, tx } from "./pool";

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
  ["Redbull", "Drinks", "4780001000073", 22000, 15500, 24],
] as const;

// B2 Game tariffs:
// - Soatlik tariflar vaqt oynasiga qarab chiqadi.
// - Paketlar skidka paytida ishlamaydi; 17:00 dan keyin ko'rinadi.
// available_days uses ISO weekdays (1=Dushanba ... 7=Yakshanba).
const tariffs = [
  ["Logitech 1 soat", "main", 60, 25000, null, "time", [1, 2, 3, 4], "10:00", "17:00", "Dushanba-Payshanba 10:00-17:00"],
  ["Logitech 1 soat", "main", 60, 40000, null, "time", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Logitech 1 soat", "main", 60, 50000, null, "time", [5, 6, 7], "10:00", "03:00", "Juma-Yakshanba"],
  ["Logitech 3 soat paket", "main", 180, 100000, null, "package", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Logitech 5 soat paket", "main", 300, 150000, null, "package", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Logitech tungi paket (8 soat)", "main", 480, 250000, null, "night", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Logitech 3 soat paket", "main", 180, 130000, null, "package", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
  ["Logitech 5 soat paket", "main", 300, 200000, "Energetik", "package", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
  ["Logitech tungi paket (8 soat)", "main", 480, 350000, "Redbull", "night", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
  ["Moza 1 soat", "vip", 60, 60000, null, "time", [1, 2, 3, 4], "10:00", "17:00", "Dushanba-Payshanba 10:00-17:00"],
  ["Moza 1 soat", "vip", 60, 80000, null, "time", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Moza 1 soat", "vip", 60, 100000, null, "time", [5, 6, 7], "10:00", "03:00", "Juma-Yakshanba"],
  ["Moza 3 soat paket", "vip", 180, 200000, null, "package", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Moza 5 soat paket", "vip", 300, 300000, null, "package", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Moza tungi paket (8 soat)", "vip", 480, 500000, "Energetik", "night", [1, 2, 3, 4], "17:00", "03:00", "Dushanba-Payshanba 17:00-03:00"],
  ["Moza 3 soat paket", "vip", 180, 250000, "Energetik", "package", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
  ["Moza 5 soat paket", "vip", 300, 300000, "Energetik + Chips", "package", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
  ["Moza tungi paket (8 soat)", "vip", 480, 500000, "Redbull + Chips", "night", [5, 6, 7], "17:00", "03:00", "Juma-Yakshanba 17:00-03:00"],
] as const;

const removedBranchAdminEmails = [
  "admin.yunusabad@b2game.uz",
  "admin.chilonzor@b2game.uz",
  "admin.sergeli@b2game.uz",
  "admin.samarqand@b2game.uz",
] as const;

async function upsertUser(name: string, email: string, password: string, role: "admin" | "super_admin" | "dev_admin" | "dev_super_admin", branchId: string | null) {
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

    // Hidden developer accounts — invisible to super_admin/admin in the UI and audit logs.
    await upsertUser("Dev Super Admin", "devsuper@b2game.uz", "devb2game2026", "dev_super_admin", null);
    await upsertUser("Dev Admin", "devadmin@b2game.uz", "devb2game2026", "dev_admin", branchRows.MAIN);
    await upsertUser("Super Admin", "superadmin@b2game.uz", "12345678", "super_admin", null);
    await upsertUser("Main Admin", "admin.main@b2game.uz", "admin123", "admin", branchRows.MAIN);
    await upsertUser("Main Admin", "admin@b2game.uz", "admin123", "admin", branchRows.MAIN);

    const mainBranchId = branchRows.MAIN;

    await client.query("update tariffs set is_active=false where branch_id=$1", [mainBranchId]);
    for (const [name, zone, duration, price, bonus, type, availableDays, availableFrom, availableUntil, availabilityLabel] of tariffs) {
      await client.query(
        `insert into tariffs(branch_id,name,simulator_zone,duration_minutes,price,weekday_price,weekend_price,weekday_bonus,weekend_bonus,type,available_days,available_from,available_until,availability_label,is_active)
         values($1,$2,$3,$4,$5,$5,$5,$6,$6,$7,$8::int[],$9::time,$10::time,$11,true)`,
        [mainBranchId, name, zone, duration, price, bonus, type, availableDays, availableFrom, availableUntil, availabilityLabel],
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
  });

  const flight = await pool.query("select count(*)::int as count from simulators where code ilike '%flight%' or name ilike '%flight%'");
  if (flight.rows[0].count !== 0) throw new Error("FLIGHT simulator seed violation");
  console.log("seed complete");
}

run().then(() => pool.end()).catch((error) => {
  console.error(error);
  pool.end().finally(() => process.exit(1));
});
