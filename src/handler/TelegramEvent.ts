import { Client } from "discord.js";
import DiscordEvent from "./DiscordEvent";
import TelegramBot from "node-telegram-bot-api";


export class TelegramEvent extends DiscordEvent {

  constructor(eventType: string, eventName: string) {
    super(eventType, eventName);
  }


  run(client?: TelegramBot, discordClient?: Client, ...params: any[]) {

  }
}
