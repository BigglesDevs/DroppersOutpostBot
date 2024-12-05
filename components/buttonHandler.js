const { EmbedBuilder } = require('discord.js');

const handleButtonInteraction = async (interaction, client, config) => {
    if (interaction.customId === 'apply_button') {
        const channel = await client.channels.fetch(config.ChannelID);

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Application Submitted!')
            .setDescription('Your application has been received.');

        await interaction.reply({
            content: 'Your application has been submitted!',
            ephemeral: true
        });

        await channel.send({ embeds: [embed] });
    } else if (interaction.customId === 'cancel_button') {
        await interaction.reply({
            content: 'Your application has been canceled.',
            ephemeral: true
        });
    }
};

module.exports = { handleButtonInteraction };
