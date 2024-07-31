const fs = require("fs");
const path = require("path");
module.exports = {
  name: "welcome-message",
  description: "Set welcome message",
  aliases: ["wm"],
  usage: "welcome-message <message> || wm <message>",
  required_permission: "ManageChannels",
  async execute(message, args, client) {
    const config = require("../../config.json");
    if (!args[0]) {
      return message.channel.send("Please provide a message!");
    }

    config.users.welcome_message = args.join(" ");

    fs.writeFileSync(
      path.join(__dirname, "../../config.json"),
      JSON.stringify(config, null, 2)
    );

    message.channel.send(`Welcome message set to ${args.join(" ")}`);
  },
};
