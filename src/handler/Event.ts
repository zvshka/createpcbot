import Toggleable from "./Toggleable"
import {Client} from "discord.js";

class Event extends Toggleable {
    public eventName: string;
    public name: string;

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
    run(client?: Client, ...params:any[]) {
        throw new Error('Event is missing run method');
    }
}

export default Event
