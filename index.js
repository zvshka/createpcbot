if (Number(process.version.slice(1).split('.')[0]) < 10)
    throw new Error(
        'Node 10.0.0 or higher is required. Update Node on your system.',
    );

const path = require('path');
const mongoose = require("mongoose")

const {Client} = require('discord.js');
const {Handler} = require('./handler');

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