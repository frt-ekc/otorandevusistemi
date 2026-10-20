"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { loginAction } from "./actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sifreGorunur, setSifreGorunur] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAction(email, password);
      if (!result.ok) {
        setError(result.message ?? "Giriş başarısız.");
        setLoading(false);
        return;
      }
      // Sadece site içi yönlendirmeye izin ver (açık yönlendirme açığını önler)
      const safeRedirect =
        redirectTo.startsWith("/admin") && !redirectTo.startsWith("//") ? redirectTo : "/admin";
      router.push(safeRedirect);
      router.refresh();
    } catch (err) {
      setError("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-brand-slate p-6 text-brand-text sm:p-8">
      <Image src="/logo.svg" alt="Fırat Oto Lastik logo" width={160} height={40} className="h-10 w-auto" priority />
      <p className="mt-8 text-sm font-semibold text-brand-gold">Yönetici Paneli</p>
      <h1 className="mt-1 text-3xl font-extrabold">Giriş yap</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Admin paneline erişmek için e-posta ve şifrenizi girin.
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-sm text-white/70">
          E-posta
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Şifre
          {/* Göz: yazılan şifreyi kontrol etmek için göster / gizle */}
          <span className="relative">
            <input
              type={sifreGorunur ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-brand-dark py-3 pl-4 pr-12 text-brand-text outline-none transition-colors focus:border-brand-gold"
              required
            />
            <button
              type="button"
              onClick={() => setSifreGorunur((v) => !v)}
              aria-label={sifreGorunur ? "Şifreyi gizle" : "Şifreyi göster"}
              aria-pressed={sifreGorunur}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-white/50 transition-colors hover:text-brand-gold"
            >
              {sifreGorunur ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a12.6 12.6 0 0 1-2.9 4.1M6.1 6.1A12.4 12.4 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7a9.6 9.6 0 0 0 4.3-1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-dark transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div className="text-brand-text">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
