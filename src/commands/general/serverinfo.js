const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información sobre este servidor.'),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'Este comando solo funciona en un servidor.', ephemeral: true });
    }

    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(
        { name: 'Dueño',        value: owner.user.tag,                                                    inline: true },
        { name: 'Miembros',     value: `${guild.memberCount}`,                                            inline: true },
        { name: 'Creado',       value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,              inline: true },
        { name: 'Canales',      value: `${guild.channels.cache.size}`,                                    inline: true },
        { name: 'Roles',        value: `${guild.roles.cache.size}`,                                       inline: true },
        { name: 'Boost Level',  value: `${guild.premiumTier}`,                                            inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
