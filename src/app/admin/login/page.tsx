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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-white/10 bg-brand-dark px-4 py-3 text-brand-text outline-none transition-colors focus:border-brand-gold"
            required
          />
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
