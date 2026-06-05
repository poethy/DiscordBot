const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información sobre un usuario.')
    .addUserOption(opt =>
      opt.setName('usuario')
         .setDescription('Usuario a consultar (por defecto tú mismo)')
         .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'Este comando solo funciona en un servidor.', ephemeral: true });
    }

    const target = interaction.options.getUser('usuario') ?? interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(target.tag)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(0x5865F2)
      .addFields(
        { name: 'ID',              value: target.id,                                                             inline: true },
        { name: 'Cuenta creada',   value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`,                 inline: true },
        { name: 'Ingresó al servidor', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: 'Bot',             value: target.bot ? 'Sí' : 'No',                                             inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
