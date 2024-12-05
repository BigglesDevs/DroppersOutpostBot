const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a member')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to untimeout')
                .setRequired(true)
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
        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setColor('#28A745')
                .setTitle('Timeout Removed')
                .setDescription(`${user} no longer has a timeout.`)
                .setTimestamp();

            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Untimeout Failed')
                .setDescription(`Failed to remove timeout from ${user}. Error: ${error.message}`)
                .setTimestamp();

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }
    },
};