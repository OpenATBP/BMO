const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../config.js');

var createRoleSelector = function(client){
	client.guilds.fetch(config.guild_id).then((guild) => {
    guild.channels.fetch(config.roles_channel).then((channel) => {
      const select = new StringSelectMenuBuilder()
			.setCustomId('roleSelect')
			.setPlaceholder('Choose your role...')
			.addOptions(
				new StringSelectMenuOptionBuilder().setLabel('No Color').setValue('NONE'),
				new StringSelectMenuOptionBuilder().setLabel('BMO Buddies').setValue('947258999831658577'),
        new StringSelectMenuOptionBuilder().setLabel('Friends of Finn').setValue('947259030773051452'),
        new StringSelectMenuOptionBuilder().setLabel('Fionna Followers').setValue('947259059009093674'),
        new StringSelectMenuOptionBuilder().setLabel('Flame Princess Party').setValue('947259110695534622'),
        new StringSelectMenuOptionBuilder().setLabel('Gunter Gatherers').setValue('947259138679910440'),
        new StringSelectMenuOptionBuilder().setLabel('Ice King\'s Devotees').setValue('947259169206042676'),
        new StringSelectMenuOptionBuilder().setLabel('Jake Jostlers').setValue('947259212210249830'),
        new StringSelectMenuOptionBuilder().setLabel('Lemongrab Lovers').setValue('947259228601585694'),
        new StringSelectMenuOptionBuilder().setLabel('Lumpy Space Squad').setValue('947259235459301416'),
        new StringSelectMenuOptionBuilder().setLabel('Magic Man Mainers').setValue('947259315796979723'),
        new StringSelectMenuOptionBuilder().setLabel('Marceline\'s Marauders').setValue('947259365319143475'),
        new StringSelectMenuOptionBuilder().setLabel('PepBut Pwners').setValue('947259395396468806'),
        new StringSelectMenuOptionBuilder().setLabel('Bubblegum Battalion').setValue('947259450270572554'),
        new StringSelectMenuOptionBuilder().setLabel('Rattleballers').setValue('947259510811144263'),
        new StringSelectMenuOptionBuilder().setLabel('Billy\'s Bunch').setValue('947259545330266174'),
        new StringSelectMenuOptionBuilder().setLabel('NEPTR Nemeses').setValue('947259592235171911'),
        new StringSelectMenuOptionBuilder().setLabel('Cinnamon Congregation').setValue('947259618244042802'),
        new StringSelectMenuOptionBuilder().setLabel('Hunson Admirers').setValue('947259648837296159'),
        new StringSelectMenuOptionBuilder().setLabel('Lich Listeners').setValue('947284774706360383'),
			);
      const row = new ActionRowBuilder()
			.addComponents(select);
      channel.send({
        content: 'Choose a role to rep your favorite character (BMO!) and get a special name color!\nNote that you can only have one color role at a time',
        components: [row]
      }).then((mes) => {
        console.log("Message was a success!");
      }).catch(console.error);
    }).catch(console.error);
  }).catch(console.error);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolemessage')
		.setDescription('Creates the role message in a designated chat.'),
	async execute(interaction) {
		if(config.admin_ids.includes(interaction.user.id)){
			createRoleSelector(interaction.client);
	    interaction.reply({content: 'Message created.', ephemeral: true}).catch(console.error);
		}else{
			interaction.reply({content: 'You do not have permission to use this.', ephemeral:true}).catch(console.error);
		}
	},
};
