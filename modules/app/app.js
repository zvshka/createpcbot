const {Feature} = require('../../handler')
const axios = require('axios')
const configs = require('./events/configs')
const reports = require('./events/reports')
const whois = require('./commands/whois')

module.exports = class extends Feature {
    constructor(deps) {
        super("app");
        this.registerEvent(new configs({...deps, fetch: this.fetch}))
        this.registerEvent(new reports({...deps, fetch: this.fetch}))
        this.registerCommand(new whois({...deps, fetch: this.fetch}))
    }

    /**
     * @param url {String}
     * @param dataObject {Object}
     * @returns {Promise<Object>}
     */
    async fetch(url, dataObject) {
        let data = ""
        if (dataObject.hasOwnProperty("auth")) {
            if (dataObject.auth) {
                dataObject.removeProperty("auth")
                Object.assign(dataObject, {password: process.env.PASSWORD, login: process.env.LOGIN})
            }
        }
        for (let key in dataObject) {
            data += `${key}=${dataObject[key]}&`
        }
        const res = await axios.post(process.env.baseURL + url, data)
            .catch(e => {
                if (e) {
                    console.log(`[ERROR] Ошибка в получении ${url} с данными ${data}`)
                    console.log(e)
                }
                return false
            })
        const returnObject = {
            status: res.status === 200
        }
        if (returnObject.status && res.data.hasOwnProperty("list")) {
            returnObject.list = res.data.list || []
        }
        if (returnObject.status && res.data.users_config) {
            returnObject.configs = res.data.users_config
        }
        if (returnObject.status && res.data.MESSAGE) {
            const info = JSON.parse(res.data.MESSAGE)
            returnObject.name = info.name
            returnObject.avatar = info.avatar
            returnObject.messages = info.count_message
            returnObject.donater = Boolean(info.ShowAds) ? "Да" : "Нет"
            returnObject.configs = info.count_publish_config
            returnObject.registration = info.date_registration
            returnObject.rating = info.rating
            returnObject.warns = JSON.parse(info.list_warning)
        }
        return returnObject
    }
}