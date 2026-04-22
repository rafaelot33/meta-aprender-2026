"use client";

import { X, Download, AlertTriangle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilePreviewProps {
  file: {
    title: string;
    fileUrl: string | null;
    type?: string;
  } | null;
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewProps) {
  if (!file || !file.fileUrl) return null;

  const actualPath = file.fileUrl.toLowerCase();
  
  const isPdf = actualPath.includes('.pdf') || file.type?.toLowerCase().includes('pdf');
  const isOffice = actualPath.includes('.doc') || actualPath.includes('.ppt') || actualPath.includes('.xls');

  // Rota para BAIXAR (forçado)
  const fileDownloadUrl = `/api/download?path=${file.fileUrl}`;
  
  // NOVA ROTA PARA VISUALIZAR (Lida pelo navegador)
  const fileViewUrl = `/api/download?path=${file.fileUrl}&view=true`;

  let previewUrl = null;

  if (isPdf) {
    previewUrl = fileViewUrl; // O PDF agora usa a rota de visualização
  } else if (isOffice) {
    const absoluteUrl = `${window.location.origin}${fileViewUrl}`;
    previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F172A] w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 bg-[#020617] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-white/5 rounded-lg">
                <FileText className="w-5 h-5 text-cyanBright" />
              </div>
              <h3 className="text-lg font-bold text-white truncate">{file.title}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={fileDownloadUrl}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-cyanBright text-black hover:bg-cyan-400 font-bold rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" /> Baixar Arquivo
              </a>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-lg text-white hover:bg-red-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white relative">
            {previewUrl ? (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-none"
                title={`Pré-visualização de ${file.title}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <AlertTriangle className="w-16 h-16 mb-4 text-yellow-500" />
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Pré-visualização Indisponível</h4>
                <p className="text-center max-w-md">
                  O navegador não suporta a visualização direta deste formato. Utilize o botão <strong>"Baixar Arquivo"</strong> acima para abri-lo em seu computador.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}