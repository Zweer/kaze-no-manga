/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chapterNumber` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `pages` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `coverImageUrl` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VerificationToken` table. All the data in the column will be lost.
  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MangaList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MangaListItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadChapter` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceUrl]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mangaId,sourceId,sourceName]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceId,sourceName]` on the table `Manga` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `index` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceId` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceName` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Manga` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceId` to the `Manga` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceName` to the `Manga` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `Manga` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "MangaStatus" AS ENUM ('Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Unknown');

-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "MangaList" DROP CONSTRAINT "MangaList_userId_fkey";

-- DropForeignKey
ALTER TABLE "MangaListItem" DROP CONSTRAINT "MangaListItem_id_fkey";

-- DropForeignKey
ALTER TABLE "MangaListItem" DROP CONSTRAINT "MangaListItem_mangaListId_fkey";

-- DropForeignKey
ALTER TABLE "ReadChapter" DROP CONSTRAINT "ReadChapter_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "ReadChapter" DROP CONSTRAINT "ReadChapter_userId_fkey";

-- DropIndex
DROP INDEX "Chapter_mangaId_chapterNumber_idx";

-- DropIndex
DROP INDEX "Manga_source_id_idx";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "chapterNumber",
DROP COLUMN "pages",
ADD COLUMN     "index" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "releasedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceName" TEXT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Manga" DROP COLUMN "coverImageUrl",
DROP COLUMN "description",
DROP COLUMN "source",
ADD COLUMN     "chaptersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "lastCheckedForUpdates" TIMESTAMP(3),
ADD COLUMN     "releasedAt" TIMESTAMP(3),
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceName" TEXT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT NOT NULL,
ADD COLUMN     "status" "MangaStatus" NOT NULL DEFAULT 'Unknown',
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "Authenticator";

-- DropTable
DROP TABLE "MangaList";

-- DropTable
DROP TABLE "MangaListItem";

-- DropTable
DROP TABLE "ReadChapter";

-- CreateTable
CREATE TABLE "UserManga" (
    "userId" TEXT NOT NULL,
    "mangaId" TEXT NOT NULL,
    "lastReadChapterId" TEXT,
    "lastReadAt" TIMESTAMP(3),
    "isFavourite" BOOLEAN NOT NULL DEFAULT false,
    "hasNewChapter" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserManga_pkey" PRIMARY KEY ("userId","mangaId")
);

-- CreateIndex
CREATE INDEX "UserManga_userId_idx" ON "UserManga"("userId");

-- CreateIndex
CREATE INDEX "UserManga_mangaId_idx" ON "UserManga"("mangaId");

-- CreateIndex
CREATE INDEX "UserManga_userId_hasNewChapter_idx" ON "UserManga"("userId", "hasNewChapter");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_sourceUrl_key" ON "Chapter"("sourceUrl");

-- CreateIndex
CREATE INDEX "Chapter_mangaId_idx" ON "Chapter"("mangaId");

-- CreateIndex
CREATE INDEX "Chapter_releasedAt_idx" ON "Chapter"("releasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_mangaId_sourceId_sourceName_key" ON "Chapter"("mangaId", "sourceId", "sourceName");

-- CreateIndex
CREATE INDEX "Manga_lastCheckedForUpdates_idx" ON "Manga"("lastCheckedForUpdates");

-- CreateIndex
CREATE UNIQUE INDEX "Manga_sourceId_sourceName_key" ON "Manga"("sourceId", "sourceName");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- AddForeignKey
ALTER TABLE "UserManga" ADD CONSTRAINT "UserManga_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManga" ADD CONSTRAINT "UserManga_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManga" ADD CONSTRAINT "UserManga_lastReadChapterId_fkey" FOREIGN KEY ("lastReadChapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
