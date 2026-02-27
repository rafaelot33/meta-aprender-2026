"use client";

import { useState } from "react";
import { Pencil, X, Save, Lock, User, Mail, Shield } from "lucide-react";
import { updateUser } from "@/app/actions";

interface UserProps {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EditUserButton({ user }: { user: UserProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fecha o modal ao clicar fora ou salvar
  const handleClose = () => setIsOpen(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      setIsOpen(false);
    } catch (error) {
      alert("Erro ao atualizar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão de Lápis (Abre o Modal) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-lg text-gray-400 transition-all border border-white/5"
        title="Editar Usuário"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animation-fade-in">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0F172A]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-cyanBright" /> Editar Usuário
              </h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form action={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">Nome Completo</label>
                <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg px-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <input 
                    name="name" 
                    defaultValue={user.name} 
                    className="w-full bg-transparent p-3 text-sm text-white outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">E-mail</label>
                <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg px-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <input 
                    name="email" 
                    type="email" 
                    defaultValue={user.email} 
                    className="w-full bg-transparent p-3 text-sm text-white outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">Função / Permissão</label>
                <div className="flex items-center bg-[#0F172A] border border-white/10 rounded-lg px-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <select 
                    name="role" 
                    defaultValue={user.role} 
                    className="w-full bg-transparent p-3 text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="USER" className="bg-[#0F172A]">Servidor Meta</option>
                    <option value="ADMIN" className="bg-[#0F172A]">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <label className="text-xs text-yellow-500/80 ml-1 font-bold">Alterar Senha (Opcional)</label>
                <div className="flex items-center bg-[#0F172A] border border-yellow-500/20 rounded-lg px-3">
                  <Lock className="w-4 h-4 text-yellow-500/50" />
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="Deixe vazio para manter a atual" 
                    className="w-full bg-transparent p-3 text-sm text-white outline-none placeholder:text-gray-600" 
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-lg bg-vibrantPurple hover:bg-purple-600 text-white font-bold text-sm transition-colors flex justify-center items-center gap-2"
                >
                  {isLoading ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}