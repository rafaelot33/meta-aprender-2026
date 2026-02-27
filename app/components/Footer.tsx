import { Instagram, Lock } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#050d1a] border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Coluna 1: Marca */}
          <div>
            <h4 className="text-2xl font-heading font-bold text-white mb-4 uppercase">
              Meta Aprender
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Transformando a educação através de tecnologia e metodologia lúdica. Junte-se à nossa missão.
            </p>
          </div>

          {/* Coluna 2: Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 uppercase">Navegação</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyanBright transition-colors">Início</a></li>
              <li><a href="#materiais" className="hover:text-cyanBright transition-colors">Materiais</a></li>
              <li><a href="#" className="hover:text-cyanBright transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-cyanBright transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Coluna 3: Social */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4 uppercase">Siga-nos</h4>
            <a 
              href="https://www.instagram.com/metaaprenderpatos/" 
              target="_blank" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              @metaaprender
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Dennys Angelim. Todos os direitos reservados.
          </p>
          
          {/* Acesso Admin Secreto */}
          <Link href="/admin/login" className="group flex items-center gap-2 text-gray-800 hover:text-cyanBright transition-colors" title="Área Restrita">
            <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Sistema Admin
            </span>
            <Lock className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </Link>
        </div>

      </div>
    </footer>
  );
}