const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

// Path to the JSON file
const reactionRolesPath = path.join(__dirname, '../../json/reactionRoles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Assigns a reaction role')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID of the message to add the reaction to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji to react with')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign')
                .setRequired(true)),

    async execute(interaction, client, config) {
        // Ensure only users with the owner role can use the command
        if (!interaction.member.roles.cache.has(config.ownerRoleID)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const messageId = interaction.options.getString('messageid');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');
        const channel = interaction.channel;

        try {
            // Fetch the message to add the reaction
            const message = await channel.messages.fetch(messageId);
            await message.react(emoji);

            // Ensure the JSON file exists
            if (!fs.existsSync(reactionRolesPath)) {
                fs.writeFileSync(reactionRolesPath, '{}'); // Create empty JSON if it doesn't exist
            }

            // Load existing data
            let reactionRoles = JSON.parse(fs.readFileSync(reactionRolesPath, 'utf8'));

            // Ensure messageId entry exists as an array
            if (!Array.isArray(reactionRoles[messageId])) {
                reactionRoles[messageId] = [];
            }

            // Add the emoji-role mapping
            reactionRoles[messageId].push({ emoji, roleId: role.id });

            // Save back to file
            fs.writeFileSync(reactionRolesPath, JSON.stringify(reactionRoles, null, 2));

            await interaction.reply({ content: `✅ Reaction role set! React with ${emoji} to assign the ${role.name} role.`, ephemeral: true });
        } catch (error) {
            console.error('Error setting reaction role:', error);
            await interaction.reply({ content: '❌ Failed to set the reaction role. Check the message ID and bot permissions.', ephemeral: true });
        }
    },
};