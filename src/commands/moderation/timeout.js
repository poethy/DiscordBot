const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const DURATIONS = {
  '1m':  1  * 60 * 1000,
  '5m':  5  * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '1h':  1  * 60 * 60 * 1000,
  '1d':  1  * 24 * 60 * 60 * 1000,
  '1w':  7  * 24 * 60 * 60 * 1000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Silencia a un usuario temporalmente.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('usuario').setDescription('Usuario a silenciar').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('duracion')
         .setDescription('Duración del silencio')
         .setRequired(true)
         .addChoices(
           { name: '1 minuto',  value: '1m'  },
           { name: '5 minutos', value: '5m'  },
           { name: '10 minutos',value: '10m' },
           { name: '1 hora',    value: '1h'  },
           { name: '1 día',     value: '1d'  },
           { name: '1 semana',  value: '1w'  },
         ),
    )
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón del silencio').setRequired(false),
    ),

  async execute(interaction) {
    const target   = interaction.options.getUser('usuario');
    const duration = interaction.options.getString('duracion');
    const reason   = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tienes permiso para silenciar usuarios.', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'No tengo permiso para silenciar usuarios.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'No se encontró ese usuario en el servidor.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: 'No puedo silenciar a ese usuario.', ephemeral: true });

    await member.timeout(DURATIONS[duration], `${interaction.user.tag}: ${reason}`);

    const embed = new EmbedBuilder()
      .setTitle('Usuario silenciado')
      .setColor(0xEB459E)
      .addFields(
        { name: 'Usuario',    value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderador', value: interaction.user.tag,            inline: true },
        { name: 'Duración',  value: duration,                        inline: true },
        { name: 'Razón',     value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
