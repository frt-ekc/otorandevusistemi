#!/usr/bin/env bash
# 1) Tabloları, kolonları, RLS kurallarını ve depolama (storage) kurallarını
#    eski projeden okuyup yeni projede oluşturur. Veri kopyalamaz (o iş 2-veri.sh).
# Sadece BİR KEZ, yeni ve boş projede çalıştırılır.
source "$(dirname "$0")/ortak.sh"

tablo_sayisi=$(yeni_psql -At -c "select count(*) from pg_tables where schemaname = 'public'")
if [[ "$tablo_sayisi" != "0" ]]; then
  echo "Yeni projede public şemasında zaten $tablo_sayisi tablo var; 1-sema.sh daha önce çalışmış görünüyor."
  echo "Veriyi yenilemek için sadece 2-veri.sh çalıştırın."
  exit 1
fi

echo "→ Eski projenin şeması okunuyor..."
pg_dump "$ESKI_DB_URL" --schema-only --schema=public --no-owner --no-privileges \
  | grep -v -E '^(CREATE SCHEMA public;|COMMENT ON SCHEMA public )' \
  > "$CIKTI/sema.sql"
echo "  tablolar: $(grep -c '^CREATE TABLE' "$CIKTI/sema.sql")," \
     "RLS kuralları: $(grep -c '^CREATE POLICY' "$CIKTI/sema.sql")"

echo "→ Depolama (storage) kuralları okunuyor..."
eski_psql -At > "$CIKTI/depolama-kurallari.sql" <<'SQL'
select 'set client_min_messages = warning;'
union all
select * from (
select format('drop policy if exists %I on %I.%I;', policyname, schemaname, tablename) || E'\n' ||
       format('create policy %I on %I.%I as %s for %s to %s%s%s;',
         policyname, schemaname, tablename, permissive, cmd,
         (select string_agg(case when r = 'public' then 'public' else quote_ident(r) end, ', ')
            from unnest(roles) r),
         coalesce(' using (' || qual || ')', ''),
         coalesce(' with check (' || with_check || ')', ''))
from pg_policies
where schemaname = 'storage'
order by tablename, policyname
) kurallar;
SQL
echo "  depolama kuralları: $(grep -c '^create policy' "$CIKTI/depolama-kurallari.sql" || true)"

echo "→ Şema yeni projeye yazılıyor..."
yeni_psql -f "$CIKTI/sema.sql" > /dev/null

if [[ -s "$CIKTI/depolama-kurallari.sql" ]]; then
  echo "→ Depolama kuralları yeni projeye yazılıyor..."
  # Site görselleri service_role ile yüklediği için bu kurallar kritik değil;
  # biri hata verirse diğerleri yine de denenir.
  psql "$YENI_DB_URL" -X -q -v ON_ERROR_STOP=0 -f "$CIKTI/depolama-kurallari.sql" > /dev/null \
    || echo "  UYARI: bazı depolama kuralları yazılamadı (yukarıdaki mesajlara bakın)."
fi

echo "Tamam. Şimdi: scripts/frankfurt-tasima/2-veri.sh"
