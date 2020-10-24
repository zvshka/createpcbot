// function makeID(length) {
//     let result = '';
//     let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//     for (let i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
// }
// const ms = require('ms')
// const {MessageEmbed} = require('discord.js')
// async function end(id) {
//     const configs = (await eventsChannel.messages.fetch())
//         .filter(message => message.embeds.length > 0 && message.embeds[0].footer.text !== "INFO")
//         .sort((a, b) => (b.reactions.cache.get("⬆️").count - b.reactions.cache.get("⬇️").count) - (a.reactions.cache.get("⬆️").count - a.reactions.cache.get("⬇️").count))
//     const res = configs.map(place => {
//         return {title: place.embeds[0].title,rating: place.reactions.cache.get("⬆️").count - place.reactions.cache.get("⬇️").count, author: place.embeds[0].author.name, id: place.embeds[0].footer.text}
//     })
//     const results = new MessageEmbed()
//         .setTitle("РЕЗУЛЬТАТЫ")
//         .setFooter("INFO")
//     for(let info of res) {
//         results.addField(info.title, `Рейтинг в дискорд: ${info.rating}\nАвтор: ${info.author}`)
//     }
//     await eventsChannel.bulkDelete(100)
//     eventsChannel.send(results).then(msg => msg.delete({timeout: 60000}))
//     const event = await PCEvent.findOne({id})
//     event.configs = res
//     event.winner = configs.first().embeds[0].author.name
//     event.save().catch(e => console.log(e))
// }
//
// module.exports.run = async (bot, message, args) => {
//     if(args[0] === "end") {
//         const id = args[1].split(":")[1]
//         await end(id)
//     } else {
//         const alreadyStarted = (await eventsChannel.messages.fetch().then(messages => messages.filter(m => m.embeds.length > 0 && m.embeds[0].footer.text === "INFO"))).first()
//         if(alreadyStarted) return message.channel.send("Уже идёт 1 ивент")
//         const time = ms(args[0])
//         if(isNaN(time)) return message.channel.send("Укажи корректное время")
//         const [name, description, target] = args.slice(1).join(" ").split(";")
//         if (!name) return message.channel.send("Укажи имя эвента")
//         if (!description) return message.channel.send("Укажи описание")
//         if (!target) return message.channel.send("Укажи цель: цена, комплеткующие и тп")
//         const id = makeID(7)
//         const embed = new MessageEmbed()
//             .setTitle("EVENT")
//             .setDescription(`1. Название: ${name}\n2. Описание: ${description}\n3. Цель: ${target}\n4. Время: ${args[0]}\n\nЧтобы участвовать опубликуй сборку с текстом: EVENT:${id} в описании`)
//             .setFooter("INFO")
//         eventsChannel.send(embed)
//         eventsChannel.send(`EVENT:${id}`).then(() => message.delete())
//         const newEvent = new PCEvent({
//             id: id,
//             name: name,
//             description: description,
//             target: target,
//             ends: Date.now() + time,
//             winner: ""
//         })
//         newEvent.save().catch(e => {})
//         setTimeout(async () => {
//             await end(id)
//         }, time)
//     }
// }