import { Command } from '../../../handler';
import { ChannelType, EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';
import prisma from '../../../lib/prisma';

export default class SettingsCommand extends Command {
  constructor() {
    super('settings', {
      adminOnly: true,
      aliases: [],
      guildOnly: true,
      info: 'настройки',
      usage: 'settings'
    });
  }

  async run(message: Message, args?: string[]) {
    if (message.channel.type === ChannelType.GroupDM) return;
    const guildSettings = await prisma.guild.findUnique({
      where: {
        id: message.guildId
      },
      include: {
        welcomeImages: true,
        welcomeMessages: true
      }
    });

    if (message.author.id !== '263349725099458566' && !message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    if (args.length === 0) {
      const embed = new EmbedBuilder();
      for (let key in guildSettings) {
        if (guildSettings[key] && guildSettings[key] instanceof Array) continue;
        const value = `${guildSettings[key] || 'None'}`;
        embed.addFields({ name: key, value: String.raw`${value}`, inline: true });
      }
      return message.channel.send({
        embeds: [embed]
      });
    } else {
      const key = args[1];
      if (key in guildSettings) {
        let data;
        if (args[0] === 'set') {
          if (key.endsWith('channel')) {
            if (!message.mentions.channels.first()) {
              return message.channel.send('Ну ты канал то укажи текстовый');
            }
            data = { [key.toLowerCase()]: message.mentions.channels.first().id };
          } else {
            const value = args.splice(2).join(' ');
            if (typeof guildSettings[key] === 'number') {
              if (isNaN(Number(value))) {
                return message.channel.send('Введи число');
              }
              data = { [key.toLowerCase()]: Number(value) };
            } else {
              data = { [key.toLowerCase()]: value };
            }
          }
          await prisma.guild.update({
            where: {
              id: message.guildId
            },
            data
          });
        } else if (args[0] === 'remove') {
          let def;
          switch (key) {
            case 'quotes_prefix':
              def = '\\';
              break;
            case 'prefix':
              def = '.';
              break;
            case 'quotes_channel':
              def = null;
              break;
          }
          await prisma.guild.update({
            where: {
              id: message.guildId
            },
            data: {
              [key]: def
            }
          });
        } else if (args[0] === 'add') {
          if (key === 'welcomeImages') {
            if (args[2].toLowerCase() === 'api') {
              await prisma.welcomeImage.create({
                data: {
                  url: args[4],
                  isApi: true,
                  pathToImage: args[3],
                  guild: {
                    connect: {
                      id: message.guildId
                    }
                  }
                }
              });
            } else {
              await prisma.welcomeImage.create({
                data: {
                  url: args[2],
                  guild: {
                    connect: {
                      id: message.guildId
                    }
                  }
                }
              });
            }
          } else if (key === 'welcomeMessages') {
            if (!args[2]) {
              return message.channel.send('Ну ты вафля, введи нормальное сообщение');
            }

            await prisma.welcomeMessage.create({
              data: {
                text: args.splice(2).join(' '),
                guild: {
                  connect: {
                    id: message.guildId
                  }
                }
              }
            });
          }
        }

        return message.channel.send('Ну я типо обновил');
      } else {
        return message.channel.send('Ты можешь написать в качестве ключа только: prefix, quotes_channel, quotes_prefix');
      }
    }
  }
}
