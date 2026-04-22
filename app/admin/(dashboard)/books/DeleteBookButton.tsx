"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteBook } from "@/app/actions";

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const formData = new FormData();
    formData.append("bookId", bookId);
    await deleteBook(formData);
    setIsOpen(false);
    setIsDeleting(false);
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-1.5 rounded-lg transition-colors text-xs font-bold">
        <Trash2 className="w-3.5 h-3.5" /> Excluir
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Excluir Livro?</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação apagará a capa e o PDF do servidor. Não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button disabled={isDeleting} onClick={() => setIsOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 font-bold">Cancelar</button>
              <button disabled={isDeleting} onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold flex justify-center items-center gap-2">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}