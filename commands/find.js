const mongoose = require('mongoose')
const connection = mongoose.createConnection("mongodb+srv://zvshka:1234@database-a6uzs.mongodb.net/products?retryWrites=true&w=majority", {
    useFindAndModify: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})
const rm = require('discord.js-reaction-menu');
const {MessageEmbed} = require('discord.js')
//mongoose.set('debug', true)
require('../modules/models')(connection)
function splitArray(input, maxLength) {
    if (!Array.isArray(input)) {
        throw new TypeError('Expected an array to split');
    }

    if (typeof maxLength !== 'number') {
        throw new TypeError('Expected a number of groups to split the array in');
    }

    let result = [];
    let part = [];

    for (let i = 0; i < input.length; i++) {
        part.push(input[i]);

        // check if we reached the maximum amount of items in a partial
        // or just if we reached the last item
        if (part.length === maxLength || i === input.length - 1) {
            result.push(part);
            part = [];
        }
    }

    return result;
}

const instruction = new MessageEmbed()
    .setTitle("ИНСТРУКЦИЯ")
    .setDescription("Для того, чтобы найти что то в базе, пожалуйста укажи 1 слово из списка ниже, соотвествующее вашему запросу. Так же возможен поиск по коду товара: find <ключ> код <код товара>")
    .addField("Видеокарта", "видеокарта", true)
    .addField("Процессор", "процессор", true)
    .addField("Водяное охлаждение", "сжо", true)
    .addField("Кулер(воздушный)", "кулер", true)
    .addField("Ссд", "ссд", true)
    .addField("М2", "м2", true)
    .addField("Жесткий диск", "хдд", true)
    .addField("Корпус", "корпус", true)
    .addField("Материнская плата", "материнская", true)
    .addField("Оперативная память", "оперативка", true)
    .addField("Блок питания", "псу", true)

module.exports.run = async (bot, message, args) => {
    if (!args[0]) return message.channel.send(instruction)
    const option = args[0].toLowerCase()
    let model;
    switch (option) {
        case "видеокарта":
            model = "Product"
            break;
        case "кулер":
            model = "AirCooler"
            break;
        case "сжо":
            model = "WaterCooler"
            break;
        case "корпус":
            model = "Body"
            break;
        case "материнская":
            model = "Motherboard"
            break;
        case "м2":
            model = "M2"
            break;
        case "хдд":
            model = "Hdd"
            break;
        case "ссд":
            model = "Ssd"
            break;
        case "псу":
            model = "Powersupply"
            break;
        case "процессор":
            model = "Processor"
            break;
        case "оперативка":
            model = "Ram"
            break;
        default:
            model = null
            break
    }
    if (!model) return message.channel.send(instruction)
    else {
        if (args.length === 1) return message.channel.send(instruction)
        if (args[1].toLowerCase() === "код") {
            const data = await connection.models[model].findOne({
                "data.Код товара": args[2]
            })
            if (!data) return message.channel.send("Такого нет")
            const entries = splitArray(Object.entries(data.data).filter(e => e[0] !== e[1] && e[0] !== "Модель" && e[0] !== "Image"), 25).map(e => {
                const embed = new MessageEmbed()
                    .setTitle(data.data.Модель)
                    .setThumbnail(data.data.Image)
                for (let [k, v] of e) {
                    embed.addField(k, v, true)
                }
                return embed
            })
            new rm.menu({
                channel: message.channel,
                userID: message.author.id,
                pages: entries,
                time: 60000
            })
        } else {
            const toFind = args.slice(1).map(arg => arg.trim())
            let data;
            const check = toFind.filter(arg => arg.startsWith("[") && arg.endsWith("]") && toFind.indexOf(arg) === toFind.length - 1)
            if(check.length > 0) {
                data = await connection.models[model].findOne({
                    "data.Код производителя": check[0]
                }).lean(true)
            } else {
                const aggregation = toFind.map(arg => {
                    return {
                        $match: {
                            "data.Модель": {
                                $regex: arg, $options: 'gi'
                            }
                        }
                    }
                })
                data = await connection.models[model].aggregate(aggregation)
            }
            if (!data || data.length === 0) return message.channel.send("Такого нет")
            else if(data.data) {
                const entries = splitArray(Object.entries(data.data).filter(e => e[0] !== e[1] && e[0] !== "Модель" && e[0] !== "Image" && e[0] !== "URL"), 25).map(e => {
                    const embed = new MessageEmbed()
                        .setTitle(data.data.Модель)
                        .setURL(data.data.URL)
                        .setThumbnail(data.data.Image)
                    for (let [k, v] of e) {
                        embed.addField(k, v, true)
                    }
                    return embed
                })
                new rm.menu(message.channel, message.author.id, entries, 60000)
            } else if (data.length === 1) {
                const entries = splitArray(Object.entries(data[0].data).filter(e => e[0] !== e[1] && e[0] !== "Модель" && e[0] !== "Image" && e[0] !== "URL"), 25).map(e => {
                    const embed = new MessageEmbed()
                        .setTitle(data[0].data.Модель)
                        .setURL(data[0].data.URL)
                        .setThumbnail(data[0].data.Image)
                    for (let [k, v] of e) {
                        embed.addField(k, v, true)
                    }
                    return embed
                })
                new rm.menu({
                    channel: message.channel,
                    userID: message.author.id,
                    pages: entries,
                    time: 60000
                })
            } else {
                if(data.length > 25) {
                    const splinted = splitArray(data, 25)
                    const embeds = splinted.map(dataArray => {
                        const embed = new MessageEmbed()
                            .setTitle("Несколько результатов")
                            .setDescription("Чтобы получить информацию об каком либо товаре воспользуйтесь поиском по коду товара")
                            .setFooter(`Страница ${splinted.indexOf(dataArray) + 1} / ${splinted.length}`)
                        dataArray.forEach(p => {
                            embed.addField(`${p.data.Модель} ${p.data["Код производителя"] ? p.data["Код производителя"] : ""}`,` (Код товара: ${p.data["Код товара"]})`, true)
                        })
                        return embed
                    })
                    new rm.menu({
                        channel: message.channel,
                        userID: message.author.id,
                        pages: embeds,
                        time: 60000
                    })
                } else {
                    const embed = new MessageEmbed()
                        .setTitle("Несколько результатов")
                        .setDescription("Чтобы получить информацию об каком либо товаре воспользуйтесь поиском по коду товара")
                    data.forEach(p => {
                        embed.addField(`${p.data.Модель} ${p.data["Код производителя"] ? p.data["Код производителя"] : ""}`,` (Код товара: ${p.data["Код товара"]})`, true)
                    })
                    message.channel.send(embed)
                }
            }
        }
    }
}
