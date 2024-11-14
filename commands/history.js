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

const stats = [{name: 'Kills', value: 'kills'},
{name: 'Deaths', value: 'deaths'},
{name: 'Assists', value: 'assists'},
{name: 'Total Physical Damage Dealt', value: 'damageDealtPhysical'},
{name: 'Total Spell Damage Dealt', value: 'damageDealtSpell'},
{name: 'Total Damage Dealt', value: 'damageDealtTotal'},
{name: 'Total Physical Damage Received', value: 'damageReceivedPhysical'},
{name: 'Total Damage Received', value: 'damageReceivedTotal'},
{name: 'Score Gained', value: 'score'},
{name: 'Elo', value: 'elo'},
{name: 'Elo Gained', value: 'eloGain'}];


module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('Get the match history of a player!')
		.addStringOption(option => option.setName('name').setDescription('Enter the display name of the player').setRequired(true)),
	async execute(interaction) {
		try{
			if(interaction.channelId != config.bot_channel){
				interaction.reply({content:'Please go to the spicy battle channel to use this command!',ephemeral:true});
				return;
			}
      if(!config.admin_ids.includes(interaction.user.id)){
        interaction.reply({content: 'Feature in progress...',ephemeral:true});
        return;
      }

			const database = mongoClient.db('openatbp');
			const players = database.collection('users');
      const history = database.collection('matches');
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
        if(data.history == undefined){
          interaction.reply({content:"No previous match history",ephemeral:true}).catch(console.error);
          return;
        }
        var historyId = data.history[data.history.length-1];

        history.findOne({"_id":historyId}).then((hist) => {
          if (hist == null){
            interaction.reply({content:"No valid history",ephemeral:true}).catch(console.error);
            return;
          }
          var teamANames = [];
          var teamBNames = [];
          var playerObj = {};
          for(var k of Object.keys(hist['0'])){
            teamANames.push(k);
            if(k == data.user.dname){
              playerObj = hist['0'][`${k}`];
            }
          }
          for(var k of Object.keys(hist['1'])){
            teamBNames.push(k);
            if(k == data.user.dname){
              playerObj = hist['1'][`${k}`];
            }
          }
          var message = '';
          for(var i in teamANames){
            message+=teamANames[i];
            if(parseInt(i)+1 != teamANames.length) message+=", ";
          }
          message+=" v. ";
          for(var i in teamBNames){
            message+=teamBNames[i];
            if(parseInt(i)+1 != teamBNames.length){
							message+=", ";
						}
          }
          message+="\n\n**PERSONAL STATS:** \n\n";
          for(var c of choices){
            if(c.value == playerObj.champion){
              message+="Champion: " + c.name + "\n";
              break;
            }
          }
          for(var s of stats){
            if(playerObj[`${s.value}`] != undefined){
              message+=`${s.name}: ${playerObj[`${s.value}`]}\n`;
            }
          }
          interaction.reply({content:message,ephemeral:true}).catch(console.error);
        }).catch(console.error);

			}).catch(console.error);
		}finally{
			console.log("Done!");
		}
	},
};
