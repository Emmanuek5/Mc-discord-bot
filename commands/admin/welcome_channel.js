const fs = require("fs");
const path = require("path");
module.exports = {
  name: "welcome-channel",
  description: "Set welcome channel",
  aliases: ["wc"],
  usage: "welcome-channel <channel> || wc <channel>",
  required_permission: "ManageChannels",
  async execute(message, args, client) {
    const config = require("../../config.json");
    if (!args[0]) {
      return message.channel.send("Please mention a channel!");
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.channel.send("Please mention a valid channel!");
    }

    config.users.welcome_channel = channel.id;

    fs.writeFileSync(
      path.join(__dirname, "../../config.json"),
      JSON.stringify(config, null, 2)
    );

    message.channel.send(`Welcome channel set to ${channel}`);
  },
};
