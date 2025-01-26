import { TelegramEvent } from "../../../handler/TelegramEvent";
import TelegramBot, { Message, User } from "node-telegram-bot-api";
import { Client, GuildTextBasedChannel, TextChannel } from "discord.js";
import * as process from "node:process";

function getTelegramName(user: User) {
  if (user.username) {
    return user.username
  } else if (user.first_name && user.last_name) {
    return user.first_name + user.last_name
  } else if (user.first_name) {
    return user.first_name
  } else if (user.last_name) {
    return user.last_name
  }
  return "undefined"
}

export default class PozdnyakovMessages extends TelegramEvent {
  constructor() {
    super('message', 'pozdnyakovMessages');
  }

  async run(client: TelegramBot, discordClient: Client, message: Message) {
    console.log(message.chat.username, message.chat.id)
    if (message.chat.id === parseInt(process.env.POZDNYAKOV)) {
      const sendChannel = <TextChannel>(await discordClient.channels.fetch("1295041304836964363"))
      if (sendChannel) {
        const voiceMessage = message.voice ? await client.getFileLink(message.voice.file_id) : null;
        const photos = message.photo.length > 1 ? await Promise.all(message.photo.map(async p => await client.getFileLink(p.file_id))) : null;

        try {
          await sendChannel.send({
            content: message.text,
            files: [voiceMessage, ...photos]
          })
        } catch (e) {

        }
      }
    }
  }
};
