const {MessageEmbed} = require('discord.js')
const fetchConfigs = require('./fetchConfigs')
const {Configuration} = require('../schemas/Configuration')
module.exports = async () => {
    const lastConfig = await Configuration.find({}).sort({ID: -1}).limit(1)
    const configs = await fetchConfigs(lastConfig[0].ID)
    if (configs.length === 0) return;
    for (let configuration of configs) {
        // if (eventCode.length > 0) {
        //     const event = await PCEvent.findOne({id: eventCode})
        //     if (event) {
        //         if (Date.now() > event.ends) {
        //             return channel.send(embed)
        //         }
        //         configuration.result = 0
        //         event.configs.push(configuration)
        //         event.save().catch(e => {
        //         })
        //         const msg = await eventsChannel.send(embed)
        //         await msg.react("⬆️")
        //         await msg.react("⬇️")
        //     }
        // }
        const conf = new Configuration(configuration)
        conf.save().catch(e => {
        })
    }
}