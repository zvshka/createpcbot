const {MessageEmbed} = require('discord.js');
const {Command} = require('../../handler');
const Utils = require('../../Utils.js');

module.exports = class extends Command {
    constructor({commandHandler}) {
        super('help', {
            aliases: ['h', 'commands', 'cmds'],
            info: 'Список команд или подробности о команде',
            usage: 'help [command]',
            guildOnly: false,
            adminOnly: false
        });

        this.commandHandler = commandHandler;
    }

    async run(message, args) {
        const prefix = this.commandHandler.prefix;
        let description;

        if (args.length === 0) {
            description = `
        ${Array.from(this.commandHandler.commands)
                .map(
                    ([, command]) => `**${prefix}${command.usage}** - ${command.info}`,
                )
                .join('\n')}`;
        } else {
            let command = this.commandHandler.commands.get(args[0]);

            if (!command) {
                command = this.commandHandler.aliases.get(args[0]);
            }

            if (!command) {
                const embed = new MessageEmbed()
                    .setTitle('Что-то пошло не так!')
                    .setColor("RED")
                    .setDescription('Введена не правильная команда, попробуй ещё!');

                return message.channel.send(embed);

            }

            description = `
        **Название:** ${command.name}
        **Как использовать:** ${prefix}${command.usage}
        **Информация:** ${command.info}
        **Алиасы:** ${command.aliases.join(', ')}
        **Только на сервере:** ${Utils.boolToString(command.guildOnly)}
        **Только для админов:** ${Utils.boolToString(command.adminOnly)}
        **Включена:** ${Utils.boolToString(command.isEnabled)}
            `;
        }

        const embed = new MessageEmbed()
            .setTitle('Нужна помощь? Получи!')
            .setDescription(
                `${description}\n(**[]** не обязательно, **<>** обязательно)`,
            );

        await message.channel.send(embed);
    }
};
