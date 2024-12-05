const fs = require('fs');
const path = require('path');

const loadCommands = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`Loaded command: ${command.data.name} from ${folder}/${file}`);
            } else {
                console.warn(`The command at ${folder}/${file} is missing required properties.`);
            }
        }
    }
};

module.exports = { loadCommands };