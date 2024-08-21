const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');
const { MongoClient, RegExp } = require('mongodb');

const mongoClient = new MongoClient(config.mongo_uri);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge inactive closed beta testers'),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id)){


      const database = mongoClient.db('openatbp');
      const players = database.collection('players');

      interaction.guild.roles.fetch(config.beta_role).then((role) => {
        const betaTesters = role.members;
        for(var m of betaTesters){
          //console.log(m[1].user.globalName);
          var currentUser = m[1].user;
          checkPlayers(players,currentUser);
        }
        interaction.reply({content: "Successfully ran command!", ephemeral: true}).catch(console.error);
      }).catch(console.error);
    }
	},
};

function checkPlayers(players, user){
  var query = {"user.authid":user.id};
  players.findOne(query).then((u) => {
    if(u != undefined){
      if(u.player == undefined) console.log(`${user.username} has an incomplete account`);
      //console.log(user);
      if(u.player.playsPVP <= 5 || (u.player.elo == 0 && u.player.playsPVP <= 5) || u.friends.length == 0){
        console.log(user.username + " is inactive with " + u.player.elo + " elo, " + u.player.playsPVP + " games played, and " + u.friends.length + " friends");
      }
    }else console.log(user.username + " has no account!");
  }).catch(console.error);
}
