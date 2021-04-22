const axios = require("axios");
const {Event} = require('../../handler');
const Utils = require('../../Utils')
const Configuration = require('../../schemas/Configuration')
module.exports = class extends Event {
    constructor() {
        super('ready');
    }

    async run(client) {
        await this.post()
        setInterval(async () => {
            await this.post()
        }, 30000)
    }

    async post() {
        const lastConfig = await Configuration.find({}).sort({ID: -1}).limit(1)
        const configs = await this.fetchPages(lastConfig[0].ID)
        if (configs.length === 0) return;
        for (let configuration of configs) {
            const conf = new Configuration(configuration)
            conf.save().catch(_ => {
            })
        }
    }

    async fetchPages(lastID, page = 1) {
        const configs = await axios.post(`${process.env.baseURL}/getUsers_configV2.php`,
            `page=${page}&where=&order=users_config.ID%20DESC&Login=zvshka`)
            .then(({data}) => data.users_config)
            .catch(e => console.log("ERROR IN FETCH"))
        if (!configs) return
        return Utils.convertConfigs(configs)
            .filter(config => parseInt(config.ID) > parseInt(lastID))
            .sort((a, b) => parseInt(a.ID) - parseInt(b.ID))
    }
};
