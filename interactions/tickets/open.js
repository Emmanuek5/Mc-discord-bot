const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "open_ticket",
  description: "Open a ticket",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const db = client.db;
    const config = client.config;
    const userTickets = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM tickets WHERE user_id = ?",
        interaction.user.id,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (userTickets.length >= 3) {
      interaction.editReply({
        content:
          "You already have 3 open tickets. Please close one before opening a new one.",
        ephemeral: true,
      });
      return;
    }

    const categoryID = config.ticket_category;
    let category = interaction.guild.channels.cache.get(categoryID);
    if (!category) {
      category = await interaction.guild.channels.create({
        name: "ticket-category",
        type: ChannelType.GuildCategory,
      });

      category = interaction.guild.channels.cache.find(
        (c) => c.id === category.id
      );

      config.ticket_category = category.id;
      console.log(config);
      fs.writeFileSync(
        path.join(__dirname, "../../config.json"),
        JSON.stringify(config)
      );

      if (!category) {
        interaction.editReply({
          content: "Failed to create category",
          ephemeral: true,
        });
        return; // Stop execution if category creation fails
      }
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0,
      parent: config.ticket_category,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder().setTitle("Ticket").setDescription(
      `${interaction.user},This is your ticket, please wait for staff to respond. \n
         If you would like to close this ticket, please click the button below.`
    );
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Close Ticket")
        .setStyle("Danger")
        .setCustomId("close_ticket")
    );
    db.run("INSERT INTO tickets (user_id, channel_id) VALUES (?, ?)", [
      interaction.user.id,
      channel.id,
    ]);
    channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({
      content: `Your ticket has been created in ${channel}`,
      ephemeral: true,
    });
  },
};
