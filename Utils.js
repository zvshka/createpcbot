const check = /EVENT:(.*){7}/
module.exports = {
    convertConfigs: (configs) => {
        return configs.map(info => {
            return {
                ID: info.ID,
                description: info.Description_config,
                author: info.Name_author,
                name: info.Name_config,
                price: info.Price_config,
                eventCode: !!info.Description_config.replace("\n", " ").split(" ").find(str => check.test(str)) ?
                    info.Description_config.replace("\n", " ").split(" ").find(str => check.test(str)).split(":")[1] : "",
                CPU: {
                    price: info.Price_CPU,
                    model: info.Model_CPU
                },
                body: {
                    price: info.Price_Body,
                    model: info.Model_Body,
                    image: info.Image_Body,
                    standards: info.PAR1_Body,
                    format: info.PAR2_Body
                },
                cooler: {
                    price: info.Price_Cooling_system,
                    model: info.Model_Cooling_system,
                    dispersion: info.PAR2_Cooling_system
                },
                GPU: {
                    price: info.Price_Video_card,
                    model: info.Model_Video_card,
                    count: info.Count_Video_card
                },
                PSU: {
                    price: info.Price_Power_supply,
                    model: info.Model_Power_supply
                },
                RAM: {
                    price: info.Price_RAM,
                    model: info.Model_RAM,
                    count: info.Count_RAM,
                    kit: info.PAR2_RAM
                },
                motherboard: {
                    price: info.Price_Motherboard,
                    model: info.Model_Motherboard
                },
                HDD: [
                    info.Model_Data_storage_1.length > 0 ? {
                        price: info.Price_Data_storage_1,
                        model: info.Model_Data_storage_1,
                        count: info.Count_Data_storage_1,
                        capacity: info.PAR1_Data_storage_1,
                        spinSpeed: info.PAR2_Data_storage_1
                    } : null,
                    info.Model_Data_storage_2.length > 0 ? {
                        price: info.Price_Data_storage_2,
                        model: info.Model_Data_storage_2,
                        count: info.Count_Data_storage_2,
                        capacity: info.PAR1_Data_storage_2,
                        spinSpeed: info.PAR2_Data_storage_2
                    } : null,
                    info.Model_Data_storage_3.length > 0 ? {
                        price: info.Price_Data_storage_3,
                        model: info.Model_Data_storage_3,
                        count: info.Count_Data_storage_3,
                        capacity: info.PAR1_Data_storage_3,
                        spinSpeed: info.PAR2_Data_storage_3
                    } : null,
                ].filter(disk => disk),
                SSD: [
                    info.Model_SSD_1.length > 0 ? {
                        price: info.Price_SSD_1,
                        model: info.Model_SSD_1,
                        count: info.Count_SSD_1,
                        capacity: info.PAR1_SSD_1,
                        chipType: info.PAR2_SSD_1
                    } : null,
                    info.Model_SSD_2.length > 0 ? {
                        price: info.Price_SSD_2,
                        model: info.Model_SSD_2,
                        count: info.Count_SSD_2,
                        capacity: info.PAR1_SSD_2,
                        chipType: info.PAR2_SSD_2
                    } : null,
                    info.Model_SSD_3.length > 0 ? {
                        price: info.Price_SSD_3,
                        model: info.Model_SSD_3,
                        count: info.Count_SSD_3,
                        capacity: info.PAR1_SSD_3,
                        chipType: info.PAR2_SSD_3
                    } : null,
                ].filter(disk => disk),
                M2: [
                    info.Model_SSD_M2_1.length > 0 ? {
                        price: info.Price_SSD_M2_1,
                        model: info.Model_SSD_M2_1,
                        count: info.Count_SSD_M2_1,
                        capacity: info.PAR1_SSD_M2_1,
                        chipType: info.PAR2_SSD_M2_1
                    } : null,
                    info.Model_SSD_M2_2.length > 0 ? {
                        price: info.Price_SSD_M2_2,
                        model: info.Model_SSD_M2_2,
                        count: info.Count_SSD_M2_2,
                        capacity: info.PAR1_SSD_M2_2,
                        chipType: info.PAR2_SSD_M2_2
                    } : null,
                    info.Model_SSD_M2_3.length > 0 ? {
                        price: info.Price_SSD_M2_3,
                        model: info.Model_SSD_M2_3,
                        count: info.Count_SSD_M2_3,
                        capacity: info.PAR1_SSD_M2_3,
                        chipType: info.PAR2_SSD_M2_3
                    } : null,
                ].filter(disk => disk),
            }
        })
    }
}