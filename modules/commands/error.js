const {Command} = require('../../handler');

module.exports = class extends Command {
    constructor() {
        super('error', {
            aliases: ['err'],
            info: 'Создать ошибку',
            usage: 'error',
            guildOnly: false,
            adminOnly: true
        });
    }


    async run(message) {
        message.guild.channels.cache.fetch("1")
    }
};
