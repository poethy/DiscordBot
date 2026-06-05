const {
  SlashCommandBuilder, EmbedBuilder, AttachmentBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { startGame, checkNaturals, playerHit, playerStand, playerDoubleDown } = require('../../utils/blackjackLogic');
const { handValue } = require('../../utils/deck');
const { renderBlackjack } = require('../../utils/cardRenderer');
const { getBalance, deductBalance, addBalance } = require('../../utils/economy');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeButtons(userId, canDouble, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`bj:hit:${userId}`)
      .setLabel('Hit')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`bj:stand:${userId}`)
      .setLabel('Stand')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`bj:double:${userId}`)
      .setLabel('Double Down')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled || !canDouble),
  );
}

const RESULT_COLOR = { player_win: 0x57F287, blackjack: 0xFEE75C, dealer_win: 0xED4245, push: 0x95A5A6 };
const RESULT_TEXT  = {
  player_win: '🎉 ¡Ganaste!',
  blackjack:  '🃏 ¡Blackjack!',
  dealer_win: '💀 El dealer gana.',
  push:       '🤝 Empate.',
};

function buildPayload(state, gameOver = false) {
  const color  = gameOver && state.result ? RESULT_COLOR[state.result] : 0x5865F2;
  const buffer = renderBlackjack(state.playerHand, state.dealerHand, !gameOver);
  const attach = new AttachmentBuilder(buffer, { name: 'game.png' });

  const playerVal = handValue(state.playerHand).value;
  const dealerVal = gameOver ? handValue(state.dealerHand).value : '?';

  const embed = new EmbedBuilder()
    .setTitle('♠ Blackjack')
    .setColor(color)
    .setImage('attachment://game.png')
    .addFields(
      { name: 'Tu mano',         value: `**${playerVal}**`, inline: true },
      { name: 'Mano del dealer', value: `**${dealerVal}**`, inline: true },
    );

  if (state.bet > 0) embed.addFields({ name: 'Apuesta', value: `🪙 ${state.bet.toLocaleString()}`, inline: true });
  if (state.doubled) embed.setFooter({ text: 'Double Down' });

  if (gameOver) {
    let desc = RESULT_TEXT[state.result] ?? 'Fin del juego.';
    if (state.bet > 0) {
      const gain = state.result === 'player_win'  ? state.bet
                 : state.result === 'blackjack'   ? Math.floor(state.bet * 1.5)
                 : state.result === 'push'         ? 0
                 : -state.bet;
      const sign = gain >= 0 ? '+' : '';
      desc += `\n${sign}🪙 ${gain.toLocaleString()} monedas`;
    }
    embed.setDescription(desc);
  }

  return { embeds: [embed], files: [attach] };
}

// ── Slash command ─────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Juega una partida de Blackjack contra el dealer.')
    .addIntegerOption(opt =>
      opt.setName('apuesta')
         .setDescription('Cantidad de monedas a apostar (opcional)')
         .setRequired(false)
         .setMinValue(1),
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const games  = interaction.client.activeGames;
    const bet    = interaction.options.getInteger('apuesta') ?? 0;

    if (games.has(`bj:${userId}`)) {
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

    const state   = startGame();
    state.bet     = bet;
    const natural = checkNaturals(state);

    if (natural) {
      // Immediate result — pay out now
      if (bet > 0) {
        if (state.result === 'blackjack')   addBalance(userId, bet + Math.floor(bet * 1.5));
        else if (state.result === 'push')   addBalance(userId, bet);
        // dealer_win: nothing returned
      }
      const payload = buildPayload(state, true);
      return interaction.reply(payload);
    }

    games.set(`bj:${userId}`, state);
    const payload = buildPayload(state, false);
    await interaction.reply({ ...payload, components: [makeButtons(userId, true)] });
  },

  async handleButton(interaction) {
    const [, action, ownerId] = interaction.customId.split(':');
    const userId = interaction.user.id;

    if (userId !== ownerId) {
      return interaction.reply({ content: '¡Este no es tu juego!', ephemeral: true });
    }

    const games = interaction.client.activeGames;
    const state = games.get(`bj:${userId}`);

    if (!state) {
      return interaction.reply({ content: 'No tienes partida activa. Usa /blackjack para empezar.', ephemeral: true });
    }
    if (state.status === 'finished') {
      games.delete(`bj:${userId}`);
      return interaction.reply({ content: 'Esa partida ya terminó.', ephemeral: true });
    }

    if (action === 'hit')    playerHit(state);
    if (action === 'stand')  playerStand(state);
    if (action === 'double') playerDoubleDown(state);

    const gameOver  = state.status === 'finished';
    const canDouble = !gameOver && state.playerHand.length === 2;

    if (gameOver) {
      games.delete(`bj:${userId}`);
      // Pay out
      if (state.bet > 0) {
        if (state.result === 'player_win') addBalance(userId, state.bet * 2);
        else if (state.result === 'push') addBalance(userId, state.bet);
        // loss: nothing returned
      }
    }

    const payload = buildPayload(state, gameOver);
    await interaction.update({ ...payload, components: [makeButtons(userId, canDouble, gameOver)] });
  },
};
