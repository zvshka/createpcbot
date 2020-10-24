const {MessageEmbed} = require('discord.js')
const {Configuration} = require('../schemas/Configuration')

function getPartTop(configs, part) {
    const arrayParts = ["hdd", "ssd", "m2"]
    if(arrayParts.some(p => part.toLowerCase() === p)) {
        const uniqueParts = [...new Set(configs.map(item => item[part].map(p => p.model)).flat())];
        const countsParts = uniqueParts.map(p => {
            const configsWithThisPart = configs.filter(config => config[part].some(pp => pp.model === p))
            const count = configsWithThisPart.length
            return {
                p,
                count,
                middlePrice: configsWithThisPart.map(config => config.price).reduce((a, b) => parseInt(a) + parseInt(b)) / count
            }
        }).sort((a, b) => b.count - a.count)
        return {countsParts, models: uniqueParts.length}
    } else {
        const uniqueParts = [...new Set(configs.map(item => item[part].model))];
        const countsParts = uniqueParts.map(p => {
            const configsWithThisPart = configs.filter(config => config[part].model === p)
            const count = configsWithThisPart.length
            return {
                p,
                count,
                middlePrice: configsWithThisPart.map(config => config.price).reduce((a, b) => parseInt(a) + parseInt(b)) / count
            }
        }).sort((a, b) => b.count - a.count)
        return {countsParts, models: uniqueParts.length}
    }
}

module.exports.run = async (bot, message, args) => {
    message.delete()
    const argsToCheck = ["cpu", "gpu", "ram", "body", "cooler", "id", "hdd", "ssd", "m2", "clear"]
    let top;
    if(args[0] && argsToCheck.some(a => a === args[0].toLowerCase())) {
        if (args[0].toLowerCase() === "cpu") {
            top = "CPU"
        } else if (args[0].toLowerCase() === "gpu") {
            top = "GPU"
        } else if (args[0].toLowerCase() === "cooler") {
            top = "cooler"
        } else if (args[0].toLowerCase() === "body") {
            top = "body"
        } else if (args[0].toLowerCase() === "ram") {
            top = "RAM"
        } else if (args[0].toLowerCase() === "hdd") {
            top = "HDD"
        } else if (args[0].toLowerCase() === "m2") {
            top = "M2"
        } else if (args[0].toLowerCase() === "ssd") {
            top = "SSD"
        } else if (args[0].toLowerCase() === "id") {
            const configs = await Configuration.find({}).lean(true).exec()
            const unique = [...new Set(configs.map(item => item.ID))]
            message.channel.send(new MessageEmbed()
                .addField("Уникальных сборок", unique.length)
                .addField("Всего сборок", configs.length))
        } else if (args[0].toLowerCase() === "clear") {
            const configs = await Configuration.find({}).lean(true).exec()
            const unique = [...new Set(configs.map(item => item.ID))]
            for (let id of unique) {
                const count = configs.filter(item => item.ID === id)
                if (count.length > 1) {
                    await Configuration.deleteOne({ID: id})
                }
            }
        }
        if(top) {
            const configs = await Configuration.find({}).lean(true).exec()
            const {countsParts, models} = getPartTop(configs, top)
            const topEmbed = new MessageEmbed()
                .setTitle("ТОП 10 В ПРИЛОЖЕНИИ")
                .setFooter("Всего сборок в базе: " + configs.length)
                .setDescription("Уникальных моделей использовано: " + models)
            for (let i = 0; i < 10; i++) {
                topEmbed.addField(`${i + 1}. ${countsParts[i].p}`, `Кол-во сборок с ним: ${countsParts[i].count}\nСредняя цена сборки с ним: ${countsParts[i].middlePrice.toFixed(0)}`)
            }
            message.channel.send(topEmbed)
        }
    } else {
        message.channel.send("Укажи: " + argsToCheck.join(" "))
    }
}