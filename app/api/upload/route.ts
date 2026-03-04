import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return new NextResponse("Não autorizado", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("Usuário não encontrado", { status: 404 });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const parentId = formData.get("parentId") as string | null;
    const targetUserId = formData.get("targetUserId") as string || user.id;

    if (!files || files.length === 0) {
      return new NextResponse("Nenhum arquivo enviado", { status: 400 });
    }

    const uploadDir = join(process.cwd(), "storage", "uploads");
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (file.size === 0) continue;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Limpa nomes estranhos de arquivos para evitar erros no servidor
      const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const fileName = `${Date.now()}-${originalName}`;
      
      await writeFile(join(uploadDir, fileName), buffer);

      // Descobre se é PDF, JPG, DOCX, etc.
      const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";

      await prisma.material.create({
        data: {
          title: file.name,
          type: ext,
          fileUrl: `/uploads/${fileName}`,
          size: file.size,
          userId: targetUserId,
          parentId: parentId === "root" || parentId === "" ? null : parentId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no upload:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}