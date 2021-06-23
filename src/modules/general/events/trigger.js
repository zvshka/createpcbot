import Event from "../../../handler/Event";

export default class TriggerEvent extends Event {
    constructor() {
        super("message", "trigger");
    }

    async run(message) {
        
    }
}