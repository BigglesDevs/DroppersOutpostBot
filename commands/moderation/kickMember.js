const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the kick')
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
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('User Kicked')
                .setDescription(`${user} has been kicked from the server.`)
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
                .setColor('#FF0000')
                .setTitle('Kick Failed')
                .setDescription(`Failed to kick ${user}. Error: ${error.message}`)
                .setTimestamp();

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }
    },
};