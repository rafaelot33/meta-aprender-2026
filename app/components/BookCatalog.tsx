"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { BookOpen, Download, ExternalLink, FileText, SearchX, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface Book {
  id: string; title: string; category: string; subCategory: string | null; type: string; coverUrl: string; contentUrl: string;
}

export default function BookCatalog({ books }: { books: Book[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("Todas");
  
  // NOVO: Controle de quantos livros aparecem na tela
  const [visibleCount, setVisibleCount] = useState(10);

  // Ajusta a quantidade inicial baseada no tamanho da tela (Mobile mostra menos de início)
  useEffect(() => {
    if (window.innerWidth < 768) setVisibleCount(6);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(books.map(b => b.category));
    return ["Todas", ...Array.from(cats).sort()];
  }, [books]);

  const subCategories = useMemo(() => {
    let filtered = books;
    if (activeCategory !== "Todas") filtered = books.filter(b => b.category === activeCategory);
    const subs = new Set(filtered.map(b => b.subCategory).filter(Boolean) as string[]);
    return ["Todas", ...Array.from(subs).sort()];
  }, [books, activeCategory]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchCategory = activeCategory === "Todas" || book.category === activeCategory;
      const matchSubCategory = activeSubCategory === "Todas" || book.subCategory === activeSubCategory;
      return matchCategory && matchSubCategory;
    });
  }, [books, activeCategory, activeSubCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubCategory("Todas");
    setVisibleCount(window.innerWidth < 768 ? 6 : 10); // Reseta a paginação ao mudar categoria
  };

  const handleSubCategoryChange = (sub: string) => {
    setActiveSubCategory(sub);
    setVisibleCount(window.innerWidth < 768 ? 6 : 10); // Reseta a paginação ao mudar subcategoria
  };

  if (books.length === 0) return null;

  return (
    <div className={`w-full bg-white text-black font-sans selection:bg-[#EAB308]/10 ${poppins.className}`}>
      <div className="container mx-auto pb-12">
        
        <div className="flex flex-col gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat) => (
              <button 
                key={cat} onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition shadow-sm ${
                  activeCategory === cat 
                    ? 'bg-[#EAB308] text-white border-[#EAB308]' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {subCategories.length > 1 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 items-center pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase mr-1">Subcategoria:</span>
              {subCategories.map(sub => (
                <button
                  key={sub} onClick={() => handleSubCategoryChange(sub)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
                    activeSubCategory === sub 
                      ? "bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30" 
                      : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-gray-400">
            <SearchX className="w-16 h-16 mb-4 opacity-30 text-[#EAB308]" />
            <p className="text-xl font-bold">Nenhum livro encontrado.</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              <AnimatePresence>
                {/* NOVO: Aqui o slice corta a lista para mostrar apenas até o limite do visibleCount */}
                {filteredBooks.slice(0, visibleCount).map((book) => (
                  <motion.div
                    layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                    key={book.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#EAB308]/40 transition-all group flex flex-col hover:shadow-[0_15px_40px_rgba(234,179,8,0.1)] h-full cursor-default"
                  >
                    <div className="relative w-full aspect-[2/3] bg-gray-100 overflow-hidden border-b border-gray-100">
                      <Image 
                        src={`/api/download?path=${book.coverUrl}&view=true`} alt={`Capa de ${book.title}`} fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized 
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded shadow-sm border border-gray-100 flex items-center gap-1 text-[9px] font-bold text-gray-600">
                        {book.type === 'FILE' ? <FileText className="w-3 h-3 text-[#EAB308]" /> : <ExternalLink className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col z-10 bg-white">
                      <p className="text-[#EAB308] text-[9px] uppercase font-bold tracking-wider mb-1 line-clamp-1">
                        {book.category} {book.subCategory && `• ${book.subCategory}`}
                      </p>
                      <h3 className="text-gray-900 font-bold text-sm leading-tight mb-4 line-clamp-2 group-hover:text-[#EAB308] transition-colors" title={book.title}>
                        {book.title}
                      </h3>

                      <div className="mt-auto">
                        <a 
                          href={book.type === 'LINK' ? book.contentUrl : `/api/download?path=${book.contentUrl}&view=true`} target="_blank"
                          className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 hover:bg-[#EAB308] hover:text-white border border-gray-200 hover:border-[#EAB308] py-2.5 rounded-xl transition-all duration-300 text-xs font-bold"
                        >
                          {book.type === 'FILE' ? <><Download className="w-4 h-4" /> Baixar PDF</> : <><ExternalLink className="w-4 h-4" /> Acessar Online</>}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* NOVO: BOTÃO VER MAIS */}
            {filteredBooks.length > visibleCount && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + (window.innerWidth < 768 ? 6 : 10))} 
                  className="flex items-center gap-2 px-8 py-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Ver Mais Livros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}