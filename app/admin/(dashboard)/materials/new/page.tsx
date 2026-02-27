import { createMaterial } from "@/app/actions"; // Importa a função que criamos acima
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewMaterialPage() {
  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/dashboard" 
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Material</h1>
          <p className="text-gray-400 text-sm">Preencha os dados para adicionar ao acervo.</p>
        </div>
      </div>

      {/* Formulário */}
      <form action={createMaterial} className="bg-[#1E293B] border border-white/5 p-8 rounded-2xl shadow-xl space-y-6">
        
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título do Material</label>
          <input
            name="title"
            type="text"
            required
            placeholder="Ex: Apostila de Matemática Básica"
            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
          <select
            name="category"
            required
            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all appearance-none"
          >
            <option value="E-book PDF">E-book PDF</option>
            <option value="Jogos">Jogos</option>
            <option value="Inclusão">Inclusão</option>
            <option value="Atividade">Atividade</option>
            <option value="Vídeo Aula">Vídeo Aula</option>
          </select>
        </div>

        {/* Grid de URLs (Por enquanto Links externos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL da Imagem (Capa)</label>
            <input
              name="imageUrl"
              type="url"
              placeholder="https://..."
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Cole o link de uma imagem (Unsplash, Imgur, etc)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL do Arquivo (Download)</label>
            <input
              name="fileUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Link do Google Drive, Dropbox ou PDF direto.</p>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Descrição (Opcional)</label>
          <textarea
            name="description"
            rows={4}
            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vibrantPurple focus:ring-1 focus:ring-vibrantPurple transition-all resize-none"
            placeholder="Descreva brevemente o conteúdo..."
          />
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-vibrantPurple hover:bg-[#8e24a1] text-white font-bold rounded-xl shadow-lg hover:shadow-neon-purple transition-all"
          >
            <Save className="w-5 h-5" />
            Salvar Material
          </button>
        </div>

      </form>
    </div>
  );
}