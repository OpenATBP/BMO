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
		.setName('stats')
		.setDescription('Get the stats of a player!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true))
		.addStringOption(opt => opt.setName('champion').setDescription("List the champion you want stats for (if applicable)").addChoices(
			{name: 'Champ Rankings', value: 'all'},
			{name: "Billy", value: 'billy'},
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
			{name: "Rattleballs", value: 'rattleballs'}
		)),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel && interaction.guild.id == config.guild_id){
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
				var champ = interaction.options.getString('champion');
				if(champ != undefined && champ != ''){
					if(data.champion == undefined){
						interaction.reply({content:"That user has no champion data!",ephemeral:true}).catch(console.error);
						return;
					}
					var champName = "CHAMP RANKINGS";
					for(var c of choices){
						if(champ == c.value){
							champName = c.name;
							break;
						}
					}
					if(champ == 'all'){
						var allChamps = [];
						for(var c of Object.keys(data.champion)){
							var cData = data.champion[c];
							var cName = "";
							for(var ch of choices){
								if(ch.value == c){
									cName = ch.name;
									break;
								}
							}
							var champData = {"message": `**${cName}**: WIN RATIO: ${Math.floor((cData.winsPVP/cData.playsPVP).toFixed(2)*100)}%`, value: Math.floor((cData.winsPVP/cData.playsPVP).toFixed(2)*100)};
							allChamps.push(champData);
						}
						allChamps = allChamps.sort((a,b) => b.value - a.value);
						var message = `**${data.user.dname} CHAMP RANKINGS:** \n`;
						for(var c of allChamps){
							message+=c.message +"\n";
						}
						interaction.reply({content:message,ephemeral:false}).catch(console.error);
					}else{
						var message = `**${data.user.dname}: ${champName}** \n`;
						var champData = data.champion[`${champ}`];
						if(champData != undefined){
							message+=`PLAYED IN ${champData.playsPVP} GAMES OR ${Math.floor((champData.playsPVP/data.player.playsPVP).toFixed(2)*100)}% OF GAMES \n`;
							message+=`WIN RATIO: ${Math.floor((champData.winsPVP/champData.playsPVP).toFixed(2)*100)}% OR ${Math.floor((champData.winsPVP/data.player.winsPVP).toFixed(2)*100)}% of WINS\n`;
							message+=`AVERAGE KILLS PER GAME: ${Math.round(champData.kills/champData.playsPVP)}\n`;
							message+=`AVERAGE CHAMP DAMAGE PER GAME: ${Math.round(champData.damage/champData.playsPVP)}`;
						}else message+=`No data found for ${champName}`;
						interaction.reply({content:message,ephemeral:false}).catch(console.error);
					}
				}else{
					var message = `**${data.user.dname}** \n`;
					message+=`ELO: ${data.player.elo}\n`;
					message+=`PLAYED ${data.player.playsPVP} GAMES\n`;
					message+=`WIN RATIO: ${Math.floor((data.player.winsPVP/data.player.playsPVP).toFixed(2)*100)}%\n`;
					message+=`AVERAGE KILLS PER LIFE: ${Math.round(data.player.kills/data.player.deaths)}\n`;
					interaction.reply({content:message,ephemeral:false}).catch(console.error);
				}

			}).catch(console.error);
		}finally{
			console.log("Done!");
		}
	},
};
