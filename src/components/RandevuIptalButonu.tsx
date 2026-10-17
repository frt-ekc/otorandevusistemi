"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { randevuIptalEt } from "@/app/(public)/randevu-sorgula/actions";

type Props = {
  id: string;
  ad: string;
  telefon: string;
  ozet: string; // "20 Ekim 14:00" gibi, onay sorusunda gösterilir
};

export default function RandevuIptalButonu({ id, ad, telefon, ozet }: Props) {
  const router = useRouter();
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const iptalEt = () => {
    setHata(null);
    startTransition(async () => {
      const sonuc = await randevuIptalEt(id, ad, telefon);
      if (!sonuc.ok) {
        setHata(sonuc.message ?? "İptal edilemedi.");
        return;
      }
      setOnay(false);
      router.refresh();
    });
  };

  if (!onay) {
    return (
      <button
        type="button"
        onClick={() => setOnay(true)}
        className="mt-5 w-full rounded-full border border-rose-400/40 px-5 py-3 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/10"
      >
        Randevuyu iptal et
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
      <p className="text-sm font-semibold text-white">{ozet} randevunuz iptal edilsin mi?</p>
      {hata ? <p className="mt-2 text-sm text-rose-200">{hata}</p> : null}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setOnay(false)}
          disabled={pending}
          className="flex-1 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={iptalEt}
          disabled={pending}
          className="flex-1 rounded-full bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50"
        >
          {pending ? "İptal ediliyor..." : "Evet, iptal et"}
        </button>
      </div>
    </div>
  );
}
