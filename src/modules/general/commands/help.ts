import { ChannelType, Colors, EmbedBuilder, Message } from 'discord.js';
import Utils from '../../../Utils';
import { Command, Handler } from '../../../handler';
import prisma from '../../../lib/prisma';

export default class HelpCommand extends Command {
  private commandHandler: Handler;

  constructor({ commandHandler }) {
    super('help', {
      aliases: ['h', 'commands', 'cmds'],
      info: 'Список команд или подробности о команде',
      usage: 'help [command]',
      guildOnly: false,
      adminOnly: false
    });

    this.commandHandler = commandHandler;
  }

  async run(message: Message, args) {
    if (message.channel.type === ChannelType.GroupDM) return;
    const guildSettings = await prisma.guild.findUnique({
      where: {
        id: message.guildId
      }
    });
    const prefix = process.env.DEV ? '$' : guildSettings.prefix;
    let description;

    if (args.length === 0) {
      description = `
            
        **Модули**:
        ${Array.from(this.commandHandler.features)
        .map(
          ([name, feature]) => `**${name}** - ${feature.commands.map(Command => Command.name).join(', ')}`,
        )
        .join('\n')}
                
                
        **Команды:**
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
        const embed = new EmbedBuilder()
          .setTitle('Что-то пошло не так!')
          .setColor(Colors.Red)
          .setDescription('Введена не правильная команда, попробуй ещё!');

        return message.channel.send({
          embeds: [embed]
        });

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

    const embed = new EmbedBuilder()
      .setTitle('Нужна помощь? Получи!')
      .setDescription(
        `${description}\n(**[]** не обязательно, **<>** обязательно)`,
      );

    await message.channel.send({
      embeds: [
        embed
      ]
    });
  }
};
