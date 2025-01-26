import { Client } from "discord.js";
import Event from "./Event";
import TelegramBot from "node-telegram-bot-api";


export class TelegramEvent extends Event {

  constructor(eventType: string, eventName: string) {
    super(eventType, eventName);
  }


  run(client?: TelegramBot, discordClient?: Client, ...params: any[]) {

  }
}