const {
  SlashCommandBuilder, EmbedBuilder, AttachmentBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { startGame, makeGuess } = require('../../utils/higherOrLowerLogic');
const { renderCard } = require('../../utils/cardRenderer');
const { getBalance, deductBalance, addBalance } = require('../../utils/economy');

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
    new ButtonBuilder()
      .setCustomId(`hol:cashout:${userId}`)
      .setLabel('💰 Cobrar')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
  );
}

const RESULT_TEXT = {
  correct:      '✅ ¡Correcto!',
  correct_same: '✅ ¡Correcto! ¡Era la misma! (+3x)',
  wrong:        '❌ ¡Incorrecto! Fin del juego.',
};

function buildPayload(state, gameOver = false, cashedOut = false) {
  const buffer = renderCard(state.currentCard);
  const attach = new AttachmentBuilder(buffer, { name: 'card.png' });

  const color = gameOver ? (cashedOut ? 0x57F287 : 0xED4245) :
                state.lastResult === null ? 0x5865F2 : 0x57F287;

  const embed = new EmbedBuilder()
    .setTitle('🃏 Higher or Lower')
    .setColor(color)
    .setImage('attachment://card.png')
    .addFields(
      { name: 'Carta actual', value: `**${state.currentCard.display}**`, inline: true },
      { name: 'Racha',        value: `**${state.streak}**`,              inline: true },
    );

  if (state.bet > 0) {
    embed.addFields({ name: 'Pot', value: `🪙 ${state.pot.toLocaleString()}`, inline: true });
  } else {
    embed.addFields({ name: 'Puntuación', value: `**${state.score}**`, inline: true });
  }

  if (state.lastResult && state.nextCard) {
    embed.addFields({
      name:  'Resultado',
      value: `${RESULT_TEXT[state.lastResult]} (siguiente: **${state.nextCard.display}**)`,
    });
  }

  if (gameOver) {
    if (cashedOut) {
      embed.setDescription(`💰 ¡Cobraste! Ganaste 🪙 **${state.pot.toLocaleString()}** monedas.`);
    } else {
      const lossMsg = state.bet > 0
        ? `Fin del juego. Perdiste 🪙 **${state.bet.toLocaleString()}** monedas.`
        : `Fin del juego. Puntuación final: **${state.score}**`;
      embed.setDescription(lossMsg);
    }
  } else {
    embed.setDescription(
      '¿La siguiente carta es **más alta**, **más baja** o **igual**?\n' +
      'A=1, 2-10=valor, J=11, Q=12, K=13',
    );
  }

  return { embeds: [embed], files: [attach] };
}

// ── Slash command ─────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('higherorlower')
    .setDescription('Adivina si la siguiente carta es más alta, baja o igual.')
    .addIntegerOption(opt =>
      opt.setName('apuesta')
         .setDescription('Monedas a ganar por cada acierto (opcional)')
         .setRequired(false)
         .setMinValue(1),
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const games  = interaction.client.activeGames;
    const bet    = interaction.options.getInteger('apuesta') ?? 0;

    if (games.has(`hol:${userId}`)) {
      return interaction.reply({ content: 'Ya tienes una partida activa. ¡Termínala primero!', ephemeral: true });
    }

    if (bet > 0) {
      const result = deductBalance(userId, bet);
      if (result === false) {
        const balance = getBalance(userId);
        return interaction.reply({
          content: `Saldo insuficiente. Tienes 🪙 **${balance.toLocaleString()}** monedas.`,
          ephemeral: true,
        });
      }
    }

    const state = startGame();
    state.bet   = bet;
    state.pot   = 0;
    games.set(`hol:${userId}`, state);

    const payload = buildPayload(state);
    await interaction.reply({ ...payload, components: [makeButtons(userId)] });
  },

  async handleButton(interaction) {
    const [, action, ownerId] = interaction.customId.split(':');
    const userId = interaction.user.id;

    if (userId !== ownerId) {
      return interaction.reply({ content: '¡Este no es tu juego!', ephemeral: true });
    }

    const games = interaction.client.activeGames;
    const state = games.get(`hol:${userId}`);

    if (!state) {
      return interaction.reply({ content: 'No tienes partida activa. Usa /higherorlower para empezar.', ephemeral: true });
    }

    // Cash out
    if (action === 'cashout') {
      games.delete(`hol:${userId}`);
      if (state.bet > 0 && state.pot > 0) addBalance(userId, state.pot);
      const payload = buildPayload(state, true, true);
      return interaction.update({ ...payload, components: [makeButtons(userId, true)] });
    }

    makeGuess(state, action);

    if (state.lastResult !== 'wrong' && state.bet > 0) {
      const earned = action === 'same' ? state.bet * 3 : state.bet;
      state.pot += earned;
    }

    const gameOver = state.status === 'finished';
    if (gameOver) {
      games.delete(`hol:${userId}`);
      // wrong answer: initial bet already deducted, pot forfeited
    }

    const payload = buildPayload(state, gameOver, false);
    await interaction.update({ ...payload, components: [makeButtons(userId, gameOver)] });
  },
};
