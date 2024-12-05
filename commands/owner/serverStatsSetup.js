const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatssetup')
    .setDescription('Sets up server stats with customizable options.')
    .addBooleanOption(option =>
      option.setName('bots')
        .setDescription('Include bot count in the stats.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('totalmembers')
        .setDescription('Include total member count in the stats.')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('members')
        .setDescription('Include member (non-bot) count in the stats.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Acknowledge the interaction right away

    const { guild, member } = interaction;
    const includeBots = interaction.options.getBoolean('bots');
    const includeTotalMembers = interaction.options.getBoolean('totalmembers');
    const includeMembers = interaction.options.getBoolean('members');

    if (!member.roles.cache.has(config.ownerRoleID)) {
      return interaction.editReply({ content: '❌ You do not have permission to use this command.' });
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.editReply({ content: '❌ I need the "Manage Channels" permission to create and organize channels.' });
    }

    try {
      // Check if category exists, and delete it if it does
      const existingCategory = guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory && channel.name === '📊 | SERVER STATS'
      );

      if (existingCategory) {
        const childChannels = guild.channels.cache.filter(channel => channel.parentId === existingCategory.id);
        for (const [, channel] of childChannels) {
          await channel.delete().catch(console.error);
        }
        await existingCategory.delete().catch(console.error);
      }

      // Create a new category
      const category = await guild.channels.create({
        name: '📊 | SERVER STATS',
        type: ChannelType.GuildCategory,
      });

      await category.setPosition(0).catch(console.error);

      // Helper function to create restricted channels
      const createRestrictedChannel = async (name, parent) => {
        return await guild.channels.create({
          name: name,
          type: ChannelType.GuildVoice,
          parent: parent.id,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.Connect],
            },
          ],
        });
      };

      // Fetch the updated member count (to ensure bots are counted correctly)
      await guild.members.fetch();

      const totalMembers = guild.memberCount;
      const botCount = guild.members.cache.filter(member => member.user.bot).size;
      const humanCount = totalMembers - botCount;

      const channels = {};
      if (includeTotalMembers) {
        channels.total = await createRestrictedChannel(`👥 Total Members: ${totalMembers}`, category);
      }
      if (includeBots) {
        channels.bots = await createRestrictedChannel(`🤖 Bots: ${botCount}`, category);
      }
      if (includeMembers) {
        channels.members = await createRestrictedChannel(`🧍 Members: ${humanCount}`, category);
      }

      // Let the user know the setup is complete
      await interaction.editReply({ content: '✅ Server stats have been set up successfully!' });

      // Function to safely update channel names
      const updateChannelName = async (channelId, newName) => {
        try {
          const channel = guild.channels.cache.get(channelId);
          if (!channel) {
            console.warn(`Channel with ID ${channelId} not found. Skipping update.`);
            return;
          }
          await channel.setName(newName);
        } catch (error) {
          console.error(`Error updating channel ${channelId}:`, error);
        }
      };

      // Update stats periodically
      const updateStats = async () => {
        try {
          const updatedTotalMembers = guild.memberCount;
          const updatedBotCount = guild.members.cache.filter(member => member.user.bot).size;
          const updatedHumanCount = updatedTotalMembers - updatedBotCount;

          if (channels.total) {
            await updateChannelName(channels.total.id, `👥 Total Members: ${updatedTotalMembers}`);
          }
          if (channels.bots) {
            await updateChannelName(channels.bots.id, `🤖 Bots: ${updatedBotCount}`);
          }
          if (channels.members) {
            await updateChannelName(channels.members.id, `🧍 Members: ${updatedHumanCount}`);
          }
        } catch (error) {
          console.error('Error updating stats:', error);
        }
      };

      // Set up event listeners for member add/remove
      guild.client.on('guildMemberAdd', async member => {
        if (member.guild.id === guild.id) await updateStats();
      });

      guild.client.on('guildMemberRemove', async member => {
        if (member.guild.id === guild.id) await updateStats();
      });

      // Update stats every minute
      setInterval(updateStats, 1 * 60 * 1000);

    } catch (error) {
      console.error('Error setting up server stats:', error);
      interaction.editReply({ content: '❌ An error occurred while setting up server stats. Please try again.' });
    }
  },
};