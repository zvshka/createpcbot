-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "starboard_channel" TEXT;

-- CreateTable
CREATE TABLE "StarredMessage" (
    "guildId" TEXT NOT NULL,
    "starredMessageId" TEXT NOT NULL,
    "botMessageId" TEXT NOT NULL,

    CONSTRAINT "StarredMessage_pkey" PRIMARY KEY ("guildId","starredMessageId")
);

-- AddForeignKey
ALTER TABLE "StarredMessage" ADD CONSTRAINT "StarredMessage_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
