const config = require('../config');
const handleButtonInteraction = async (interaction, client) => {
    if (interaction.customId === 'join_giveaway') {
        
        await interaction.reply({
            content: `You have joined the giveaway, ${interaction.user.username}! 🎉`,
            ephemeral: true,
        });
    }
};

module.exports = { handleButtonInteraction };
