const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Lista las advertencias de un usuario.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a consultar').setRequired(true),
    ),

  async execute(interaction) {
    const target   = interaction.options.getUser('usuario');
    const list     = interaction.client.warnings.get(target.id) ?? [];

    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tienes permiso para ver advertencias.', ephemeral: true });
    }

    if (list.length === 0) {
      return interaction.reply({
        content: `${target.tag} no tiene advertencias registradas.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Advertencias de ${target.tag}`)
      .setColor(0xFEE75C)
      .setTimestamp();

    list.forEach((w, i) => {
      embed.addFields({
        name:  `#${i + 1} — <t:${Math.floor(w.timestamp / 1000)}:R>`,
        value: `**Razón:** ${w.reason}\n**Moderador:** ${w.issuedBy}`,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
