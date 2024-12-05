const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startdrop')
        .setDescription('Announce a game drop!')
        .addStringOption(option =>
            option
                .setName('platform')
                .setDescription('The platform (xbox, playstation, pc)')
                .setRequired(true)
                .addChoices(
                    { name: 'Xbox', value: 'xbox' },
                    { name: 'PlayStation', value: 'playstation' },
                    { name: 'PC', value: 'pc' }
                )
        )
        .addStringOption(option =>
            option
                .setName('game')
                .setDescription('The game for the drop (e.g., DL1, DL2, Dying Light 2)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('How long the drop will last (e.g., 1h, 30m)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const platform = interaction.options.getString('platform');
        const gameInput = interaction.options.getString('game');
        const durationInput = interaction.options.getString('duration');
        const user = interaction.user;
        const member = interaction.member;

        // Expand game abbreviations
        const gameMap = {
            dl1: 'Dying Light',
            dl2: 'Dying Light 2',
        };
        const game = gameMap[gameInput.toLowerCase()] || gameInput;

        // Parse duration
        const durationRegex = /^(\d+)([hm])$/;
        const match = durationInput.match(durationRegex);
        if (!match) {
            return interaction.reply({
                content: 'Invalid duration format. Use numbers followed by "h" (hours) or "m" (minutes), e.g., 1h or 30m.',
                ephemeral: true,
            });
        }

        const amount = parseInt(match[1]);
        const unit = match[2];
        const durationMs = unit === 'h' ? amount * 60 * 60 * 1000 : amount * 60 * 1000;

        // Dynamically find the role
        const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === platform.toLowerCase());
        if (!role) {
            return interaction.reply({
                content: `The role for ${platform} does not exist! Please make sure it is created in the server.`,
                ephemeral: true,
            });
        }

        // Check permissions
        if (!member.roles.cache.has(role.id) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You do not have the required role to use this command.',
                ephemeral: true,
            });
        }

        // Find drop-planning channel
        const dropChannel = interaction.guild.channels.cache.get(config.dropPlanningChannel);
        if (!dropChannel) {
            return interaction.reply({
                content: 'The drop planning channel is not configured correctly.',
                ephemeral: true,
            });
        }

        // Create the initial embed
        const embed = new EmbedBuilder()
            .setColor('#2ecc71') // A green color for the embed
            .setTitle(`🎮 ${game} Drops Open!`) // Expanded game name in the title
            .setDescription(
                `**Host:** ${user}\n` +
                `**Platform:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n` +
                `**Closes:** <t:${Math.floor(Date.now() / 1000 + durationMs / 1000)}:R>` // Relative timestamp
            )
            .setFooter({ text: 'Developed by BigglesDevelopment❤️' })
            .setTimestamp();

        // Send the message
        const message = await dropChannel.send({
            content: `<@&${role.id}>`, // Ping the dynamically found role
            embeds: [embed],
        });

        // Schedule the update
        setTimeout(async () => {
            const updatedEmbed = EmbedBuilder.from(embed)
                .setDescription(
                    `**Host:** ${user}\n` +
                    `**Platform:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n` +
                    `**Closes:** \`Closed\``
                )
                .setColor('#e74c3c');

            // Edit the message
            await message.edit({ embeds: [updatedEmbed] });
        }, durationMs);

        // Acknowledge the command
        return interaction.reply({
            content: `Your drop has been announced in <#${config.dropPlanningChannel}>.`,
            ephemeral: true,
        });
    },
};
