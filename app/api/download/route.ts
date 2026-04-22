import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { join } from "path";

// Função auxiliar para identificar o tipo correto do arquivo para o navegador não se confundir
function getContentType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    default: return 'application/octet-stream'; // Padrão genérico
  }
}

export async function GET(req: NextRequest) {
  const pathParam = req.nextUrl.searchParams.get("path");
  const cleanup = req.nextUrl.searchParams.get("cleanup");
  
  // 1. Lemos o novo parâmetro 'view' que enviamos do Modal
  const isView = req.nextUrl.searchParams.get("view") === "true"; 

  if (!pathParam) {
    return new NextResponse("Caminho não informado", { status: 400 });
  }

  const cleanPath = pathParam.replace(/^\//, ''); 
  const filePath = join(process.cwd(), "storage", cleanPath);
  
  try {
     const buffer = await readFile(filePath);
     const filename = pathParam.split('/').pop() || 'arquivo';
     
     if (cleanup === 'true') {
         try {
             await unlink(filePath);
         } catch (err) {
             console.error("Erro ao limpar arquivo temporário:", err);
         }
     }

     // 2. Define se vai mostrar na tela (inline) ou forçar download (attachment)
     const dispositionType = isView ? "inline" : "attachment";
     
     // 3. Puxa o tipo correto baseado na extensão
     const contentType = getContentType(filename);

     return new NextResponse(buffer, {
         headers: {
             "Content-Disposition": `${dispositionType}; filename="${filename}"`,
             "Content-Type": contentType, // Agora o navegador sabe que é um PDF/Word/etc!
         }
     });
  } catch (e) {
      console.error("Erro no download:", e);
      return new NextResponse("Arquivo não encontrado no servidor", { status: 404 });
  }
}