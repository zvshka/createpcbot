import path from "path"
import {Client} from "discord.js";
import {Handler} from "./handler"

const client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES']});
const handler = new Handler(client);

handler.load(path.join(__dirname, './modules'), {
    client,
    commandHandler: handler,
});

client.login(process.env.TOKEN).then(r => {
});