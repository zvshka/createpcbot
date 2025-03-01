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
import { createCanvas, loadImage, GlobalFonts, Canvas, SKRSContext2D } from '@napi-rs/canvas';
import { Event } from '../../../handler';
import prisma from '../../../lib/prisma';
import fillWithEmoji from '../../../lib/fillWithEmoji';
import axios from 'axios';

GlobalFonts.registerFromPath('./fonts/GoogleSans-Regular.ttf', 'Google Sans Regular');
GlobalFonts.registerFromPath('./fonts/GoogleSans-Italic.ttf', 'Google Sans Italic');

const mainTextSize = 52
const secondaryTextSize = 42
const globalMargin = 25;

type CanvasTextBaseline = "alphabetic" | "bottom" | "hanging" | "ideographic" | "middle" | "top"

const validBaselines: CanvasTextBaseline[] = ["alphabetic", "bottom", "hanging", "ideographic", "middle", "top"];

export default class QuoteEvent extends Event {
  private sequence: Collection<Snowflake, Array<Message>>;

  constructor() {
    super(Events.MessageCreate, 'quotes');
  }

  async run(client: Client<boolean>, message: Message<boolean>): Promise<any> {
    // Если вдруг групповой ЛС чат - возвращаемся
    if (message.channel.type === ChannelType.GroupDM) return;

    const messageChannel = message.channel as TextChannel;

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

    const args = message.content.split(' ');
    const isTriggered = args[0] === (guildSettings?.quotes_prefix || '\\');

    if (!isTriggered) return;

    // Получаем полную информацию о сообщении.
    const ref = await message.fetchReference().catch(e => {
    });
    // Если таковой нет, то кидаем ошибку.
    if (!ref) return messageChannel.send('Нет сообщения для цитирования.');
    // Если сообщение не содержит текст - кидаем ошибку.
    if (!ref.content || ref.content.trim().length === 0) return messageChannel.send('В сообщении нет текста.');

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
      .map(row => this.getLines(textCtx, row, 880, `${mainTextSize}px Google Sans Italic`)).flat();

    const width = 1000;
    const height = 155 + this.calcHeight(lines) + 270;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.textBaseline = args[1] in validBaselines ? args[1] as CanvasTextBaseline : 'top';

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
    ctx.font = `${mainTextSize}px Google Sans Regular`;
    ctx.fillText('Цитаты великих людей', 215, 35 + globalMargin);

    ctx.font = `${mainTextSize}px "Google Sans Italic"`;
    for (let i = 0; i < lines.length; i++) {
      const y = 155 + i * mainTextSize + i * 23;
      const line = lines[i];
      await fillWithEmoji(ctx, line.length > 0 ? line : ' ', 60, y + globalMargin);
    }

    ctx.font = `${secondaryTextSize}px Google Sans Regular`;
    ctx.fillText('©', 250, height - 180 + globalMargin);
    ctx.font = this.applyText(canvas, name);
    ctx.fillText(name, 280, height - 180 + globalMargin);

    const avatar = await loadImage(ref.author.displayAvatarURL({ extension: 'jpg' }));
    const radius = 75;
    const avatarY = height - 210;
    ctx.beginPath();
    ctx.arc(135, avatarY + radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 60, avatarY, 150, 150);
    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'quote.png' });
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

  applyText(canvas: Canvas, text: string, font = 'Google Sans Regular', fontSize = mainTextSize - 2) {
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';

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
