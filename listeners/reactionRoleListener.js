const fs = require('fs');
const path = require('path');
const reactionRolesPath = path.join(__dirname, '../json/reactionRoles.json');

module.exports = (client) => {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) return;

        const { message, emoji } = reaction;

        // Ensure the JSON file exists
        if (!fs.existsSync(reactionRolesPath)) {
            console.error('Reaction roles file not found!');
            return;
        }

        // Load existing data
        let reactionRoles;
        try {
            reactionRoles = JSON.parse(fs.readFileSync(reactionRolesPath, 'utf8'));
        } catch (error) {
            console.error('Failed to read reactionRoles.json:', error);
            return;
        }

        // Check if the message ID is in the JSON
        const messageReactionRoles = reactionRoles[message.id];
        if (!messageReactionRoles || !Array.isArray(messageReactionRoles)) return;

        // Find the matching emoji-role mapping
        const roleEntry = messageReactionRoles.find(entry => {
            // Check for both standard and custom emojis
            return emoji.id 
                ? `<:${emoji.name}:${emoji.id}>` === entry.emoji // Custom emoji
                : emoji.name === entry.emoji; // Standard emoji
        });

        if (!roleEntry) return;

        const guild = message.guild;
        const member = guild.members.cache.get(user.id);

        if (!member) return;

        try {
            // Add the role to the user
            const role = guild.roles.cache.get(roleEntry.roleId);
            if (!role) {
                console.error(`Role not found: ${roleEntry.roleId}`);
                return;
            }

            await member.roles.add(role);
            console.log(`Assigned role ${role.name} to ${user.tag}`);
        } catch (error) {
            console.error('Error assigning role:', error);
        }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
        if (user.bot) return;

        const { message, emoji } = reaction;

        // Ensure the JSON file exists
        if (!fs.existsSync(reactionRolesPath)) {
            console.error('Reaction roles file not found!');
            return;
        }

        // Load existing data
        let reactionRoles;
        try {
            reactionRoles = JSON.parse(fs.readFileSync(reactionRolesPath, 'utf8'));
        } catch (error) {
            console.error('Failed to read reactionRoles.json:', error);
            return;
        }

        // Check if the message ID is in the JSON
        const messageReactionRoles = reactionRoles[message.id];
        if (!messageReactionRoles || !Array.isArray(messageReactionRoles)) return;

        // Find the matching emoji-role mapping
        const roleEntry = messageReactionRoles.find(entry => {
            // Check for both standard and custom emojis
            return emoji.id 
                ? `<:${emoji.name}:${emoji.id}>` === entry.emoji // Custom emoji
                : emoji.name === entry.emoji; // Standard emoji
        });

        if (!roleEntry) return;

        const guild = message.guild;
        const member = guild.members.cache.get(user.id);

        if (!member) return;

        try {
            // Remove the role from the user
            const role = guild.roles.cache.get(roleEntry.roleId);
            if (!role) {
                console.error(`Role not found: ${roleEntry.roleId}`);
                return;
            }

            await member.roles.remove(role);
            console.log(`Removed role ${role.name} from ${user.tag}`);
        } catch (error) {
            console.error('Error removing role:', error);
        }
    });
};