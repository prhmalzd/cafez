-- Caféz MVP schema. Run in a fresh Supabase project.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('manager', 'admin');
create type public.cafe_status as enum ('draft', 'pending_review', 'approved', 'suspended', 'rejected');
create type public.offer_status as enum ('draft', 'active', 'paused', 'expired');
create type public.claim_status as enum ('active', 'redeemed', 'expired', 'rejected');
create type public.promotion_status as enum ('requested', 'scheduled', 'active', 'completed', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.profile_role not null default 'manager',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cafes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 100),
  short_description text not null default '',
  description text not null default '',
  neighborhood text not null,
  address text not null,
  cafe_type text not null default 'کافه',
  price_range text not null default 'متوسط',
  phone text not null,
  instagram_url text,
  website_url text,
  map_url text,
  logo_url text,
  cover_url text,
  amenities text[] not null default '{}',
  status public.cafe_status not null default 'draft',
  featured boolean not null default false,
  rejection_note text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cafe_members (
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'owner' check (member_role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now(),
  primary key (cafe_id, user_id)
);

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  unique (cafe_id, weekday),
  check (is_closed or (opens_at is not null and closes_at is not null))
);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_toman integer not null check (price_toman >= 0),
  image_url text,
  ingredients text[] not null default '{}',
  badges text[] not null default '{}',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null,
  terms text not null default '',
  badge text not null,
  image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  valid_weekdays smallint[] not null default '{0,1,2,3,4,5,6}',
  valid_from time,
  valid_until time,
  daily_cap integer check (daily_cap is null or daily_cap > 0),
  status public.offer_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.offer_claims (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  anonymous_id_hash text not null,
  code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  status public.claim_status not null default 'active',
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  placement text not null check (placement in ('home_hero', 'home_card', 'cafes_card', 'offers_banner')),
  title text,
  image_url text,
  target_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.promotion_status not null default 'requested',
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '',
  kind text not null check (kind in ('logo', 'cover', 'gallery', 'menu_item', 'offer')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  cafe_id uuid references public.cafes(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade,
  event_type text not null check (event_type in ('profile_view', 'menu_view', 'contact_click', 'directions_click', 'offer_view', 'offer_claim', 'offer_redeem', 'promotion_impression', 'promotion_click')),
  anonymous_id_hash text,
  source text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid references public.cafes(id) on delete set null,
  actor_id uuid not null references public.profiles(id),
  action text not null,
  note text,
  previous_status public.cafe_status,
  next_status public.cafe_status,
  created_at timestamptz not null default now()
);

create index cafes_public_idx on public.cafes(status, featured, created_at desc);
create index menu_categories_cafe_idx on public.menu_categories(cafe_id, sort_order);
create index menu_items_cafe_idx on public.menu_items(cafe_id, category_id, sort_order);
create index offers_active_idx on public.offers(status, starts_at, ends_at);
create index claims_offer_created_idx on public.offer_claims(offer_id, created_at desc);
create index claims_device_idx on public.offer_claims(offer_id, anonymous_id_hash, created_at desc);
create index analytics_cafe_created_idx on public.analytics_events(cafe_id, created_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger cafes_touch before update on public.cafes for each row execute function public.touch_updated_at();
create trigger categories_touch before update on public.menu_categories for each row execute function public.touch_updated_at();
create trigger items_touch before update on public.menu_items for each row execute function public.touch_updated_at();
create trigger offers_touch before update on public.offers for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', '')); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function public.is_cafe_member(target_cafe uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cafe_members where cafe_id = target_cafe and user_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.cafes enable row level security;
alter table public.cafe_members enable row level security;
alter table public.business_hours enable row level security;
alter table public.amenities enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.offers enable row level security;
alter table public.offer_claims enable row level security;
alter table public.promotions enable row level security;
alter table public.media_assets enable row level security;
alter table public.analytics_events enable row level security;
alter table public.moderation_actions enable row level security;

create policy "profiles read self" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "public approved cafes" on public.cafes for select using (status = 'approved' or public.is_cafe_member(id) or public.is_admin());
create policy "members update cafes" on public.cafes for update using (public.is_cafe_member(id) or public.is_admin()) with check (public.is_cafe_member(id) or public.is_admin());
create policy "memberships read" on public.cafe_members for select using (user_id = auth.uid() or public.is_admin());
create policy "hours public read" on public.business_hours for select using (exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "hours member write" on public.business_hours for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "amenities public read" on public.amenities for select using (is_active or public.is_admin());
create policy "amenities admin write" on public.amenities for all using (public.is_admin()) with check (public.is_admin());
create policy "categories public read" on public.menu_categories for select using (exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "categories member write" on public.menu_categories for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "items public read" on public.menu_items for select using (exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "items member write" on public.menu_items for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "offers public read" on public.offers for select using ((status = 'active' and now() between starts_at and ends_at and exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved')) or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "offers member write" on public.offers for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "claims manager read" on public.offer_claims for select using (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "promotions public read" on public.promotions for select using ((status = 'active' and now() between starts_at and ends_at) or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "promotions manager request" on public.promotions for insert with check (public.is_cafe_member(cafe_id) and status = 'requested');
create policy "promotions admin write" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "media public read" on public.media_assets for select using (exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin());
create policy "media member write" on public.media_assets for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "analytics manager read" on public.analytics_events for select using (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "moderation admin only" on public.moderation_actions for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_cafe(
  p_name text, p_slug text, p_neighborhood text, p_address text, p_phone text, p_type text, p_short_description text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  insert into public.cafes(name, slug, neighborhood, address, phone, cafe_type, short_description, status, submitted_at)
  values (p_name, p_slug, p_neighborhood, p_address, p_phone, p_type, p_short_description, 'pending_review', now()) returning id into new_id;
  insert into public.cafe_members(cafe_id, user_id, member_role) values (new_id, auth.uid(), 'owner');
  return new_id;
end $$;

create or replace function public.claim_offer(p_offer_id uuid, p_anonymous_id text)
returns table(id uuid, code text, expires_at timestamptz) language plpgsql security definer set search_path = '' as $$
declare target public.offers; existing public.offer_claims; new_code text; expiry timestamptz; device_hash text;
begin
  if char_length(p_anonymous_id) < 16 or char_length(p_anonymous_id) > 100 then raise exception 'INVALID_DEVICE'; end if;
  select * into target from public.offers where offers.id = p_offer_id for update;
  if target.id is null or target.status <> 'active' or now() not between target.starts_at and target.ends_at then raise exception 'OFFER_EXPIRED'; end if;
  if target.valid_from is not null and target.valid_until is not null and (timezone('Asia/Tehran', now())::time < target.valid_from or timezone('Asia/Tehran', now())::time >= target.valid_until) then raise exception 'OUTSIDE_HOURS'; end if;
  if not (extract(dow from timezone('Asia/Tehran', now()))::smallint = any(target.valid_weekdays)) then raise exception 'OUTSIDE_DAYS'; end if;
  device_hash := encode(digest(p_anonymous_id, 'sha256'), 'hex');
  select * into existing from public.offer_claims where offer_id = p_offer_id and anonymous_id_hash = device_hash and created_at > now() - interval '24 hours' and status <> 'rejected' order by created_at desc limit 1;
  if existing.id is not null then
    if existing.status = 'active' and existing.expires_at > now() then return query select existing.id, existing.code, existing.expires_at; end if;
    raise exception 'CLAIM_LIMIT';
  end if;
  if target.daily_cap is not null and (select count(*) from public.offer_claims where offer_id = p_offer_id and status = 'redeemed' and timezone('Asia/Tehran', created_at)::date = timezone('Asia/Tehran', now())::date) >= target.daily_cap then raise exception 'DAILY_CAP'; end if;
  expiry := least(now() + interval '2 hours', target.ends_at);
  loop
    new_code := translate(substr(upper(encode(gen_random_bytes(6), 'hex')), 1, 6), '01', 'YZ');
    exit when not exists(select 1 from public.offer_claims where offer_claims.code = new_code);
  end loop;
  insert into public.offer_claims(offer_id, cafe_id, anonymous_id_hash, code, expires_at) values (p_offer_id, target.cafe_id, device_hash, new_code, expiry) returning offer_claims.id into id;
  insert into public.analytics_events(cafe_id, offer_id, event_type, anonymous_id_hash) values (target.cafe_id, p_offer_id, 'offer_claim', device_hash);
  code := new_code; expires_at := expiry; return next;
end $$;

create or replace function public.redeem_offer_claim(p_code text, p_cafe_id uuid)
returns table(id uuid, status public.claim_status, redeemed_at timestamptz) language plpgsql security definer set search_path = '' as $$
declare target public.offer_claims;
begin
  if not (public.is_cafe_member(p_cafe_id) or public.is_admin()) then raise exception 'FORBIDDEN'; end if;
  select * into target from public.offer_claims where code = upper(trim(p_code)) for update;
  if target.id is null then raise exception 'NOT_FOUND'; end if;
  if target.cafe_id <> p_cafe_id then raise exception 'WRONG_CAFE'; end if;
  if target.status = 'redeemed' then raise exception 'ALREADY_REDEEMED'; end if;
  if target.status <> 'active' or target.expires_at <= now() then update public.offer_claims set status = 'expired' where offer_claims.id = target.id; raise exception 'EXPIRED'; end if;
  update public.offer_claims set status = 'redeemed', redeemed_at = now() where offer_claims.id = target.id returning offer_claims.id, offer_claims.status, offer_claims.redeemed_at into id, status, redeemed_at;
  insert into public.analytics_events(cafe_id, offer_id, event_type, anonymous_id_hash) values (target.cafe_id, target.offer_id, 'offer_redeem', target.anonymous_id_hash);
  return next;
end $$;

revoke all on function public.claim_offer(uuid, text) from public;
grant execute on function public.claim_offer(uuid, text) to anon, authenticated, service_role;
revoke all on function public.redeem_offer_claim(text, uuid) from public;
grant execute on function public.redeem_offer_claim(text, uuid) to authenticated, service_role;
revoke all on function public.submit_cafe(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_cafe(text, text, text, text, text, text, text) to authenticated;

insert into public.amenities(slug, label, sort_order) values
('wifi', 'وای‌فای', 1), ('outdoor', 'فضای باز', 2), ('takeaway', 'بیرون‌بر', 3),
('accessible', 'دسترسی‌پذیر', 4), ('parking', 'پارکینگ', 5), ('power', 'پریز برق', 6), ('quiet', 'فضای ساکت', 7);
