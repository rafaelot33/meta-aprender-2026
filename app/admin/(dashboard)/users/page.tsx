import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserPlus, Shield, User, FolderOpen, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { createNewUser, moveUserOrder } from "@/app/actions";
import Link from "next/link";
import EditUserButton from "./EditUserButton"; 
import DeleteUserButton from "./DeleteUserButton"; 

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/admin/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
        <Shield className="w-16 h-16 mb-4 text-red-500" />
        <h1 className="text-xl font-bold text-white">Acesso Negado</h1>
        <p>Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' }
    ]
  });

  return (
    <div className="space-y-8 w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Usuários</h1>
          <p className="text-gray-400 text-sm">Cadastre novos membros e organize a sequência da Landing Page.</p>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-white/5 p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg text-white mb-4 flex items-center gap-2 font-bold">
          <UserPlus className="text-cyanBright" /> Novo Cadastro
        </h2>
        
        <form action={createNewUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
             <label className="text-xs text-gray-400 mb-1 block">Nome</label>
             <input name="name" placeholder="Nome Completo" className="w-full bg-[#0F172A] border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-cyanBright" required />
          </div>
          <div className="lg:col-span-1">
             <label className="text-xs text-gray-400 mb-1 block">Email</label>
             <input name="email" type="email" placeholder="email@exemplo.com" className="w-full bg-[#0F172A] border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-cyanBright" required />
          </div>
          <div className="lg:col-span-1">
             <label className="text-xs text-gray-400 mb-1 block">Senha</label>
             <input name="password" type="password" placeholder="******" className="w-full bg-[#0F172A] border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-cyanBright" required />
          </div>
          <div className="lg:col-span-1">
             <label className="text-xs text-gray-400 mb-1 block">Perfil</label>
             <select name="role" className="w-full bg-[#0F172A] border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-cyanBright">
              <option value="USER">Servidor Meta</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          
          <div className="lg:col-span-1">
            <button className="w-full bg-vibrantPurple text-white p-3 rounded-lg font-bold hover:bg-purple-600 transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2">
               <UserPlus className="w-4 h-4" /> Cadastrar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-400 min-w-[800px]"> 
            <thead className="bg-[#1E293B] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Usuário</th>
                <th className="p-4">Email</th>
                <th className="p-4">Função</th>
                <th className="p-4 text-center">Ordem</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u, index) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.role === 'ADMIN' ? 'bg-vibrantPurple/20 text-vibrantPurple' : 'bg-cyanBright/20 text-cyanBright'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  
                  <td className="p-4 text-sm">{u.email}</td>
                  
                  <td className="p-4">
                    {u.role === 'ADMIN' ? (
                      <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20 flex w-fit items-center gap-1">
                        <Shield className="w-3 h-3"/> ADMIN
                      </span>
                    ) : (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                        SERVIDOR META
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                        {index > 0 ? (
                            <form action={moveUserOrder}>
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="direction" value="up" />
                                <button type="submit" className="p-1.5 bg-white/5 hover:bg-cyanBright hover:text-black rounded-lg transition-colors" title="Mover para Cima">
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                            </form>
                        ) : <div className="w-7 h-7" />}

                        {index < users.length - 1 ? (
                            <form action={moveUserOrder}>
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="direction" value="down" />
                                <button type="submit" className="p-1.5 bg-white/5 hover:bg-cyanBright hover:text-black rounded-lg transition-colors" title="Mover para Baixo">
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </form>
                        ) : <div className="w-7 h-7" />}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/dashboard?viewUser=${u.id}`}
                        className="p-2 bg-white/5 hover:bg-cyanBright hover:text-black rounded-lg text-gray-400 transition-all text-xs font-bold flex items-center gap-2 border border-white/5"
                        title="Ver Arquivos"
                      >
                        <FolderOpen className="w-4 h-4" /> <span className="hidden xl:inline">Arquivos</span>
                      </Link>

                      <EditUserButton user={u} />

                      {u.id !== currentUser.id && (
                          <DeleteUserButton userId={u.id} /> 
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}