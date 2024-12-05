const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('unLocks the current channel, allowing all members to send messages.'),

  async execute(interaction, client, config) {
    const channel = interaction.channel;

    if (
      !interaction.member.roles.cache.has(config.ownerRoleID) &&
      !interaction.member.roles.cache.has(config.adminRoleID)
    ) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `🔒 Channel locked. No one can send messages.`,
    });

    try {
      const roles = channel.guild.roles.cache;
      for (const [roleID, role] of roles) {
        await channel.permissionOverwrites.edit(role, {
          SendMessages: false,
        });
      }
    } catch (error) {
      console.error('Error locking the channel:', error);
    }
  },
};
