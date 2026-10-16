-- Lastik paketleri ve fiyat (16.10.2026)
-- Supabase panelinde: SQL Editor > New query > bu dosyanın içeriğini yapıştır > Run
-- Hiçbir veri silinmez. Kodu yayına almadan ÖNCE çalıştırın.

-- 1) Randevuya paket bilgisi ve fiyat
alter table public.randevular
  add column if not exists arac_turu text,
  add column if not exists lastik_adedi integer,
  add column if not exists balans_adedi integer,
  add column if not exists fiyat integer;

-- 2) Hizmetleri gizleyip açabilmek için "gorunur" kolonu (yeni hizmetler varsayılan olarak görünür)
alter table public.services
  add column if not exists gorunur boolean not null default true;

-- 3) Sadece lastik değişimi ve tamiri görünsün, diğerleri gizlensin (silinmez)
update public.services
set gorunur = (lower(name) like '%değişim%' or lower(name) like '%tamir%');

-- 4) Kontrol: hangi hizmet görünür, hangisi gizli?
select name, gorunur from public.services order by gorunur desc, name;
