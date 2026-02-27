import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { hash } from 'bcryptjs'

const { Pool } = pg

const adapter = new PrismaPg(
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })
)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando criação do Admin...')

  // 1. Criar Senha Criptografada
  const passwordHash = await hash('123456', 6)

  // 2. Criar ou Atualizar o Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@metaaprender.com' },
    update: {
        password: passwordHash, // Atualiza a senha caso o usuário já exista
        role: 'ADMIN',
    },
    create: {
      email: 'admin@metaaprender.com',
      name: 'Dennys Angelim',
      password: passwordHash,
      role: 'ADMIN',
      // Configurações da Pasta Pública
      folderName: 'Pasta do Dennys',
      folderCategory: 'Tecnologia',
      folderDescription: 'Materiais de aula sobre programação e design.',
    },
  })

  console.log('✅ Admin criado/atualizado:', admin.email)
  console.log('🔑 Senha definida para: 123456')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })