"use client";

import { useState } from "react";
import { Edit, Loader2, X } from "lucide-react";
import { updateBook } from "@/app/actions";

export default function EditBookModal({ book }: { book: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [category, setCategory] = useState(book.category);
  const [subCategory, setSubCategory] = useState(book.subCategory || "");
  const [link, setLink] = useState(book.type === "LINK" ? book.contentUrl : "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("bookId", book.id);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    if (book.type === "LINK") formData.append("contentLink", link);

    await updateBook(formData);
    setIsSaving(false);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-1.5 rounded-lg transition-colors text-xs font-bold">
        <Edit className="w-3.5 h-3.5" /> Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <form onSubmit={handleUpdate} className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl relative text-left">
            <button type="button" onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-4">Editar Informações</h3>
            
            <div className="space-y-4 mb-6">
              <div><label className="text-xs font-bold text-gray-400">Título</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:border-cyanBright" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-400">Categoria</label><input required value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:border-cyanBright" /></div>
                <div><label className="text-xs font-bold text-gray-400">Subcategoria</label><input value={subCategory} onChange={e=>setSubCategory(e.target.value)} className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:border-cyanBright" /></div>
              </div>
              {book.type === "LINK" && (
                <div><label className="text-xs font-bold text-gray-400">Link</label><input required type="url" value={link} onChange={e=>setLink(e.target.value)} className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:border-cyanBright" /></div>
              )}
            </div>

            <button disabled={isSaving} type="submit" className="w-full py-2.5 rounded-xl bg-cyanBright text-black font-bold flex justify-center items-center gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}