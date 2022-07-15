-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT E'.',
    "quotes_channel" TEXT,
    "quotes_prefix" TEXT DEFAULT E'\\',
    "welcome_channel" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelcomeImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "WelcomeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelcomeMessage" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "WelcomeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PingAnswer" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "PingAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WelcomeImage" ADD CONSTRAINT "WelcomeImage_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelcomeMessage" ADD CONSTRAINT "WelcomeMessage_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingAnswer" ADD CONSTRAINT "PingAnswer_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
