const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member for a specified duration')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration of the timeout (e.g., 10m, 1h, 1d)')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        ),
    async execute(interaction) {
        const { StaffRoleID } = require('../../config');

        if (!interaction.member.roles.cache.has(StaffRoleID)) {
            return interaction.reply({
                content: "You don't have permission to use this command.",
                ephemeral: true,
            });
        }

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const msDuration = ms(duration);

        if (!msDuration) {
            return interaction.reply({
                content: 'Invalid duration. Use formats like 10m, 1h, 1d.',
                ephemeral: true,
            });
        }

        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.timeout(msDuration, reason);

            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('User Timed Out')
                .setDescription(`${user} has been timed out for **${duration}**. Reason: ${reason}`)
                .setTimestamp();

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Timeout Failed')
                .setDescription(`Failed to timeout ${user}. Error: ${error.message}`)
                .setTimestamp();

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }
    },
};
