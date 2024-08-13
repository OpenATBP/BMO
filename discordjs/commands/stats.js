const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Get the stats of a player!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true)),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel){
				interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
			const database = mongoClient.db('openatbp');
			const players = database.collection('users');
			var name = interaction.options.getString('name');
			if(name != undefined){
				name = name.toUpperCase();
				for(var n of config.dev_names){
					if(name == n){
						name = "[DEV] " + name;
						break;
					}
				}
				for(var n of config.bot_names){
					if(name == n){
						name = "[BOT ]" + name;
						break;
					}
				}
			}
			const query = {"user.dname": name};
			players.findOne(query).then((data) => {
				if(data == null){
					interaction.reply({content:"No user exists with that name!",ephemeral:true}).catch(console.error);
					return;
				}
				var message = `**${data.user.dname}** \n`;
				message+=`ELO: ${data.player.elo}\n`;
				message+=`PLAYED ${data.player.playsPVP} GAMES\n`;
				message+=`WIN RATIO: ${Math.floor((data.player.winsPVP/data.player.playsPVP).toFixed(2)*100)}%\n`;
				message+=`AVERAGE KILLS PER LIFE: ${Math.round(data.player.kills/data.player.deaths)}\n`;
				interaction.reply({content:message,ephemeral:false}).catch(console.error);
			}).catch(console.error);
		}finally{
			console.log("Done!");
		}
	},
};
