const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');
const fs = require('node:fs');
const crypto = require('crypto');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('login')
		.setDescription('Login to OpenATBP!'),
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
				interaction.reply({content: `Login at ${config.oauth_url} and the copy & paste the link provided into Waterfox / Pale Moon. Sorry for the inconvenience!`, ephemeral: true});
			}else{
				interaction.reply({content: 'You are not authorized to register at this time!', ephemeral: true});
			}
		}).catch(console.error);

	},
};
