const {Feature} = require('../../handler')
const Utils = require('../../Utils')
const path = require("path");

module.exports = class extends Feature {
    constructor(deps) {
        super("giveaway");
        this.load()
        this.deps = deps
    }

    load() {
        try {
            Utils
                .readdirSyncRecursive(path.join(__dirname, './commands'))
                .filter(file => file.endsWith('.js'))
                .map(require)
                .map(Node => new Node({...this.deps}))
                .map(Node => this.registerCommand(Node))
        } catch (e) {

        }

        try {
            Utils
                .readdirSyncRecursive(path.join(__dirname, './events'))
                .filter(file => file.endsWith('.js'))
                .map(require)
                .map(Node => new Node({...this.deps}))
                .map(this.registerEvent)
        } catch (e) {

        }
    }
}