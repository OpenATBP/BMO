const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rankinfo')
		.setDescription('Displays ELO thresholds for each rank'),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel){
				await interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
			const image = new AttachmentBuilder('img/rank-brackets.png');
            await interaction.reply({content: '**HERE ARE THE ELO RANGES FOR EACH RANK**:',
                files: [image],
				ephemeral: true
            });
			
		} catch (error) {
            console.error('Error executing the rankbrackets command:', error);
        }  finally{
			console.log("Done!");
		}
	},
};
