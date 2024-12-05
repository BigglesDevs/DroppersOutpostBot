const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

const reactionRolesPath = path.join(__dirname, '../../json/reactionRoles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroledel')
        .setDescription('Deletes a reaction role')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID of the message to delete the reaction role from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji of the reaction role to delete')
                .setRequired(true)),

    async execute(interaction, client, config) {
        if (!interaction.member.roles.cache.has(config.ownerRoleID)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const messageId = interaction.options.getString('messageid');
        const emoji = interaction.options.getString('emoji');

        try {
            if (!fs.existsSync(reactionRolesPath)) {
                return interaction.reply({ content: "❌ No reaction roles file found.", ephemeral: true });
            }

            let reactionRoles = JSON.parse(fs.readFileSync(reactionRolesPath, 'utf8'));

            if (!reactionRoles[messageId]) {
                return interaction.reply({ content: `❌ No reaction roles found for message ID: ${messageId}`, ephemeral: true });
            }

            const initialLength = reactionRoles[messageId].length;
            reactionRoles[messageId] = reactionRoles[messageId].filter(entry => entry.emoji !== emoji);

            if (reactionRoles[messageId].length === initialLength) {
                return interaction.reply({ content: `❌ No reaction role found for the emoji: ${emoji} on message ID: ${messageId}`, ephemeral: true });
            }

            if (reactionRoles[messageId].length === 0) {
                delete reactionRoles[messageId];
            }

            fs.writeFileSync(reactionRolesPath, JSON.stringify(reactionRoles, null, 2));

            await interaction.reply({ content: `✅ Reaction role for emoji ${emoji} on message ID ${messageId} has been deleted.`, ephemeral: true });
        } catch (error) {
            console.error('Error deleting reaction role:', error);
            await interaction.reply({ content: '❌ Failed to delete the reaction role. Please check the message ID and emoji.', ephemeral: true });
        }
    },
};
