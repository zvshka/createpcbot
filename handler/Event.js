import Toggleable from "./Toggleable"

class Event extends Toggleable {
    /**
     * @description Create a new event
     * @param {string} eventName - The name of the event
     * @param {string} name - Name
     */
    constructor(eventName, name) {
        super();

        this.eventName = eventName;
        this.name = name
    }

    /**
     * @description Method that runs when the event is fired
     */
    run() {
        throw new Error('Event is missing run method');
    }
}

export default Event
