-- =============================================================
-- 增量脚本：管理后台与导出支持
-- 在 Supabase SQL Editor 执行（schema.sql 之后执行一次）
-- 执行后请把自己的管理员邮箱插入白名单：
--   insert into public.admin_emails (email) values ('you@example.com');
-- =============================================================

-- 导出时间戳（统计导出次数）
alter table public.trip_plans add column if not exists exported_at timestamptz;

-- 管理员白名单（DB 内维护；无 RLS policy，普通查询拒绝，仅 security definer 函数可读）
create table if not exists public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;

-- 判定当前登录用户是否管理员
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

-- 管理后台聚合数据（非管理员调用直接 403）
create or replace function public.admin_dashboard(p_days int default 7)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  v_result json;
begin
  if not is_admin() then
    raise insufficient_privilege;
  end if;

  select json_build_object(
    'windowDays', p_days,
    'metrics', json_build_object(
      'totalRuns',    (select count(*)::int from planner_runs where created_at >= v_since),
      'successRuns',  (select count(*)::int from planner_runs where created_at >= v_since and status = 'success'),
      'failedRuns',   (select count(*)::int from planner_runs where created_at >= v_since and status = 'failed'),
      'avgLatencyMs', coalesce((select round(avg(latency_ms))::int from planner_runs where created_at >= v_since and status = 'success'), 0),
      'todayRuns',    (select count(*)::int from planner_runs where created_at >= date_trunc('day', now())),
      'exportCount',  (select count(*)::int from trip_plans where exported_at >= v_since),
      'totalTrips',   (select count(*)::int from trip_plans)
    ),
    'hotDestinations', coalesce((
      select json_agg(x) from (
        select destination as name, count(*)::int as count
        from trip_plans group by destination order by count desc, name limit 8
      ) x
    ), '[]'::json),
    'ratingDistribution', coalesce((
      select json_agg(x) from (
        select score as star, count(*)::int as count
        from trip_feedback group by score order by score desc
      ) x
    ), '[]'::json),
    'runs', coalesce((
      select json_agg(x) from (
        select r.id, p.destination, r.provider, r.latency_ms,
               r.status, r.error_message, r.created_at
        from planner_runs r
        left join trip_plans p on p.id = r.trip_plan_id
        order by r.created_at desc
        limit 50
      ) x
    ), '[]'::json),
    'feedback', coalesce((
      select json_agg(x) from (
        select f.id, f.score, f.comment, f.created_at, p.destination,
               left(split_part(coalesce(u.email, '匿名'), '@', 1), 2) || '**' as user
        from trip_feedback f
        join trip_plans p on p.id = f.trip_plan_id
        left join auth.users u on u.id = f.user_id
        order by f.created_at desc
        limit 30
      ) x
    ), '[]'::json)
  ) into v_result;

  return v_result;
end $$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_dashboard(int) to authenticated;
