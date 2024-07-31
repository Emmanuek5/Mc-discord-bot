const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  Client,
} = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "close_ticket",
  description: "Close a ticket",
  /**
   * Asynchronously executes the given interaction with the provided client.
   *
   * @param {import("discord.js").Interaction} interaction - The interaction to be executed
   * @param {Client} client - The client object
   * @return {Promise} A promise that resolves after the execution is complete
   */
  async execute(interaction, client) {
    const db = client.db;
    const config = client.config;
    const userIsTicketCreator = interaction.channel?.name.startsWith(
      `ticket-${interaction.user.username}`
    );
    const userIsAdmin = interaction.guild.members.cache
      .get(interaction.user.id)
      ?.permissions.has(PermissionsBitField.Flags.ManageChannels);

    // Only the ticket creator and an admin with "Manage Channels" permission can close the ticket
    if (userIsTicketCreator || userIsAdmin) {
      interaction.channel.delete();
      db.run("DELETE FROM tickets WHERE user_id = ? AND channel_id = ?", [
        interaction.user.id,
        interaction.channel.id,
      ]);

      interaction.reply({
        content: "Ticket closed successfully.",
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: "You don't have permission to close this ticket.",
        ephemeral: true,
      });
    }
  },
};
