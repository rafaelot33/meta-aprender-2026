import Showcase from "./components/Showcase";
import BookCatalog from "./components/BookCatalog"; // <-- 1. IMPORTAMOS O NOVO COMPONENTE
import { prisma } from "./lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Home() {
  
  // Busca os dados das Pastas e Usuários (O que já existia)
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

  // 2. BUSCA TODOS OS LIVROS CADASTRADOS NO BANCO DE DADOS
  const allBooks = await prisma.book.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    // ATENÇÃO AQUI: Como agora temos a Vitrine e os Livros, precisamos tirar o "h-screen overflow-hidden"
    // para que a pessoa possa rolar a página para baixo e ver os livros!
    <main className="bg-black min-h-screen selection:bg-[#10B981]/10 selection:text-white">
      
      {/* Agora passamos tanto os folders quanto os books para o Showcase */}
      <Showcase folders={foldersData} books={allBooks} />
      
    </main>
  );
}