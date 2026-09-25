-- trip-planner 应用隔离初始化（独立 trip schema + 成员表授权）
-- 可重复执行；执行后在 Settings / API / Data API / Exposed schemas 勾选 trip

create schema if not exists trip;

revoke all on schema trip from public;
grant usage on schema trip to authenticated;

create table if not exists trip.profiles
(
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null default '',
  display_name text,
  app          text not null default 'trip-planner',
  role         text not null default 'member' check (role in ('member', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table trip.profiles enable row level security;

drop policy if exists "trip_profiles_select_self" on trip.profiles;
create policy "trip_profiles_select_self" on trip.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "trip_profiles_update_self" on trip.profiles;
create policy "trip_profiles_update_self" on trip.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke all on trip.profiles from public;
grant select, update on trip.profiles to authenticated;

create or replace function trip.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trip_profiles_touch_ts on trip.profiles;
create trigger trip_profiles_touch_ts
  before update on trip.profiles
  for each row execute function trip.touch_updated_at();

create or replace function public.handle_new_user_trip_planner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'app', '') = 'trip-planner' then
    insert into trip.profiles (id, email, display_name)
    values (
      new.id,
      coalesce(new.email, ''),
      nullif(new.raw_user_meta_data ->> 'display_name', '')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_trip_planner on auth.users;
create trigger on_auth_user_created_trip_planner
  after insert on auth.users
  for each row execute function public.handle_new_user_trip_planner();

create or replace function trip.ensure_profile(p_display_name text default null)
returns trip.profiles
language plpgsql
security definer
set search_path = trip
as $$
declare
  v_row trip.profiles;
begin
  if auth.uid() is null then
    raise exception 'trip.ensure_profile: not authenticated';
  end if;

  select * into v_row from trip.profiles where id = auth.uid();
  if found then
    return v_row;
  end if;

  insert into trip.profiles (id, email, display_name)
  values (auth.uid(), coalesce(auth.email(), ''), nullif(p_display_name, ''))
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function trip.ensure_profile(text) to authenticated;

create or replace function trip.is_app_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = trip
as $$
  select exists (select 1 from trip.profiles p where p.id = target);
$$;

create or replace function trip.is_app_admin(target uuid)
returns boolean
language sql
stable
security definer
set search_path = trip
as $$
  select exists (
    select 1 from trip.profiles p
    where p.id = target and p.role = 'admin'
  );
$$;

grant execute on function trip.is_app_member(uuid) to authenticated;
grant execute on function trip.is_app_admin(uuid) to authenticated;
