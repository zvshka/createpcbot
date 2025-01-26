import {
  AttachmentBuilder,
  ChannelType,
  Client,
  Collection,
  Events,
  GuildMember,
  Message,
  Snowflake,
  TextChannel
} from 'discord.js';
import {createCanvas, loadImage, GlobalFonts, Canvas, SKRSContext2D} from '@napi-rs/canvas';
import {Event} from '../../../handler';
import prisma from '../../../lib/prisma';
import fillWithEmoji from '../../../lib/fillWithEmoji';
import axios from 'axios';

GlobalFonts.registerFromPath('./fonts/GoogleSans-Regular.ttf', 'Google Sans Regular');
GlobalFonts.registerFromPath('./fonts/GoogleSans-Italic.ttf', 'Google Sans Italic');

export default class QuoteEvent extends Event {
  private sequence: Collection<Snowflake, Array<Message>>;

  constructor() {
    super(Events.MessageCreate, 'quotes');
    this.sequence = new Collection();
  }

  /**
   * @param client
   * @param {Message} message
   * @returns {Promise<*>}
   */
  async run(client: Client<boolean>, message: Message): Promise<any> {
    // Если вдруг групповой ЛС чат - возвращаемся
    if (message.channel.type === ChannelType.GroupDM) return;
    // Полуаем настройки сервака
    const guildSettings = await prisma.guild.upsert({
      where: {
        id: message.guildId
      },
      create: {
        id: message.guildId
      },
      update: {}
    });

    // Экспериментальные функции
    const args = message.content.split(' ');
    const flagsSet = new Set(args.filter(arg => arg.startsWith('--')));

    //Проверка на срабатывание
    const isTriggeredDev = process.env.DEV && args[0] === '/';
    const isTriggered = args[0] === (guildSettings?.quotes_prefix || '\\');
    if (process.env.DEV ? isTriggeredDev : isTriggered) {
      if (flagsSet.has('--seq')) {
        if (flagsSet.has('--reset')) {
          return this.sequence.delete(message.author.id);
        } else if (flagsSet.has('--end')) {
          const sequence = this.sequence.get(message.author.id);
          if (!sequence || sequence.length === 0) return;

          const textCanvas = createCanvas(1000, 500);
          const textCtx = textCanvas.getContext('2d');

          const messages = await Promise.all(sequence.sort((a, b) => a.createdTimestamp - b.createdTimestamp).map(async msg => {
            const member = await msg.guild.members.fetch(msg.author.id).catch(_ => {
            }) as GuildMember;
            const avatar = member.displayAvatarURL({extension: 'jpg'});
            const name = member ? member.displayName : msg.author.username;
            let content = `—— ${msg.content.trim()}`;
            if (!content.endsWith('.')) content += '.';
            for (let [id, user] of msg.mentions.users) {
              const member = msg.guild.members.cache.get(id);
              const toReplace = member ? `@${member.displayName}` : `@${user.username}`;
              content = content.replaceAll(`<@${id}>`, toReplace).replaceAll(`<@!${id}>`, toReplace);
            }

            const lines = content.split('\n')
              .map(row => this.getLines(textCtx, row, 880, '52px "Google Sans Italic"')).flat();
            const height = this.calcHeight(lines);
            return {name, content: lines, avatar, height};
          }));

          const width = 1000;
          const height = messages.reduce((a, b) => a + b.height, 425);

          const canvas = createCanvas(width, height);
          const ctx = canvas.getContext('2d');
          // Фон
          ctx.textBaseline = 'top';

          if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const response = await axios.get(attachment.url, {
              responseType: 'arraybuffer'
            });
            // Получаем буфер изображения
            const imageBuffer = Buffer.from(response.data);
            const image = await loadImage(imageBuffer);
            ctx.drawImage(image, 0, 0, width, height);
            ctx.globalAlpha = 0.65;
            ctx.fillStyle = `rgb(0, 0, 0)`;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = `rgb(0, 0, 0)`;
            ctx.fillRect(0, 0, width, height);
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = '52px "Google Sans Regular"';
          ctx.fillText('Цитаты великих людей', 215, 35);

          ctx.font = '52px "Google Sans Italic"';
          for (let j = 0; j < messages.length; j++) {
            const msg = messages[j];
            let lastY = 0;
            for (let i = 0; i < msg.content.length; i++) {
              const y = ((j + 1) * 155 + (messages[j - 1] ? messages[j - 1].height > 155 ? messages[j - 1].height - 155 : 0 : 0)) + i * 75;
              ctx.fillText(msg.content[i], 60, y);
              lastY = y;
            }

            ctx.font = '42px "Google Sans Regular"';
            ctx.fillText('©', width - 300, height - 180);
            ctx.font = this.applyText(canvas, `— ${msg.name}`);
            ctx.fillText(msg.name, width - 280, height - 180);

            const avatar = await loadImage(msg.avatar);
            const radius = 75;
            const avatarY = lastY + 20;
            ctx.beginPath();
            ctx.arc(135, avatarY + radius, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, width - 120, avatarY, 50, 50);
          }

          const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {name: 'quote.png'});
          if (guildSettings.quotes_channel) {
            const quotes = <TextChannel>(await message.guild.channels.fetch(guildSettings.quotes_channel));
            quotes.send({
              files: [
                attachment
              ]
            }).catch(e => {
            });
          }

          await message.channel.send({
            files: [
              attachment
            ]
          }).catch(e => {
          });

        } else {
          const ref = await message.fetchReference().catch(e => {
          });
          if (!ref) return message.channel.send('Лэээ, кого цитировать то');
          if (ref.content.length < 1) return message.channel.send('Лэээ, текст дай');
          const array = this.sequence.get(message.author.id);
          if (!array) this.sequence.set(message.author.id, [ref]);
          else array.push(ref);
        }
      } else {
        // Получаем полную информацию о сообщении.
        const ref = await message.fetchReference().catch(e => {
        });
        // Если таковой нет, то кидаем ошибку.
        if (!ref) return message.channel.send('Лэээ, кого цитировать то');
        // Если сообщение не содержит текст - кидаем ошибку.
        if (ref.content.length < 1) return message.channel.send('Лэээ, текст дай');

        // Создаем канвас для отрисовки
        const textCanvas = createCanvas(1000, 500);
        const textCtx = textCanvas.getContext('2d');
        // Получаем полные данные человека, который отправил цитируемое сообщение.
        const member = await message.guild.members.fetch(ref.author.id).catch(_ => {
        });
        const name = member ? member.displayName : ref.author.username;
        let content = ref.content.trim();
        for (let [id, user] of ref.mentions.users) {
          const member = ref.guild.members.cache.get(id);
          const toReplace = member ? `@${member.displayName}` : `@${user.username}`;
          content = content.replaceAll(`<@${id}>`, toReplace).replaceAll(`<@!${id}>`, toReplace);
        }

        const text = '«' + content + '».';
        const lines = text.split('\n')
          .map(row => this.getLines(textCtx, row, 880, '52px "Google Sans Italic"')).flat();
        const width = 1000;
        const height = 35 + 66 + 54 + this.calcHeight(lines) + 60 + 150 + 60;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Фон
        ctx.textBaseline = 'top';

        if (message.attachments.size > 0) {
          const attachment = message.attachments.first();
          const response = await axios.get(attachment.url, {
            responseType: 'arraybuffer'
          });
          // Получаем буфер изображения
          const imageBuffer = Buffer.from(response.data);
          const image = await loadImage(imageBuffer);
          ctx.drawImage(image, 0, 0, width, height);
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = `rgb(0, 0, 0)`;
          ctx.fillRect(0, 0, width, height);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = `rgb(0, 0, 0)`;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '52px "Google Sans Regular"';
        ctx.fillText('Цитаты великих людей', 215, 35);

        ctx.font = '52px "Google Sans Italic"';
        for (let i = 0; i < lines.length; i++) {
          const y = 155 + i * 52 + i * 23;
          const line = lines[i];
          await fillWithEmoji(ctx, line.length > 0 ? line : ' ', 60, y);
        }

        if (!flagsSet.has('--noauthor')) {
          ctx.font = '42px "Google Sans Regular"';
          ctx.fillText('©', 250, height - 180);
          ctx.font = this.applyText(canvas, name);
          ctx.fillText(name, 280, height - 180);

          const avatar = await loadImage(ref.author.displayAvatarURL({extension: 'jpg'}));
          const radius = 75;
          const avatarY = height - 210;
          ctx.beginPath();
          ctx.arc(135, avatarY + radius, radius, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, 60, avatarY, 150, 150);
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {name: 'quote.png'});
        if (guildSettings.quotes_channel) {
          const quotes = <TextChannel>(await message.guild.channels.fetch(guildSettings.quotes_channel));
          quotes.send({
            files: [
              attachment
            ]
          }).catch(e => {
          });
        }
        await message.channel.send({
          files: [
            attachment
          ]
        }).then(() => {
          console.log(`[LOG] ${message.author.tag} использовал цитату на сообщение ${ref.content} пользователя ${name}`);
        });
      }
    }
  }

  applyText(canvas: Canvas, text: string, font = '"Google Sans Regular"', fontSize = 50) {
    const ctx = canvas.getContext('2d');

    do {
      // Assign the font to the context and decrement it, so it can be measured again
      ctx.font = `${fontSize -= 2}px ${font}`;
      // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
  }

  /**
   * @param {String} text
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} maxWidth
   * @param {String} font
   * @returns Array<String>
   * */
  getLines(ctx: SKRSContext2D, text: string, maxWidth: number, font: string) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    const tempFont = ctx.font;
    ctx.font = font;

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const toMeasure = currentLine + ' ' + word;
      const width = ctx.measureText(
        toMeasure
          .replaceAll(/<?(a:|:)\w*:(\d{17}|\d{18})>/gi, 'EM')
      ).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    ctx.font = tempFont;
    return lines;
  }

  calcHeight(lines: string | any[]) {
    return lines.length * 52 + lines.length * 23;
  }
};
