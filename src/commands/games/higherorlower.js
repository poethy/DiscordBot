const {
  SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { startGame, makeGuess } = require('../../utils/higherOrLowerLogic');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeButtons(userId, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hol:higher:${userId}`)
      .setLabel('Higher ▲')
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`hol:lower:${userId}`)
      .setLabel('Lower ▼')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`hol:same:${userId}`)
      .setLabel('Same =')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
  );
}

const RESULT_TEXT = {
  correct:      '✅ ¡Correcto!',
  correct_same: '✅ ¡Correcto! ¡Era la misma! (+3 puntos)',
  wrong:        '❌ ¡Incorrecto! Fin del juego.',
};

function buildEmbed(state, gameOver = false) {
  const color = gameOver ? 0xED4245 : state.lastResult === null ? 0x5865F2 : 0x57F287;

  const embed = new EmbedBuilder()
    .setTitle('🃏 Higher or Lower')
    .setColor(color)
    .addFields(
      { name: 'Carta actual', value: `**${state.currentCard.display}**`, inline: true },
      { name: 'Racha',        value: `${state.streak}`,                  inline: true },
      { name: 'Puntuación',   value: `${state.score}`,                   inline: true },
    );

  if (state.lastResult && state.nextCard) {
    embed.addFields({
      name:  'Resultado',
      value: `${RESULT_TEXT[state.lastResult]} (la siguiente era **${state.nextCard.display}**)`,
    });
  }

  if (gameOver) {
    embed.setDescription(`Fin del juego. Puntuación final: **${state.score}**`);
  } else {
    embed.setDescription(
      '¿La siguiente carta es **más alta**, **más baja** o **igual**?\n' +
      'A=1, 2-10=valor, J=11, Q=12, K=13',
    );
  }

  return embed;
}

// ── Slash command ─────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('higherorlower')
    .setDescription('Adivina si la siguiente carta es más alta, baja o igual.'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const games  = interaction.client.activeGames;

    if (games.has(`hol:${userId}`)) {
      return interaction.reply({ content: 'Ya tienes una partida activa. ¡Termínala primero!', ephemeral: true });
    }

    const state = startGame();
    games.set(`hol:${userId}`, state);

    await interaction.reply({
      embeds:     [buildEmbed(state)],
      components: [makeButtons(userId)],
    });
  },

  // ── Button handler (called from interactionCreate) ────────────────────────
  async handleButton(interaction) {
    const [, guess, ownerId] = interaction.customId.split(':');
    const userId = interaction.user.id;

    if (userId !== ownerId) {
      return interaction.reply({ content: '¡Este no es tu juego!', ephemeral: true });
    }

    const games = interaction.client.activeGames;
    const state = games.get(`hol:${userId}`);

    if (!state) {
      return interaction.reply({ content: 'No tienes una partida activa. Usa /higherorlower para empezar.', ephemeral: true });
    }

    makeGuess(state, guess);

    const gameOver = state.status === 'finished';
    if (gameOver) games.delete(`hol:${userId}`);

    await interaction.update({
      embeds:     [buildEmbed(state, gameOver)],
      components: [makeButtons(userId, gameOver)],
    });
  },
};
