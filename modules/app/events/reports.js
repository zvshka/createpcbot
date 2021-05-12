const {MessageEmbed} = require("discord.js");
const {Event} = require('../../../handler');
const Report = require('../../../schemas/Report')

module.exports = class extends Event {
    constructor({fetch}) {
        super('ready', 'reports');
        this.fetch = fetch
    }

    async run(client) {
        await this.post(client)
        setInterval(async () => {
            await this.post(client)
        }, 30000)
    }

    async post(bot) {
        const reports = await this.fetch("/getListUsers_warn.php", {
            auth: true
        })

        if (reports.status) {
            const list = reports.list
            /**
             * @type {TextChannel}
             */
            const reportChannel = await bot.channels.fetch("833058424928993290")
            const messages = await reportChannel.messages.fetch()
            const embeds = messages
                .filter(message => message.embeds.length > 0)
                .map(message => ({message, id: message.embeds[0].footer.text}))
            const checked = embeds
                .filter(embed => !list.some(report => report.ID === embed.id))
            const newReports = list
                .filter(report => !embeds.some(embed => report.ID === embed.id))
            for (let report of newReports) {
                const embed = new MessageEmbed()
                    .setTitle("Репорт №" + report.ID)
                    .setDescription(`
                **Тип:** \`${report.Type === "config" ? "Сборка" : "Сообщение"}\`
                **Виновник:** \`${report.name_intruder}\`
                **Отправитель:** \`${report.name_user}\`
                **Сообщение:** \`${report.message_warn}\`
                
                ${report.Type === "config" ? `
                    **ID Сборки:** \`${report.ID_config}\`
                    **Название сборки:** \`${report.name_config}\`
                    **Описание сборки:** \`${report.description_config}\`
                ` : `
                    **ID сообщения:** \`${report.id_message}\`
                    **Текст сообщения виновного:** \`${report.text_message}\`
                `}
                `)
                    .setFooter(report.ID)
                await reportChannel.send(embed)
                const reportDoc = {
                    id: report.ID,
                    type: report.Type,
                    content: report.message_warn
                }
                if (report.Type === "config") {
                    reportDoc.config = {
                        id: report.ID_config,
                        name: report.name_config,
                        description: report.description_config
                    }
                } else {
                    reportDoc.message = {
                        id: report.id_message,
                        text: report.text_message
                    }
                }
                const nReport = new Report(reportDoc)
                await nReport.save()
            }
            for (let embed of checked) {
                await embed.message.delete()
            }
        }
    }
};
