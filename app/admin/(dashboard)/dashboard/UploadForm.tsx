"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadFiles } from "@/app/actions";

// Adicione targetUserId na interface de props
export default function UploadForm({ parentId, targetUserId }: { parentId: string | null, targetUserId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsUploading(true);
    setMessage("Enviando arquivos...");
    setError(null);

    // Adiciona o parentId ao FormData
    if (parentId) {
      formData.append("parentId", parentId);
    }
    
    // Adiciona o targetUserId (Para o Admin enviar para outro user)
    if (targetUserId) {
      formData.append("targetUserId", targetUserId);
    }

    try {
      await uploadFiles(formData);
      setMessage("Upload concluído com sucesso!");
      (document.getElementById("uploadForm") as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
      <form 
        id="uploadForm"
        action={handleSubmit} 
        className="flex gap-2 items-center"
      >
        <input 
          name="files" 
          type="file" 
          multiple
          required
          className="text-xs text-gray-300 file:bg-vibrantPurple file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 flex-1 file:cursor-pointer" 
        />
        
        <button 
          disabled={isUploading}
          className="bg-vibrantPurple hover:bg-purple-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        </button>
      </form>

      {/* Mensagens de Feedback */}
      {isUploading && (
        <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden animate-pulse">
          <div className="h-full bg-cyanBright w-full animate-progress-indeterminate"></div>
        </div>
      )}
      {message && !error && (
        <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {message}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>
      )}
    </div>
  );
}