-- Zero historical money movement without changing tariffs or product prices.
--
-- This resets already-recorded session payments, cashier/shop sales,
-- expenses, withdrawals, shift money totals, customer spend totals, and
-- audit-log amounts. It intentionally does NOT update:
--   - tariffs.price / weekday_price / weekend_price
--   - products.price / products.cost
--   - inventory stock quantities
--
-- Run on the target database only after taking a backup.

BEGIN;

UPDATE sessions
SET
  session_amount = 0,
  added_time_amount = 0,
  shop_amount = 0,
  total_amount = 0,
  paid_amount = 0,
  debt_amount = 0,
  hourly_rate = 0,
  updated_at = NOW();

UPDATE payments
SET
  amount = 0,
  cash_amount = 0,
  card_amount = 0,
  qr_amount = 0,
  balance_amount = 0,
  received_amount = CASE WHEN received_amount IS NULL THEN NULL ELSE 0 END,
  change_amount = 0;

UPDATE sales
SET
  subtotal = 0,
  discount = 0,
  total = 0,
  total_cost = 0,
  profit = 0;

UPDATE sale_items
SET
  unit_price = 0,
  unit_cost = 0,
  total_price = 0,
  total_cost = 0,
  profit = 0;

UPDATE expenses
SET amount = 0;

UPDATE shift_withdrawals
SET amount = 0;

UPDATE cash_withdrawal_requests
SET amount = 0;

UPDATE admin_deductions
SET amount = 0;

UPDATE admin_penalty_payments
SET
  amount = 0,
  cash_amount = 0,
  card_amount = 0,
  qr_amount = 0,
  received_amount = CASE WHEN received_amount IS NULL THEN NULL ELSE 0 END,
  change_amount = 0;

UPDATE shifts
SET
  expected_cash = 0,
  actual_cash = CASE WHEN actual_cash IS NULL THEN NULL ELSE 0 END,
  card_total = 0,
  qr_total = 0,
  product_sales = 0,
  session_sales = 0,
  refunds = 0,
  difference = 0,
  cash_sales = 0,
  balance_sales = 0,
  total_revenue = 0,
  cash_withdrawn = 0,
  card_withdrawn = 0,
  bank_withdrawn = 0,
  remaining_cash = 0,
  updated_at = NOW();

UPDATE customers
SET
  total_spent = 0,
  updated_at = NOW();

UPDATE repair_requests
SET
  revenue_impact = 0,
  charge_amount = 0,
  updated_at = NOW();

UPDATE logs
SET amount = 0
WHERE amount IS NOT NULL;

COMMIT;

-- Verification: all should return 0.
SELECT 'payments.amount' AS metric, COALESCE(SUM(amount), 0) AS total FROM payments
UNION ALL SELECT 'sessions.total_amount', COALESCE(SUM(total_amount), 0) FROM sessions
UNION ALL SELECT 'sessions.paid_amount', COALESCE(SUM(paid_amount), 0) FROM sessions
UNION ALL SELECT 'sales.total', COALESCE(SUM(total), 0) FROM sales
UNION ALL SELECT 'sale_items.total_price', COALESCE(SUM(total_price), 0) FROM sale_items
UNION ALL SELECT 'expenses.amount', COALESCE(SUM(amount), 0) FROM expenses
UNION ALL SELECT 'shift_withdrawals.amount', COALESCE(SUM(amount), 0) FROM shift_withdrawals
UNION ALL SELECT 'cash_withdrawal_requests.amount', COALESCE(SUM(amount), 0) FROM cash_withdrawal_requests
UNION ALL SELECT 'admin_deductions.amount', COALESCE(SUM(amount), 0) FROM admin_deductions
UNION ALL SELECT 'admin_penalty_payments.amount', COALESCE(SUM(amount), 0) FROM admin_penalty_payments
UNION ALL SELECT 'shifts.total_revenue', COALESCE(SUM(total_revenue), 0) FROM shifts
UNION ALL SELECT 'customers.total_spent', COALESCE(SUM(total_spent), 0) FROM customers
UNION ALL SELECT 'repair_requests.charge_amount', COALESCE(SUM(charge_amount), 0) FROM repair_requests
UNION ALL SELECT 'logs.amount', COALESCE(SUM(amount), 0) FROM logs;
