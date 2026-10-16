-- Randevu formu güncellemesi (16.10.2026)
-- Plaka ve e-posta artık formda istenmiyor; yerine sendika seçimi geliyor.
-- Yapılacak işlem ayrı kolona değil not_metni alanına "İşlem: ..." olarak yazılıyor.
-- Supabase panelinde: SQL Editor > New query > bu dosyanın içeriğini yapıştır > Run

-- 1) Sendika kolonu
alter table public.randevular
  add column if not exists sendika text;

-- 2) Plaka ve e-posta artık boş gelebilir (eski kayıtlar korunur)
alter table public.randevular alter column plaka drop not null;
alter table public.randevular alter column email drop not null;
