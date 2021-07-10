import Feature from "../../handler/Feature";
import axios from "axios";
import Utils from "../../Utils";
import path from "path";

export default class extends Feature {
    constructor(deps) {
        super("app");
        this.deps = deps
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
        const status = res.status === 200
        return {
            status,
            ...((status && res.data.hasOwnProperty("list")) && {
                list: res.data.list || []
            }),
            ...((status && res.data.users_config) && {
                configs: res.data.users_config
            }),
            ...((status && res.data.MESSAGE) && (() => {
                const info = JSON.parse(res.data.MESSAGE)
                return {
                    name: info.name,
                    avatar: info.avatar,
                    messages: info.count_message,
                    donater: Boolean(info.ShowAds),
                    configs: info.count_publish_config,
                    registration: info.date_registration,
                    rating: info.rating,
                    warns: JSON.parse(info.list_warning)
                }
            })())
        }
    }

    async load() {
        const dependency = {...this.deps, fetch: this.fetch}
        try {
            const nodes = await Promise.all(Utils
                .readdirSyncRecursive(path.join(__dirname, './commands'))
                .filter(file => file.endsWith('.js'))
                .map(async file => (await import(file)).default))
            nodes.map(Node => new Node(dependency))
                .map(Node => this.registerCommand(Node))
        } catch (e) {

        }

        try {
            const nodes = await Promise.all(Utils
                .readdirSyncRecursive(path.join(__dirname, './events'))
                .filter(file => file.endsWith('.js'))
                .map(async file => (await import(file)).default))
            nodes.map(Node => new Node(dependency))
                .map(Node => this.registerEvent(Node))
        } catch (e) {

        }
    }
}