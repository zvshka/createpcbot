/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "Member_guildId_id_idx";

-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("guildId", "id");
