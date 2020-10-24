const axios = require('axios')
const {convertConfigs} = require("../Utils");
const {baseURL} = require('../config')

module.exports = async (lastID) => {
    const configs = await axios.post(`${baseURL}/getUsers_configV2.php`, "page=1&where=&order=users_config.ID%20DESC&Login=zvshka").then(data => data.data.users_config).catch(e => console.log("ERROR IN FETCH"))
    if(!configs) return
    return convertConfigs(configs).filter(config => parseInt(config.ID) > parseInt(lastID)).sort((a, b) => parseInt(a.ID) - parseInt(b.ID))
}