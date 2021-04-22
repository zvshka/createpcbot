const {Event} = require('../../handler');
const {MessageAttachment} = require('discord.js')
const {createCanvas, loadImage, registerFont} = require('canvas')
registerFont("./fonts/GoogleSans-Regular.ttf", {family: "Google Sans Regular"})
registerFont("./fonts/GoogleSans-Italic.ttf", {family: "Google Sans Italic"})

module.exports = class extends Event {
    constructor() {
        super('message');
    }

    async run(client, message) {
        if (message.content !== "\\") return
        const ref = message.referencedMessage
        if (!ref) return message.channel.send("Лэээ, кого цитировать то")
        if (ref.content.length < 1) return message.channel.send("Лэээ, текст дай")
        const textCanvas = createCanvas(1000, 500)
        const textCtx = textCanvas.getContext('2d')
        const member = await message.guild.members.fetch(ref.author.id).catch(e => {})
        const name = member ? member.displayName : ref.author.username

        const text = "«" + ref.content + "»."
        const lines = text.split("\n").map(row => this.getLines(textCtx, row, 880, '52px "Google Sans Italic"')).flat()
        const width = 1000
        const height = 35 + 66 + 54 + this.calcHeight(lines) + 60 + 150 + 60

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        // Фон
        ctx.textBaseline = "top"
        ctx.fillStyle = `rgb(0, 0, 0)`
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = '#ffffff';
        ctx.font = '52px "Google Sans Regular"';
        ctx.fillText("Цитаты великих людей", 215, 35);

        ctx.font = '52px "Google Sans Italic"'
        // ctx.fillText(content, 60, 155)
        for (let i = 0; i < lines.length; i++) {
            const y = 155 + i * 52 + i * 23
            ctx.fillText(lines[i], 60, y)
        }

        ctx.font = '42px "Google Sans Regular"';
        ctx.fillText("©", 250, height-180);
        ctx.font = this.applyText(canvas, name);
        ctx.fillText(name, 280, height-180)

        const avatar = await loadImage(ref.author.displayAvatarURL({format: 'jpg'}));
        const radius = 75
        const avatarY = height - 210
        ctx.beginPath();
        ctx.arc(135, avatarY + radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 60, avatarY, 150, 150)

        const attachment = new MessageAttachment(canvas.toBuffer(), 'cit.png');
        await message.channel.send(attachment);
    }

    applyText(canvas, text, font = '"Google Sans Regular"', fontSize = 50) {
        const ctx = canvas.getContext('2d');

        do {
            // Assign the font to the context and decrement it so it can be measured again
            ctx.font = `${fontSize -= 2}px ${font}`;
            // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (ctx.measureText(text).width > canvas.width - 300);

        // Return the result to use in the actual canvas
        return ctx.font;
    }

    getLines(ctx, text, maxWidth, font) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];

        const tempFont = ctx.font
        ctx.font = font

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        ctx.font = tempFont
        return lines;
    }

    calcHeight(lines) {
        return lines.length * 52 + lines.length * 23
    }
};
