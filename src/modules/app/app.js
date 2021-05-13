import Feature from "../../handler/Feature";
import axios from "axios";
import Configs from "./events/configs";
import Reports from "./events/reports";
import Whois from "./commands/whois";

export default class extends Feature {
    constructor(deps) {
        super("app");
        this.deps = deps
        this.load()
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
                delete dataObject.auth
                Object.assign(dataObject, {login: process.env.LOGIN, password: process.env.PASSWORD})
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

    load() {
        const dependency = {...this.deps, fetch: this.fetch}
        const configsEvent = new Configs(dependency)
        const reportsEvent = new Reports(dependency)
        const whoisCommand = new Whois(dependency)
        this.registerEvent(configsEvent)
        this.registerEvent(reportsEvent)
        this.registerCommand(whoisCommand)
    }
}