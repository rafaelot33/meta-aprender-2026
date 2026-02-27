-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL,
ALTER COLUMN "size" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
