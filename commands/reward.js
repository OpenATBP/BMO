const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reward')
		.setDescription('Reward a player!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true))
		.addStringOption(opt => opt.setName('reward').setDescription("What do you want to reward?").addChoices(
			{name: 'Coins', value: 'coins'},
			{name: "Item", value: 'item'},
		).setRequired(true))
		.addStringOption(o => o.setName('value').setDescription("What is it that you are trying to add?").setRequired(true)),
	async execute(interaction) {

		if (config.admin_ids.includes(interaction.user.id) || config.community_manager.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
			const players = database.collection('users');

			var addReward = (username) => {
				const query = {"user.TEGid":username};
				var update = {};
				if (interaction.options.getString("reward") == 'coins'){
					var val = parseInt(interaction.options.getString("value"));
					update = {$inc: {"player.coins":val}};
				}else if(interaction.options.getString("reward") == 'item'){
					update = {$addToSet: {"inventory":interaction.options.getString("value")}};
				}
				players.updateOne(query,update).then((res) => {
					if (res != null){
						interaction.reply({content:"Added reward to account!",ephemeral:true}).catch(console.error);
					}else interaction.reply({content:"Failed to add reward!",ephemeral:true}).catch(console.error);
				}).catch(console.error);
			};

			players.findOne({"user.TEGid":interaction.options.getString("name")}).then((data) => {
				if (data != null){
					addReward(data.user.TEGid);
				}else{
					players.findOne({"user.dname":interaction.options.getString("name").toUpperCase()}).then((dat) => {
						if (dat != null){
							addReward(dat.user.TEGid);
						}else{
							interaction.reply({content:"Player not found!",ephemeral:true}).catch(console.error);
						}
					}).catch(console.error);
				}
			}).catch(console.error);
		}
	},
};
