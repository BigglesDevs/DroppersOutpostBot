const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        ),
    async execute(interaction) {
        const { AdminRoleID } = require('../../config');

        if (!interaction.member.roles.cache.has(AdminRoleID)) {
            return interaction.reply({
                content: "You don't have permission to use this command.",
                ephemeral: true,
            });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(user.id, { reason });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('User Banned')
                .setDescription(`${user} has been banned from the server.`)
                .addFields(
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('Ban Failed')
                .setDescription(`Failed to ban ${user}. Error: ${error.message}`)
                .setTimestamp();

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }
    },
};