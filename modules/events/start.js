const {Event} = require('../../handler');
const {MessageEmbed} = require('discord.js')

module.exports = class extends Event {
    constructor() {
        super('ready');
    }

    async run(client) {
        console.log(`Logged in as ${client.user.tag}`);

        const start = new MessageEmbed()
            .setTitle("Включаюсь")
            .setTimestamp()
            .setDescription("Происходит включение")

        const guild = client.guilds.cache.get("725786415438364692")
        const channel = guild.channels.cache.get("835439074571190292")
        if (!process.env.DEV) {
            channel.send(start)
        }

        process.stdin.resume();//so the program will not close instantly

        function exitHandler(options, exitCode) {
            if (process.env.DEV) return process.exit()
            const embed = new MessageEmbed()
                .setTitle("Выключение")
                .setDescription(`Происходит выключение по коду ${exitCode}`)
                .setTimestamp()
            channel.send(embed).then(() => {
                if (options.exit) process.exit();
            })
        }

        process.on('exit', exitHandler.bind(null, {cleanup: true}));
        process.on('SIGINT', exitHandler.bind(null, {exit: true}));
        process.on('SIGTERM', exitHandler.bind(null, {exit: true}));
        process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
    }
};
