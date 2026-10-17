#!/usr/bin/env bash
# 2) Eski projedeki tüm verileri (randevular, services, products, lastikler, ayarlar...)
#    yeni projeye kopyalar ve görsel adreslerini (image_url) yeni projeye çevirir.
# Tekrar tekrar çalıştırılabilir: her seferinde yeni projedeki tablolar boşaltılıp
# eski projenin o anki hali yeniden yazılır. Gece geçişinde son kez bu çalıştırılır.
# Eski projede hiçbir şey değişmez.
source "$(dirname "$0")/ortak.sh"

echo "→ Eski projenin verisi okunuyor..."
pg_dump "$ESKI_DB_URL" --data-only --schema=public --no-owner --no-privileges \
  > "$CIKTI/veri.sql"

cat > "$CIKTI/veri-yukle.sql" <<'SQL'
-- Yeni projedeki public tablolarını boşalt
do $$
declare t text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
    into t from pg_tables where schemaname = 'public';
  if t is not null then
    execute 'truncate table ' || t || ' restart identity cascade';
  end if;
end $$;

\i :veri_dosyasi

-- Görsel adreslerini eski proje adresinden yeni proje adresine çevir
set client_min_messages = notice;
select set_config('tasima.eski', :'eski_url', false) as eski,
       set_config('tasima.yeni', :'yeni_url', false) as yeni \gset tasima_
do $$
declare
  k record;
  n bigint;
  eski text := current_setting('tasima.eski');
  yeni text := current_setting('tasima.yeni');
begin
  for k in
    select c.table_name, c.column_name
    from information_schema.columns c
    join pg_tables t on t.schemaname = c.table_schema and t.tablename = c.table_name
    where c.table_schema = 'public' and c.data_type in ('text', 'character varying')
  loop
    execute format('update public.%I set %I = replace(%I, $1, $2) where %I like $3',
                   k.table_name, k.column_name, k.column_name, k.column_name)
      using eski, yeni, '%' || eski || '%';
    get diagnostics n = row_count;
    if n > 0 then
      raise notice '% satır güncellendi: %.%', n, k.table_name, k.column_name;
    end if;
  end loop;
end $$;
SQL

echo "→ Yeni projeye yazılıyor (tek işlemde; hata olursa hiçbir şey değişmez)..."
yeni_psql --single-transaction \
  -v veri_dosyasi="$CIKTI/veri.sql" \
  -v eski_url="$ESKI_SUPABASE_URL" \
  -v yeni_url="$YENI_SUPABASE_URL" \
  -f "$CIKTI/veri-yukle.sql" > /dev/null

echo "→ Satır sayıları karşılaştırılıyor..."
"$KLASOR/4-kontrol.sh" --sadece-tablolar
