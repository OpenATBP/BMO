const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dodgecount')
		.setDescription('Check for how many times someone has dodged')
    .addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true)),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id) || config.community_manager.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
      const players = database.collection('users');
			if(interaction.options.getString("name") != undefined){ //Search for player alts
				var name = interaction.options.getString("name").toUpperCase();
				players.findOne({"user.dname":name}).then((data) => {
					if(data != undefined){
						var lastQueue = new Date(data.queue.lastDodge);
						interaction.reply({content: `${data.user.dname} has been queue banned ${data.queue.timesOffended} time(s)
							\n Last dodged on ${data.queue.lastDodge == -1 ? "N/A" : lastQueue.toString()}
							\n Has currently dodged ${data.queue.dodgeCount} time(s)`,ephemeral:true}).catch(console.error);
					}else interaction.reply({content:"No user exists with that name.",ephemeral:true}).catch(console.error);
				})
			}
		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
