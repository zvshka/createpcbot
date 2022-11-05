import { loadImage } from "canvas";
import { parse } from "twemoji-parser";
const splitEmoji = (string: string) => {
  let toReturn = ""
  for (let symbol of string) {
    if (/\p{Emoji_Presentation}/gu.test(symbol)) {
      toReturn += ` ${symbol} `
    } else {
      toReturn += symbol
    }
  }
  return toReturn.trim()
}
const fillWithEmoji = async (ctx, text: string, x, y) => {
  if (!text) throw new Error("(discord-emoji-canvas) No Text was provided");
  if (!ctx) throw new Error(`(discord-emoji-canvas) No Context was provided`);
  if (!x) throw new Error(`(discord-emoji-canvas) No x axis was provided`);
  if (!y) throw new Error(`(discord-emoji-canvas) No y axis was provided`);
  // starting function from here
  let emojiPercent1 = 0.1;
  let emojiPercent2 = 0.1;
  let fontSize = parseInt(ctx.font);
  let emojiSideMargin = fontSize * emojiPercent1;
  let emojiUpMargin = fontSize * emojiPercent2;
  let entity = text
    .replace(">", "> ")
    .split(" ")
    .map(splitEmoji)
    .flat()
    .join(" ")
    .trim()
    .split(" ");

  const baseLine = ctx.measureText("").alphabeticBaseline;
  let currWidth = 0;
  for (let i = 0; i < entity.length; i++) {
    //starting loop
    const ent = entity[i]; //getting current word or emoji
    let parsed = parse(ent); //parsing to check later if emote is an twemoji
    if (ent.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
      if (ent.startsWith("«")) {
        ctx.fillText("«", x + currWidth, y);
        currWidth += ctx.measureText("«").width + fontSize / 5;
      }
      //checking if custom emote or not
      let matched = ent.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
      let img = await loadImage(
        `https://cdn.discordapp.com/emojis/${matched[2]}.png`
      );
      ctx.drawImage(
        img,
        x + currWidth + emojiSideMargin,
        y + emojiUpMargin - fontSize - baseLine,
        fontSize,
        fontSize
      );
      currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
      if (ent.endsWith("».")) {
        ctx.fillText("».", x + currWidth, y);
        currWidth += ctx.measureText("».").width + fontSize / 5;
      }
    } else if (parsed.length > 0) {
      if (ent.startsWith("«")) {
        ctx.fillText("«", x + currWidth, y);
        currWidth += ctx.measureText("«").width + fontSize / 5;
      }
      //checking if twemoji or not
      let img = await loadImage(parsed[0].url);
      ctx.drawImage(
        img,
        x + currWidth + emojiSideMargin,
        y + emojiUpMargin - fontSize - baseLine,
        fontSize,
        fontSize
      );
      currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
      if (ent.endsWith("».")) {
        ctx.fillText("».", x + currWidth, y);
        currWidth += ctx.measureText("».").width + fontSize / 5;
      }
    } else {
      //if string
      ctx.fillText(ent, x + currWidth, y);
      currWidth += ctx.measureText(ent).width + fontSize / 5;
    }
  }
};
export default fillWithEmoji;
