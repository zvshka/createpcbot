const fs = require('fs');
const path = require('path');

class Utils {
    /**
     * @description Read a directory recursively to get all files
     * @param {string} directory - The directory to read
     * @returns {Array<string>} All the paths to the files
     */
    static readdirSyncRecursive(directory) {
        let files = [];

        fs.readdirSync(directory).forEach(file => {
            const location = path.join(directory, file);

            // If the file is a directory read it recursively
            if (fs.lstatSync(location).isDirectory()) {
                files = files.concat(Utils.readdirSyncRecursive(location));
            } else {
                files.push(location);
            }
        });

        return files;
    }

    /**
     * @description Makes a boolean object Yes or No.
     * @param {boolean} bool - The boolean to stringify.
     * @returns {string} Boolean as Yes or No, accordingly.
     */
    static boolToString(bool) {
        if (typeof bool === 'boolean') {
            return bool ? 'Yes' : 'No';
        }
        return String(bool);
    }

    static convertConfigs(configs) {
        const check = /EVENT:(.*){7}/
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

    static split(input, maxLength) {
        if (!Array.isArray(input)) {
            throw new TypeError('Expected an array to split');
        }

        if (typeof maxLength !== 'number') {
            throw new TypeError('Expected a number of groups to split the array in');
        }

        const result = [];
        let part = [];

        for (let i = 0; i < input.length; i++) {
            part.push(input[i]);

            // check if we reached the maximum amount of items in a partial
            // or just if we reached the last item
            if (part.length === maxLength || i === input.length - 1) {
                result.push(part);
                part = [];
            }
        }

        return result;
    };
}

module.exports = Utils;