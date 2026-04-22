import Showcase from "./components/Showcase";
import { prisma } from "./lib/prisma";

// AS TRÊS LINHAS MÁGICAS QUE DESLIGAM O CACHE DA LANDING PAGE:
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Home() {
  
  const rawUsersWithFolders = await prisma.user.findMany({
    orderBy: { displayOrder: 'asc' }, 
    include: { materials: { where: { parentId: null } } }
  });

  const usersWithFolders = rawUsersWithFolders.map(user => ({
    ...user,
    materials: user.materials.sort((a, b) => {
      if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
      if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;
      if (a.type === 'LINK' && b.type !== 'LINK') return -1;
      if (a.type === 'LINK' && b.type === 'LINK') return 1;
      if (a.type === b.type) return a.title.localeCompare(b.title);
      return a.type.localeCompare(b.type);
    })
  }));

  const foldersData = usersWithFolders.map(user => {
    // Transformamos em 'any' para o TypeScript não barrar a leitura de colunas personalizadas
    const u = user as any; 
    
    return {
      id: u.id,
      name: u.folderName || u.name || "Pasta Sem Nome", 
      creatorName: u.name || "Desconhecido",
      folderCategory: u.folderCategory || "Geral", 
      creatorDescription: u.folderDescription || u.description || "Nenhuma descrição informada.",
      materials: u.materials, 
      numMaterials: u.materials?.length || 0,
      numSubscribers: Math.floor(Math.random() * 50) + 5, 
      downloads: Math.floor(Math.random() * 200) + 15,
    };
  });

  return (
    // MÁGICA AQUI: h-screen e overflow-hidden para travar a tela e impedir de rolar para baixo!
    <main className="bg-black h-screen overflow-hidden selection:bg-[#10B981]/10 selection:text-white">
      
      {/* Agora a Vitrine é a ÚNICA coisa na página inicial */}
      <Showcase folders={foldersData} />
      
    </main>
  );
}