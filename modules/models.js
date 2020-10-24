module.exports = (connection) => {
    connection.model("Product", {
        data: Object
    })
    connection.model("AirCooler", {
        data: Object
    })
    connection.model("WaterCooler", {
        data: Object
    })
    connection.model("Body", {
        data: Object
    })
    connection.model("Motherboard", {
        data: Object
    })
    connection.model("M2", {
        data: Object
    })
    connection.model("Hdd", {
        data: Object
    })
    connection.model("Ssd", {
        data: Object
    })
    connection.model("Powersupply", {
        data: Object
    })
    connection.model("Processor", {
        data: Object
    })
    connection.model("Ram", {
        data: Object
    })
    return connection
}