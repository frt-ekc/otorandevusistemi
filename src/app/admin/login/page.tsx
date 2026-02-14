"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error || !data.session) {
        setError(error?.message ?? "Giriş başarısız.");
        setLoading(false);
        return;
      }
      const accessToken = data.session.access_token;
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 6}; secure`;
      router.push(redirectTo);
    } catch (err) {
      setError("Giriş sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0f172a]/90 backdrop-blur-md p-8 text-white shadow-2xl">
      <h1 className="text-2xl font-semibold">Yönetici Girişi</h1>
      <p className="mt-2 text-sm text-white/60">
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
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Şifre
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-white/10 bg-brand-night px-4 py-3 text-white"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] bg-[url('/otolastik.png')] bg-cover bg-center bg-no-repeat bg-fixed px-4">
      <Suspense fallback={<div className="text-white">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
