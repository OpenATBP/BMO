const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuemessage')
		.setDescription('Creates the queue message in a designated chat.'),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id)){
			const embed = new EmbedBuilder().setColor(0x0099FF)
			.setTitle("OpenATBP Pre-Queue")
			.setDescription("Ready to play but no one is online? Join the pre-queue and we will notify you when enough people are interested to play! You will be removed if your status goes to offline!")
			.addFields(
				{name: 'In-Queue', value: 'No one'}
			);
			const join = new ButtonBuilder().setCustomId('queue').setLabel("Toggle Queue").setStyle(ButtonStyle.Secondary);
			const row = new ActionRowBuilder().addComponents(join);
			interaction.client.guilds.fetch(config.guild_id).then((guild) => {
				guild.channels.fetch(config.queue_channel).then((channel) => {
					channel.send({components:[row], embeds: [embed], ephemeral:false}).then(() => {
						interaction.reply({content: 'Message created.', ephemeral: true}).catch(console.error);
					}).catch(console.error);
				}).catch(console.error);
			}).catch(console.error);

		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
