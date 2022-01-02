const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

module.exports = class FileHandler {

    constructor(resourcesPath) {
        this.resourcesPath = resourcesPath;
    }

    async writeFile(message) {
        const { path: filePath, data } = message;
        const fullPath = path.join(this.resourcesPath, filePath);
        const dir = path.dirname(fullPath);
        mkdir(dir, { recursive: true });
        const buffer = Buffer.from(data, 'base64');
        await writeFile(fullPath, buffer);
        console.log(`Wrote file ${filePath}`);
    }

};
