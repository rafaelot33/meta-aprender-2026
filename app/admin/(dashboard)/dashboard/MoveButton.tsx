"use client";

import { useState } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { moveMaterial } from "@/app/actions";

interface MoveButtonProps {
  itemId: string;
  folders: { id: string, title: string }[];
}

export default function MoveButton({ itemId, folders }: MoveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMove = async (newParentId: string) => {
    // VALIDAÇÃO COM CONFIRM
    const folderName = newParentId === "root" ? "Raiz" : folders.find(f => f.id === newParentId)?.title;
    
    if (!window.confirm(`Tem certeza que deseja mover para "${folderName}"?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("itemId", itemId);
    formData.append("newParentId", newParentId);
    
    await moveMaterial(formData);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-400 hover:text-white bg-[#1E293B] p-2 rounded-lg border border-white/5 hover:bg-blue-500/10 transition-colors"
        title="Mover"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-48 bg-[#0F172A] border border-white/10 rounded-xl shadow-xl z-50 p-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 px-2">Mover para:</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            <button 
                onClick={() => handleMove("root")}
                className="w-full text-left text-xs text-white px-2 py-1.5 hover:bg-white/10 rounded flex items-center justify-between"
            >
                Raiz
            </button>
            {folders.map(f => (
                <button 
                    key={f.id}
                    onClick={() => handleMove(f.id)}
                    className="w-full text-left text-xs text-white px-2 py-1.5 hover:bg-white/10 rounded truncate"
                >
                    {f.title}
                </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}