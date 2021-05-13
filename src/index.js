import path from "path"
import mongoose from "mongoose"
import {Client} from "discord.js";
import {Handler} from "./handler"

const client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES']});
const handler = new Handler(client);

handler.load(path.join(__dirname, './modules'), {
    client,
    commandHandler: handler,
});

mongoose.connect(process.env.mongo, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => {
    client.login(process.env.TOKEN).then(r => {
    });
})