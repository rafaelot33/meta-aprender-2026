"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Instagram, X, Copy, LayoutGrid } from "lucide-react";
import Materials from "./Materials"; 
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

const CARDS = [
  { id: "intro", title: "Introdução", color: "#2563EB", img: "/cards/1.png" }, 
  { id: "materiais", title: "Materiais", color: "#10B981", img: "/cards/2.png" }, 
  { id: "livros", title: "Livros", color: "#EAB308", img: "/cards/3.png" }, 
  { id: "jogos", title: "Jogos", color: "#EF4444", img: "/cards/4.png" }, 
];

export default function Showcase({ folders }: { folders: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverState, setHoverState] = useState<"left" | "right" | "none">("none");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"stack" | "grid">("stack");
  const [isMobile, setIsMobile] = useState(false);
  
  // ESTADO DO PRELOADER (Começa como true para mostrar a tela branca)
  const [showPreloader, setShowPreloader] = useState(true);

  const currentCard = CARDS[currentIndex];
  const nextCard = CARDS[(currentIndex + 1) % CARDS.length];

  // Temporizador do Preloader (Desaparece após 2.5 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2000); // Ajuste esse tempo (em milissegundos) conforme a duração do seu GIF
    return () => clearTimeout(timer);
  }, []);

  // Detector de Tamanho de Tela
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile(); 
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lógica do Mouse
  useEffect(() => {
    if (isModalOpen || viewMode === "grid" || isMobile || showPreloader) {
      setHoverState("none");
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const center = window.innerWidth / 2;
      const deadZoneRadius = window.innerWidth < 1400 ? 150 : 180;

      if (x < center - deadZoneRadius) {
        setHoverState("left");
      } else if (x > center + deadZoneRadius) {
        setHoverState("right");
      } else {
        setHoverState("none");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isModalOpen, viewMode, isMobile, showPreloader]);

  const handleBgClick = (e: React.MouseEvent) => {
    if (viewMode === "grid" || showPreloader) return;

    if (isMobile) {
      const x = e.clientX;
      const center = window.innerWidth / 2;
      if (x < center) setCurrentIndex((prev) => (prev + 1) % CARDS.length);
      else setIsModalOpen(true);
      return;
    }

    if (hoverState === "left") {
      setCurrentIndex((prev) => (prev + 1) % CARDS.length);
      setHoverState("none");
    } else if (hoverState === "right") {
      setIsModalOpen(true);
      setHoverState("none");
    }
  };

  const smoothTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  return (
    <>
      {/* TELA DE CARREGAMENTO (PRELOADER) COM FUNDO BRANCO */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
          >
            <Image 
              src="/logo.gif" 
              alt="Carregando..." 
              width={400} 
              height={400} 
              unoptimized // Impede o Next.js de travar a animação do GIF
              priority
              className="w-[180px] md:w-[250px] h-auto object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-[100dvh] overflow-hidden text-white cursor-default select-none bg-black" onClick={handleBgClick}>
        
        <motion.div className="absolute inset-0 z-0" animate={{ backgroundColor: currentCard.color }} transition={{ duration: 0.5 }} />
        
        <motion.div 
          className="absolute inset-y-0 left-0 w-1/2 z-0"
          animate={{ clipPath: hoverState === "left" ? "ellipse(56% 150% at 100% 50%)" : "ellipse(0% 150% at 100% 50%)", backgroundColor: nextCard.color }}
          transition={smoothTransition}
        />

        <motion.div 
          className="absolute inset-y-0 right-0 w-1/2 z-0 bg-black/20"
          animate={{ clipPath: hoverState === "right" ? "ellipse(56% 150% at 0% 50%)" : "ellipse(0% 150% at 0% 50%)" }}
          transition={smoothTransition}
        />

        <div className={`absolute inset-0 z-50 flex flex-col justify-between p-6 md:p-10 pointer-events-none ${poppins.className}`}>
          <div className="flex justify-between items-start w-full">
            <Link href="#ajuda" onClick={(e) => e.stopPropagation()} className="font-medium tracking-wide text-xs md:text-sm text-white hover:opacity-70 transition-opacity pointer-events-auto">Ajuda</Link>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-medium tracking-wide text-[10px] md:text-sm text-white whitespace-nowrap">Todos Pela Aprendizagem Das Crianças</h1>
            <a href="https://instagram.com/metaaprender" target="_blank" onClick={(e) => e.stopPropagation()} className="hover:opacity-70 transition-opacity pointer-events-auto flex items-center justify-center p-1.5 md:p-2 rounded-full bg-white/10 backdrop-blur-sm">
              <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </a>
          </div>

          <div className="flex justify-between items-end w-full">
            <Image src="/logo.png" alt="Logo" width={160} height={60} className="w-[100px] md:w-[140px] h-auto brightness-0 invert pointer-events-auto" priority />
            <Link href="/admin/login" onClick={(e) => e.stopPropagation()} className="font-medium tracking-wide text-xs md:text-sm text-white hover:opacity-70 transition-opacity pointer-events-auto pb-1">Plataforma</Link>
          </div>
        </div>

        <AnimatePresence>
          {viewMode === "stack" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`absolute inset-0 z-30 flex flex-row items-end lg:items-center justify-between px-6 sm:px-12 pb-28 lg:pb-0 lg:px-12 xl:px-20 2xl:px-[18%] pointer-events-none ${poppins.className}`}
            >
              <motion.span 
                className="font-medium text-xl sm:text-2xl md:text-3xl 2xl:text-4xl tracking-tight border-b-2 pb-1 md:pb-2"
                animate={{ 
                  color: isMobile ? "#FFFFFF" : (hoverState === "left" ? "#FFFFFF" : "rgba(0, 0, 0, 0.25)"),
                  borderColor: isMobile ? "rgba(255, 255, 255, 0.5)" : (hoverState === "left" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.1)")
                }} transition={{ duration: 0.3 }}
              >
                Próximo card
              </motion.span>
              <motion.span 
                className="font-medium text-xl sm:text-2xl md:text-3xl 2xl:text-4xl tracking-tight border-b-2 pb-1 md:pb-2"
                animate={{ 
                  color: isMobile ? "#FFFFFF" : (hoverState === "right" ? "#FFFFFF" : "rgba(0, 0, 0, 0.25)"),
                  borderColor: isMobile ? "rgba(255, 255, 255, 0.5)" : (hoverState === "right" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.1)")
                }} transition={{ duration: 0.3 }}
              >
                Mostre-me!
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex bg-[#1E1E1E]/90 backdrop-blur-md rounded-full p-1 sm:p-1.5 shadow-2xl border border-white/10 pointer-events-auto">
          <button onClick={(e) => { e.stopPropagation(); setViewMode("stack"); }} className={`p-2 sm:p-2.5 rounded-full transition-all ${viewMode === 'stack' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}><Copy className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setViewMode("grid"); }} className={`p-2 sm:p-2.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none pb-12 lg:pb-0" style={{ perspective: 1800 }}>
          {CARDS.map((card, idx) => {
            const offset = (idx - currentIndex + CARDS.length) % CARDS.length;
            const isTop = offset === 0;
            const spreadX = isMobile ? 18 : 30, spreadY = isMobile ? 8 : 12, lequeAberto = isMobile ? 70 : 120;

            return (
              <motion.div
                layoutId={`card-${card.id}`} key={`stack-${card.id}`} className="absolute overflow-hidden rounded-[20px] md:rounded-3xl"
                animate={{
                  x: isTop ? (hoverState === "left" ? -lequeAberto : hoverState === "right" ? lequeAberto : 0) : offset * spreadX,
                  y: isTop ? 0 : offset * spreadY, zIndex: 40 - offset, opacity: 1,
                  rotateY: isTop ? (hoverState === "left" ? -40 : hoverState === "right" ? 40 : 0) : 0,
                  rotateZ: isTop ? (hoverState === "left" ? -6 : hoverState === "right" ? 6 : 0) : offset * 5,
                  scale: isTop ? (hoverState !== "none" ? 1.08 : 1) : 1, 
                }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                style={{ backfaceVisibility: "hidden", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)" }}
              >
                <Image src={card.img} width={375} height={600} alt={card.title} unoptimized className="w-[200px] sm:w-[260px] lg:w-[280px] xl:w-[300px] 2xl:w-[340px] h-auto object-cover rounded-[20px] md:rounded-3xl" />
              </motion.div>
            );
          })}

          <AnimatePresence>
            {viewMode === "grid" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md overflow-y-auto pt-24 pb-24 px-6 md:px-20 pointer-events-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
                  {CARDS.map((card, idx) => (
                    <motion.div layoutId={`card-${card.id}`} key={`grid-${card.id}`} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setViewMode("stack"); }} className="cursor-pointer hover:scale-105 transition-transform flex justify-center">
                      <Image src={card.img} width={375} height={600} alt={card.title} unoptimized className="w-[240px] sm:w-full h-auto rounded-3xl shadow-2xl" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL DE CONTEÚDO */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ y: 100, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 100, scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()} className={`bg-white w-full max-w-7xl h-[95dvh] rounded-[30px] md:rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden text-black ${poppins.className}`}>
              <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} className="absolute top-4 md:top-6 right-4 md:right-6 bg-black text-white p-2.5 md:p-3 rounded-full hover:scale-110 transition-transform z-50 shadow-lg">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="pt-12 md:pt-16 pb-6 md:pb-8 px-6 md:px-10 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <span className="bg-[#0A192F] text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 md:mb-4 inline-block shadow-md">{currentCard.title}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2">Explore os recursos de <span style={{ color: currentCard.color }}>{currentCard.title}</span></h2>
                <p className="text-gray-500 max-w-2xl text-sm md:text-lg">Navegue pelo acervo colaborativo construído pela rede de educadores do Meta Aprender.</p>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 md:p-10">
                {currentCard.id === "materiais" ? <Materials folders={folders} /> : (
                  <div className="w-full h-full min-h-[40vh] flex flex-col items-center justify-center text-gray-400">
                    <Image src={currentCard.img} width={150} height={250} alt="Breve" className="mb-6 opacity-50 grayscale rounded-2xl shadow-lg w-[100px] md:w-[150px]" />
                    <p className="text-xl md:text-2xl font-bold text-center">Conteúdo de {currentCard.title} em breve...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}