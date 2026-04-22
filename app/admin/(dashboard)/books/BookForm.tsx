"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Link as LinkIcon, Image as ImageIcon, Loader2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { createBook } from "@/app/actions";
import Image from "next/image";

const MAX_FILE_SIZE = 45 * 1024 * 1024;

export default function BookForm({ userId }: { userId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState<"FILE" | "LINK">("FILE");
  const [contentLink, setContentLink] = useState("");
  
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // MÁGICA DA COMPRESSÃO DE IMAGEM NO NAVEGADOR
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return setError("A capa precisa ser uma imagem.");
      setError(null);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new globalThis.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500; // Reduz a resolução para economizar espaço
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, { type: "image/jpeg" });
              setCoverFile(newFile);
              setCoverPreview(URL.createObjectURL(newFile));
            }
          }, "image/jpeg", 0.7); // 70% de qualidade
        };
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("O arquivo ultrapassa 45MB.");
        setContentFile(null);
      } else {
        setContentFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!coverFile) return setError("Anexe a capa.");
    if (type === "FILE" && !contentFile) return setError("Anexe o PDF.");
    if (type === "LINK" && !contentLink) return setError("Informe o link.");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title); formData.append("category", category);
      formData.append("subCategory", subCategory); formData.append("type", type);
      formData.append("userId", userId); formData.append("cover", coverFile);
      if (type === "FILE") formData.append("contentFile", contentFile!);
      if (type === "LINK") formData.append("contentLink", contentLink);

      const result = await createBook(formData);
      if (result.error) setError(result.error);
      else {
        setSuccess(true);
        setTimeout(() => {
          setTitle(""); setCategory(""); setSubCategory(""); setContentLink("");
          setContentFile(null); setCoverFile(null); setCoverPreview(null);
          setSuccess(false);
          router.refresh();
        }, 2000);
      }
    } catch (err) { setError("Erro no servidor."); } 
    finally { setIsUploading(false); }
  };

  return (
    // Removido max-w-4xl, agora ocupa 100% da largura (w-full)
    <form onSubmit={handleSubmit} className="bg-[#1E293B] p-6 md:p-8 rounded-2xl border border-white/5 shadow-xl w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CAPA - Ocupa 3 colunas em telas grandes */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <label className="text-sm font-bold text-gray-300">Capa (Imagem)</label>
          <div 
            className={`relative w-full aspect-[2/3] border-2 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors ${coverPreview ? 'border-cyanBright/50' : 'border-gray-600 hover:border-cyanBright'}`}
            onClick={() => coverInputRef.current?.click()}
          >
            <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverChange} />
            {coverPreview ? (
              <Image src={coverPreview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="text-center p-4 text-gray-500"><ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-xs">Clique para adicionar</p></div>
            )}
          </div>
        </div>

        {/* INFORMAÇÕES - Ocupa as outras 9 colunas */}
        <div className="lg:col-span-9 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Título do Livro</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0F172A] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-cyanBright" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-300 mb-2">Categoria</label><input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0F172A] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-cyanBright" /></div>
            <div><label className="block text-sm font-bold text-gray-300 mb-2">Subcategoria (Opcional)</label><input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full bg-[#0F172A] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-cyanBright" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Formato</label>
              <div className="flex bg-[#0F172A] p-1 rounded-xl border border-gray-600">
                <button type="button" onClick={() => setType("FILE")} className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 ${type === "FILE" ? "bg-cyanBright text-black" : "text-gray-400"}`}><FileText className="w-4 h-4" /> PDF</button>
                <button type="button" onClick={() => setType("LINK")} className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 ${type === "LINK" ? "bg-cyanBright text-black" : "text-gray-400"}`}><LinkIcon className="w-4 h-4" /> Link</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">Anexo</label>
              {type === "FILE" ? (
                <div className="flex items-center gap-3">
                  <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="contentFile" />
                  <label htmlFor="contentFile" className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-[#0F172A] border border-gray-600 border-dashed rounded-xl cursor-pointer hover:border-cyanBright text-sm text-gray-400 truncate"><UploadCloud className="w-4 h-4" /> {contentFile ? contentFile.name : "Selecionar PDF..."}</label>
                </div>
              ) : (
                <input type="url" value={contentLink} onChange={(e) => setContentLink(e.target.value)} className="w-full bg-[#0F172A] text-white border border-gray-600 rounded-xl px-4 py-2.5 outline-none focus:border-cyanBright" placeholder="https://" />
              )}
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}
          {success && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Cadastrado com sucesso!</div>}

          <button type="submit" disabled={isUploading || success} className="mt-auto w-full bg-cyanBright hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-lg">
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cadastrar Livro"}
          </button>
        </div>
      </div>
    </form>
  );
}