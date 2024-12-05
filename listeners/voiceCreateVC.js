const { ChannelType, PermissionsBitField } = require('discord.js');
const config = require('../config.js');

module.exports = (client) => {
  const activeVoiceChannels = new Map();

  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.user.bot) return;
  
    if (newState.channelId === config.joinToCreateChannelId) {
      const member = newState.member;

      try {
        const newVC = await newState.guild.channels.create({
          name: `🔊・${member.user.username}'s VC`,
          type: ChannelType.GuildVoice,
          parent: config.categoryId,
          permissionOverwrites: [
            {
              id: newState.guild.id,
              allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel],
            },
          ],
        });
        await member.voice.setChannel(newVC);
        activeVoiceChannels.set(newVC.id, member.id);
        console.log(`Created and moved ${member.user.username} to ${newVC.name}`);
      } catch (error) {
        console.error('Error creating/moving to new VC:', error);
      }
    }

    if (oldState.channel && activeVoiceChannels.has(oldState.channel.id)) {
      const oldVC = oldState.channel;

      if (oldVC.members.size === 0) {
        try {
          await oldVC.delete();
          activeVoiceChannels.delete(oldVC.id);
          console.log(`Deleted empty channel: ${oldVC.name}`);
        } catch (error) {
          console.error('Error deleting empty VC:', error);
        }
      }
    }
  });
};
