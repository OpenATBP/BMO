const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a player from the game.')
    .addUserOption(option => option.setName('player').setDescription('Provide the player you wish to remove from OpenATBP').setRequired(true)),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id)){
      const target = interaction.options.getUser('player');

      const database = mongoClient.db('openatbp');
      const players = database.collection('players');

      const query = { "user.authid": target.id};
      players.deleteMany(query).then((res) => {
        interaction.reply({content: `Deleted ${res.deletedCount} instances of that player`, ephemeral: true});
      }).catch(console.error);
		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
