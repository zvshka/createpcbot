import path from 'path';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Handler } from './handler';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') })

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});
const handler = new Handler(client);

handler.load(path.join(__dirname, './modules'), {
  client,
  commandHandler: handler,
}).then(res => {
  client.login(process.env.TOKEN).then(r => {
    console.log("[DONE] Загружен!")
  });
});
