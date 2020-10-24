const {Client} = require('discord.js')
const bot = new Client()
const {prefix, mongo, eventsChannelID} = require('./config')
const postConfig = require('./modules/postConfig')
const mongoose = require('mongoose')
const parse = require('parse-ms')
const commands = new Map()
const fs = require('fs')
bot.on("ready", async () => {
    console.log("/////////////////////////////////////////////////////////")
    console.log("/////////////           IM STARTED            ///////////")
    console.log("/////////////////////////////////////////////////////////")
    await mongoose.connect(mongo, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    await postConfig()
    setInterval(postConfig, 30000)
})

fs.readdirSync("./commands/").map(file => {
    const f = require(`./commands/${file}`)
    if(f) commands.set(file.split(".")[0], f)
})

bot.on("message", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return
    const [command, ...args] = message.content
        .slice(prefix.length)
        .split(" ")
    const c = commands.get(command)
    if(c) c.run(bot, message, args)
})

bot.on('messageReactionAdd', async (r, user) => {
    if(user.bot) return
    if(r.message.channel.id !== eventsChannelID) return;
    if(r.message.embeds.length === 0) return;
    if(r.message.embeds[0].footer.text === "INFO") return;
    const up = r.message.reactions.cache.get("⬆️")
    const down = r.message.reactions.cache.get("⬇️")
    if(r.emoji.name === "⬆️") {
        if(down.users.cache.has(user.id)) await down.users.remove(user)
    } else if(r.emoji.name === "⬇️") {
        if(up.users.cache.has(user.id)) await up.users.remove(user)
    }
})
bot.on("ready", async () => {
    const channel = await bot.channels.cache.get("725786415895674911")
    const moment = require('moment');
    const data = moment();
    const today = new Date(data.year(), data.month(), data.date()).getTime()
    const hour = 60 * 60 * 1000
    let hoursNear = 0
    let todayWithHours = today
    while (Date.now() > todayWithHours) {
        todayWithHours += hour
        hoursNear++
    }
    const timeout = todayWithHours-Date.now()
    function sendToChat(hour) {
        console.log(hour)
        if(hour === 6 || hour === 8 || hour === 10) {
            channel.send("Здравствуйте, Пользователи. Прошу вас соблюдать правила нашего сервера (#📕правила📓), а также слушать Админов. Хорошего дня.")
        } else if(hour === 11 || hour === 13 || hour === 15 || hour === 17) {
            channel.send("Добрый день, Пользователи. Прошу Вас соблюдать правила нашего сервера (#📕правила📓), а также слушать Админов. Удачи.")
        } else if(hour === 18 || hour === 20 || hour === 22) {
            channel.send("Добрый вечер, Пользователи. Прошу Вас соблюдать правила нашего сервера (#📕правила📓), а также слушать Админов. Надеюсь Ваш день прошёл отлично, удачи.")
        } else if(hour === 23 || hour === 0) {
            channel.send("Спокойной ночи, Пользователи. Хороших Вам снов.")
        }
    }
    setTimeout(() => {
        sendToChat(hoursNear + 2)
        setInterval(() => {
            const parsed = parse(Date.now())
            sendToChat(parsed.hours + 2)
        }, hour)
    }, timeout)
})

bot.login("NTk1OTA5MTkyNjc4NzY4NjUy.XvYb8g.N7o0lhu3wgaI2ewbsRe_WMjBF74").catch(e => {
})