const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');
const fs = require('node:fs');
const crypto = require('crypto');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your account for OpenATBP!'),
	async execute(interaction) {
		interaction.guild.roles.fetch().then((roles) => {
			var hasAccess = false;
			for(var r of roles){
				if(r[1].members != undefined){
					console.log(`Boolean 1: ${config.register_roles.includes(r[0])} | Boolean 2: ${r[1].members.has(interaction.member.id)}`);
					if(config.register_roles.includes(r[0]) && r[1].members.has(interaction.member.id)){
						hasAccess = true;
						break;
					}
				}
			}
			if(hasAccess){
				fs.readFile('./names/names.json',(err,data) => {
		      if(err) console.log(err);
		      if(data != undefined){
		        var dataJson = JSON.parse(data).DATAPACKET;
		        var list1 = dataJson.listone.displayname;
		        var list2 = dataJson.listtwo.displayname;
		        var list3 = dataJson.listthree.displayname;

		        var listArray1 = [];
		        var listArray2 = [];
		        var listArray3 = [];
		        for(var name1 of list1){
		          listArray1.push(name1['__cdata'].toUpperCase());
		        }
		        for(var name2 of list2){
		          listArray2.push(name2['__cdata'].toUpperCase());
		        }
		        for(var name3 of list3){
		          listArray3.push(name3['__cdata'].toUpperCase());
		        }
		        const database = mongoClient.db('openatbp');
		        const players = database.collection('players');
		        const query1 = {"user.authid": interaction.user.id};
		        players.findOne(query1).then((doc) => {
		          if(doc == null){
		            interaction.deferReply({ephemeral:true});
		            interaction.user.send('You are now registering for OpenATBP! Please enter in your name (must match CN naming system)').then((mes) => {
		              const filter = collected => collected.author.id === mes.author.id;
		              const collector = mes.channel.createMessageCollector({time: 60_000});
		              collector.on('collect', (m) => {
		                if(m.author.id == interaction.user.id){
		                  var nameSplit = m.content.split(' ');
		                  if(nameSplit.length > 1){
		                    var requirement1 = listArray1.includes(nameSplit[0].toUpperCase()) || listArray2.includes(nameSplit[0].toUpperCase());
		                    var requirement2 = listArray2.includes(nameSplit[1].toUpperCase()) || listArray3.includes(nameSplit[1].toUpperCase());
		                    if(nameSplit.length == 3){
		                      requirement2 = listArray2.includes(nameSplit[1].toUpperCase()) && listArray3.includes(nameSplit[2].toUpperCase());
		                    }
		                    console.log(`Requirement 1: ${requirement1} | Requirement 2: ${requirement2}`);
		                    if(requirement1 && requirement2){
		                      const query = {"user.dname": {$regex: m.content.toUpperCase(), $options: 'i'}};
		                      players.findOne(query).then((doc) => {
		                        if(doc == null){ //Create User / give auth code
		                          var blankUser = {user: {TEGid: crypto.randomUUID(), dname: m.content.toUpperCase(), authid: interaction.user.id}};
		                          players.insertOne(blankUser).then(() => {
		                            interaction.editReply({content:'Your final step is to authenticate using this link! Congrats! ' + config.oauth_url,ephemeral:true}).then(() => {
		                              m.reply('Your final step is to authenticate using this link! Congrats! ' + config.oauth_url + " Please copy and paste this into Waterfox Classic to login successfully");
		                            }).catch(console.error);
		                          }).catch(console.error);
		                          collector.stop();
		                        }else{
		                          m.reply("Name is already taken!");
		                        }
		                      }).catch(console.error);
		                    }else{
		                      m.reply("Invalid name!");
		                    }
		                  }else{
		                    m.reply('Invalid name!');
		                  }
		                }
		              });
		            }).catch(console.error);
		          }else{
		            interaction.reply({content: 'You are already registered!', ephemeral: true});
		          }
		        }).catch(console.error);
		      }
		    });
			}else{
				interaction.reply({content: 'You are not authorized to register at this time!', ephemeral: true});
			}
		}).catch(console.error);

	},
};
