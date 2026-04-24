import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookForm from "./BookForm";
import { BookOpen, ExternalLink, FileText, Download } from "lucide-react";
import Image from "next/image";
import DeleteBookButton from "./DeleteBookButton";
import EditBookModal from "./EditBookModal";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BooksAdminPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect("/admin/login");

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email }, 
    select: { id: true, role: true } 
  });
  
  if (!user || user.role !== 'ADMIN') return <div>Acesso Negado</div>;

  // --- LÓGICA DE PAGINAÇÃO ---
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 12; // 12 livros por página (encaixa perfeitamente no grid de 2, 3, 4 ou 6)
  const skip = (currentPage - 1) * pageSize;

  // Busca o total geral para calcular as páginas
  const totalBooks = await prisma.book.count();
  const totalPages = Math.ceil(totalBooks / pageSize);

  // Busca apenas a "fatia" de livros da página atual
  const books = await prisma.book.findMany({ 
    orderBy: { createdAt: 'desc' },
    skip: skip,
    take: pageSize
  });

  return (
    <div className="space-y-10 pb-10">
      
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#1E293B] p-5 rounded-2xl border border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-xl"><BookOpen className="w-6 h-6 text-orange-400" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Catálogo de Livros</h1>
            <p className="text-sm text-gray-400">Adicione novos livros em PDF ou Links à biblioteca.</p>
          </div>
        </div>
      </div>

      <section>
        <BookForm userId={user.id} />
      </section>

      <section className="border-t border-white/10 pt-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <span className="w-2 h-6 bg-orange-400 rounded-full"></span> Livros Cadastrados ({totalBooks})
        </h2>

        {books.length === 0 ? (
          <div className="bg-[#1E293B] border border-dashed border-gray-600 rounded-2xl p-10 text-center"><p className="text-gray-400">Nenhum livro cadastrado.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book) => (
                <div key={book.id} className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden flex flex-col group">
                  
                  <div className="relative w-full aspect-[2/3] bg-[#0F172A]">
                    <Image src={`/api/download?path=${book.coverUrl}&view=true`} alt="Capa" fill className="object-cover" unoptimized />
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                      {book.type === 'FILE' ? <FileText className="w-3 h-3 text-cyanBright" /> : <ExternalLink className="w-3 h-3 text-green-400" />}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-white/5 text-gray-300 px-1.5 py-0.5 rounded">{book.category}</span>
                      {book.subCategory && <span className="text-[9px] uppercase tracking-wider font-bold bg-white/5 text-gray-300 px-1.5 py-0.5 rounded">{book.subCategory}</span>}
                    </div>
                    
                    <h3 className="text-white font-bold text-sm leading-tight mb-3 line-clamp-2" title={book.title}>{book.title}</h3>

                    <div className="mt-auto flex flex-col gap-2">
                      <a 
                        href={book.type === 'LINK' ? book.contentUrl : `/api/download?path=${book.contentUrl}&view=true`} 
                        target="_blank" 
                        className="w-full flex items-center justify-center gap-1.5 bg-vibrantPurple hover:bg-purple-500 text-white py-1.5 rounded-lg transition-colors text-xs font-bold"
                      >
                        {book.type === 'FILE' ? <><Download className="w-3.5 h-3.5"/> Abrir PDF</> : <><ExternalLink className="w-3.5 h-3.5"/> Acessar</>}
                      </a>

                      <div className="flex gap-2">
                        <EditBookModal book={book} />
                        <DeleteBookButton bookId={book.id} />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* CONTROLES DE PAGINAÇÃO */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link 
                  href={`/admin/books?page=${currentPage - 1}`}
                  className={`px-4 py-2 rounded-lg bg-[#1E293B] border border-white/5 text-sm font-bold transition ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'}`}
                >
                  Anterior
                </Link>
                
                <span className="text-gray-400 text-sm font-medium">
                  Página <span className="text-white">{currentPage}</span> de {totalPages}
                </span>

                <Link 
                  href={`/admin/books?page=${currentPage + 1}`}
                  className={`px-4 py-2 rounded-lg bg-[#1E293B] border border-white/5 text-sm font-bold transition ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'}`}
                >
                  Próxima
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}