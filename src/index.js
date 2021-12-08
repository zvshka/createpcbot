import path from "path"
import {Client, Intents} from "discord.js";
import {Handler} from "./handler"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS
    ]
});
const handler = new Handler(client);

handler.load(path.join(__dirname, './modules'), {
    client,
    commandHandler: handler,
});

client.login(process.env.TOKEN).then(r => {
});