const {MessageEmbed} = require('discord.js')
const puppeteer = require('puppeteer')
const mongoose = require('mongoose')
const cheerio = require('cheerio')
const {Configuration} = require('../schemas/Configuration')
const LAUNCH_PUPPETEER_OPTS = {
    'defaultViewport': {'width': 1920, 'height': 1080},
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
    ]
}
const PAGE_PUPPETEER_OPTS = {
    networkIdle2Timeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000
}

const connection = mongoose.createConnection("mongodb+srv://zvshka:1234@database-a6uzs.mongodb.net/products?retryWrites=true&w=majority", {
    useFindAndModify: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})
require('../modules/models')(connection)

function getModel(key) {
    let model;
    switch (key) {
        case "GPU":
            model = "Product"
            break;
        case "cooler":
            model = ["AirCooler", "WaterCooler"]
            break;
        case "body":
            model = "Body"
            break;
        case "motherboard":
            model = "Motherboard"
            break;
        case "M2":
            model = "M2"
            break;
        case "HDD":
            model = "Hdd"
            break;
        case "SSD":
            model = "Ssd"
            break;
        case "PSU":
            model = "Powersupply"
            break;
        case "CPU":
            model = "Processor"
            break;
        case "RAM":
            model = "Ram"
            break;
        default:
            model = null
            break
    }
    return model
}

const keys = [
    "GPU",
    "cooler",
    "body",
    "motherboard",
    "M2",
    "HDD",
    "SSD",
    "PSU",
    "CPU",
    "RAM"
]

async function findInDatabase(toFind, model, value) {
    let data;
    const check = toFind.filter(arg => arg.startsWith("[") && arg.endsWith("]") && toFind.indexOf(arg) === toFind.length - 1)
    if (check.length > 0) {
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
        data = connection.models[model].findOne({
            "data.Модель": value.model
        }).lean(true)
        if (!data) {
            data = await connection.models[model].aggregate(aggregation)
        }
    }
    return data instanceof Array ? data[0] : data
}

module.exports.run = async (bot, message, args) => {
    const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS)
    if (!args[0]) return message.channel.send("Укажи id сборки")
    if (!args[1]) return message.channel.send("Укажи город на русском")
    const pc = parseInt(args[0])
    const startEmbed = new MessageEmbed()
        .setTitle("Подождите пока сборка обработается")
        .setDescription("ШАГ 1: Скачивание сборки")
        .setFooter("ВНИМАНИЕ!!! Прогресс может быть очень долгим, имейте терпение, спасибо")
    const answer = await message.channel.send(startEmbed)
    const config = await Configuration.findOne({ID: pc}).lean(true)
    if (!config) {
        const noConfig = new MessageEmbed()
            .setTitle("Ошибка").setDescription("Такого конфига нет в базе бота")
        return answer.edit(noConfig)
    }
    const entries = Object.entries(config).filter(([k, v]) => keys.includes(k) && (v instanceof Array ? v.length > 0 : true))
    const products = (
        await Promise.all(
            entries.map(async ([key, value]) => {
                const model = getModel(key)
                if (value instanceof Array) {
                    return Promise.all(value.map(async val => await findInDatabase(val.model.split(" "), model, val)))
                } else {
                    if (model instanceof Array) {
                        return Promise.all(model.map(async model => await findInDatabase(value.model.split(" "), model, value)))
                    } else {
                        return findInDatabase(value.model.split(" "), model, value)
                    }
                }
            })
        )
    ).flat().filter(i => i)
    let sumPrice = 0
    const resultEmbed = new MessageEmbed()
    const page = await browser.newPage()
    await page.goto("https://www.dns-shop.ru", PAGE_PUPPETEER_OPTS)
    await page.waitForTimeout(200);
    await page.evaluate(async () => {
        const button = document.querySelector(".city-select.w-choose-city-widget")
        await button.click()
    })
    await page.waitForSelector("div.search-field")
    await page.type('div.search-field > input', args[1], {delay: 20})
    await page.keyboard.press('Enter')
    await page.waitForTimeout(400);
    for (let product of products) {
        const stepEmbed = new MessageEmbed()
            .setTitle("Подождите пока сборка обработается")
            .setDescription(`ШАГ 2: обработка продукта (${products.indexOf(product)+1}/${products.length})`)
            .setFooter("ВНИМАНИЕ!!! Прогресс может быть очень долгим, имейте терпение, спасибо")
        await answer.edit(stepEmbed)

        if(product.data.URL) {
            await page.goto(product.data.URL, PAGE_PUPPETEER_OPTS)
            await page.waitForSelector(".product-card-price__current").catch(e => {})
            const content = await page.content()
            const $ = cheerio.load(content)
            const price = $(".product-card-price__current").text() || "0"
            const availability = $(".buttons-wrapper.buttons-wrapper_without-by-in-shop > button").text()
            if(config.HDD.length > 0 && config.HDD.some(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)) {
                sumPrice += parseInt(price.replace(" ", "").replace( /^\D+/g, '')) * config.HDD.filter(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)[0].count
            }else
            if(config.SSD.length > 0 && config.SSD.some(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)) {
                sumPrice += parseInt(price.replace(" ", "").replace( /^\D+/g, '')) * config.SSD.filter(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)[0].count
            }else
            if(config.M2.length > 0 && config.M2.some(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)) {
                sumPrice += parseInt(price.replace(" ", "").replace( /^\D+/g, '')) * config.M2.filter(item => item.model === `${product.data.Модель} ${product.data["Код производителя"]}`)[0].count
            }else {
                sumPrice += parseInt(price.replace(" ", "").replace( /^\D+/g, ''))
            }
            resultEmbed.addField(`${product.data.Модель} ${product.data["Код производителя"] ? product.data["Код производителя"] : ""}`, `В наличии: ${availability === "Купить" ? "Да" : "Нет"}\nЦена: ${price}`, true)
        } else {
            resultEmbed.addField(`${product.data.Модель} ${product.data["Код производителя"] ? product.data["Код производителя"] : ""}`, `Нет данных`, true)
        }
    }
    resultEmbed.setTitle(`Конечная цена в твоём городе: ${sumPrice}P (Учитываются только комплектующие)`)
    await answer.edit(resultEmbed)
    await browser.close()
}