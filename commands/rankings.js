const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rankings')
		.setDescription('Displays the top 10 players in Battle Party!'),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel && interaction.guild.id == config.guild_id){
				interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
			const database = mongoClient.db('openatbp');
			const players = database.collection('users');
			const sort = {"player.elo":-1};
			const cursor = players.find({}).sort(sort).limit(10);
			var place = 0;
			var message = "**HERE ARE THE TOP TEN PLAYERS**: \n";
			for await (var doc of cursor){
				place++;
				message+=`#${place}: ${doc.user.dname} - ${doc.player.elo} ELO \n`;
				if(place == 10){
					interaction.reply({content:message,ephemeral:false}).catch(console.error);
				}
			}
		}finally{
			console.log("Done!");
		}
	},
};
