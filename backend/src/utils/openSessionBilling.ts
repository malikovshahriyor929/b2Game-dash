export function openSessionAmountSql(sessionAlias = "sess", endExpression = "now()") {
  return `coalesce((
    with base_tariff as (
      select *
      from tariffs
      where id = ${sessionAlias}.tariff_id
      limit 1
    ),
    bounds as (
      select
        (${sessionAlias}.started_at at time zone 'Asia/Tashkent') as start_local,
        (${endExpression} at time zone 'Asia/Tashkent') as end_local
    ),
    days as (
      select generate_series(
        date_trunc('day', (select start_local from bounds)) - interval '1 day',
        date_trunc('day', (select end_local from bounds)),
        interval '1 day'
      ) as day_start
    ),
    matching_tariffs as (
      select t.*
      from tariffs t
      join base_tariff b on true
      where t.is_active = true
        and t.branch_id is not distinct from b.branch_id
        and t.simulator_zone = b.simulator_zone
        and lower(trim(t.name)) = lower(trim(b.name))
        and lower(t.type) = lower(b.type)
        and t.duration_minutes = b.duration_minutes
    ),
    windows as (
      select
        t.*,
        d.day_start,
        case
          when t.available_from is null or t.available_until is null then d.day_start
          else d.day_start + (t.available_from - time '00:00')
        end as window_start,
        case
          when t.available_from is null or t.available_until is null then d.day_start + interval '1 day'
          when t.available_from <= t.available_until then d.day_start + (t.available_until - time '00:00')
          else d.day_start + interval '1 day' + (t.available_until - time '00:00')
        end as window_end
      from matching_tariffs t
      cross join days d
      where cardinality(t.available_days) = 0
         or extract(isodow from d.day_start)::int = any(t.available_days)
    ),
    overlap_windows as (
      select
        greatest(w.window_start, b.start_local) as overlap_start,
        least(w.window_end, b.end_local) as overlap_end,
        case
          when extract(isodow from w.day_start)::int in (6, 7) then coalesce(w.weekend_price, w.weekday_price, w.price)
          else coalesce(w.weekday_price, w.weekend_price, w.price)
        end as hourly_price
      from windows w
      cross join bounds b
      where w.window_end > b.start_local
        and w.window_start < b.end_local
    )
    select round(sum(ceil(extract(epoch from (overlap_end - overlap_start)) / 60.0) * hourly_price / 60.0))
    from overlap_windows
    where overlap_end > overlap_start
  ), round(ceil(extract(epoch from (${endExpression} - ${sessionAlias}.started_at)) / 60.0) * ${sessionAlias}.hourly_rate / 60.0))`;
}

export function openSessionSegmentsSql(sessionAlias = "sess", endExpression = "now()") {
  return `coalesce((
    with base_tariff as (
      select *
      from tariffs
      where id = ${sessionAlias}.tariff_id
      limit 1
    ),
    bounds as (
      select
        (${sessionAlias}.started_at at time zone 'Asia/Tashkent') as start_local,
        (${endExpression} at time zone 'Asia/Tashkent') as end_local
    ),
    days as (
      select generate_series(
        date_trunc('day', (select start_local from bounds)) - interval '1 day',
        date_trunc('day', (select end_local from bounds)),
        interval '1 day'
      ) as day_start
    ),
    matching_tariffs as (
      select t.*
      from tariffs t
      join base_tariff b on true
      where t.is_active = true
        and t.branch_id is not distinct from b.branch_id
        and t.simulator_zone = b.simulator_zone
        and lower(trim(t.name)) = lower(trim(b.name))
        and lower(t.type) = lower(b.type)
        and t.duration_minutes = b.duration_minutes
    ),
    windows as (
      select
        t.*,
        d.day_start,
        case
          when t.available_from is null or t.available_until is null then d.day_start
          else d.day_start + (t.available_from - time '00:00')
        end as window_start,
        case
          when t.available_from is null or t.available_until is null then d.day_start + interval '1 day'
          when t.available_from <= t.available_until then d.day_start + (t.available_until - time '00:00')
          else d.day_start + interval '1 day' + (t.available_until - time '00:00')
        end as window_end
      from matching_tariffs t
      cross join days d
      where cardinality(t.available_days) = 0
         or extract(isodow from d.day_start)::int = any(t.available_days)
    ),
    overlap_windows as (
      select
        greatest(w.window_start, b.start_local) as overlap_start,
        least(w.window_end, b.end_local) as overlap_end,
        w.name as tariff_name,
        coalesce(w.availability_label, w.name) as period_label,
        case
          when extract(isodow from w.day_start)::int in (6, 7) then coalesce(w.weekend_price, w.weekday_price, w.price)
          else coalesce(w.weekday_price, w.weekend_price, w.price)
        end as hourly_price
      from windows w
      cross join bounds b
      where w.window_end > b.start_local
        and w.window_start < b.end_local
    ),
    segments as (
      select
        overlap_start,
        overlap_end,
        tariff_name,
        period_label,
        ceil(extract(epoch from (overlap_end - overlap_start)) / 60.0)::int as minutes,
        hourly_price,
        round(ceil(extract(epoch from (overlap_end - overlap_start)) / 60.0) * hourly_price / 60.0) as amount
      from overlap_windows
      where overlap_end > overlap_start
    )
    select jsonb_agg(jsonb_build_object(
      'from', to_char(overlap_start, 'HH24:MI'),
      'until', to_char(overlap_end, 'HH24:MI'),
      'tariffName', tariff_name,
      'label', period_label,
      'minutes', minutes,
      'hourlyPrice', hourly_price,
      'amount', amount
    ) order by overlap_start)
    from segments
  ), jsonb_build_array(jsonb_build_object(
    'from', to_char(${sessionAlias}.started_at at time zone 'Asia/Tashkent', 'HH24:MI'),
    'until', to_char(${endExpression} at time zone 'Asia/Tashkent', 'HH24:MI'),
    'tariffName', coalesce((select name from tariffs where id = ${sessionAlias}.tariff_id limit 1), 'VIP'),
    'label', 'VIP',
    'minutes', ceil(extract(epoch from (${endExpression} - ${sessionAlias}.started_at)) / 60.0)::int,
    'hourlyPrice', ${sessionAlias}.hourly_rate,
    'amount', round(ceil(extract(epoch from (${endExpression} - ${sessionAlias}.started_at)) / 60.0) * ${sessionAlias}.hourly_rate / 60.0)
  )))`;
}
