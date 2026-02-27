import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import SettingsForm from "./SettingsForm"; // Importa o componente que acabamos de criar

export default async function SettingsPage() {
  const session = await getServerSession();
  
  // Busca os dados atuais no servidor
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Configurações da Pasta</h1>
        <p className="text-gray-400 text-sm">Personalize como os alunos e visitantes veem seu acervo público.</p>
      </div>

      {/* Chama o formulário de cliente passando os dados */}
      <SettingsForm user={user} />
    </div>
  );
}