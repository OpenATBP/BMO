import os
import discord
import views.roleselect

from localStoragePy import localStoragePy
from discord import app_commands

localStorage = localStoragePy('bmo', 'sqlite')

class MyClient(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)
        # A CommandTree is a special type that holds all the application command
        # state required to make it work. This is a separate class because it
        # allows all the extra state to be opt-in.
        # Whenever you want to work with application commands, your tree is used
        # to store and work with them.
        # Note: When using commands.Bot instead of discord.Client, the bot will
        # maintain its own tree instead.
        self.tree = app_commands.CommandTree(self)

    # In this basic example, we just synchronize the app commands to one guild.
    # Instead of specifying a guild to every command, we copy over our global commands instead.
    # By doing so, we don't have to wait up to an hour until they are shown to the end-user.
    async def setup_hook(self):
        # This copies the global commands over to your guild.
        self.tree.copy_global_to(guild=MY_GUILD)
        await self.tree.sync(guild=MY_GUILD)

intents = discord.Intents.default()
client = MyClient(intents=intents)

@client.event
async def on_ready():
    if localStorage.getItem("role_select_id"):
        role_view = RoleDropdownView()
        print("Using message ID", localStorage.getItem("role_select_id"))
        # XXX: specifying message id in add_view causes select to fail after restart?
        client.add_view(view=role_view)
        print(client.persistent_views)
    else:
        print('Warning: role select message ID not set.')

    print(f'Logged in as {client.user} (ID: {client.user.id})')
    print('------')

@client.tree.command()
@app_commands.rename(channel_to_send='channel')
@app_commands.describe(channel_to_send='Which channel to create the role selector in')
async def create_role_select(interaction: discord.Interaction, channel_to_send: discord.TextChannel):
    if not interaction.permissions.administrator:
        await interaction.reponse.send("You don't have permission to use that.", ephemeral=True)
        return

    role_view = RoleDropdownView()
    
    # Alert the command's user, and send the view to specified channel
    await interaction.response.send_message('Okay, I created it in that channel.', ephemeral=True)
    completed_msg = await channel_to_send.send(ROLE_SELECT_MSG, view=role_view)
    localStorage.setItem("role_select_id", completed_msg.id)

client.run(os.environ.get('BMO_DISCORD_TOKEN'))
