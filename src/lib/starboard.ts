import { Colors, EmbedBuilder } from 'discord.js';

export const editEmbed = ({ botMessage, reactionCount, reaction }) => {
  const embed = new EmbedBuilder(botMessage.embeds[0])
  if (reactionCount > 3) embed.setColor(Colors.Yellow)
  if (reactionCount > 5) embed.setColor(Colors.Orange)
  if (reactionCount > 7) embed.setColor(Colors.Blurple)
  return botMessage.edit({
    content: `${reaction.emoji.toString()} **${reactionCount}** <#${reaction.message.channelId}>`,
    embeds: [embed]
  }).catch(e => {})
}
