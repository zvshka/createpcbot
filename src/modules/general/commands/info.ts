import { ChannelType, EmbedBuilder, Message } from 'discord.js';
import { Command, Handler } from '../../../handler';

export default class InfoCommand extends Command {
  private handler: Handler;

  constructor({ commandHandler }) {
    super('info', {
      aliases: ['i'],
      info: 'Информация о боте',
      usage: 'info',
      guildOnly: false,
      adminOnly: false
    });
    this.handler = commandHandler;
  }

  async run(message: Message, args) {
    if (message.channel.type === ChannelType.GroupDM) return;
    const embed = new EmbedBuilder()
      .setTitle('Информация о боте')
      .addFields(
        { name: 'Префикс', value: 'префикс', inline: true },
        { name: 'Версия', value: 'Пошел нахуй пидорас', inline: true },
        { name: 'Время работы', value: this.format(process.uptime()), inline: true },
      );
    await message.channel.send({
      embeds: [embed]
    });
  }

  format(s) {
    function pad(s) {
      return (s < 10 ? '0' : '') + s;
    }

    let hours = Math.floor(s / (60 * 60));
    let minutes = Math.floor(s % (60 * 60) / 60);
    let seconds = Math.floor(s % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
  }
};
