const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addaccess')
		.setDescription('Add access to the early beta branch!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true))
		.addStringOption(opt => opt.setName('access').setDescription("Do you want them to have access?").addChoices(
			{name: 'Allow', value: 'true'},
			{name: 'Deny', value: 'false'},
		).setRequired(true)),
	async execute(interaction) {

		if (config.admin_ids.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
			const players = database.collection('users');

			var addReward = (username) => {
				const query = {"user.TEGid":username};
				var update = {$set: {'earlyAccess':interaction.options.getString("access") === 'true'}};
				players.updateOne(query,update).then((res) => {
					if (res != null){
						interaction.reply({content:"Changed access to early beta",ephemeral:true}).catch(console.error);
					}else interaction.reply({content:"Failed to change access",ephemeral:true}).catch(console.error);
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
