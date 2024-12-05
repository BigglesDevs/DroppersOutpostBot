const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply for a role.'),

    async execute(interaction, client) {
        const user = interaction.user;

        const embed = new EmbedBuilder()
            .setTitle('📩 Application Started!')
            .setDescription('Please check your DMs to begin your application process.')
            .setColor('Green');
        await interaction.reply({ embeds: [embed], ephemeral: true });

        const dmEmbed = new EmbedBuilder()
            .setTitle('📝 Dropper Application')
            .setDescription(
                'Choose your platform by typing the corresponding number:\n\n' +
                '1️⃣ **Xbox**\n' +
                '2️⃣ **PlayStation**\n' +
                '3️⃣ **PC**\n\n' +
                'Type the number below to start the process. You can cancel anytime by typing "cancel".'
            )
            .setColor('Blue');
        
        try {
            const dmChannel = await user.createDM();
            await dmChannel.send({ embeds: [dmEmbed] });

            const filter = (msg) => msg.author.id === user.id;
            const collector = dmChannel.createMessageCollector({ filter, time: 300000 }); // 5-minute limit

            let retries = 0;
            let chosenPlatform = null;
            let isCanceled = false;

            const applicationQuestions = [
                { question: 'Have you ever dropped before? 🤔', example: 'e.g., Yes, I have dropped items in Dying Light 2 before.' },
                { question: 'Have you read our rules and regulations? 📚', example: 'e.g., Yes, I have read and understand the rules of the community.' },
                { question: 'Why do you want to become a dropper? 💡', example: 'e.g., I want to help the community and provide valuable resources.' },
                { question: 'What game will you be mainly dropping for? 🎮', example: 'e.g., Dying Light 2, GTA V, or Minecraft.' },
                { question: 'Do you need anything to start dropping? 🔧', example: 'e.g., No, I have everything set up to begin dropping.' },
                { question: 'Are you ready to submit your application?', example: 'Type `yes` to submit or `no` to cancel. ✅' },
            ];

            const answers = {};
            let currentQuestionIndex = 0;

            const askQuestion = async () => {
                if (isCanceled) return;

                if (!chosenPlatform) {
                    return;
                }

                if (currentQuestionIndex >= applicationQuestions.length) {
                    finalizeApplication();
                    return;
                }

                const currentQuestion = applicationQuestions[currentQuestionIndex];
                const questionEmbed = new EmbedBuilder()
                    .setTitle(currentQuestion.question)
                    .setDescription(`Example: ${currentQuestion.example}`)
                    .setColor('Orange')
                    .setFooter({ text: 'Thank you for applying, best of luck!🎉' })
                    .setTimestamp();
                await dmChannel.send({ embeds: [questionEmbed] });
            };

            const finalizeApplication = async () => {
                if (isCanceled) return;

                const confirmationEmbed = new EmbedBuilder()
                    .setTitle('✅ Application Submitted')
                    .setDescription('Your application has been submitted successfully. A reviewer will respond shortly.')
                    .setColor('Green');

                await dmChannel.send({ embeds: [confirmationEmbed] });

                const applicationEmbed = new EmbedBuilder()
                    .setTitle('Dropper Application')
                    .setColor('Purple')
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({ text: 'Developed by BigglesDevelopment❤️' })
                    .addFields(
                        { name: 'User Tag', value: `${user.tag}`, inline: true },
                        { name: 'User ID', value: `${user.id}`, inline: true },
                        { name: 'Platform', value: `${chosenPlatform}`, inline: true },
                        ...Object.entries(answers).map(([question, answer]) => ({
                            name: `${question}`,
                            value: `${answer}`,
                            inline: false,
                        }))
                    );

                const channel = client.channels.cache.get(config.ChannelID);
                if (channel) {
                    const applicationMessage = await channel.send({ embeds: [applicationEmbed] });
                    await applicationMessage.react('✅');
                    await applicationMessage.react('❎');
                }
            };

            collector.on('collect', async (message) => {
                if (message.content.toLowerCase() === 'cancel') {
                    isCanceled = true;
                    const cancelEmbed = new EmbedBuilder()
                        .setTitle('❌ Application Canceled')
                        .setDescription('You have canceled your application. You can start over anytime.')
                        .setColor('Red');
                    await dmChannel.send({ embeds: [cancelEmbed] });
                    collector.stop();
                    return;
                }

                if (!chosenPlatform) {
                    if (['1', '2', '3'].includes(message.content.trim())) {
                        chosenPlatform = ['Xbox', 'PlayStation', 'PC'][message.content.trim() - 1];
                        await dmChannel.send(`✅ You selected **${chosenPlatform}**.`);
                        currentQuestionIndex = 0;
                        askQuestion();
                    } else {
                        retries++;
                        if (retries >= 3) {
                            const retryEmbed = new EmbedBuilder()
                                .setTitle('❌ Invalid Response')
                                .setDescription('Too many invalid attempts. The application process has been canceled.')
                                .setColor('Red');
                            await dmChannel.send({ embeds: [retryEmbed] });
                            collector.stop();
                        } else {
                            const retryEmbed = new EmbedBuilder()
                                .setTitle('❌ Invalid Response')
                                .setDescription('Please choose `1`, `2`, or `3` for the platform.')
                                .setColor('Red');
                            await dmChannel.send({ embeds: [retryEmbed] });
                        }
                    }
                    return;
                }

                const answer = message.content.trim();
                answers[applicationQuestions[currentQuestionIndex].question] = answer;

                if (currentQuestionIndex === applicationQuestions.length - 1) {
                    if (answer.toLowerCase() === 'yes') {
                        finalizeApplication();
                        collector.stop();
                    } else if (answer.toLowerCase() === 'no') {
                        isCanceled = true;
                        const cancelEmbed = new EmbedBuilder()
                            .setTitle('❌ Application Canceled')
                            .setDescription('You have canceled your application. You can start over anytime.')
                            .setColor('Red');
                        await dmChannel.send({ embeds: [cancelEmbed] });
                        collector.stop();
                    } else {
                        const invalidEmbed = new EmbedBuilder()
                            .setTitle('❌ Invalid Response')
                            .setDescription('Please type `yes` to submit or `no` to cancel.')
                            .setColor('Red');
                        await dmChannel.send({ embeds: [invalidEmbed] });
                    }
                } else {
                    currentQuestionIndex++;
                    askQuestion();
                }
            });
        } catch (err) {
            console.error('Error in application flow:', err);
        }
    },
};