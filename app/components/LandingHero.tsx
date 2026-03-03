"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function LandingHero() {
  // Variáveis para rastrear a posição do mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Função que atualiza as coordenadas quando o mouse move
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Logos dos parceiros (Simulados - você pode trocar pelas imagens reais depois)
  const partners = [
    "Jesuita Guedes", "Dennys Angelim", "Lyandra Alves", 
    "Adamara Ramalho", "Aline Oliveira", "Carlos Gabriel", 
    "Fernanda Aprigio", "Gicelia Santos", "Maria José",
    "Nicodemos Oliveira", "Shirley Valéria", "Suênia Santos",
    "Jean Pierre", "Rubênia Alves"
  ];

  return (
    <div id="inicio"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#020617] group"
      onMouseMove={handleMouseMove}
    >
      
      {/* --- BACKGROUND INTERATIVO (SPOTLIGHT) --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grade de Fundo */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* A Luz que segue o mouse */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(14, 165, 233, 0.15),
                transparent 80%
              )
            `,
          }}
        />
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div  className="relative z-10 container mx-auto px-6 pt-20 text-center">
        
        {/* Badge Animado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyanBright/30 bg-cyanBright/10 text-cyanBright text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3" /> Metodologia Ativa & Tecnológica
        </motion.div>

        {/* SLOGAN GIGANTE (O que você pediu) */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
        >
          TODOS PELA <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanBright via-white to-vibrantPurple animate-gradient-x">
            APRENDIZAGEM
          </span> <br />
          DAS CRIANÇAS
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light"
        >
          Uma plataforma colaborativa onde educadores compartilham materiais, 
          trocam experiências e transformam o futuro da educação de Patos.
        </motion.p>

        {/* Botões CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
        >
          <Link href="/admin/login" className="px-8 py-4 bg-vibrantPurple hover:bg-[#9d34b3] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 group">
            <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            Acessar Plataforma
          </Link>
          
          <button 
             onClick={() => document.getElementById('materiais')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-all flex items-center gap-2"
          >
            Ver Acervo Público <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

      </div>

      {/* --- LOGOS DOS PARCEIROS (Marquee Infinito) --- */}
      <div className="relative border-t border-white/5 bg-black/20 backdrop-blur-sm py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617] z-10 pointer-events-none" />
        
        <motion.div 
          className="flex gap-16 whitespace-nowrap w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        >
          {/* Duplicamos a lista para criar o efeito infinito */}
          {[...partners, ...partners, ...partners, ...partners].map((partner, i) => (
            <div key={i} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
              {/* Se tiver logo imagem, coloque <img src="..." /> aqui */}
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{partner[0]}</span>
              </div>
              <span className="text-lg font-bold text-white/80 uppercase tracking-widest">{partner}</span>
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}