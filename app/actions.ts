"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import AdmZip from "adm-zip"; 

// --- HELPERS ---

// Verifica permissão: Retorna o item se o usuário pode mexer nele
async function checkPermission(itemId: string, userEmail: string) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) throw new Error("Usuário não encontrado");

  const item = await prisma.material.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item não encontrado");

  // Se for Admin, pode tudo. Se for o dono, pode. Senão, erro.
  if (user.role === 'ADMIN' || item.userId === user.id) {
    return { item, user };
  }
  
  throw new Error("Permissão negada.");
}

async function getAllFilesRecursively(folderId: string): Promise<{path: string, dbPath: string}[]> {
  const files: {path: string, dbPath: string}[] = [];
  const items = await prisma.material.findMany({ where: { parentId: folderId } });

  for (const item of items) {
    if (item.type === 'FOLDER') {
      const subFiles = await getAllFilesRecursively(item.id);
      files.push(...subFiles.map(f => ({ path: join(item.title, f.path), dbPath: f.dbPath })));
    } else if (item.fileUrl && item.type !== 'LINK') {
      files.push({ path: item.title, dbPath: item.fileUrl });
    }
  }
  return files;
}

// --- 1. UPLOAD MÚLTIPLO CORRIGIDO (COM HERANÇA DE DONO) ---
export async function uploadFiles(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Login necessário");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const files = formData.getAll("files") as File[];
  const rawParentId = formData.get("parentId") as string;
  const parentId = (rawParentId === "" || rawParentId === "root") ? null : rawParentId;
  
  let targetUserId = user.id;

  if (parentId) {
     const parent = await prisma.material.findUnique({ where: { id: parentId } });
     if (parent) targetUserId = parent.userId;
  } else {
     const formTargetId = formData.get("targetUserId") as string;
     if (formTargetId) targetUserId = formTargetId;
  }

  if (user.id !== targetUserId && user.role !== 'ADMIN') {
      throw new Error("Sem permissão para modificar esta pasta.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, include: { materials: true } });
  
  // VERIFICAÇÃO APENAS DA COTA GLOBAL (5GB)
  const MAX_STORAGE = 5 * 1024 * 1024 * 1024; 
  const currentUsage = targetUser!.materials.reduce((acc, item) => acc + item.size, 0);
  const totalUploadSize = files.reduce((acc, file) => acc + file.size, 0);

  if (currentUsage + totalUploadSize > MAX_STORAGE) {
    throw new Error("Cota global de 5GB excedida para este usuário.");
  }

  for (const file of files) {
    if (file.size === 0) continue;
    
    // AQUI NÃO TEM MAIS NENHUMA TRAVA DE LIMITE INDIVIDUAL!
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const uploadDir = join(process.cwd(), "storage", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), buffer);

    await prisma.material.create({
      data: {
        title: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        fileUrl: `/uploads/${fileName}`,
        size: file.size,
        userId: targetUserId,
        parentId: parentId,
      },
    });
  }
  revalidatePath("/admin/dashboard");
}

// --- 2. CRIAR PASTA CORRIGIDO (COM HERANÇA DE DONO) ---
export async function createFolder(formData: FormData) {
  const session = await getServerSession();
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  
  const name = formData.get("name") as string;
  const rawParentId = formData.get("parentId") as string;
  const parentId = (rawParentId === "" || rawParentId === "root") ? null : rawParentId;

  // Lógica de Dono
  let targetUserId = user!.id;
  if (parentId) {
      const parent = await prisma.material.findUnique({ where: { id: parentId } });
      if (parent) targetUserId = parent.userId;
  } else {
      const formTargetId = formData.get("targetUserId") as string;
      if (formTargetId) targetUserId = formTargetId;
  }

  if (user!.id !== targetUserId && user!.role !== 'ADMIN') throw new Error("Sem permissão.");

  await prisma.material.create({
    data: { title: name, type: "FOLDER", size: 0, userId: targetUserId, parentId: parentId }
  });
  revalidatePath("/admin/dashboard");
}

// --- 3. CRIAR LINK CORRIGIDO (COM HERANÇA DE DONO) ---
export async function createLink(formData: FormData) {
    const session = await getServerSession();
    const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    const rawParentId = formData.get("parentId") as string;
    const parentId = (rawParentId === "" || rawParentId === "root") ? null : rawParentId;

    // Lógica de Dono
    let targetUserId = user!.id;
    if (parentId) {
        const parent = await prisma.material.findUnique({ where: { id: parentId } });
        if (parent) targetUserId = parent.userId;
    } else {
        const formTargetId = formData.get("targetUserId") as string;
        if (formTargetId) targetUserId = formTargetId;
    }

    if (user!.id !== targetUserId && user!.role !== 'ADMIN') throw new Error("Sem permissão.");

    await prisma.material.create({
        data: {
            title: title || "Novo Link",
            type: "LINK",
            fileUrl: url.startsWith("http") ? url : `https://${url}`,
            size: 0,
            userId: targetUserId,
            parentId: parentId,
        }
    });
    revalidatePath("/admin/dashboard");
}

// --- 4. RENOMEAR (ESTAVA FALTANDO) ---
export async function renameMaterial(formData: FormData) {
    const session = await getServerSession();
    const itemId = formData.get("itemId") as string;
    const newName = formData.get("newName") as string;

    await checkPermission(itemId, session?.user?.email!);

    await prisma.material.update({
        where: { id: itemId },
        data: { title: newName }
    });
    revalidatePath("/admin/dashboard");
}

// --- 5. EXCLUIR USUÁRIO ---
export async function deleteUser(formData: FormData) {
    const session = await getServerSession();
    const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
    
    if (currentUser?.role !== 'ADMIN') throw new Error("Apenas Admin pode excluir usuários.");

    const userIdToDelete = formData.get("userId") as string;
    if (userIdToDelete === currentUser!.id) throw new Error("Você não pode excluir a si mesmo.");

    const userMaterials = await prisma.material.findMany({ where: { userId: userIdToDelete } });
    for (const item of userMaterials) {
        await deleteMaterial(item.id); 
    }

    await prisma.user.delete({ where: { id: userIdToDelete } });
    revalidatePath("/admin/users");
}

// --- 6. MOVER ---
export async function moveMaterial(formData: FormData) {
  const session = await getServerSession();
  const itemId = formData.get("itemId") as string;
  const newParentId = formData.get("newParentId") as string;
  const finalParentId = (newParentId === "root" || newParentId === "") ? null : newParentId;

  await checkPermission(itemId, session?.user?.email!);

  if (itemId === finalParentId) throw new Error("Destino inválido.");

  if (finalParentId) {
    let currentCheckId = finalParentId;
    while (currentCheckId) {
      if (currentCheckId === itemId) throw new Error("Não pode mover para subpasta própria.");
      const parent = await prisma.material.findUnique({ where: { id: currentCheckId } });
      if (!parent || !parent.parentId) break;
      currentCheckId = parent.parentId;
    }
  }

  await prisma.material.update({
    where: { id: itemId },
    data: { parentId: finalParentId }
  });
  revalidatePath("/admin/dashboard");
}

// --- 7. DELETAR RECURSIVO ---
export async function deleteMaterial(id: string) {
  const session = await getServerSession();
  try {
     await checkPermission(id, session?.user?.email!);
  } catch { return; }

  const item = await prisma.material.findUnique({ where: { id } });
  if (!item) return;

  if (item.type === 'FOLDER') {
    const children = await prisma.material.findMany({ where: { parentId: id } });
    for (const child of children) {
      await deleteMaterial(child.id);
    }
  } else if (item.fileUrl && item.type !== 'LINK') {
      try { await unlink(join(process.cwd(), "public", item.fileUrl)); } catch {}
  }

  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/dashboard");
}

// --- 8. BACKUP (ZIP) ---
export async function downloadBackup() {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("Login necessário");
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    const zip = new AdmZip();
    
    // Busca TODOS os materiais (arquivos e pastas) deste usuário de uma vez só
    const allMaterials = await prisma.material.findMany({ 
        where: { userId: user!.id } 
    });

    // Função interna para descobrir o caminho exato de uma pasta (ex: "Matematica/Provas/")
    const getZipPath = (item: any, allItems: any[]): string => {
        if (!item.parentId) return ""; // Se está na raiz, não tem caminho antes
        const parent = allItems.find(i => i.id === item.parentId);
        if (!parent) return "";
        return getZipPath(parent, allItems) + parent.title + "/";
    };

    for (const item of allMaterials) {
        if (item.type !== 'FOLDER' && item.type !== 'LINK' && item.fileUrl) {
            // É um arquivo real
            try {
                const filePath = join(process.cwd(), "storage", item.fileUrl);
                const folderPathInsideZip = getZipPath(item, allMaterials); // Descobre onde colocar no ZIP
                
                // Adiciona o arquivo dentro da pasta certa no ZIP
                zip.addLocalFile(filePath, folderPathInsideZip);
            } catch (e) { console.log("Arquivo não encontrado:", item.title); }
            
        } else if (item.type === 'FOLDER') {
            // Se for uma pasta, cria ela vazia no ZIP (caso não tenha arquivos dentro, ela não some)
            const folderPathInsideZip = getZipPath(item, allMaterials) + item.title + "/";
            zip.addFile(folderPathInsideZip, Buffer.alloc(0));
        }
    }

    const backupName = `backup-${user!.name.replace(/\s+/g, '-')}-${Date.now()}.zip`;
    const backupPath = join(process.cwd(), "storage", "backups");
    await mkdir(backupPath, { recursive: true });
    
    await zip.writeZipPromise(join(backupPath, backupName));
    
    return `/backups/${backupName}`;
}

// --- AÇÕES ADMIN / OUTROS ---
export async function createNewUser(formData: FormData) {
  const session = await getServerSession();
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  
  if (currentUser?.role !== 'ADMIN') throw new Error("Apenas Admin pode criar usuários.");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const passwordHash = await hash(password, 6);
  
  await prisma.user.create({
    data: { name, email, password: passwordHash, role, folderName: `Pasta de ${name}` }
  });
  revalidatePath("/admin/users");
}

export async function updateProfile(formData: FormData) {
  const session = await getServerSession();
  await prisma.user.update({
    where: { email: session!.user!.email! },
    data: {
      folderName: formData.get("folderName") as string,
      folderCategory: formData.get("folderCategory") as string,
      folderDescription: formData.get("folderDescription") as string,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function getFolderContents(folderId: string) {
   return await prisma.material.findMany({ 
     where: { parentId: folderId }, 
     orderBy: { type: 'asc' } 
   });
}

// --- ATUALIZAR USUÁRIO (ADMIN) ---
export async function updateUser(formData: FormData) {
  const session = await getServerSession();
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });

  if (currentUser?.role !== 'ADMIN') {
    throw new Error("Permissão negada. Apenas administradores podem editar usuários.");
  }

  const userIdToUpdate = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  // Prepara os dados para atualização
  const updateData: any = {
    name,
    email,
    role
  };

  // Só atualiza a senha se o campo não estiver vazio
  if (password && password.trim() !== "") {
    updateData.password = await hash(password, 6);
  }

  await prisma.user.update({
    where: { id: userIdToUpdate },
    data: updateData
  });

  revalidatePath("/admin/users");
}

export async function moveUserOrder(formData: FormData) {
  const userId = formData.get("userId") as string;
  const direction = formData.get("direction") as "up" | "down";

  // Busca todos os usuários ordenados pela ordem atual (e desempata por data de criação)
  const users = await prisma.user.findMany({
      orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'asc' } 
      ]
  });

  const currentIndex = users.findIndex(u => u.id === userId);
  if (currentIndex === -1) return;

  // Bloqueia se tentar subir o primeiro ou descer o último
  if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === users.length - 1)) {
      return;
  }

  // Descobre com quem ele vai trocar de lugar
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
  // Troca eles de posição no array
  const temp = users[currentIndex];
  users[currentIndex] = users[swapIndex];
  users[swapIndex] = temp;

  // Atualiza TODO MUNDO no banco de dados com a nova numeração (0, 1, 2, 3...) oculta
  // Usa transação para ser super rápido
  const updates = users.map((user, index) => 
      prisma.user.update({
          where: { id: user.id },
          data: { displayOrder: index }
      })
  );
  await prisma.$transaction(updates);

  revalidatePath("/");
  revalidatePath("/admin/users");
}

// --- CRIAR PASTA OU LINK ---
export async function createMaterial(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Login necessário");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const title = formData.get("title") as string;
  const type = formData.get("type") as string; // 'FOLDER' ou 'LINK'
  const fileUrl = formData.get("fileUrl") as string | null;
  
  const rawParentId = formData.get("parentId") as string;
  const parentId = (rawParentId === "" || rawParentId === "root") ? null : rawParentId;
  
  let targetUserId = user.id;

  if (parentId) {
     const parent = await prisma.material.findUnique({ where: { id: parentId } });
     if (parent) targetUserId = parent.userId;
  } else {
     const formTargetId = formData.get("targetUserId") as string;
     if (formTargetId) targetUserId = formTargetId;
  }

  if (user.id !== targetUserId && user.role !== 'ADMIN') {
      throw new Error("Sem permissão para modificar esta pasta.");
  }

  await prisma.material.create({
    data: {
      title,
      type: type === 'LINK' ? 'LINK' : 'FOLDER',
      fileUrl: type === 'LINK' ? fileUrl : null,
      userId: targetUserId,
      parentId: parentId,
    }
  });

  revalidatePath("/admin/dashboard");
}