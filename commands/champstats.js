const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);
const choices = [{name: "Billy", value: 'billy'},
{name: "BMO", value: 'bmo'},
{name: "Cinnamon Bun", value: 'cinnamonbun'},
{name: "Finn", value: 'finn'},
{name: "Fionna", value: 'fionna'},
{name: "Flame Princess", value: 'flame'},
{name: "Gunter", value: 'gunter'},
{name: "Hunson", value: 'hunson'},
{name: "Ice King", value: 'iceking'},
{name: "Jake", value: 'jake'},
{name: "Lemongrab", value: 'lemongrab'},
{name: "Lich", value: 'lich'},
{name: "LSP", value: 'lsp'},
{name: "Magic Man", value: 'magicman'},
{name: "Marceline", value: 'marceline'},
{name: "Neptr", value: 'neptr'},
{name: "Peppermint Butler", value: 'peppermintbutler'},
{name: "Princess Bubblegum", value: 'princessbubblegum'},
{name: "Rattleballs", value: 'rattleballs'}];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('champstats')
		.setDescription('Get the stats of a champion!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the champion').setRequired(true).addChoices(
			{name: "Billy", value: 'billy'},
			{name: "BMO", value: 'bmo'},
			{name: "Cinnamon Bun", value: 'cinnamonbun'},
			{name: "Finn", value: 'finn'},
			{name: "Fionna", value: 'fionna'},
			{name: "Flame Princess", value: 'flame'},
			{name: "Gunter", value: 'gunter'},
			{name: "Hunson", value: 'hunson'},
			{name: "Ice King", value: 'iceking'},
			{name: "Jake", value: 'jake'},
			{name: "Lemongrab", value: 'lemongrab'},
			{name: "Lich", value: 'lich'},
			{name: "LSP", value: 'lsp'},
			{name: "Magic Man", value: 'magicman'},
			{name: "Marceline", value: 'marceline'},
			{name: "Neptr", value: 'neptr'},
			{name: "Peppermint Butler", value: 'peppermintbutler'},
			{name: "Princess Bubblegum", value: 'princessbubblegum'},
			{name: "Rattleballs", value: 'rattleballs'}
		)),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel){
				interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
			const database = mongoClient.db('openatbp');
			const champs = database.collection('champions');
			var name = interaction.options.getString('name');
			const query = {"champion": name};
			champs.findOne(query).then((data) => {
				if(data == null){
					interaction.reply({content:"That champion has no data!",ephemeral:true}).catch(console.error);
					return;
				}
				var display = "";
				for(var c of choices){
					if(name == c.value){
						display = c.name;
						break;
					}
				}
				var message = `**${display}** \n`;
				message+=`PLAYED IN ${data.playsPVP} GAMES\n`;
				message+=`WIN RATIO: ${Math.floor((data.winsPVP/data.playsPVP).toFixed(2)*100)}%\n`;
				message+=`AVERAGE KILLS PER GAME: ${Math.round(data.kills/data.playsPVP)}\n`;
				message+=`AVERAGE CHAMP DAMAGE PER GAME: ${Math.round(data.damage/data.playsPVP)}`;
				interaction.reply({content:message,ephemeral:false}).catch(console.error);
			}).catch(console.error);
		}finally{
			console.log("Done!");
		}
	},
};
