const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('altaudit')
		.setDescription('Check for alternate accounts')
    .addStringOption(option => option.setName('name').setDescription('Enter the display name of the player')),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id)){
			const database = mongoClient.db('openatbp');
      const players = database.collection('users');
			if(interaction.options.getString("name") != undefined){ //Search for player alts
				var name = interaction.options.getString("name").toUpperCase();
				players.findOne({"user.dname":name}).then((data) => {
					if(data != undefined){
						if(data.address != undefined){
							var allAlts = [];
								var cursor = players.find({"address":data.address});
								cursor.toArray().then((dat) => {
									for(var doc of dat){
										allAlts.push(doc.user);
									}
									var messageContent = allAlts.length > 1 ? `Here are all the alts for ${name} at ${data.address}:\n` : `${name} has no alts at ${data.address}!`;
									for(var alt of allAlts){
										messageContent+=`Name: ${alt.dname} | Username: ${alt.TEGid}\n`;
									}
									interaction.reply({content:messageContent,ephemeral:true}).catch(console.error);
								}).catch(console.error);

						}else interaction.reply({content: "No alts exist for that account!",ephemeral:true}).catch(console.error);
					}else interaction.reply({content:"No user exists with that name.",ephemeral:true}).catch(console.error);
				})
			}else{ //Search for all alts
				var allUsers = []
				try {
			    var cursor = players.find();
			    for await (var doc of cursor) {
			      allUsers.push(doc);
			    }
			  }catch(e){
					console.log(e);
				} finally {
			    var altCheck = {};
					for(var u of allUsers){
						if(u.address != undefined){
							if(altCheck[`${u.address}`] == undefined) altCheck[`${u.address}`] = [];
							altCheck[`${u.address}`].push(u.user);
						}
					}
					var potentialAlts = [];
					for(var k of Object.keys(altCheck)){
						var obj = {};
						obj[`${k}`] = altCheck[k];
						if(altCheck[k].length > 1) potentialAlts.push(obj);
					}
					var redFlags = [];
					for(var pa of potentialAlts){
						var address = Object.keys(pa)[0];
						if (pa[`${address}`].length > 2){
							redFlags.push(pa);
						}
					}
					var messageContent = `There are ${potentialAlts.length} differnet people with alts. There are ${redFlags.length} people with too many alts.`;
					if (redFlags.length > 0){
						messageContent+=" Here they are:\n";
					}
					for(var rf of redFlags){
						messageContent+=`Address: ${Object.keys(rf)[0]}. Accounts: `;
						for(var alt of rf[`${Object.keys(rf)[0]}`]){
							messageContent+=alt.dname+", ";
						}
						messageContent+=`\n`;
					}
					interaction.reply({content: messageContent, ephemeral:true}).catch(console.error);
			  }
			}
		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
