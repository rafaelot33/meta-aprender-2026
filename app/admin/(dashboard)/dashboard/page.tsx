import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { Upload, FolderPlus, Folder, ArrowLeft, Home, FolderOpen, User, Link as LinkIcon } from "lucide-react";
import { createFolder, createLink } from "@/app/actions"; 
import Link from "next/link";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm"; 
import BackupButton from "./BackupButton"; 

// Importa o novo componente que lida com a lista interativa (que criaremos logo abaixo no mesmo arquivo)
import InteractiveFileList from "./InteractiveFileList";

interface PageProps {
  searchParams: Promise<{ folder?: string; viewUser?: string }>;
}

export default async function DashboardPage(props: PageProps) {
  const session = await getServerSession();
  const params = await props.searchParams;
  
  const currentFolderId = params.folder || null;
  const viewUserId = params.viewUser || null;

  if (!session?.user?.email) redirect("/admin/login");

  const loggedUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!loggedUser) return <div>Erro de sessão</div>;

  const isAdmin = loggedUser.role === 'ADMIN';
  const showUserList = isAdmin && !currentFolderId && !viewUserId;
  const targetUserId = (isAdmin && viewUserId) ? viewUserId : loggedUser.id;

  let materials: any[] = [];
  let usersList: any[] = [];

  if (showUserList) {
    usersList = await prisma.user.findMany({
        where: { id: { not: loggedUser.id } } 
    });
  } else {
    materials = await prisma.material.findMany({
      where: { 
        userId: targetUserId, 
        parentId: currentFolderId 
      }
    });
  }

  const sortedMaterials = materials.sort((a, b) => {
    if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
    if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
    if (a.type === 'LINK' && b.type !== 'LINK') return -1;
    if (a.type !== 'LINK' && b.type === 'LINK') return 1;
    if (a.type === b.type) return a.title.localeCompare(b.title);
    return a.type.localeCompare(b.type);
  });

  const allFolders = await prisma.material.findMany({
    where: { 
        userId: targetUserId, 
        type: 'FOLDER',
        id: { not: currentFolderId || "" }
    }
  });

  let currentFolderName = "Raiz";
  let parentOfCurrent = null;
  if (currentFolderId) {
    const f = await prisma.material.findUnique({ where: { id: currentFolderId } });
    if (f) { currentFolderName = f.title; parentOfCurrent = f.parentId; }
  } else if (viewUserId) {
     const u = await prisma.user.findUnique({ where: { id: viewUserId }});
     currentFolderName = `Arquivos de ${u?.name}`;
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#1E293B] p-4 rounded-xl border border-white/5 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
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

        {!showUserList && !currentFolderId && (
            <BackupButton />
        )}
      </div>

      {/* MODO LISTA DE USUÁRIOS (ADMIN) */}
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
            {/* Ações (Grid Responsivo) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
                    <form action={createFolder} className="flex gap-2">
                        <input type="hidden" name="parentId" value={currentFolderId || ""} />
                        <input type="hidden" name="targetUserId" value={targetUserId} />
                        <input name="name" placeholder="Nova Pasta..." className="bg-[#0F172A] text-white px-3 py-2 rounded-lg border border-white/10 flex-1 text-xs outline-none" required />
                        <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg"><FolderPlus className="w-5 h-5" /></button>
                    </form>
                </div>
                
                <UploadForm parentId={currentFolderId} targetUserId={targetUserId} />

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

            {/* AQUI ESTÁ A GRANDE MUDANÇA: Passamos a lista de arquivos para um componente Cliente que sabe abrir Modais! */}
            <InteractiveFileList 
              materials={sortedMaterials} 
              allFolders={allFolders} 
              viewUserId={viewUserId} 
            />
        </>
      )}
    </div>
  );
}