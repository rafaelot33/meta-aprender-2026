"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efeito para mudar a cor do navbar quando rolar a página
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Recursos", href: "#recursos" },
    { name: "Materiais", href: "#materiais" },
    { name: "Sobre", href: "#sobre" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-deepBlue/80 backdrop-blur-md border-b border-white/5 py-4 shadow-lg"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyanBright to-vibrantPurple rounded-lg flex items-center justify-center text-white font-bold shadow-neon-cyan">
              M
            </div>
            <span className="font-heading font-bold text-xl tracking-wider text-white group-hover:text-cyanBright transition-colors">
              META APRENDER
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white hover:scale-105 transition-all uppercase tracking-wide"
              >
                {link.name}
              </Link>
            ))}
            
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay (Gaveta) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-[60] bg-[#0A192F] flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Links Mobile */}
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-2xl font-heading font-bold text-white hover:text-cyanBright tracking-widest uppercase"
              >
                {link.name}
              </motion.a>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-vibrantPurple to-cyanBright rounded-xl text-white font-bold shadow-lg flex items-center gap-3"
            >
              <Rocket className="w-5 h-5" />
              Acessar Plataforma
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}