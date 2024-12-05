const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const registerCommands = async (clientId) => {
    const commands = [];

    const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../commands/${folder}`)).filter((file) =>
            file.endsWith('.js')
        );

        for (const file of commandFiles) {
            try {
                const command = require(`../commands/${folder}/${file}`);

                if (command.data && typeof command.data.toJSON === 'function') {
                    commands.push(command.data.toJSON());
                } else {
                    console.error(`Command in ${folder}/${file} is missing 'data' or is improperly formatted.`);
                }
            } catch (err) {
                console.error(`Error loading command in ${folder}/${file}:`, err);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🔁 Refreshing global slash commands...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Global slash commands have been refreshed successfully!');
    } catch (err) {
        console.error('❌ Error refreshing global slash commands:', err);
    }
};

module.exports = { registerCommands };