const {Event} = require('../../handler');
const parse = require('parse-ms')
const moment = require('moment-timezone');

module.exports = class extends Event {
    constructor() {
        super('ready');
    }

    async run(client) {
        const channel = await client.channels.cache.get("725786415895674911")
        const date = moment().tz("Europe/Moscow");
        const today = new Date(date.year(), date.month(), date.date()).getTime()
        const hour = 60 * 60 * 1000
        let hoursNear = 0
        let todayWithHours = today
        while (Date.now() > todayWithHours) {
            todayWithHours += hour
            hoursNear++
        }
        const timeout = todayWithHours - Date.now()

        function sendToChat(hour) {
            if (hour === 6 || hour === 8 || hour === 10) {
                channel.send("Здравствуйте, Пользователи. Прошу вас соблюдать правила нашего сервера (<#725966961997250571>), а также слушать Админов. Хорошего дня.")
            } else if (hour === 11 || hour === 13 || hour === 15 || hour === 17) {
                channel.send("Добрый день, Пользователи. Прошу Вас соблюдать правила нашего сервера (<#725966961997250571>), а также слушать Админов. Удачи.")
            } else if (hour === 18 || hour === 20 || hour === 22) {
                channel.send("Добрый вечер, Пользователи. Прошу Вас соблюдать правила нашего сервера (<#725966961997250571>), а также слушать Админов. Надеюсь Ваш день прошёл отлично, удачи.")
            } else if (hour === 23 || hour === 0) {
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
    }
};
