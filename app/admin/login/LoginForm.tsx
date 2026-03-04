"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("E-mail ou senha inválidos.");
            setLoading(false);
        } else {
            // TRUQUE MÁGICO AQUI:
            router.refresh(); // Avisa ao Next.js que a sessão mudou e limpa os caches
            router.replace("/admin/dashboard"); // Troca a página no histórico (evita o botão voltar)
        }
        } catch (err) {
        setError("Ocorreu um erro ao tentar entrar.");
        setLoading(false);
        }
        };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-vibrantPurple rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(156,39,176,0.5)]">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
            Acesso Restrito
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Identifique-se para gerenciar o sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A192F]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all"
              placeholder="admin@metaaprender.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A192F]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vibrantPurple hover:bg-[#8e24a1] text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>
        
        <div className="mt-8 text-center">
             <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">Voltar para o site</a>
        </div>
      </div>
    </div>
  );
}