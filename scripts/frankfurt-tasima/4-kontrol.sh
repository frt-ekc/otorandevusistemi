#!/usr/bin/env bash
# 4) Eski ve yeni projeyi karşılaştırır: tablo satır sayıları, depolama dosya sayıları
#    ve yeni projede eski adrese işaret eden görsel kalıp kalmadığı.
# Sadece okur, hiçbir şeyi değiştirmez.
source "$(dirname "$0")/ortak.sh"

SAYIM_SQL="select string_agg(format('select %L, count(*) from %I.%I', tablename, schemaname, tablename), ' union all ' order by tablename) from pg_tables where schemaname = 'public'"

sayim() { # $1 = eski_psql | yeni_psql
  local sorgu
  sorgu=$($1 -At -c "$SAYIM_SQL")
  [[ -n "$sorgu" ]] && $1 -At -F ' ' -c "$sorgu"
}

fark=0
printf '%-20s %10s %10s\n' "TABLO" "ESKİ" "YENİ"
while read -r tablo eski_sayi; do
  yeni_sayi=$(yeni_psql -At -c "select count(*) from public.\"$tablo\"" 2>/dev/null || echo "YOK")
  isaret=""
  [[ "$eski_sayi" != "$yeni_sayi" ]] && { isaret="  <-- FARKLI"; fark=1; }
  printf '%-20s %10s %10s%s\n' "$tablo" "$eski_sayi" "$yeni_sayi" "$isaret"
done < <(sayim eski_psql)

kalan=$(yeni_psql -At -v eski_url="$ESKI_SUPABASE_URL" <<'SQL'
select coalesce(sum((xpath('/row/n/text()',
         query_to_xml(format('select count(*) as n from public.%I where %I like %L',
                             c.table_name, c.column_name, '%' || :'eski_url' || '%'), false, true, '')))[1]::text::bigint), 0)
from information_schema.columns c
join pg_tables t on t.schemaname = c.table_schema and t.tablename = c.table_name
where c.table_schema = 'public' and c.data_type in ('text', 'character varying');
SQL
)
echo
echo "Yeni projede hâlâ eski adresi gösteren alan sayısı: $kalan"
[[ "$kalan" != "0" ]] && fark=1

if [[ "${1:-}" != "--sadece-tablolar" ]]; then
  echo
  DEPO_SQL="select bucket_id, count(*) from storage.objects where name not like '%.emptyFolderPlaceholder' group by bucket_id order by bucket_id"
  printf '%-20s %10s %10s\n' "KOVA" "ESKİ" "YENİ"
  while read -r kova eski_sayi; do
    yeni_sayi=$(yeni_psql -At -c "select count(*) from storage.objects where bucket_id = '$kova' and name not like '%.emptyFolderPlaceholder'")
    isaret=""
    [[ "$eski_sayi" != "$yeni_sayi" ]] && { isaret="  <-- FARKLI"; fark=1; }
    printf '%-20s %10s %10s%s\n' "$kova" "$eski_sayi" "$yeni_sayi" "$isaret"
  done < <(eski_psql -At -F ' ' -c "$DEPO_SQL")
fi

echo
if [[ "$fark" == "0" ]]; then
  echo "SONUÇ: Eski ve yeni proje eşit. ✔"
else
  echo "SONUÇ: Farklar var (yukarıda işaretli)."
  exit 1
fi
