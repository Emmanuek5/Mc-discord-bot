const {
  PermissionsBitField,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

module.exports = {
  name: "ticket_button",
  description: "Create A Ticket Button For The Server",
  aliases: [],
  required_permission: PermissionsBitField.Flags.ManageChannels.toString(),
  execute(message, args, client) {
    // Convert the BigInt to a string
    const requiredPermissionString = this.required_permission.toString();

    const emebed = new EmbedBuilder()
      .setTitle("Ticket Creator")
      .setDescription(
        `Click the button below to open a ticket. \nWe will be with you shortly!`
      );
    emebed.setColor(Colors.Green);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open Ticket")
        .setStyle("Primary")
        .setCustomId("open_ticket")
    );

    message.channel.send({ embeds: [emebed], components: [row] });

    console.log(`Required Permission: ${requiredPermissionString}`);
  },
};
