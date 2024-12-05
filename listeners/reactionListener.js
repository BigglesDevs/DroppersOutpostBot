const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = (client) => {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) return;

        const { message, emoji } = reaction;
        const channel = message.channel;

        // Ensure this is the correct channel and there is at least one embed
        if (channel.id !== config.ChannelID || !message.embeds.length) return;

        const embed = message.embeds[0];
        const applicantTag = embed.fields.find(field => field.name === 'User Tag')?.value;
        const applicantId = embed.fields.find(field => field.name === 'User ID')?.value;
        const applicationType = embed.title.includes('Dropper') ? 'dropper' : 'staff'; // Determine application type
        
        if (!applicantId) return; // Applicant ID must be present

        const guild = channel.guild;
        const member = guild.members.cache.get(applicantId);
        if (!member) {
            await channel.send(`❌ Could not find the applicant <@${applicantId}> in this server.`);
            return;
        }

        try {
            const dmChannel = await member.createDM();

            if (emoji.name === '✅') {
                let roleID;

                // Determine which role to assign based on the application type
                if (applicationType === 'dropper') {
                    const platform = embed.fields.find(field => field.name === 'Platform')?.value;
                    if (!platform) {
                        await channel.send(`❌ No platform specified for ${applicationType} application.`);
                        return;
                    }
                    roleID = config.dropperRoles[platform.toLowerCase()];
                } else if (applicationType === 'staff') {
                    roleID = config.staffRoleID; // Replace with the actual role ID for staff
                }

                if (!roleID) {
                    await channel.send(`❌ No role configured for ${applicationType} application.`);
                    return;
                }

                await member.roles.add(roleID);

                await dmChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎉 Application Accepted!')
                            .setDescription(`Congratulations! You have been accepted as a **${applicationType}**.`)
                            .setColor('Green')
                            .setFooter({ text: 'Welcome to the team!' })
                    ]
                });

                const acceptanceMessage = `${applicantTag}'s application has been **accepted** by <@${user.id}>.`;

                const updatedEmbed = new EmbedBuilder(embed.toJSON())
                    .setColor('Green');

                await message.edit({ content: acceptanceMessage, embeds: [updatedEmbed] });

                await message.reactions.removeAll();
            }

            if (emoji.name === '❎') {
                await dmChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('❌ Application Denied')
                            .setDescription(`Unfortunately, your application for **${applicationType}** was not accepted at this time.`)
                            .setColor('Red')
                            .setFooter({ text: 'Feel free to reapply in the future.' })
                    ]
                });

                const denialMessage = `${applicantTag}'s application has been **rejected** by <@${user.id}>.`;

                const updatedEmbed = new EmbedBuilder(embed.toJSON())
                    .setColor('Red');

                await message.edit({ content: denialMessage, embeds: [updatedEmbed] });

                await message.reactions.removeAll();
            }
        } catch (error) {
            console.error('Error processing reaction:', error);
            await channel.send(`❌ Failed to notify the applicant <@${applicantId}> via DM.`);
        }
    });
};