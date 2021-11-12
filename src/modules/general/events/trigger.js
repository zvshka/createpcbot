import Event from "../../../handler/Event";

export default class TriggerEvent extends Event {
    constructor() {
        super("message", "trigger");
        this.toggle()
    }

    async run(message) {
        
    }
}