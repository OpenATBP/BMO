const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prequeueaccess')
		.setDescription('Add or remove access to pre-queue!')
		.addUserOption(option => option.setName('name').setDescription('Who is the discord user?').setRequired(true))
		.addStringOption(opt => opt.setName('access').setDescription("Do you want them to have access?").addChoices(
			{name: 'Allow', value: 'true'},
			{name: 'Deny', value: 'false'},
		).setRequired(true)),
	async execute(interaction) {

		if (config.admin_ids.includes(interaction.user.id) || config.community_manager.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
			const players = database.collection('discord');

			var addReward = (username) => {
				const query = {"id":username};
				var update = {$set: {'preQueue':interaction.options.getString("access") === 'true'}};
				players.updateOne(query,update).then((res) => {
					if (res != null){
						interaction.reply({content:"Changed access to pre queue",ephemeral:true}).catch(console.error);
					}else interaction.reply({content:"Failed to change access",ephemeral:true}).catch(console.error);
				}).catch(console.error);
			};

			var user = interaction.options.getUser('name');

			players.findOne({"id":user.id}).then((data) => {
				if (data != null){
					addReward(user.id);
				}else{
					players.insertOne({'id': user.id, 'preQueue':interaction.options.getString("access") === 'true'}).then(() => {
						interaction.reply({content: "Changed access to pre queue!",ephemeral:true}).catch(console.error);
					}).catch(console.error);
				}
			}).catch(console.error);
		}
	},
};
