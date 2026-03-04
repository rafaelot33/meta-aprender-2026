import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { Upload, FolderPlus, Folder, FileText, ArrowLeft, Trash2, Home, FolderOpen, ArrowRightLeft, User, ShieldAlert, Link as LinkIcon, Archive } from "lucide-react";
import { createFolder, deleteMaterial, moveMaterial, createLink } from "@/app/actions"; 
import Link from "next/link";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm"; 
import MoveButton from "./MoveButton";
import RenameButton from "./RenameButton"; 
import BackupButton from "./BackupButton"; 
import FileIcon from "@/app/components/FileIcon";

// Helpers
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface PageProps {
  searchParams: Promise<{ folder?: string; viewUser?: string }>;
}

export default async function DashboardPage(props: PageProps) {
  const session = await getServerSession();
  const params = await props.searchParams;
  
  const currentFolderId = params.folder || null;
  const viewUserId = params.viewUser || null;

  if (!session?.user?.email) redirect("/admin/login");

  // Busca dados do Usuário Logado
  const loggedUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!loggedUser) return <div>Erro de sessão</div>;

  // --- LÓGICA DE ADMINISTRAÇÃO ---
  const isAdmin = loggedUser.role === 'ADMIN';
  const showUserList = isAdmin && !currentFolderId && !viewUserId;

  // CRUCIAL: Definir quem é o dono dos arquivos que estamos vendo
  const targetUserId = (isAdmin && viewUserId) ? viewUserId : loggedUser.id;

  // Busca Conteúdo
  let materials: any[] = [];
  let usersList: any[] = [];

  if (showUserList) {
    // Admin vendo a lista de usuários
    usersList = await prisma.user.findMany({
        where: { id: { not: loggedUser.id } } 
    });
  } else {
    // Vendo arquivos
    materials = await prisma.material.findMany({
      where: { 
        userId: targetUserId, 
        parentId: currentFolderId 
      }
    });
  }

  // --- LÓGICA DE ORGANIZAÇÃO INTELIGENTE ---
  const sortedMaterials = materials.sort((a, b) => {
    if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
    if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
    if (a.type === 'LINK' && b.type !== 'LINK') return -1;
    if (a.type !== 'LINK' && b.type === 'LINK') return 1;
    if (a.type === b.type) return a.title.localeCompare(b.title);
    return a.type.localeCompare(b.type);
  });

  // Busca Pastas para o Dropdown "Mover Para"
  const allFolders = await prisma.material.findMany({
    where: { 
        userId: targetUserId, 
        type: 'FOLDER',
        id: { not: currentFolderId || "" }
    }
  });

  // Breadcrumb info
  let currentFolderName = "Raiz";
  let parentOfCurrent = null;
  if (currentFolderId) {
    const f = await prisma.material.findUnique({ where: { id: currentFolderId } });
    if (f) { currentFolderName = f.title; parentOfCurrent = f.parentId; }
  } else if (viewUserId) {
     const u = await prisma.user.findUnique({ where: { id: viewUserId }});
     currentFolderName = `Arquivos de ${u?.name}`;
  }

  // --- RENDERIZAÇÃO ---
  return (
    <div className="space-y-6 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#1E293B] p-4 rounded-xl border border-white/5 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          
          {/* Botão Voltar */}
          {currentFolderId ? (
            <Link 
              href={`/admin/dashboard?folder=${parentOfCurrent || ""}${viewUserId ? `&viewUser=${viewUserId}` : ""}`} 
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
          ) : viewUserId ? (
            <Link href="/admin/dashboard" className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
          ) : (
            <div className="p-2 bg-vibrantPurple/20 rounded-lg">
              <Home className="w-5 h-5 text-vibrantPurple" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 truncate">
              {currentFolderId ? <FolderOpen className="text-cyanBright shrink-0" /> : null} 
              <span className="truncate">{currentFolderName}</span>
            </h1>
            <p className="text-xs text-gray-400">
                {isAdmin && !viewUserId && !currentFolderId ? "Painel Geral" : "Gerenciador"}
            </p>
          </div>
        </div>

        {/* Botão de Backup */}
        {!showUserList && !currentFolderId && (
            <BackupButton />
        )}
      </div>

      {/* --- MODO LISTA DE USUÁRIOS (ADMIN) --- */}
      {showUserList ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/admin/dashboard?viewUser=${loggedUser.id}`} className="bg-vibrantPurple p-6 rounded-xl flex items-center gap-4 hover:opacity-90 transition-all shadow-lg">
                <div className="bg-white/20 p-3 rounded-full"><User className="w-6 h-6 text-white"/></div>
                <div>
                    <h3 className="font-bold text-white">Meus Arquivos</h3>
                    <p className="text-xs text-white/70">Acessar meu drive</p>
                </div>
            </Link>

            {usersList.map(u => (
                 <Link key={u.id} href={`/admin/dashboard?viewUser=${u.id}`} className="bg-[#1E293B] border border-white/5 p-6 rounded-xl flex items-center gap-4 hover:border-cyanBright/50 transition-all">
                 <div className="bg-white/5 p-3 rounded-full"><User className="w-6 h-6 text-cyanBright"/></div>
                 <div>
                     <h3 className="font-bold text-white">{u.name}</h3>
                     <p className="text-xs text-gray-500">{u.role}</p>
                 </div>
             </Link>
            ))}
        </div>
      ) : (
        <>
            {/* --- MODO ARQUIVOS (NORMAL) --- */}
            
            {/* Ações (Grid Responsivo) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Criar Pasta */}
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
                    <form action={createFolder} className="flex gap-2">
                        <input type="hidden" name="parentId" value={currentFolderId || ""} />
                        <input type="hidden" name="targetUserId" value={targetUserId} />
                        <input name="name" placeholder="Nova Pasta..." className="bg-[#0F172A] text-white px-3 py-2 rounded-lg border border-white/10 flex-1 text-xs outline-none" required />
                        <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg"><FolderPlus className="w-5 h-5" /></button>
                    </form>
                </div>
                
                {/* 2. Upload Arquivo */}
                <UploadForm parentId={currentFolderId} targetUserId={targetUserId} />

                {/* 3. Criar Link */}
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
                     <form action={createLink} className="flex gap-2 items-center">
                        <input type="hidden" name="parentId" value={currentFolderId || ""} />
                        <input type="hidden" name="targetUserId" value={targetUserId} />
                        <div className="flex-1 flex flex-col gap-2">
                             <input name="title" placeholder="Nome do Link" className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg border border-white/10 text-xs outline-none" required />
                             <input name="url" placeholder="https://site.com" className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg border border-white/10 text-xs outline-none" required />
                        </div>
                        <button className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg h-full"><LinkIcon className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>

            {/* Lista de Materiais Organizada */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedMaterials.map((item) => (
                <div key={item.id} className="group bg-[#0F172A] border border-white/10 p-3 rounded-xl flex items-center justify-between hover:border-cyanBright/30 transition-all">
                    
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                        <div className="shrink-0">
                            {item.type === 'FOLDER' ? <Folder className="w-8 h-8 text-yellow-500" /> : 
                             item.type === 'LINK' ? <LinkIcon className="w-8 h-8 text-green-400" /> :
                             <FileIcon filename={item.title} className="w-8 h-8" />}
                        </div>
                        <div className="truncate pr-2 w-full">
                            {item.type === 'FOLDER' ? (
                                <Link 
                                    href={`/admin/dashboard?folder=${item.id}${viewUserId ? `&viewUser=${viewUserId}` : ""}`} 
                                    className="text-white font-bold hover:underline block truncate text-sm"
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <a 
                                    href={item.fileUrl!} 
                                    target="_blank" 
                                    className="text-white font-medium hover:underline block truncate text-sm"
                                >
                                    {item.title}
                                </a>
                            )}
                            <span className="text-[10px] text-gray-500 block">
                                {item.type === 'FOLDER' ? 'Pasta' : item.type === 'LINK' ? 'Link Externo' : formatBytes(item.size)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <MoveButton 
                            itemId={item.id} 
                            folders={allFolders.filter(f => f.id !== item.id)} 
                        />
                        <RenameButton itemId={item.id} currentName={item.title} />
                        <form action={deleteMaterial.bind(null, item.id)}>
                            <button className="text-red-400 hover:text-red-500 bg-[#1E293B] p-2 rounded-lg border border-white/5 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>
                ))}
                
                {sortedMaterials.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">
                        Pasta vazia.
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
}