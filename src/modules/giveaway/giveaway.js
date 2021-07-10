import Feature from "../../handler/Feature";
import Utils from "../../Utils";
import path from "path";

export default class Giveaway extends Feature {
    constructor(deps) {
        super("giveaway");
        this.deps = deps
        this.toggle()
    }

    async load() {
        try {
            const nodes = await Promise.all(Utils
                .readdirSyncRecursive(path.join(__dirname, './commands'))
                .filter(file => file.endsWith('.js'))
                .map(async file => (await import(file)).default))
            nodes.map(Node => new Node(this.deps))
                .map(Node => this.registerCommand(Node))
        } catch (e) {

        }

        try {
            const nodes = await Promise.all(Utils
                .readdirSyncRecursive(path.join(__dirname, './events'))
                .filter(file => file.endsWith('.js'))
                .map(async file => (await import(file)).default))
            nodes.map(Node => new Node(this.deps))
                .map(Node => this.registerCommand(Node))
        } catch (e) {

        }
    }
}