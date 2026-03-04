import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";
import Partners from "./components/Partners";
import Materials from "./components/Materials";
import { prisma } from "./lib/prisma";

// Garante que a Landing Page mostre os arquivos novos na mesma hora (Sem Cache)
export const dynamic = 'force-dynamic';

export default async function Home() {
  
  // Busca os usuários e os materiais brutos no banco
  const rawUsersWithFolders = await prisma.user.findMany({
    orderBy: { displayOrder: 'asc' }, 
    include: { materials: { where: { parentId: null } } }
  });

  // Aplica a Organização Inteligente nos materiais antes de mandar para a tela
  const usersWithFolders = rawUsersWithFolders.map(user => ({
    ...user,
    materials: user.materials.sort((a, b) => {
      // 1. Pastas primeiro
      if (a.type === 'FOLDER' && b.type !== 'FOLDER') return -1;
      if (a.type !== 'FOLDER' && b.type === 'FOLDER') return 1;

      // 2. Links em seguida (Opcional, mas mantém organizado)
      if (a.type === 'LINK' && b.type !== 'LINK') return -1;
      if (a.type !== 'LINK' && b.type === 'LINK') return 1;

      // 3. Se for do mesmo tipo (Duas pastas, ou dois PDFs), desempata por ordem alfabética
      if (a.type === b.type) {
        return a.title.localeCompare(b.title);
      }

      // 4. Se forem arquivos diferentes (PDF e JPG), agrupa pelo tipo em ordem alfabética
      return a.type.localeCompare(b.type);
    })
  }));

  return (
    <main className="bg-[#020617] min-h-screen text-white selection:bg-cyanBright selection:text-black overflow-x-hidden">
      
      <Navbar />

      {/* 1. Hero Interativo (Mouse Follow + Slogan) */}
      <LandingHero />

      {/* 2. Faixa de Parceiros (Conecta o Hero ao Conteúdo) */}
      <Partners />

      {/* 3. Acervo Digital (Design Escuro Unificado) */}
      <Materials folders={usersWithFolders} />
      
      <Footer />
      
    </main>
  );
}