import discord

SELECTABLE_ROLE_IDS = [947258999831658577, 947259030773051452, 947259059009093674, 947259110695534622, 947259138679910440,
                    947259169206042676, 947259212210249830, 947259228601585694, 947259235459301416, 947259315796979723,
                    947259365319143475, 947259395396468806, 947259450270572554, 947259510811144263, 947259545330266174,
                    947259592235171911, 947259618244042802, 947259648837296159, 947284774706360383]

SELECTABLE_ROLES = []

for role_id in SELECTABLE_ROLE_IDS:
    SELECTABLE_ROLES.append(discord.Object(id=role_id, type=discord.abc.Snowflake))

ROLE_SELECT_MSG ='Choose a role to rep your favorite character and get a special name color!\nNote that you can only have one color role at a time.'

class RoleDropdown(discord.ui.Select):
    def __init__(self):
        # Set the options that will be presented inside the dropdown
        options = [
            discord.SelectOption(label='No Color', value='NONE'),
            discord.SelectOption(label='BMO Buddies', value='947258999831658577'),
            discord.SelectOption(label='Friends of Finn', value='947259030773051452'),
            discord.SelectOption(label='Fionna Followers', value='947259059009093674'),
            discord.SelectOption(label='Flame Princess Party', value='947259110695534622'),
            discord.SelectOption(label='Gunter Gatherers', value='947259138679910440'),
            discord.SelectOption(label='Ice King\'s Devotees', value='947259169206042676'),
            discord.SelectOption(label='Jake Jostlers', value='947259212210249830'),
            discord.SelectOption(label='Lemongrab Lovers', value='947259228601585694'),
            discord.SelectOption(label='Lumpy Space Squad', value='947259235459301416'),
            discord.SelectOption(label='Magic Man Mainers', value='947259315796979723'),
            discord.SelectOption(label='Marceline\'s Marauders', value='947259365319143475'),
            discord.SelectOption(label='PepBut Pwners', value='947259395396468806'),
            discord.SelectOption(label='Bubblegum Battalion', value='947259450270572554'),
            discord.SelectOption(label='Rattleballers', value='947259510811144263'),
            discord.SelectOption(label='Billy\'s Bunch', value='947259545330266174'),
            discord.SelectOption(label='NEPTR Nemeses', value='947259592235171911'),
            discord.SelectOption(label='Cinnamon Congregation', value='947259618244042802'),
            discord.SelectOption(label='Hunson Admirers', value='947259648837296159'),
            discord.SelectOption(label='Lich Listeners', value='947284774706360383')
        ]

        super().__init__(placeholder='Choose your role...', min_values=1, max_values=1, options=options, custom_id="bmo_role_select")

    async def callback(self, interaction: discord.Interaction):
        current_roles = list(set(interaction.user.roles) & set(SELECTABLE_ROLES))
        if current_roles:
            await interaction.user.remove_roles(current_roles[0])
        
        if self.values[0] == 'NONE':
            pass
        else:
            await interaction.user.add_roles(discord.Object(id=int(self.values[0]), type=discord.abc.Snowflake))
        
        await interaction.response.send_message(f'Okay, your role has been set!', ephemeral=True)

class RoleDropdownView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(RoleDropdown())
