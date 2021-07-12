import Command from "../../../handler/Command";

export default class Whois extends Command {
    constructor({commandHandler, fetch}) {
        super('clear', {
            aliases: ['cl'],
            info: 'Получить информацию о пользователе из приложения',
            usage: 'whois <nickname>',
            guildOnly: false,
            adminOnly: true
        });
        this.client = commandHandler.client;
        this.fetch = fetch
    }

    async run(message, args) {
        if (!message.author.id !== "263349725099458566") {
            let [login, pages] = args.join(" ").split("; ")
            let cfgs = []
            for (let i = 1; i <= Number(pages); i++) {
                console.log(`[LOG] Страница ${i}`)
                const {status, configs} = await this.fetch("/getUsers_configV2.php", {
                    page: i,
                    order: "users_config.ID DESC",
                    login: process.env.LOGIN
                })
                const need = configs.filter(cfg => cfg.Name_author === login)
                need.forEach(cfg => cfgs.push(cfg))
            }
            for (const cfg of cfgs) {
                console.log(`[LOG] Сборка с ID: ${cfg.ID}`)
                await this.fetch("/delete_users_config.php", {
                    ID_CONFIG: cfg.ID,
                    auth: true
                });
            }
        }
    }
}