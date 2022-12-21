import { MessageEmbed } from 'discord.js';

export const editEmbed = ({ botMessage, reactionCount, reaction }) => {
  const embed = new MessageEmbed(botMessage.embeds[0])
  if (reactionCount > 3) embed.setColor("YELLOW")
  if (reactionCount > 5) embed.setColor("ORANGE")
  if (reactionCount > 7) embed.setColor("BLURPLE")
  return botMessage.edit({
    content: `${reaction.emoji.toString()} **${reactionCount}** <#${reaction.message.channelId}>`,
    embeds: [embed]
  }).catch(e => {})
}
