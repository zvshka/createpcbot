import { DiscordEvent } from '../../../handler';
import { Client, Events, MessageReaction, TextBasedChannel, User } from 'discord.js';
import prisma from '../../../lib/prisma';
import fetchReaction from '../../../lib/utils';
import { editEmbed } from '../../../lib/starboard';

export default class StarboardRemove extends DiscordEvent {
  constructor() {
    super(Events.MessageReactionRemove, 'starboardRemove');
  }

  async run(client: Client<boolean>, reaction: MessageReaction, user: User) {
    await fetchReaction(reaction);

    const guildSettings = await prisma.guild.findUnique({
      where: {
        id: reaction.message.guildId
      }
    });
    if (!guildSettings || !guildSettings.starboard_channel) return;

    if (reaction.emoji.toString() !== guildSettings.starboard_emoji) return;
    if (reaction.message.author.id === user.id) return;

    const starboard = <TextBasedChannel>(await reaction.message.guild.channels.fetch(guildSettings.starboard_channel));
    if (!starboard) return;

    const messageInDatabase = await prisma.starredMessage.findUnique({
      where: {
        guildId_starredMessageId: {
          guildId: reaction.message.guildId,
          starredMessageId: reaction.message.id
        }
      }
    });

    if (!messageInDatabase) return;

    const botMessage = await starboard.messages.fetch(messageInDatabase.botMessageId).catch(e => {
    });
    if (!botMessage) return;

    const reactionCount = reaction.count - (reaction.users.cache.has(reaction.message.author.id) ? 1 : 0);

    if (reactionCount >= guildSettings.starboard_count) {
      await editEmbed({botMessage, reaction, reactionCount});
    } else {
      await prisma.starredMessage.delete({
        where: {
          guildId_starredMessageId: {
            guildId: reaction.message.guildId,
            starredMessageId: reaction.message.id
          }
        }
      }).catch(e => {
      });
      await botMessage.delete().catch(e => {
      });
    }
  }
}
