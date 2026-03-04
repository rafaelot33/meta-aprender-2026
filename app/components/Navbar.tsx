"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            ? "bg-deepBlue/80 backdrop-blur-md border-b border-white/5 shadow-lg py-1.5"
            : "bg-transparent py-1.5"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center h-[64px]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image 
              src="/logo.png" 
              alt="Logo Meta Aprender" 
              width={200} 
              height={80} 
              className="w-auto h-8 md:h-[100px] object-contain transition-transform duration-300 group-hover:scale-105 brightness-0 invert"
              priority
            />
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
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-[60] bg-[#0A192F] flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20"
            >
              <X className="w-7 h-7" />
            </button>

            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-2xl font-bold text-white hover:text-cyanBright tracking-widest uppercase"
              >
                {link.name}
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/admin/login"
                className="mt-8 px-8 py-3 bg-gradient-to-r from-vibrantPurple to-cyanBright rounded-xl text-white font-bold shadow-lg flex items-center gap-3"
              >
                <Rocket className="w-5 h-5" />
                Acessar Plataforma
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}