/*
  Warnings:

  - You are about to drop the column `stars` on the `StarredMessage` table. All the data in the column will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_guildId_fkey";

-- AlterTable
ALTER TABLE "StarredMessage" DROP COLUMN "stars";

-- DropTable
DROP TABLE "Member";
