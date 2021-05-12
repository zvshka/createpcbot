import Event from "../../../handler/Event";

const answers = [
    "Чё надо?",
    "Хули надо?",
    "Да...",
    "{user}",
    "Вы заебёте уже пинговать, мать свою пингани",
    "Умный самый бота пинговать?",
    "Иди сборку сделай и поясни за SP9"
]

export default class PingEvent extends Event {
    constructor() {
        super('message', 'ping');
    }

    async run(client, message) {
        const text = answers[Math.floor(Math.random() * answers.length)]
        if (message.mentions.has(client.user.id)) {
            return message.channel.send(text.replace("{user}", message.author.toString()))
        }
    }
};
