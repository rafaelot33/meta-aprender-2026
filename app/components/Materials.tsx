"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, X, Download, ChevronRight, ArrowLeft, Loader2, Link as LinkIcon, ExternalLink, Plus } from "lucide-react";
import { getFolderContents } from "@/app/actions"; 
import FileIcon from "./FileIcon"; // O ícone inteligente

interface Material {
  id: string; title: string; type: string; fileUrl: string | null; size: number;
}
interface UserFolder {
  id: string; name: string; folderName: string | null; folderCategory: string | null; folderDescription: string | null; materials: Material[]; 
}

// CORREÇÃO DO TAMANHO (Adicionado "Bytes")
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function Materials({ folders }: { folders: UserFolder[] }) {
  const [selectedUser, setSelectedUser] = useState<UserFolder | null>(null);
  const [currentItems, setCurrentItems] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([]);
  
  // LOGICA DO "VER MAIS"
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => {
     if (window.innerWidth < 768) setVisibleCount(3); // Celular começa com 3
  }, []);

  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = "hidden"; // Esconde a barra do body
    } else {
      document.body.style.overflow = "unset";  // Devolve a barra do body
    }

    // Limpeza de segurança caso o componente seja fechado à força
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedUser]);

  const handleOpenFolder = (user: UserFolder) => {
    setSelectedUser(user); setCurrentItems(user.materials); setBreadcrumbs([{ id: null, name: "Início" }]); 
  };
  const handleClose = () => {
    setSelectedUser(null); setCurrentItems([]); setBreadcrumbs([]);
  };

  const handleEnterFolder = async (folderId: string, folderName: string) => {
    setIsLoading(true);
    try {
      const items = await getFolderContents(folderId);
      const sortedItems = items.sort((a, b) => {
        if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
        if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
        return 0;
      });
      setCurrentItems(sortedItems as Material[]);
      setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleNavigateBack = async () => {
    if (breadcrumbs.length <= 1) return; 
    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.pop(); 
    const previousFolder = newBreadcrumbs[newBreadcrumbs.length - 1]; 
    setBreadcrumbs(newBreadcrumbs);
    setIsLoading(true);
    try {
      if (previousFolder.id === null) setCurrentItems(selectedUser!.materials);
      else {
        const items = await getFolderContents(previousFolder.id);
        setCurrentItems(items as Material[]);
      }
    } catch (error) {} finally { setIsLoading(false); }
  };

  return (
    <section id="materiais" className="relative py-32 bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ACERVO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanBright to-vibrantPurple">CRIADORES</span>
            </h2>
            <p className="text-gray-400 text-lg font-light">Navegue pelas bibliotecas públicas.</p>
        </div>

        {/* GRID DE PASTAS COM LIMITE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.slice(0, visibleCount).map((folder, index) => (
             <motion.div key={folder.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => handleOpenFolder(folder)} className="group relative p-1 rounded-2xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-cyanBright to-vibrantPurple rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
              <div className="relative h-full bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-8 rounded-xl hover:bg-[#1E293B] transition-colors overflow-hidden">
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Folder className="w-6 h-6 text-cyanBright fill-cyanBright/20" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 uppercase tracking-wider">{folder.folderCategory || "Geral"}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyanBright">{folder.folderName || folder.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">{folder.folderDescription || "Sem descrição disponível."}</p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FolderOpen className="w-4 h-4" /><span>{folder.materials.length} na raiz</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">Acessar <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTÃO VER MAIS */}
        {folders.length > visibleCount && (
            <div className="mt-12 flex justify-center">
                <button onClick={() => setVisibleCount(prev => prev + (window.innerWidth < 768 ? 3 : 6))} className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-cyanBright transition-all font-bold text-sm">
                    <Plus className="w-4 h-4" /> Ver Mais Pastas
                </button>
            </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={handleClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-[#020617] w-full max-w-4xl max-h-[85vh] h-[600px] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden mx-4">
              
              <div className="p-4 md:p-6 border-b border-white/10 bg-[#0F172A] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {breadcrumbs.length > 1 && <button onClick={handleNavigateBack} className="p-2 bg-white/5 rounded-lg text-white"><ArrowLeft className="w-5 h-5" /></button>}
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 truncate"><FolderOpen className="w-5 h-5 text-cyanBright shrink-0" /><span className="truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || selectedUser.folderName}</span></h3>
                    </div>
                  </div>
                  <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto overscroll-none flex-1 bg-[#020617] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {isLoading ? <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-cyanBright animate-spin" /></div> 
                : currentItems.length === 0 ? <div className="text-center text-gray-500 mt-10">Pasta vazia.</div> 
                : (
                  <div className="grid gap-3">
                    {currentItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#0F172A]/50 border border-white/5 hover:border-cyanBright/30 transition-all group cursor-pointer" onClick={() => item.type === 'FOLDER' && handleEnterFolder(item.id, item.title)}>
                        
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg flex items-center justify-center bg-[#020617]`}>
                            {/* USANDO O COMPONENTE DE ÍCONE AQUI */}
                            {item.type === 'FOLDER' ? <Folder className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-yellow-500/20" /> 
                             : item.type === 'LINK' ? <LinkIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400" /> 
                             : <FileIcon filename={item.title} className="w-8 h-8" />}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium truncate text-sm md:text-base">{item.title}</h4>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                              {item.type !== 'FOLDER' && item.type !== 'LINK' && <span className="py-0.5">{formatBytes(item.size)}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {item.type === 'FOLDER' ? <ChevronRight className="w-5 h-5 text-gray-500" /> : (
                          // ATENÇÃO: Link agora usa a API de download
                          <a href={item.type === 'LINK' ? item.fileUrl! : `/api/download?path=${item.fileUrl}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-cyanBright hover:text-black text-white rounded-lg text-xs md:text-sm font-bold border border-white/10" onClick={(e) => e.stopPropagation()}>
                            {item.type === 'LINK' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />} 
                            <span className="hidden sm:inline">{item.type === 'LINK' ? 'Acessar' : 'Baixar'}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}