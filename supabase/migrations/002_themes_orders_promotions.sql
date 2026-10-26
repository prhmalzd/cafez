-- Caféz pilot growth features: safe themes, pickup orders, PWA subscriptions and promotions.
create type public.cafe_theme_preset as enum ('classic', 'warm', 'minimal');
create type public.cafe_theme_mode as enum ('light', 'dark');
create type public.pickup_order_status as enum ('pending', 'accepted', 'ready', 'collected', 'rejected', 'cancelled', 'expired', 'no_show');

create table public.cafe_themes (
  cafe_id uuid primary key references public.cafes(id) on delete cascade,
  preset public.cafe_theme_preset not null default 'classic',
  primary_color text not null default '#20332c' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text not null default '#ef5b2a' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  mode public.cafe_theme_mode not null default 'light',
  font text not null default 'default' check (font in ('default', 'rounded')),
  tier text not null default 'standard' check (tier in ('standard', 'advanced')),
  updated_at timestamptz not null default now()
);

create table public.order_settings (
  cafe_id uuid primary key references public.cafes(id) on delete cascade,
  enabled boolean not null default false,
  minimum_prep_minutes integer not null default 15 check (minimum_prep_minutes between 15 and 180),
  slot_interval_minutes integer not null default 15 check (slot_interval_minutes in (15, 30, 60)),
  capacity_per_slot integer not null default 5 check (capacity_per_slot between 1 and 100),
  acceptance_timeout_minutes integer not null default 5 check (acceptance_timeout_minutes between 3 and 15),
  order_opens_at time not null default '08:00',
  order_closes_at time not null default '22:30',
  updated_at timestamptz not null default now()
);

alter table public.menu_items add column is_orderable boolean not null default true;

create table public.pickup_orders (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  anonymous_id_hash text not null,
  network_hash text,
  public_code text not null unique check (public_code ~ '^[A-Z2-9]{8}$'),
  access_token_hash text not null,
  status public.pickup_order_status not null default 'pending',
  requested_for timestamptz not null,
  promised_for timestamptz,
  note text not null default '' check (char_length(note) <= 200),
  total_price_toman integer not null default 0 check (total_price_toman >= 0),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  ready_at timestamptz,
  collected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pickup_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.pickup_orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  unit_price_toman integer not null check (unit_price_toman >= 0),
  quantity integer not null check (quantity between 1 and 10),
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid references public.cafes(id) on delete cascade,
  order_id uuid references public.pickup_orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  purpose text not null check (purpose in ('staff', 'customer')),
  created_at timestamptz not null default now(),
  check ((purpose = 'staff' and cafe_id is not null and user_id is not null) or (purpose = 'customer' and order_id is not null))
);

create index pickup_orders_cafe_queue_idx on public.pickup_orders(cafe_id, status, requested_for);
create index pickup_orders_device_idx on public.pickup_orders(cafe_id, anonymous_id_hash, created_at desc);
create index pickup_orders_network_idx on public.pickup_orders(network_hash, created_at desc) where network_hash is not null;
create unique index pickup_orders_one_open_device_idx on public.pickup_orders(cafe_id, anonymous_id_hash)
  where status in ('pending', 'accepted', 'ready');

alter table public.promotions add column if not exists is_paused boolean not null default false;
alter table public.promotions add column if not exists rejection_note text;
alter table public.promotions add column if not exists updated_at timestamptz not null default now();

alter table public.media_assets drop constraint if exists media_assets_kind_check;
alter table public.media_assets add constraint media_assets_kind_check check (kind in ('logo', 'cover', 'gallery', 'menu_item', 'offer', 'promotion'));

alter table public.analytics_events add column if not exists promotion_id uuid references public.promotions(id) on delete set null;
alter table public.analytics_events drop constraint if exists analytics_events_event_type_check;
alter table public.analytics_events add constraint analytics_events_event_type_check check (event_type in (
  'profile_view', 'menu_view', 'contact_click', 'directions_click', 'offer_view', 'offer_claim', 'offer_redeem',
  'promotion_impression', 'promotion_click', 'order_created', 'order_accepted', 'order_ready', 'order_collected', 'order_rejected'
));

create trigger cafe_themes_touch before update on public.cafe_themes for each row execute function public.touch_updated_at();
create trigger order_settings_touch before update on public.order_settings for each row execute function public.touch_updated_at();
create trigger pickup_orders_touch before update on public.pickup_orders for each row execute function public.touch_updated_at();
create trigger promotions_touch before update on public.promotions for each row execute function public.touch_updated_at();

