const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = (client) => {
    client.on('guildMemberAdd', async (member) => {
        try {
            const channel = member.guild.channels.cache.get(config.welcomeChannelID);
            if (!channel) return;

            const color = 0x0099ff;

            const serverName = member.guild.name;
            const userAvatar = member.user.avatarURL();

            const embed = new EmbedBuilder()
                .setTitle(`Welcome to ${serverName}, ${member.user.username}! 🎉`)
                .setDescription(
                    `Hey ${member.user.username}! We're excited to have you join us here at **${serverName}**! 🚀\n\n` +
                    `Take a moment to introduce yourself and explore the channels. We have a lot of fun activities and discussions waiting for you. 🧩\n\n` +
                    `Before you dive in, make sure to read the rules to get started. 🔐\n\n` +
                    `If you need any help, feel free to reach out to any of our mods or admins! We're here to help. 🛠️`
                )
                .setColor(color)
                .setThumbnail(userAvatar)
                .setFooter({ text: `Enjoy your time at ${serverName}!` })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    });
};
