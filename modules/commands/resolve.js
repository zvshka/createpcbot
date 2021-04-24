const {Command} = require('../../handler');
const axios = require('axios')
const {MessageEmbed} = require("discord.js")

module.exports = class extends Command {
    constructor() {
        super('resolve', {
            aliases: ['обработать'],
            info: 'да',
            usage: 'не трогать',
            guildOnly: false,
            adminOnly: true
        });
    }


    async run(message, args) {

    }
};
