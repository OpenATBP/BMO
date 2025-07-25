const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a player from queue ban')
    .addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true)),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id) || config.community_manager.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
      const players = database.collection('users');
			if(interaction.options.getString("name") != undefined){ //Search for player alts
				var name = interaction.options.getString("name").toUpperCase();
				players.findOne({"user.dname":name}).then((data) => {
					if(data != undefined){
						var update = {$inc: {'queue.timesOffended':data.queue.timesOffended > 0 ? -1 : 0}, $set: {'queue.queueBan':-1,'queue.dodgeCount':1}};
						players.updateOne({'user.dname':name},update).then(() => {
							interaction.reply({content: "Player has been unbanned from queue ban",ephemeral:true}).catch(console.error);
						}).catch(console.error);
					}else interaction.reply({content:"No user exists with that name.",ephemeral:true}).catch(console.error);
				});
			}
		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
