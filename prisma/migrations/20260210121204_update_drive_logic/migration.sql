/*
  Warnings:

  - You are about to drop the column `category` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `materials` table. All the data in the column will be lost.
  - Added the required column `size` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Made the column `fileUrl` on table `materials` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "materials" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "isPublic",
DROP COLUMN "updatedAt",
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "folderCategory" TEXT DEFAULT 'Geral',
ADD COLUMN     "folderDescription" TEXT,
ADD COLUMN     "folderName" TEXT DEFAULT 'Minha Pasta';

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
