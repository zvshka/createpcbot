const {Event} = require('../../handler');

const answers = [
    "Чё надо?",
    "Вы заебёте уже пинговать, мать свою пингани",
    "Умный самый бота пинговать?",
    "Иди сборку сделай и поясни за SP9"
]

module.exports = class extends Event {
    constructor() {
        super('message');
    }

    async run(client, message) {
        const text = answers[Math.floor(Math.random() * answers.length)]
        if (message.content === client.user.toString()) {
            return message.channel.send(text)
        }
    }
};
