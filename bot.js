// Require the necessary discord.js classes
const { Client, Collection, REST, Routes, Events, GatewayIntentBits, SlashCommandBuilder, Partials } = require('discord.js');
const config = require('./config.js');
const fs = require('node:fs');
const path = require('node:path');
const request = require('request');

// Create a new client instance
const client = new Client({
  partials: [
    Partials.Message, // for message
    Partials.Channel, // for text channel
    Partials.GuildMember, // for guild member
    Partials.Reaction, // for message reaction
    Partials.GuildScheduledEvent, // for guild events
    Partials.User, // for discord user
    Partials.ThreadMember, // for thread member
  ],
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildMembers, // for guild members related things
    GatewayIntentBits.GuildBans, // for manage guild bans
    GatewayIntentBits.GuildEmojisAndStickers, // for manage emojis and stickers
    GatewayIntentBits.GuildIntegrations, // for discord Integrations
    GatewayIntentBits.GuildWebhooks, // for discord webhooks
    GatewayIntentBits.GuildInvites, // for guild invite managing
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildPresences, // for user presence things
    GatewayIntentBits.GuildMessages, // for guild messages things
    GatewayIntentBits.GuildMessageReactions, // for message reactions things
    GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.DirectMessages, // for dm messages
    GatewayIntentBits.DirectMessageReactions, // for dm message reaction
    GatewayIntentBits.DirectMessageTyping, // for dm message typinh
    GatewayIntentBits.MessageContent, // enable if you need message content things
  ],
});
client.commands = new Collection();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

	// Grab all the command files from the commands directory you created earlier
	const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.client_token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.client_id, config.guild_id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

var checkRoles = function(member){
	return new Promise(function(resolve, reject) {

		console.log(member.roles.resolve(SELECTABLE_ROLE_IDS));
		member.roles.fetch().then((roles) => {
			for(var role of roles){
				for(var selectAbleRole of SELECTABLE_ROLE_IDS){
					if(role[0] == selectAbleRole) resolve(role[0]);
				}
			}
		}).catch((err) => {
			reject(err);
		});
	});
};

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user.setActivity(`Users Online: 0`);
	//createRoleSelector();
  setInterval(() => {
    request.get(config.game_url+"data/users",(err,res,body) => {
      if (err) return;
      try{
        client.user.setActivity(`Users Online: ${JSON.parse(body).users}`);
      }catch(e){
        console.log(e);
      }
    });
  },1000*60);
});

client.on(Events.InteractionCreate, (interaction) => {
  if(interaction.isChatInputCommand()){
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
    		console.error(`No command matching ${interaction.commandName} was found.`);
    		return;
    	}else{
				command.execute(interaction);
			}
  }else{
    console.log(interaction.values[0]);
    var roleId = interaction.values[0];
    var member = interaction.member;
    if(roleId != undefined){
			const SELECTABLE_ROLE_IDS = ['947258999831658577', '947259030773051452', '947259059009093674', '947259110695534622', '947259138679910440',
			                    '947259169206042676', '947259212210249830', '947259228601585694', '947259235459301416', '947259315796979723',
			                    '947259365319143475', '947259395396468806', '947259450270572554', '947259510811144263', '947259545330266174',
			                    '947259592235171911', '947259618244042802', '947259648837296159', '947284774706360383'];
			member.roles.remove(SELECTABLE_ROLE_IDS).then(() => {
				if(roleId != "NONE"){
					member.roles.add(roleId).then(() => {
						interaction.reply({content: 'Role added!', ephemeral: true}).catch(console.error);
					}).catch(console.error);
				}else{
					interaction.reply({content: 'Role removed!', ephemeral: true}).catch(console.error);
				}
			}).catch(console.error);
    }
  }

});

// Log in to Discord with your client's token
client.login(config.client_token);
