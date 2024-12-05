const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const packageJson = require('../../package.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows information about the bot'),

    async execute(interaction) {
        const botOwner = await interaction.client.users.fetch('676354368404193280');

        const ownerAvatarURL = botOwner.avatarURL();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Information')
            .setDescription('Here is some useful information about the bot, including its capabilities and stats:')
            .setThumbnail(ownerAvatarURL)
            .setTimestamp()
            .setFooter({ text: 'Developed by BigglesDevelopment❤️' });

        embed.addFields([
            {
                name: 'Bot Name',
                value: `\`${interaction.client.user.tag}\``,
                inline: true,
            },
            {
                name: 'Bot ID',
                value: `\`${interaction.client.user.id}\``,
                inline: true,
            },
            {
                name: 'Description',
                value: 'This is a custom bot designed to help manage your server with multiple functionalities, including moderation, music, and fun commands. 🚀 It is constantly evolving with more features to come!',
                inline: false,
            },
            {
                name: 'Bot Owner',
                value: `<@676354368404193280>`,
                inline: true,
            },
            {
                name: 'Servers Count',
                value: `\`${interaction.client.guilds.cache.size}\` servers`,
                inline: true,
            },
            {
                name: 'Total Users',
                value: `\`${interaction.client.users.cache.size}\` users`,
                inline: true,
            },
            {
                name: 'Uptime',
                value: `\`${formatUptime(process.uptime())}\``,
                inline: true,
            },
            {
                name: 'Node.js Version',
                value: `\`${process.version}\``,
                inline: true,
            },
            {
                name: 'Discord.js Version',
                value: `\`${packageJson.dependencies['discord.js']}\``,
                inline: true,
            },
            {
                name: 'Source Code',
                value: '[GitHub Repository](https://github.com/DyingLightDropperBot)',
                inline: true,
            },
            {
                name: 'Invite Bot',
                value: '[Invite the Bot](https://discord.com/oauth2/authorize?client_id=1242502554248548423)',
                inline: true,
            },
        ]);

        embed.addFields([
            {
                name: 'Support Server',
                value: '[Join our Support Server!](https://discord.gg/AMebd5fPWj)',
                inline: true,
            },
            {
                name: 'Website',
                value: '[Visit our Website!](https://bigglesdevelopment)',
                inline: true,
            },
            {
                name: 'Patreon',
                value: '[Support me on Patreon!](https://patreon.com/BigglesDevelopment)',
                inline: true,
            },
        ]);

        interaction.reply({ embeds: [embed] });
    },
};

function formatUptime(uptimeInSeconds) {
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
}
