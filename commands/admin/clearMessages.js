const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearmessages')
        .setDescription('Clear a specified number of messages in the current channel')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const adminRoleID = config.AdminRoleID;

        console.log('Admin Role ID:', adminRoleID);
        console.log('User Roles:', interaction.member.roles.cache.map(role => role.id));
        console.log('Member Object:', interaction.member);

        const memberRoles = interaction.member.roles.cache;
        if (!memberRoles.has(adminRoleID)) {
            return interaction.reply({
                content: "You don't have permission to use this command.",
                ephemeral: true,
            });
        }

        if (amount <= 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF6347')
                .setTitle('❌ Invalid Amount')
                .setDescription('Please specify a **positive number** of messages to delete.')
                .setFooter({ text: 'Clear Messages Command', iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const channel = interaction.channel;
        let deletedCount = 0;

        try {
            const fetchedMessages = await channel.messages.fetch({ limit: amount });
            const deletableMessages = fetchedMessages.filter(msg => msg.deletable);
            deletedCount = deletableMessages.size;

            if (deletedCount > 0) {
                await channel.bulkDelete(deletableMessages, true);
            }
        } catch (error) {
            console.error('Error during message deletion:', error);
        }

        const resultEmbed = new EmbedBuilder()
            .setColor(deletedCount > 0 ? '#32CD32' : '#FFD700')
            .setTitle(deletedCount > 0 ? '✅ Messages Cleared' : '⚠️ No Messages Found')
            .setDescription(
                deletedCount > 0 
                ? `Successfully deleted **${deletedCount} messages** from this channel.`
                : 'No deletable messages were found within the specified range.'
            )
            .setFooter({ text: 'Clear Messages Command', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [resultEmbed], ephemeral: true });
    },
};
