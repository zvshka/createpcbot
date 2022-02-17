import Event from "../../../handler/Event";

export default class ReadyEvent extends Event {
    constructor() {
        super('ready', 'ready');
    }

    async run(client, message) {
        console.log("READY")
        client.user.setPresence({ activities: [{ name: 'Помоги мне в развитии https://github.com/zvshka/createpcbot' }], status: 'online' });
    }
};
