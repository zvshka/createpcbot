import Command from "../../handler/Command";
import {importFromString} from "module-from-string";

export default class SudoCommand extends Command {
    constructor({commandHandler}) {
        super('sudo', {
            aliases: [],
            info: 'sudo',
            usage: 'sudo <command>',
            guildOnly: false,
            adminOnly: false
        });
        this.handler = commandHandler
    }

    async run(message, args) {
        try {
            const [name, ...otherArgs] = args
            const command = await this.handler.db.command.findUnique({
                where: {
                    name
                }
            })
            if (command) {
                const cmdCode = command.code.toString().replace(/"/gi, "'")
                const cmdInst = await importFromString(cmdCode)
            }
        } catch (e) {
            console.log(e)
        }
    }
};
