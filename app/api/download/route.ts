import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises"; // <-- Importamos o unlink para apagar arquivos
import { join } from "path";

export async function GET(req: NextRequest) {
  const pathParam = req.nextUrl.searchParams.get("path");
  const cleanup = req.nextUrl.searchParams.get("cleanup"); // <-- Novo parâmetro

  if (!pathParam) {
    return new NextResponse("Caminho não informado", { status: 400 });
  }

  const cleanPath = pathParam.replace(/^\//, ''); 
  const filePath = join(process.cwd(), "storage", cleanPath);
  
  try {
     // 1. Lê o arquivo do disco para a memória
     const buffer = await readFile(filePath);
     const filename = pathParam.split('/').pop() || 'arquivo';
     
     // 2. Se o frontend pedir para limpar (cleanup=true), apaga do servidor
     if (cleanup === 'true') {
         try {
             await unlink(filePath);
         } catch (err) {
             console.error("Erro ao limpar arquivo temporário:", err);
         }
     }

     // 3. Envia o arquivo para o usuário baixar
     return new NextResponse(buffer, {
         headers: {
             "Content-Disposition": `attachment; filename="${filename}"`,
             "Content-Type": "application/octet-stream",
         }
     });
  } catch (e) {
      console.error("Erro no download:", e);
      return new NextResponse("Arquivo não encontrado no servidor", { status: 404 });
  }
}