import { EmbedBuilder } from 'discord.js';

export const editEmbed = ({ botMessage, reactionCount, reaction }) => {
  const embed = new EmbedBuilder(botMessage.embeds[0])
  if (reactionCount > 3) embed.setColor("Yellow")
  if (reactionCount > 5) embed.setColor("Orange")
  if (reactionCount > 7) embed.setColor("Blurple")
  return botMessage.edit({
    content: `${reaction.emoji.toString()} **${reactionCount}** <#${reaction.message.channelId}>`,
    embeds: [embed]
  }).catch(e => {})
}
