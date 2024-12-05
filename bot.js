const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { loadCommands } = require('./helpers/commandLoader');
const { registerCommands } = require('./helpers/registerCommands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.config = require('./config.js');
client.commands = new Collection();

loadCommands(client);

const eventsPath = path.join(__dirname, 'listeners');
fs.readdirSync(eventsPath).forEach(file => {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (typeof event === 'function') {
        event(client);
    } else {
        console.error(`[ERROR] Listener '${file}' does not export a function.`);
    }
});

client.once('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);

    try {
        await registerCommands(client.user.id);
        console.log('✅ Slash commands registered successfully.');
    } catch (error) {
        console.error('[ERROR] Failed to register slash commands:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client, client.config);
    } catch (error) {
        console.error('[ERROR] Command execution failed:', error);
        interaction.reply({
            content: '❌ An error occurred while executing the command.',
            ephemeral: true,
        });
    }
});

client.login(process.env.TOKEN)
    .then(() => console.log('✅ Logged in to Discord.'))
    .catch(error => console.error('[ERROR] Failed to log in:', error));