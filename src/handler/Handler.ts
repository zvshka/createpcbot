import { ChannelType, Client } from 'discord.js';

import Event from './Event'
import Command from './Command'
import Utils from '../Utils'
import Feature from './Feature';
import prisma from '../lib/prisma';

class Handler {
  public client: Client;
  public features: Map<string, Feature>
  public commands: Map<string, Command>
  public events: Map<string, Event[]>
  public aliases: Map<string, Command>
  public prefix: string
  public directory: string
  public dependencies: any

  /**
   * @description Create a new handler instance
   * @param {Client} client - The discord.js client
   */
  constructor(client: Client) {
    /**
     * The discord.js client
     * @type {Client}
     */
    this.client = client;

    /**
     * A map of all features
     * @type {Map<string, Feature>}
     */
    this.features = new Map();

    /**
     * A map containing all the commands, mapped by command name
     * @type {Map<string, Command>}
     */
    this.commands = new Map();

    /**
     * A map containing all the commands, mapped by alias
     * @type {Map<string, Command>}
     */
    this.aliases = new Map();

    /**
     * A map containing all the events, mapped by event name
     * @type {Map<string, Array<Event>>}
     */
    this.events = new Map();
  }

  /**
   * @description Load all command/event modules from a directory
   * @param {string} directory - The directory of the modules
   * @param {object} dependencies - The dependencies of the modules
   * @returns {undefined}
   */
  async load(directory, dependencies) {
    this.directory = directory;
    this.dependencies = dependencies;

    // Find and require all JavaScript files
    const nodes = await Promise.all(
      Utils.readdirSyncRecursive(directory)
        .filter(file => file.endsWith(process.env.DEV ? '.ts' : '.js'))
        .map(async file => (await import(file)).default),
    )

    // Load all Features
    for (const Node of nodes) {
      if (Node.prototype instanceof Feature) {
        await this.loadFeature(new Node(dependencies));
      }
    }

    // Load all Command and Event classes that haven't loaded yet
    for (const Node of nodes) {
      if (Node.prototype instanceof Command) {
        const loaded = Array.from(this.commands.values()).some(
          command => command instanceof Node,
        );

        if (!loaded) {
          this.loadCommand(new Node(dependencies));
        }
      }

      if (Node.prototype instanceof Event) {
        const loaded = Array.from(this.events.values()).some(events =>
          events.some(event => event instanceof Node),
        );

        if (!loaded) {
          this.loadEvent(new Node(dependencies));
        }
      }
    }

    // Register loaded commands and events
    this.register();
  }

  /**
   * @description Load a feature and it's commands
   * @param {Feature} feature - The feature that needs to be loaded
   */
  async loadFeature(feature) {
    if (this.features.has(feature.name)) {
      throw new Error(
        `Can't load Feature, the name '${feature.name}' is already used`,
      );
    }

    await feature.load()

    this.features.set(feature.name, feature);
    console.log(`[LOADING] Загружаю Feature: ${feature.name}`)

    feature.commands.forEach(command => {
      this.loadCommand(command);
    });

    feature.events.forEach(event => {
      this.loadEvent(event);
    });
  }

  /**
   * @description Load a command
   * @param {Command} command - The command that needs to be loaded
   */
  loadCommand(command) {
    // Command name might be in use or name might already be an existing alias
    if (this.commands.has(command.name) || this.aliases.has(command.name)) {
      throw new Error(
        `Can't load command, the name '${command.name}' is already used as a command name or alias`,
      );
    }

    this.commands.set(command.name, command);
    console.log(`[LOADING] Загружаю команду: ${command.name}`)

    command.aliases.forEach(alias => {
      // Alias might already be a command or might already be in use
      if (this.commands.has(alias) || this.aliases.has(alias)) {
        throw new Error(
          `Can't load command, the alias '${alias}' is already used as a command name or alias`,
        );
      }

      this.aliases.set(alias, command);
    });
  }

  /**
   * @description Load an event
   * @param {Event} event - The event that needs to be loaded
   */
  loadEvent(event) {
    const events = this.events.get(event.eventName) || [];
    events.push(event);

    this.events.set(event.eventName, events);
    console.log(`[LOADING] Загружаю ивент: ${event.name}`)
  }

  /**
   * @description Register the command and event handlers
   */
  register() {
    // Handle events
    for (const [name, handlers] of this.events) {
      this.client.on(name, (...params) => {
        for (const handler of handlers) {
          // Run event if enabled
          if (handler.isEnabled) {
            try {
              handler.run(this.client, ...params);
            } catch (err) {
              console.log(`[ERROR] ${err}`)
              // this.client.guilds.fetch("725786415438364692").then(guild => {
              //     const channel = guild.channels.cache.get("836263032702107749")
              //     channel.send(`Плохой человек создал ошибку, чекни <@!263349725099458566> \`\`\`${err.stack}\`\`\``)
              // })
            }
          }
        }
      });
    }

    // Handle commands
    this.client.on('messageCreate', async message => {
      const guildSettings = await prisma.guild.upsert({
        where: {
          id: message.guildId,
        },
        create: {
          id: message.guildId,
        },
        update: {},
      })
      const prefix = process.env.DEV ? '$' : guildSettings.prefix
      if (message.author.bot || !message.content.startsWith(prefix)) {
        return;
      }

      // Remove prefix and split message into command and args
      const [command, ...args] = message.content
        .slice(prefix.length)
        .split(' ');

      let cmd = this.commands.get(command.toLowerCase());

      if (!cmd) {
        // Get the command by alias
        cmd = this.aliases.get(command.toLowerCase());
      }

      if (!cmd || !cmd.isEnabled) {
        // No command or alias found or command is disabled
        return;
      }

      if (cmd.adminOnly && message.author.id !== '263349725099458566' && (message.channel.type === ChannelType.DM || !message.member.permissions.has('Administrator'))) {
        return;
      }


      if (cmd.guildOnly && !message.guild) {
        return;
      }


      try {
        await cmd.run(message, args);
        console.log(`[LOG] ${message.author.tag} использовал ${cmd.name}`)
      } catch (err) {
        console.log(err)
        console.log(`[ERROR] ${message.author.tag} использовал ${cmd.name} и что то сломал`)
      }
    });
  }
}

export default Handler
