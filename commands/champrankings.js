const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);
const choices = [{name: "Billy", value: 'billy'},
{name: "BMO", value: 'bmo'},
{name: "Choose Goose", value: 'choosegoose'},
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
		.setName('champrankings')
		.setDescription('Get the rankings of all champions!')
		.addStringOption(opt => opt.setName('type').setDescription('What stat would you like to be ranked?').setRequired(true).addChoices(
			{name: 'Highest Win Rate', value: '0'},
			{name: "Most Played", value: '1'},
			{name: "Most Damage", value: '2'}
		)),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel && interaction.guild.id == config.guild_id){
				interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
			const database = mongoClient.db('openatbp');
			const champs = database.collection('champions');
			var choice = interaction.options.getString('type');
			var champStats = [];
			try {
		    var cursor = champs.find();
		    for await (var doc of cursor) {
					if(doc.playsPVP > 0){
						var name = "";
						for(var c of choices){
							if(c.value == doc.champion){
								name = c.name;
								break;
							}
						}
			      var champData = {"message": `**${name}**: `, value: 0};
						if(choice == '0'){
							champData.value = Math.floor((doc.winsPVP/doc.playsPVP).toFixed(2)*100);
							champData.message+=`${champData.value}% WIN RATE OUT OF ${doc.playsPVP} GAMES!`;
						}
						else if(choice == '1'){
							champData.value = doc.playsPVP;
							champData.message+=`PLAYED IN ${doc.playsPVP} GAMES!`;
						}
						else if(choice == '2'){
							champData.value = Math.round(doc.damage/doc.playsPVP);
							champData.message+=`HAS DEALT ${doc.damage} DAMAGE IN ${doc.playsPVP} GAMES! AVERAGING AT ${champData.value} DAMAGE PER GAME!`;
						}
						champStats.push(champData);
					}
		    }
		  } finally {
				champStats = champStats.sort((a,b) => b.value - a.value);
				var rank = 0;
				var finalMessage = "**CHAMPION RANKINGS:**\n";
				for(var cs of champStats){
					rank++;
					finalMessage+=`#${rank}: ${cs.message}\n`;
				}
				interaction.reply({content:finalMessage,ephemeral:false}).catch(console.error);
		  }
		}finally{
			console.log("Done!");
		}
	},
};
