import path from 'path';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Handler } from './handler';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api'

dotenv.config()

const discordClient = new Client({
  intents: [
    GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});

const telegramClient = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false,
});

const handler = new Handler(discordClient, telegramClient);

handler.load(path.join(__dirname, './modules'), {
  discordClient,
  telegramClient,
  commandHandler: handler,
}).then(res => {
  discordClient.login(process.env.TOKEN).then(r => {
    console.log("[DONE] Загружен!")
  });
});
