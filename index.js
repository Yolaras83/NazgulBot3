require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

const REACTION_EMOJI = '👍';  // The emoji for the reaction role

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const channel = await guild.channels.fetch(process.env.CHANNEL_ID);

        // Send the message and add a reaction
        const message = await channel.send('React to this message to get the Beta Role! ||@everyone|| ||@here||');
        await message.react(REACTION_EMOJI);

        // Assign the Beta role to existing members who don't have it
        const members = await guild.members.fetch();
        members.forEach(member => {
            if (!member.roles.cache.has(process.env.ROLE_ID) && !member.user.bot) {
                member.roles.add(process.env.ROLE_ID).catch(console.error);
            }
        });
    } catch (error) {
        console.error('Failed to fetch guild, channel, or members:', error);
    }
});

client.on('guildMemberAdd', member => {
    if (!member.roles.cache.has(process.env.ROLE_ID)) {
        member.roles.add(process.env.ROLE_ID).catch(console.error);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        if (reaction.message.channelId === process.env.CHANNEL_ID && reaction.emoji.name === REACTION_EMOJI) {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);

            if (!member.roles.cache.has(process.env.BETA_ID)) {  // Use BETA_ID for the reaction-based role
                await member.roles.add(process.env.BETA_ID);
                console.log(`Assigned Beta role to ${user.tag}`);
            }
        }
    } catch (error) {
        console.error('Failed to handle reaction:', error);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        if (reaction.message.channelId === process.env.CHANNEL_ID && reaction.emoji.name === REACTION_EMOJI) {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);

            if (member.roles.cache.has(process.env.BETA_ID)) {  // Use BETA_ID for the reaction-based role
                await member.roles.remove(process.env.BETA_ID);
                console.log(`Removed Beta role to ${user.tag}`);
            }
        }
    } catch (error) {
        console.error('Failed to handle reaction:', error);
    }
});

client.login(process.env.TOKEN);
