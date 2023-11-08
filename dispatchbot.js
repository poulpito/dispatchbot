//  ENV Docker
const targetChannelID = process.env.targetChannelID;
const Flotte = JSON.parse(process.env.Flotte);
const token = process.env.DiscordToken;

console.log("channelid: " + targetChannelID);
console.log("flotte: " + Flotte);


const {
  Client,
  ActionRowBuilder, 
  ButtonBuilder ,
  ButtonStyle,
  GatewayIntentBits,
  Partials,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
  ],
});

const onDuty = new ButtonBuilder()
  .setCustomId('onDuty')
  .setLabel('Embarquer')
  .setStyle(ButtonStyle.Primary);

const LeaveDuty = new ButtonBuilder()
  .setCustomId('LeaveDuty')
  .setLabel('Quitter')
  .setStyle(ButtonStyle.Secondary);

const Clean = new ButtonBuilder()
  .setCustomId('Clean')
  .setLabel('Vider')
  .setStyle(ButtonStyle.Danger);

const Empty = new ButtonBuilder()
  .setCustomId('Empty')
  .setLabel('Grand Ménage')
  .setStyle(ButtonStyle.Danger);

const Actions = new ActionRowBuilder()
  .addComponents(onDuty, LeaveDuty, Clean);

const Cleanup = new ActionRowBuilder()
  .addComponents(Empty);


function initDispatch() {
  console.log('Init Dispatch Call');

  const targetChannel = client.channels.cache.get(targetChannelID);

  if (targetChannel) {
    targetChannel.messages.fetch().then(messages => {
      targetChannel.bulkDelete(messages)
        .then(deletedMessages => console.log(`Supprimé ${deletedMessages.size} messages.`))
        .catch(console.error);
    });

    setTimeout(() => {
      for (const vehicule of Flotte) {
        console.log('Ajoute message vehicule');
        const messageContent = "‎\n🚒  __**" + vehicule + "**__ \n\n";
        targetChannel.send({ content : messageContent, components: [Actions] })
        .then(sentMessage => {
          console.log(`Message créé dans ${targetChannel.name}:\n${messageContent}`);
        })
      }

      targetChannel.send({ content : '‎\n\n', components: [Cleanup] })
        .then(sentMessage => {
          console.log(`Bouton de nettoyge créé`);
        })

    }, 2000);


  }else {
    console.log(`Le canal avec l'ID ${channelId} n'a pas été trouvé.`);
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await initDispatch();

});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

    const guild = interaction.message.guild;
    const member = guild.members.cache.get(interaction.user.id);
    let username = member ? member.nickname : interaction.username ;
    username = (username === null) ? interaction.user.username : username;

    const AddMessageContent = `${interaction.message.content} \n🧑‍🚒 - ${username}`;

    const usertodelete = `\n🧑‍🚒 - ${username}`;
    const RemoveMessageContent = interaction.message.content.replace(new RegExp(usertodelete, 'g'), "");

    const EmptyContent = interaction.message.content.replace(new RegExp(`\n🧑‍🚒 - .*`, 'g'), "");


  if (interaction.customId === 'onDuty') {
    console.log("prise de service / " + username);

    await interaction.message.edit(AddMessageContent)
      .catch(console.error);

    await interaction.update({
      components: [Actions],
    });
    
  }  else if (interaction.customId === 'LeaveDuty') {
    console.log("Fin de service / " + username);

    await interaction.message.edit(RemoveMessageContent)
      .catch(console.error);

    await interaction.update({
      components: [Actions],
    });

  }  else if (interaction.customId === 'Clean') {
    console.log("On vide le véhicule / " + username);

    await interaction.message.edit(EmptyContent)
      .catch(console.error);

    await interaction.update({
      components: [Actions],
    });
  }  else if (interaction.customId === 'Empty') {
    console.log("On vide TOUT / " + username);

    await initDispatch();
  }
});


client.login(token);
