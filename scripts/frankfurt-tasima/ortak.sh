# Diğer betiklerin ortak kısmı: ayarları okur ve kontrol eder.
set -euo pipefail

KLASOR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIKTI="$KLASOR/cikti"
mkdir -p "$CIKTI"

if [[ ! -f "$KLASOR/.env.tasima" ]]; then
  echo "HATA: $KLASOR/.env.tasima yok. Önce ortam.ornek dosyasını kopyalayıp doldurun." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
source "$KLASOR/.env.tasima"
set +a

for degisken in ESKI_DB_URL YENI_DB_URL ESKI_SUPABASE_URL YENI_SUPABASE_URL; do
  if [[ -z "${!degisken:-}" || "${!degisken}" == *SIFRE* || "${!degisken}" == *YENIREF* ]]; then
    echo "HATA: .env.tasima içinde $degisken doldurulmamış." >&2
    exit 1
  fi
done

if [[ "$ESKI_DB_URL" == "$YENI_DB_URL" ]]; then
  echo "HATA: ESKI_DB_URL ile YENI_DB_URL aynı. Yanlışlıkla eski veritabanının üzerine yazılmasın diye durdum." >&2
  exit 1
fi

# Sondaki / işaretini at
ESKI_SUPABASE_URL="${ESKI_SUPABASE_URL%/}"
YENI_SUPABASE_URL="${YENI_SUPABASE_URL%/}"

eski_psql() { psql "$ESKI_DB_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }
yeni_psql() { psql "$YENI_DB_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }
