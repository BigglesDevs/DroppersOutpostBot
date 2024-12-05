const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveawaystart')
    .setDescription('Start a giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize of the giveaway')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('winners')
        .setDescription('The amount of winners')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('host')
        .setDescription('The host of the giveaway')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (1m, 1h, 1d, 1w)')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to host the giveaway')
        .setRequired(true)),

  async execute(interaction, client, config) {
    if (!interaction.member.roles.cache.has(config.ownerRoleID)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }

    const prize = interaction.options.getString('prize');
    const host = interaction.options.getUser('host');
    const duration = interaction.options.getString('duration');
    const channel = interaction.options.getChannel('channel');
    const winners = interaction.options.getString('winners');

    const parsedDuration = parseDuration(duration);
    if (!parsedDuration) {
      return interaction.reply({ content: 'Invalid duration format. Use 1m, 1h, 1d, or 1w.', ephemeral: true });
    }

    const endTime = Math.floor((Date.now() + parsedDuration) / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('Giveaway Time! 🎉')
      .setThumbnail('https://www.google.com/url?sa=i&url=https%3A%2F%2Fcreate.vista.com%2Fvectors%2FParty-Popper%2F&psig=AOvVaw1loQHdRJKyZf4LolC8lzdV&ust=1733426516639000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCqhZLrjooDFQAAAAAdAAAAABAJ')
      .setDescription(`**Host**: ${host}\n**Prize**: ${prize}\n**Winners**: ${winners}\n**Ends**: ${time(endTime, 'R')}\n**Participants**: 0`)
      .setTimestamp();

    const giveawayMessage = await channel.send({ embeds: [embed] });
    await giveawayMessage.react('🎉');

    const tempFolderPath = path.join(__dirname, '../../json');
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    const participantsPath = path.join(tempFolderPath, `${giveawayMessage.id}.json`);
    const participants = {
      host: host.id,
      prize: prize,
      endTime: endTime,
      winners: winners,
      entries: [],
    };

    fs.writeFileSync(participantsPath, JSON.stringify(participants, null, 2));

    const filter = (reaction, user) => reaction.emoji.name === '🎉' && !user.bot;
    const collector = giveawayMessage.createReactionCollector({ filter, time: parsedDuration });

    collector.on('collect', async (reaction, user) => {
      if (!participants.entries.includes(user.id)) {
        participants.entries.push(user.id);
        fs.writeFileSync(participantsPath, JSON.stringify(participants, null, 2));

        await interaction.followUp({
          content: `🎉 You have successfully entered the giveaway for **${prize}**! 🎉`,
          ephemeral: true,
        });

        const updatedEmbed = EmbedBuilder.from(embed)
          .setDescription(`**Host**: ${host}\n**Prize**: ${prize}\n**Ends**: ${time(endTime, 'R')}\n**Winners**: ${winners}\n**Participants**: ${participants.entries.length}`);
        await giveawayMessage.edit({ embeds: [updatedEmbed] });
      }
    });

    collector.on('end', async () => {
      if (participants.entries.length === 0) {
        await channel.send(`The giveaway for **${prize}** ended, but no participants entered.`);
      } else {
        const winnerIds = [];
        for (let i = 0; i < Math.min(winners, participants.entries.length); i++) {
          const winnerId = participants.entries[Math.floor(Math.random() * participants.entries.length)];
          winnerIds.push(winnerId);
        }

        const winnerMentions = await Promise.all(
          winnerIds.map(async (winnerId) => {
            const winner = await interaction.client.users.fetch(winnerId);
            return winner ? winner.toString() : '';
          })
        );

        await channel.send(`🎉 Congratulations ${winnerMentions.join(', ')} on winning **${prize}**! 🎉`);
      }

      const endedEmbed = EmbedBuilder.from(embed)
        .setDescription(`**Host**: ${host}\n**Prize**: ${prize}\n**Ends**: \`Ended\`\n**Winners**: ${winners}\n**Participants**: ${participants.entries.length}`)
        .setColor(0xFF5733)
        .setTitle('Giveaway Time! 🎉 (ENDED)')
        .setTimestamp();

      try {
        await giveawayMessage.edit({ embeds: [endedEmbed] });
      } catch (error) {
        console.error('Error while editing giveaway message:', error);
      }

      if (fs.existsSync(participantsPath)) {
        fs.unlinkSync(participantsPath);
      }
    });

    await interaction.reply({ content: `The giveaway has started in ${channel}! Good luck! 🎉`, ephemeral: true });
  },
};

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([mhdw])$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const unitMap = {
    m: 60000,
    h: 3600000,
    d: 86400000,
    w: 604800000,
  };

  return unitMap[unit] ? value * unitMap[unit] : null;
}
