const {MessageEmbed} = require('discord.js');
const {table, getBorderCharacters} = require('table');
const sp = require('split-array');
const Minimax = require('tic-tac-toe-minimax');

function getData(message, enemy, reactions, tb, emoji, round, msg) {
    const val = tb[reactions.indexOf(emoji.name) + 1];
    if(val.user) return;
    val.value = round % 2 === 0 ? "⭕" : "❌";
    val.user = round % 2 === 0 ? enemy.id : message.author.id;
    const tab = new MessageEmbed()
        .setDescription(editTab(round, tb))
        .setFooter(`${message.author.tag} - первый игрок: ❌\n${enemy.tag} - второй игрок: ⭕`);
    return msg.edit(tab);
}

function aiCalculate(board, tab, collector, reactions, emojis, enemy) {
    const huPlayer = "❌";
    const aiPlayer = "⭕";
    const symbols = {
        huPlayer: huPlayer,
        aiPlayer: aiPlayer
    };
    const difficulty = "Hard";//ttt.js -> function aiCalculate -> difficult -> Easy, Normal, Hard

    const react = emojis[Minimax.default.ComputerMove(board, symbols, difficulty)];
    collector.emit("collect", react, enemy)
}

function editTab(round, tab) {
    let data = [];
    for(let key in tab) {
        data.push(tab[key].value)
    }

    data = sp(data, 3);

    return table(data, {
        border: getBorderCharacters("void"),
        columnDefault: {
            paddingLeft: 0,
            paddingRight: 1
        },
        drawHorizontalLine: () => {
            return false
        }
    });
}

function checkWin(tab) {
    const h1 = tab[1].value === tab[2].value && tab[2].value === tab[3].value ? tab[1].user : false;
    const h2 = tab[4].value === tab[5].value && tab[5].value === tab[6].value ? tab[4].user : false;
    const h3 = tab[7].value === tab[8].value && tab[8].value === tab[9].value ? tab[7].user : false;
    const v1 = tab[1].value === tab[4].value && tab[4].value === tab[7].value ? tab[1].user : false;
    const v2 = tab[2].value === tab[5].value && tab[5].value === tab[8].value ? tab[2].user : false;
    const v3 = tab[3].value === tab[6].value && tab[6].value === tab[9].value ? tab[3].user : false;
    const o1 = tab[1].value === tab[5].value && tab[5].value === tab[9].value ? tab[1].user : false;
    const o2 = tab[3].value === tab[5].value && tab[5].value === tab[7].value ? tab[3].user : false;
    return [h1, h2, h3, v1, v2, v3, o1, o2].some(row => row) ? [h1, h2, h3, v1, v2, v3, o1, o2].filter(row => row)[0] : false
}

module.exports.run = async (client, message, args) => {
    let enemy = message.mentions.users.first();
    message.delete()
    if (!enemy) return message.channel.send("Пинг бота или игрока/себя").then(msg => msg.delete({timeout: 5 * 1000}));

    let answer;
    let msg;

    if (!enemy.bot) {
        const embed = new MessageEmbed()
            .addField("Новая игра", `${enemy} **ты хочешь поиграть с** ${message.author}?`)
            .setFooter("Реакции: ✅ - Да, ❌ - Нет");
        msg = await message.channel.send(embed);

        await msg.react("✅");
        await msg.react("❌");

        answer = await msg.createReactionCollector((r, user) => ["✅", "❌"].includes(r.emoji.name) && user.id === enemy.id);
    } else {
        const embed = new MessageEmbed()
            .addField("Новая игра", `**Вы хотите играть с ботом?**`)
            .setFooter("Реакции: ✅ - Да, ❌ - Нет");
        msg = await message.channel.send(embed);

        await msg.react("✅");
        await msg.react("❌");

        answer = await msg.createReactionCollector((r, user) => ["✅", "❌"].includes(r.emoji.name) && user.id === message.author.id);
    }

    answer.on("collect", async (r) => {
        if (r.emoji.name === "❌") {
            answer.stop();
            return msg.delete();
        }
        if (r.emoji.name === "✅") {
            let output;
            let data = [];
            const tb = {
                1: {user: "", value: "1⃣"},
                2: {user: "", value: "2⃣"},
                3: {user: "", value: "3⃣"},
                4: {user: "", value: "4⃣"},
                5: {user: "", value: "5⃣"},
                6: {user: "", value: "6⃣"},
                7: {user: "", value: "7⃣"},
                8: {user: "", value: "8⃣"},
                9: {user: "", value: "9⃣"},
            };

            for (let key in tb) {
                data.push(tb[key].value)
            }

            data = sp(data, 3);

            output = table(data, {
                border: getBorderCharacters("void"),
                columnDefault: {
                    paddingLeft: 0,
                    paddingRight: 1
                },
                drawHorizontalLine: () => {
                    return false
                }
            });
            const tab = new MessageEmbed()
                .setDescription(output)
                .setFooter(`${message.author.tag} - первый игрок: ❌\n${enemy.tag} - второй игрок: ⭕`);
            await msg.edit(tab);
            await msg.reactions.removeAll();
            const emojis = [];
            const reactions = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣"];
            for (const r of reactions) {
                const e = await msg.react(r);
                emojis.push(e)
            }
            let round = 1;
            let win = false;
            let player1;
            let player2;

            const callback = async (id, pl, r) => {
                if (enemy.bot) {
                    if (round === 1 && id === enemy.id) return;
                } else {
                    if (enemy.id !== message.author.id) {
                        if (round % 2 !== 0 && id === enemy.id) return r.users.remove(id);
                        if (round % 2 === 0 && id === message.author.id) return r.users.remove(id);
                    }
                }
                await getData(message, enemy, reactions, tb, r.emoji, round, msg);
                round++;
                win = checkWin(tb);
                if (win) {
                    if (player2) player2.stop();
                    player1.stop();
                    await msg.reactions.removeAll();
                    if (message.author.bot) return
                    return msg.edit(new MessageEmbed(msg.embeds[0]).setTitle(`${win === message.author.id ? message.author.tag : enemy.tag} Выиграл(-a)!`))
                } else if (!win && round === 10) {
                    if (player2) player2.stop();
                    player1.stop();
                    await msg.reactions.removeAll();
                    if (message.author.bot) return
                    return msg.edit(new MessageEmbed(msg.embeds[0]).setTitle(`Ничья!`))
                }
                await r.remove();
                const board = [];
                for (let key in tb) {
                    board.push(tb[key].value)
                }
                if (enemy.bot) {
                    if (round % 2 === 0) aiCalculate(board.map((row, index) => reactions.includes(row) ? index : row), tb, player1, reactions, emojis, enemy);
                }
            };
            if (!enemy.bot && message.author.id !== enemy.id) {
                player1 = await msg.createReactionCollector((r, user) => reactions.includes(r.emoji.name) && message.author.id === (user.id));
                player2 = await msg.createReactionCollector((r, user) => reactions.includes(r.emoji.name) && enemy.id === (user.id));

                player1.on('collect', callback.bind(null, message.author.id, "player1"));
                player2.on('collect', callback.bind(null, enemy.id, "player2"));
            } else {
                player1 = await msg.createReactionCollector((r, user) => reactions.includes(r.emoji.name) && message.author.id === (user.id));
                player1.on('collect', callback.bind(null, message.author.id, "player1"));
            }
        }
    })
}