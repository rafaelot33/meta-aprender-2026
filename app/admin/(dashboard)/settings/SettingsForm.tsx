"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { Save, User, FolderPen, Layers, AlignLeft, CheckCircle, Loader2 } from "lucide-react";

export default function SettingsForm({ user }: { user: any }) {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleSubmit = async (formData: FormData) => {
    setStatus("saving");
    try {
      await updateProfile(formData);
      setStatus("success");
      // Volta o botão ao normal depois de 3 segundos
      setTimeout(() => setStatus("idle"), 3000); 
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8 shadow-xl">
      <form action={handleSubmit} className="space-y-8">
        
        {/* Nome da Pasta */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-cyanBright uppercase tracking-wider">
            <FolderPen className="w-4 h-4" /> Nome da Pasta Pública
          </label>
          <input
            name="folderName"
            type="text"
            defaultValue={user.folderName || "Minha Pasta"}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-cyanBright focus:ring-1 focus:ring-cyanBright transition-all"
            placeholder="Ex: Materiais do Prof. Dennys"
          />
          <p className="text-xs text-gray-500">Este é o título principal que aparecerá na Landing Page.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Categoria */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-vibrantPurple uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Categoria Principal
            </label>
            <select
              name="folderCategory"
              defaultValue={user.folderCategory || "Geral"}
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all appearance-none cursor-pointer"
            >
              <option value="Geral">Geral</option>
              <option value="1º Ano">1º Ano</option>
              <option value="2º Ano">2º Ano</option>
              <option value="3º Ano">3º Ano</option>
              <option value="4º Ano">4º Ano</option>
              <option value="5º Ano">5º Ano</option>
              <option value="4/5º Ano">4/5º Ano</option>
              <option value="Sistemas">Sistemas</option>
              <option value="1/2º Ano">1/2º Ano</option>
              <option value="Campo">Campo</option>
            </select>
          </div>

          {/* Nome do Usuário */}
          <div className="space-y-2 opacity-50 cursor-not-allowed">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
              <User className="w-4 h-4" /> Dono da Pasta
            </label>
            <input
              type="text"
              disabled
              value={user.name}
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-4 text-gray-400"
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider">
            <AlignLeft className="w-4 h-4" /> Descrição da Pasta
          </label>
          <textarea
            name="folderDescription"
            rows={4}
            defaultValue={user.folderDescription || ""}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyanBright focus:ring-1 focus:ring-cyanBright transition-all resize-none"
            placeholder="Escreva uma breve biografia ou descreva o conteúdo que você compartilha..."
          />
        </div>

        {/* Botão Salvar com Feedback */}
        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-end gap-4">
          
          {/* Mensagem de Sucesso Animada */}
          {status === "success" && (
            <span className="text-green-400 flex items-center gap-2 text-sm font-bold animate-pulse">
              <CheckCircle className="w-5 h-5"/> Alterações salvas com sucesso!
            </span>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-vibrantPurple to-cyanBright text-white font-bold rounded-xl shadow-lg hover:shadow-cyanBright/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
          >
            {status === "saving" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
            ) : (
              <><Save className="w-5 h-5" /> Salvar Alterações</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}