alter table public.cafe_themes enable row level security;
alter table public.order_settings enable row level security;
alter table public.pickup_orders enable row level security;
alter table public.pickup_order_items enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "themes public read" on public.cafe_themes for select using (
  exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin()
);
create policy "themes member write" on public.cafe_themes for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "order settings public read" on public.order_settings for select using (
  exists(select 1 from public.cafes c where c.id = cafe_id and c.status = 'approved') or public.is_cafe_member(cafe_id) or public.is_admin()
);
create policy "order settings member write" on public.order_settings for all using (public.is_cafe_member(cafe_id) or public.is_admin()) with check (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "orders staff read" on public.pickup_orders for select using (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "orders staff update" on public.pickup_orders for update using (public.is_cafe_member(cafe_id) or public.is_admin());
create policy "order items staff read" on public.pickup_order_items for select using (
  exists(select 1 from public.pickup_orders o where o.id = order_id and (public.is_cafe_member(o.cafe_id) or public.is_admin()))
);
create policy "push staff manage" on public.push_subscriptions for all using (
  purpose = 'staff' and user_id = auth.uid() and (public.is_cafe_member(cafe_id) or public.is_admin())
) with check (purpose = 'staff' and user_id = auth.uid() and (public.is_cafe_member(cafe_id) or public.is_admin()));

create policy "staff receive order broadcasts" on realtime.messages for select to authenticated using (
  realtime.topic() like 'cafe_orders:%' and public.is_cafe_member(split_part(realtime.topic(), ':', 2)::uuid)
);

create or replace function public.broadcast_pickup_order_change()
returns trigger security definer set search_path = '' language plpgsql as $$
begin
  perform realtime.broadcast_changes('cafe_orders:' || coalesce(new.cafe_id, old.cafe_id)::text, tg_op, tg_op, tg_table_name, tg_table_schema, new, old);
  return null;
end $$;
create trigger pickup_order_broadcast after insert or update or delete on public.pickup_orders
for each row execute function public.broadcast_pickup_order_change();

create or replace function public.create_pickup_order(
  p_cafe_id uuid,
  p_anonymous_id text,
  p_network_hash text,
  p_requested_for timestamptz,
  p_note text,
  p_items jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  settings public.order_settings;
  target_cafe public.cafes;
  order_id uuid;
  order_code text;
  plain_token text;
  total integer := 0;
  total_units integer := 0;
  entry jsonb;
  item public.menu_items;
  expiry timestamptz;
begin
  select * into target_cafe from public.cafes where id = p_cafe_id and status = 'approved';
  if target_cafe.id is null then raise exception 'CAFE_NOT_AVAILABLE'; end if;
  select * into settings from public.order_settings where cafe_id = p_cafe_id for update;
  if settings.cafe_id is null or not settings.enabled then raise exception 'ORDERING_DISABLED'; end if;
  if p_requested_for < now() + make_interval(mins => settings.minimum_prep_minutes) then raise exception 'TOO_SOON'; end if;
  if timezone('Asia/Tehran', p_requested_for)::date <> timezone('Asia/Tehran', now())::date then raise exception 'SAME_DAY_ONLY'; end if;
  if timezone('Asia/Tehran', p_requested_for)::time < settings.order_opens_at or timezone('Asia/Tehran', p_requested_for)::time > settings.order_closes_at then raise exception 'OUTSIDE_ORDER_HOURS'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'EMPTY_ORDER'; end if;

  if exists(select 1 from public.pickup_orders where cafe_id = p_cafe_id and anonymous_id_hash = encode(digest(p_anonymous_id, 'sha256'), 'hex') and status in ('pending','accepted','ready')) then raise exception 'OPEN_ORDER_EXISTS'; end if;
  if p_network_hash is not null and (select count(*) from public.pickup_orders where network_hash = p_network_hash and created_at > now() - interval '30 minutes') >= 5 then raise exception 'RATE_LIMIT'; end if;

  for entry in select * from jsonb_array_elements(p_items) loop
    select * into item from public.menu_items where id = (entry->>'menuItemId')::uuid and cafe_id = p_cafe_id and is_available and is_orderable;
    if item.id is null then raise exception 'ITEM_UNAVAILABLE'; end if;
    if (entry->>'quantity')::integer not between 1 and 10 then raise exception 'INVALID_QUANTITY'; end if;
    total_units := total_units + (entry->>'quantity')::integer;
    total := total + item.price_toman * (entry->>'quantity')::integer;
  end loop;
  if total_units > 10 then raise exception 'TOO_MANY_ITEMS'; end if;
  if (select count(*) from public.pickup_orders where cafe_id = p_cafe_id and requested_for = p_requested_for and status in ('pending','accepted','ready')) >= settings.capacity_per_slot then raise exception 'SLOT_FULL'; end if;

  loop
    order_code := '';
    for i in 1..8 loop order_code := order_code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::integer, 1); end loop;
    exit when not exists(select 1 from public.pickup_orders where public_code = order_code);
  end loop;
  plain_token := encode(gen_random_bytes(24), 'hex');
  expiry := now() + make_interval(mins => settings.acceptance_timeout_minutes);

  insert into public.pickup_orders(cafe_id, anonymous_id_hash, network_hash, public_code, access_token_hash, requested_for, note, total_price_toman, expires_at)
  values (p_cafe_id, encode(digest(p_anonymous_id, 'sha256'), 'hex'), p_network_hash, order_code, encode(digest(plain_token, 'sha256'), 'hex'), p_requested_for, left(coalesce(p_note, ''), 200), total, expiry)
  returning id into order_id;

  for entry in select * from jsonb_array_elements(p_items) loop
    select * into item from public.menu_items where id = (entry->>'menuItemId')::uuid;
    insert into public.pickup_order_items(order_id, menu_item_id, item_name, unit_price_toman, quantity)
    values(order_id, item.id, item.name, item.price_toman, (entry->>'quantity')::integer);
  end loop;
  insert into public.analytics_events(cafe_id, event_type, anonymous_id_hash, metadata)
  values(p_cafe_id, 'order_created', encode(digest(p_anonymous_id, 'sha256'), 'hex'), jsonb_build_object('order_id', order_id));

  return jsonb_build_object('id', order_id, 'code', order_code, 'accessToken', plain_token, 'status', 'pending', 'requestedFor', p_requested_for, 'expiresAt', expiry, 'totalPrice', total);
end $$;

create or replace function public.get_pickup_order(p_code text, p_access_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  update public.pickup_orders set status = 'expired'
    where public_code = upper(trim(p_code)) and status = 'pending' and expires_at <= now();
  select jsonb_build_object(
    'id', o.id, 'cafeId', o.cafe_id, 'cafeName', c.name, 'code', o.public_code, 'status', o.status,
    'requestedFor', o.requested_for, 'promisedFor', o.promised_for, 'note', o.note, 'totalPrice', o.total_price_toman,
    'createdAt', o.created_at, 'expiresAt', o.expires_at, 'rejectionReason', o.rejection_reason,
    'items', coalesce((select jsonb_agg(jsonb_build_object('menuItemId', i.menu_item_id, 'name', i.item_name, 'unitPrice', i.unit_price_toman, 'quantity', i.quantity)) from public.pickup_order_items i where i.order_id = o.id), '[]'::jsonb)
  ) into result from public.pickup_orders o join public.cafes c on c.id = o.cafe_id
  where o.public_code = upper(trim(p_code)) and o.access_token_hash = encode(digest(p_access_token, 'sha256'), 'hex');
  if result is null then raise exception 'ORDER_NOT_FOUND'; end if;
  return result;
end $$;

revoke all on function public.create_pickup_order(uuid, text, text, timestamptz, text, jsonb) from public;
grant execute on function public.create_pickup_order(uuid, text, text, timestamptz, text, jsonb) to anon, authenticated, service_role;
revoke all on function public.get_pickup_order(text, text) from public;
grant execute on function public.get_pickup_order(text, text) to anon, authenticated, service_role;

create or replace function public.replace_cafe_menu(p_cafe_id uuid, p_categories jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare category jsonb; entry jsonb; category_id uuid; item_id uuid; category_order integer := 0; item_order integer;
begin
  delete from public.menu_categories where cafe_id = p_cafe_id;
  for category in select * from jsonb_array_elements(p_categories) loop
    category_id := case when coalesce(category->>'id', '') ~ '^[0-9a-fA-F-]{36}$' then (category->>'id')::uuid else gen_random_uuid() end;
    insert into public.menu_categories(id, cafe_id, name, sort_order) values(category_id, p_cafe_id, left(category->>'name', 100), category_order);
    item_order := 0;
    for entry in select * from jsonb_array_elements(coalesce(category->'items', '[]'::jsonb)) loop
      item_id := case when coalesce(entry->>'id', '') ~ '^[0-9a-fA-F-]{36}$' then (entry->>'id')::uuid else gen_random_uuid() end;
      insert into public.menu_items(id, cafe_id, category_id, name, description, price_toman, ingredients, badges, is_available, is_featured, is_orderable, sort_order)
      values(item_id, p_cafe_id, category_id, left(entry->>'name', 120), left(coalesce(entry->>'description',''), 500), greatest(0, (entry->>'price')::integer),
        coalesce(array(select jsonb_array_elements_text(coalesce(entry->'ingredients','[]'::jsonb))), '{}'),
        coalesce(array(select jsonb_array_elements_text(coalesce(entry->'badges','[]'::jsonb))), '{}'),
        coalesce((entry->>'available')::boolean, true), coalesce((entry->>'featured')::boolean, false), coalesce((entry->>'orderable')::boolean, true), item_order);
      item_order := item_order + 1;
    end loop;
    category_order := category_order + 1;
  end loop;
end $$;
revoke all on function public.replace_cafe_menu(uuid, jsonb) from public;
grant execute on function public.replace_cafe_menu(uuid, jsonb) to service_role;

insert into public.cafe_themes(cafe_id) select id from public.cafes on conflict do nothing;
insert into public.order_settings(cafe_id) select id from public.cafes on conflict do nothing;
