const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Registra una advertencia para un usuario.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a advertir').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón de la advertencia').setRequired(true),
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon');

    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'No tienes permiso para advertir usuarios.', ephemeral: true });
    }

    const warnings = interaction.client.warnings;
    if (!warnings.has(target.id)) warnings.set(target.id, []);

    warnings.get(target.id).push({
      reason,
      issuedBy:   interaction.user.tag,
      issuedById: interaction.user.id,
      timestamp:  Date.now(),
    });

    const total = warnings.get(target.id).length;

    const embed = new EmbedBuilder()
      .setTitle('Advertencia registrada')
      .setColor(0xFEE75C)
      .addFields(
        { name: 'Usuario',          value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderador',       value: interaction.user.tag,            inline: true },
        { name: 'Advertencias',    value: `${total}`,                      inline: true },
        { name: 'Razón',           value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Intentar notificar al usuario por DM
    target.send(`Has recibido una advertencia en **${interaction.guild.name}**.\nRazón: ${reason}`).catch(() => null);
  },
};
