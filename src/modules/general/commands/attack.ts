import { Command } from '../../../handler';
import { ChannelType, Message, PermissionFlagsBits } from 'discord.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export default class ErrorCommand extends Command {
  constructor() {
    super('attack', {
      aliases: [],
      info: 'НАЧАТЬ АТАКУ НА СЕРВЕ!!!!!!',
      usage: 'attack',
      guildOnly: true,
      adminOnly: false,
    });
  }


  async run(message: Message) {
    if (message.channel.type === ChannelType.GroupDM) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && message.author.id !== '263349725099458566') return;
    const messageToEdit = await message.channel.send('Запускаю подсистему...');
    await delay(3000);
    await messageToEdit.edit(`Взламываю сервера Discord...`);
    await delay(3000);
    const owner = await message.guild.fetchOwner();
    await messageToEdit.edit(`Получаю доступ к аккаунту \`${owner.displayName}\`...`);
    await delay(3000);
    await messageToEdit.edit('До уничтожения осталось \`5\` секунд');
    await delay(1000);
    await messageToEdit.edit('До уничтожения осталось \`4\` секунд');
    await delay(1000);
    await messageToEdit.edit('До уничтожения осталось \`3\` секунд');
    await delay(1000);
    await messageToEdit.edit('До уничтожения осталось \`2\` секунд');
    await delay(1000);
    await messageToEdit.edit('До уничтожения осталось \`1\` секунд');
    await delay(1000);
    await messageToEdit.edit('До уничтожения осталось \`0\` секунд');
    await delay(1000);
    await messageToEdit.delete();
  }
};
