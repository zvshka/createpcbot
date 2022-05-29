import path from "path"
import {Client, Intents} from "discord.js";
import {Handler} from "./handler";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
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

// mongoose.connect(process.env.mongo, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: true,
// }).then(() => {
//     client.login(process.env.TOKEN).then(r => {
//     });
// })