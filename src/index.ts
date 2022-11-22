import path from "path"
import { Client, Intents } from "discord.js";
import { Handler } from "./handler";
import dotenv from "dotenv"

dotenv.config({ path: path.join(__dirname, '.env') })

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
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
