import { Command } from '../../../handler';

export default class ErrorCommand extends Command {
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
    message.guild.channels.cache.fetch('1');
  }
};
