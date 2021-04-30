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
    }
}

module.exports = Utils;