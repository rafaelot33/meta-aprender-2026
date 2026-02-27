import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingHero from "./components/LandingHero";
import Partners from "./components/Partners"; // O novo arquivo
import Materials from "./components/Materials";
import { prisma } from "./lib/prisma";

export default async function Home() {
  
  // Busca apenas usuários que têm pastas configuradas ou arquivos
  const usersWithFolders = await prisma.user.findMany({
    orderBy: { displayOrder: 'asc' }, // <--- Mude a ordem de busca aqui na Landing Page
    include: { materials: { where: { parentId: null } } }
});

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