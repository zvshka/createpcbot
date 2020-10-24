const {MessageEmbed} = require('discord.js')
const puppeteer = require('puppeteer')
const Keyboard = require("puppeteer-keyboard");
const cheerio = require('cheerio')
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
module.exports.run = async (bot, message, args) => {
    message.delete()
    const city = args[0]
    const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS)
    const page = await browser.newPage()
    await page.goto("https://www.e-katalog.ru", PAGE_PUPPETEER_OPTS)
    await page.evaluate(async () => {
        const button = document.querySelector("div.ib.h")
        await button.click()
    })
    await page.screenshot({path: "buttonClick.png"})
    await page.waitForSelector("input.ek-form-control.rs-inp")
    const input = await page.$("my.input");
    const kb = new Keyboard(page);
    await kb.type(city, input);
    await kb.type("[Enter]", input);
    await page.evaluate(async () => {
        const city = document.querySelector("div.rs-div")
        await city.click()
    })
    await page.keyboard.press('Enter')
    await page.keyboard.press(String.fromCharCode(13))
    await page.screenshot({path: "changeCity.png"})
}