const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands organized by category'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help - Commands List')
            .setDescription('Here is a list of all commands you can use. Click on them for more info!')
            .setTimestamp()
            .setFooter({ text: 'Developed by BigglesDevelopment❤️' });

        const commandFolders = fs.readdirSync(path.join(__dirname, '../../commands'));
        let foundCommands = false;

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter((file) =>
                file.endsWith('.js')
            );

            if (commandFiles.length === 0) continue;

            let commandList = '';
            
            const emoji = folder === 'admin' ? '🔧' :
                folder === 'owner' ? '👑' :
                folder === 'moderation' ? '⚔️' :
                folder === 'utilities' ? '🛠️' :
                folder === 'general' ? '✨' : 
                folder === 'dropper' ? '📦' :
                '❓';

            commandFiles.forEach((file) => {
                const command = require(`../../commands/${folder}/${file}`);
                commandList += `**/${command.data.name}** - ${command.data.description}\n`; // Bold command names
            });

            const formattedCategoryName = `**__${folder.charAt(0).toUpperCase() + folder.slice(1)} Commands ${emoji}__**`;

            embed.addFields({
                name: formattedCategoryName,
                value: commandList || 'No commands available in this category.',
                inline: false
            });

            foundCommands = true;
        }

        if (!foundCommands) {
            embed.setDescription('No commands found! Please ensure you have command files in the proper folder structure.');
        }

        interaction.reply({ embeds: [embed] });
    },
};
