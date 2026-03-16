import Showcase from "./components/Showcase";
import { prisma } from "./lib/prisma";

export const dynamic = 'force-dynamic';

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

  const foldersData = usersWithFolders.map(user => ({
    id: user.id,
    name: user.folderName || user.name || "Pasta Sem Nome", 
    creatorName: user.name || "Desconhecido",
    folderCategory: user.folderCategory || "Geral", 
    creatorDescription: user.folderDescription || user.description || "Nenhuma descrição informada.",
    materials: user.materials, 
    numMaterials: user.materials.length,
    numSubscribers: Math.floor(Math.random() * 50) + 5, 
    downloads: Math.floor(Math.random() * 200) + 15,
  }));

  return (
    // MÁGICA AQUI: h-screen e overflow-hidden para travar a tela e impedir de rolar para baixo!
    <main className="bg-black h-screen overflow-hidden selection:bg-[#10B981]/10 selection:text-white">
      
      {/* Agora a Vitrine é a ÚNICA coisa na página inicial */}
      <Showcase folders={foldersData} />
      
      {/* Removemos a div de Materiais daqui, porque ela já existe dentro do Modal do Showcase! */}
      
    </main>
  );
}