const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('friend')
		.setDescription('Adds a friend!')
    .addUserOption(option => option.setName('player').setDescription('Provide the player you wish to add as a friend').setRequired(true)),
	async execute(interaction) {
      const target = interaction.options.getUser('player');
      const database = mongoClient.db('openatbp');
      const players = database.collection('players');
      const query = { "user.authid": target.id};
			players.findOne({"user.authid": interaction.user.id}).then(u => {
				if(u != undefined){
					players.findOne(query).then(p => {
						if(p != undefined){
							if(u.friends.includes(p.user.TEGid)) interaction.reply({content: 'You already have them added!',ephemeral: true}).catch(console.error);
							else{
								players.updateOne({"user.authid": interaction.user.id},{$addToSet: {friends: p.user.TEGid}}).then(() => {
									interaction.reply({content: `You have successfully added ${target.username} as a friend!`, ephemeral: true}).catch(console.error);
									target.createDM().then((dmChannel) => {
										dmChannel.send(`${interaction.user.username} has added you as a friend! You can use /friend to add them back!`).catch(console.error);
									}).catch(console.error);
								}).catch(console.error);
							}
						}else interaction.reply({content: 'User does not have an account!',ephemeral: true}).catch(console.error);
					}).catch(console.error);
				}else interaction.reply({content: 'You do not have an account!',ephemeral: true}).catch(console.error);
			}).catch(console.error);

		}
	};
