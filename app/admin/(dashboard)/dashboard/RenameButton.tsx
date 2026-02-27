"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { renameMaterial } from "@/app/actions";

export default function RenameButton({ itemId, currentName }: { itemId: string, currentName: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("itemId", itemId);
    formData.append("newName", newName);
    await renameMaterial(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 shadow-xl w-full max-w-sm">
           <h3 className="text-white mb-2 text-sm font-bold">Renomear</h3>
           <input 
             value={newName} 
             onChange={(e) => setNewName(e.target.value)} 
             className="w-full bg-[#0F172A] text-white p-2 rounded mb-4 text-sm outline-none border border-white/10 focus:border-cyanBright"
           />
           <div className="flex justify-end gap-2">
             <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-gray-400 text-xs hover:text-white">Cancelar</button>
             <button onClick={handleSave} className="bg-cyanBright text-black px-3 py-1 rounded text-xs font-bold">Salvar</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white bg-[#1E293B] p-2 rounded-lg border border-white/5 transition-colors">
      <Pencil className="w-4 h-4" />
    </button>
  );
}