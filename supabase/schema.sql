-- =============================================================
-- 智能旅游规划 Agent 平台 · 数据库结构
-- 对应 PRD 第 6 节五张表，在 Supabase SQL Editor 中整体执行一次
-- =============================================================

-- 行程计划主表（扩展列：tagline / tips / budget_breakdown 存摘要与预算拆分）
create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  origin text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric not null,
  preferences jsonb not null default '[]'::jsonb,
  pace text not null default 'standard',
  status text not null default 'draft',
  tagline text,
  tips jsonb not null default '[]'::jsonb,
  budget_breakdown jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 行程按天
create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans (id) on delete cascade,
  day_index int not null,
  title text,
  summary text,
  day_budget numeric
);

-- 每天条目
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days (id) on delete cascade,
  start_time text,
  end_time text,
  place_name text,
  category text,
  notes text,
  estimated_cost numeric,
  sort_index int not null default 0
);

-- 规划任务日志（失败时 trip_plan_id 允许为空）
create table if not exists public.planner_runs (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references public.trip_plans (id) on delete set null,
  provider text,
  latency_ms int,
  status text not null,
  error_message text,
  created_at timestamptz not null default now()
);

-- 用户反馈
create table if not exists public.trip_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score int not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 索引
-- ------------------------------------------------------------
create index if not exists idx_trip_plans_user on public.trip_plans (user_id, created_at desc);
create index if not exists idx_itinerary_days_plan on public.itinerary_days (trip_plan_id, day_index);
create index if not exists idx_itinerary_items_day on public.itinerary_items (itinerary_day_id, sort_index);
create index if not exists idx_planner_runs_plan on public.planner_runs (trip_plan_id);
create index if not exists idx_planner_runs_created on public.planner_runs (created_at desc);

-- ------------------------------------------------------------
-- RLS：用户只能访问自己的数据
-- ------------------------------------------------------------
alter table public.trip_plans enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.planner_runs enable row level security;
alter table public.trip_feedback enable row level security;

-- trip_plans
create policy "own trip_plans select" on public.trip_plans
  for select using (auth.uid() = user_id);
create policy "own trip_plans insert" on public.trip_plans
  for insert with check (auth.uid() = user_id);
create policy "own trip_plans update" on public.trip_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trip_plans delete" on public.trip_plans
  for delete using (auth.uid() = user_id);

-- itinerary_days（归属校验走父表）
create policy "own itinerary_days select" on public.itinerary_days
  for select using (
    exists (select 1 from public.trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid())
  );
create policy "own itinerary_days insert" on public.itinerary_days
  for insert with check (
    exists (select 1 from public.trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid())
  );
create policy "own itinerary_days delete" on public.itinerary_days
  for delete using (
    exists (select 1 from public.trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid())
  );

-- itinerary_items（归属校验走祖父表）
create policy "own itinerary_items select" on public.itinerary_items
  for select using (
    exists (
      select 1 from public.itinerary_days d
      join public.trip_plans p on p.id = d.trip_plan_id
      where d.id = itinerary_day_id and p.user_id = auth.uid()
    )
  );
create policy "own itinerary_items insert" on public.itinerary_items
  for insert with check (
    exists (
      select 1 from public.itinerary_days d
      join public.trip_plans p on p.id = d.trip_plan_id
      where d.id = itinerary_day_id and p.user_id = auth.uid()
    )
  );
create policy "own itinerary_items delete" on public.itinerary_items
  for delete using (
    exists (
      select 1 from public.itinerary_days d
      join public.trip_plans p on p.id = d.trip_plan_id
      where d.id = itinerary_day_id and p.user_id = auth.uid()
    )
  );

-- planner_runs：登录用户可写自己的日志（trip_plan_id 为空代表失败未成单）
create policy "own planner_runs select" on public.planner_runs
  for select using (
    trip_plan_id is null
    or exists (select 1 from public.trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid())
  );
create policy "own planner_runs insert" on public.planner_runs
  for insert with check (
    trip_plan_id is null
    or exists (select 1 from public.trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid())
  );

-- trip_feedback
create policy "own trip_feedback select" on public.trip_feedback
  for select using (auth.uid() = user_id);
create policy "own trip_feedback insert" on public.trip_feedback
  for insert with check (auth.uid() = user_id);
