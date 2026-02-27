"use client";

import { motion } from "framer-motion";
import { Zap, BookOpen, Users } from "lucide-react";

const cards = [
  {
    icon: <Zap className="w-8 h-8 text-cyanBright" />,
    title: "Metodologia Ágil",
    description: "Processos de ensino acelerados com foco em resultados reais para as crianças.",
  },
  {
    icon: <Users className="w-8 h-8 text-vibrantPurple" />,
    title: "Comunidade Ativa",
    description: "Conecte-se com educadores e pais engajados no desenvolvimento infantil.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-cyanBright" />,
    title: "Material Exclusivo",
    description: "Acesso a conteúdos didáticos premium desenvolvidos por especialistas.",
  },
];

export default function Partners() {
  return (
    <section id="recursos" className="relative py-24 bg-[#020617] z-20 overflow-hidden">
      
      {/* --- BACKGROUND UNIFICADO (Grid) --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Título da Seção */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-wide text-white mb-4">
            Recursos <span className="text-vibrantPurple">Premium</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyanBright to-vibrantPurple mx-auto rounded-full shadow-[0_0_15px_rgba(156,39,176,0.5)]" />
        </motion.div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-[#0F172A] transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.1)]"
            >
              {/* Efeito de Brilho no topo do card */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyanBright/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="mb-6 p-4 bg-[#020617] rounded-full w-fit border border-white/10 group-hover:border-cyanBright/30 transition-colors shadow-inner">
                {card.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 font-heading tracking-wide group-hover:text-cyanBright transition-colors">
                {card.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Botão CTA Centralizado */}
        <div className="mt-16 text-center">
          <button 
             onClick={() => document.getElementById('materiais')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-10 py-4 bg-transparent border border-vibrantPurple text-white font-bold tracking-wider rounded-xl hover:bg-vibrantPurple hover:shadow-[0_0_30px_rgba(156,39,176,0.4)] transition-all duration-300 uppercase"
          >
            Ver Todos os Recursos
          </button>
        </div>

      </div>
    </section>
  );
}