"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";

export default function UploadForm({ parentId, targetUserId }: { parentId: string | null, targetUserId: string }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Apenas guarda os arquivos na memória quando o usuário escolhe
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    } else {
      setSelectedFiles(null);
    }
  };

  // Permite cancelar a seleção antes de enviar
  const clearSelection = () => {
    setSelectedFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Só dispara quando clica no botão de Upload
  const handleUpload = () => {
    if (!selectedFiles?.length) return;
    
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append("files", file));
    formData.append("parentId", parentId || "");
    formData.append("targetUserId", targetUserId);

    setIsUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setProgress(0);
      setSelectedFiles(null); // Limpa o estado
      if (fileInputRef.current) fileInputRef.current.value = ""; // Limpa o input
      router.refresh(); 
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setProgress(0);
      alert("Ocorreu um erro ao fazer o upload do arquivo.");
    };

    xhr.send(formData);
  };

  return (
    <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5 flex flex-col justify-center gap-3">
      
      {/* Input e Botão de Envio */}
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          multiple 
          onChange={handleFileSelect} 
          disabled={isUploading}
          ref={fileInputRef}
          className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg border border-white/10 flex-1 text-xs outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-vibrantPurple file:text-white hover:file:bg-purple-600 cursor-pointer disabled:opacity-50 transition-all"
        />
        
        {/* O botão agora "acende" de azul quando tem arquivo selecionado */}
        <button 
          onClick={handleUpload}
          disabled={!selectedFiles || isUploading} 
          className={`p-2 rounded-lg transition-all flex items-center justify-center ${
            selectedFiles && !isUploading 
              ? "bg-cyanBright text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer" 
              : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Preview do arquivo selecionado (Antes de enviar) */}
      {selectedFiles && !isUploading && (
        <div className="flex items-center justify-between bg-[#0F172A] p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="w-4 h-4 text-cyanBright shrink-0" />
            <span className="text-xs text-gray-300 truncate font-medium">
              {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} arquivos selecionados`}
            </span>
          </div>
          <button onClick={clearSelection} className="text-gray-400 hover:text-red-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* A Nova Barra de Progresso Bonitona */}
      {isUploading && (
        <div className="w-full bg-[#0F172A] rounded-full h-6 overflow-hidden border border-white/10 relative shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-vibrantPurple to-cyanBright transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {progress === 100 ? "PROCESSANDO NO SERVIDOR..." : `${progress}% ENVIANDO`}
          </span>
        </div>
      )}
    </div>
  );
}