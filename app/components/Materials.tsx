"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, X, Download, ChevronRight, ArrowLeft, Loader2, Link as LinkIcon, ExternalLink, Plus, Search, FolderSync, Users } from "lucide-react";
import { getFolderContents } from "@/app/actions"; 
import FileIcon from "./FileIcon";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface Material {
  id: string; title: string; type: string; fileUrl: string | null; size: number;
}
interface UserFolder {
  id: string; 
  name: string; 
  folderName?: string | null; 
  folderCategory?: string | null; 
  folderDescription?: string | null; 
  materials: Material[]; 
  creatorName?: string;
  creatorDescription?: string;
  numMaterials?: number;
  numSubscribers?: number;
  downloads?: number;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; 
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Lógica para Avatar estilo Google (Letra inicial + Cor gerada pelo nome)
const avatarColors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500"];
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export default function Materials({ folders = [] }: { folders: UserFolder[] }) {
  const [selectedUser, setSelectedUser] = useState<UserFolder | null>(null);
  const [currentItems, setCurrentItems] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([]);
  
  // Estados para Filtro e Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  const [visibleCount, setVisibleCount] = useState(6);
  
  useEffect(() => {
     if (window.innerWidth < 768) setVisibleCount(3);
  }, []);

  useEffect(() => {
    if (selectedUser) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedUser]);

  const handleOpenFolder = (user: UserFolder) => {
    setSelectedUser(user); setCurrentItems(user.materials); setBreadcrumbs([{ id: null, name: "Início" }]); 
  };
  const handleClose = () => { setSelectedUser(null); setCurrentItems([]); setBreadcrumbs([]); };

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

  // Gerar lista de categorias únicas baseadas nas pastas existentes
  const categories = useMemo(() => {
    const cats = new Set(folders.map(f => f.folderCategory || "Geral"));
    return ["Todas", ...Array.from(cats)];
  }, [folders]);

  // Aplicar Busca e Filtro de Categoria
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => {
      const title = folder.folderName || folder.name || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todas" || (folder.folderCategory || "Geral") === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [folders, searchTerm, selectedCategory]);

  return (
    <div className={`w-full min-h-screen bg-white text-black font-sans selection:bg-[#10B981]/10 ${poppins.className}`}>
      <div className="container mx-auto px-4 md:px-10 py-8 md:py-12">
        
        {/* BARRA DE PESQUISA E FILTRO DE CATEGORIAS */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 border-b border-gray-100 pb-8">
          
          <div className="relative w-full md:w-1/2 lg:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome da pasta..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[52px] pl-12 pr-4 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 md:items-center">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition ${
                  selectedCategory === cat 
                    ? 'bg-[#10B981] text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID DE PASTAS */}
        {filteredFolders.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-gray-400">
            <FolderSync className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-xl font-bold">Nenhuma pasta encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.slice(0, visibleCount).map((folder) => {
              const displayName = folder.folderName || folder.name || "Pasta Sem Nome";
              const creatorName = folder.creatorName || "Criador";
              const categoryName = folder.folderCategory || "Geral";
              
              return (
                <div 
                  key={folder.id} onClick={() => handleOpenFolder(folder)}
                  className="group bg-white cursor-pointer rounded-3xl p-6 border border-gray-200 hover:border-[#10B981]/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* AVATAR ESTILO GOOGLE */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm ${getAvatarColor(creatorName)}`}>
                        {creatorName.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* BADGE DA CATEGORIA */}
                      <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider border border-gray-200 group-hover:bg-[#10B981]/10 group-hover:text-[#10B981] transition-colors">
                        {categoryName}
                      </span>
                    </div>
                    
                    {/* TÍTULO PRINCIPAL (NOME DA PASTA) */}
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#10B981] transition mb-1 line-clamp-1">
                      {displayName}
                    </h3>
                    <p className="text-xs text-gray-400 font-normal mb-4">por {creatorName}</p>
                    
                    <p className="text-sm text-gray-500 font-normal mb-6 line-clamp-2 min-h-[40px]">
                      {folder.creatorDescription || folder.folderDescription || "Nenhuma descrição informada para esta pasta."}
                    </p>
                  </div>

                  <div>
                    {/* ESTATÍSTICAS (Arquivos, Inscritos e Downloads) */}
                    <div className="grid grid-cols-3 gap-2 bg-gray-50/80 rounded-2xl p-3 text-center border border-gray-100 mb-5 group-hover:bg-[#10B981]/5 transition-colors">
                      <div>
                        <FolderSync className="w-4 h-4 text-[#10B981] mx-auto mb-1" />
                        <p className="font-bold text-gray-900 text-xs">{folder.materials?.length || 0}</p>
                        <p className="text-gray-400 text-[10px]">Arquivos</p>
                      </div>
                      <div>
                        <Users className="w-4 h-4 text-[#10B981] mx-auto mb-1" />
                        <p className="font-bold text-gray-900 text-xs">-</p>
                        <p className="text-gray-400 text-[10px]">Acessos</p>
                      </div>
                      <div>
                        <Download className="w-4 h-4 text-[#10B981] mx-auto mb-1" />
                        <p className="font-bold text-gray-900 text-xs">-</p>
                        <p className="text-gray-400 text-[10px]">Downloads</p>
                      </div>
                    </div>
                    <button className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#0A192F] text-white font-medium text-sm rounded-2xl group-hover:bg-[#10B981] transition-colors shadow-md">
                      <FolderOpen className="w-4 h-4" /> Ir para a Pasta
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTÃO VER MAIS */}
        {filteredFolders.length > visibleCount && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => setVisibleCount(prev => prev + (window.innerWidth < 768 ? 3 : 6))} className="flex items-center gap-2 px-8 py-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> Ver Mais Pastas
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE ARQUIVOS (Fundo Branco Limpo) */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-4xl max-h-[85vh] h-[600px] rounded-[30px] shadow-2xl flex flex-col overflow-hidden mx-4">
              
              <div className="p-4 md:p-6 border-b border-gray-100 bg-white flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {breadcrumbs.length > 1 && <button onClick={handleNavigateBack} className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>}
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 truncate"><FolderOpen className="w-5 h-5 text-[#10B981] shrink-0" /><span className="truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || selectedUser.folderName || selectedUser.name}</span></h3>
                    </div>
                  </div>
                  <button onClick={handleClose} className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto overscroll-none flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {isLoading ? <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 text-[#10B981] animate-spin" /></div> 
                : currentItems.length === 0 ? <div className="text-center text-gray-400 mt-10 flex flex-col items-center"><FolderSync className="w-12 h-12 mb-4 opacity-20" />Pasta vazia.</div> 
                : (
                  <div className="grid gap-3">
                    {currentItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#10B981]/50 hover:bg-white hover:shadow-sm transition-all group cursor-pointer" onClick={() => item.type === 'FOLDER' && handleEnterFolder(item.id, item.title)}>
                        
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center bg-white border border-gray-200 shadow-sm`}>
                            {item.type === 'FOLDER' ? <Folder className="w-5 h-5 md:w-6 md:h-6 text-[#10B981] fill-[#10B981]/20" /> 
                             : item.type === 'LINK' ? <LinkIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-500" /> 
                             : <FileIcon filename={item.title} className="w-8 h-8" />}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="text-gray-900 font-medium truncate text-sm md:text-base group-hover:text-[#10B981] transition-colors">{item.title}</h4>
                            <div className="flex gap-2 text-xs text-gray-400 mt-1">
                              {item.type !== 'FOLDER' && item.type !== 'LINK' && <span className="py-0.5">{formatBytes(item.size)}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {item.type === 'FOLDER' ? <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#10B981] transition-colors" /> : (
                          <a href={item.type === 'LINK' ? item.fileUrl! : `/api/download?path=${item.fileUrl}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-[#10B981] hover:border-[#10B981] hover:text-white rounded-full text-xs md:text-sm font-medium border border-gray-200 transition-colors shadow-sm" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}