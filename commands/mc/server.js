const {
  MessageEmbed,
  EmbedBuilder,
  Colors,
  AttachmentBuilder,
} = require("discord.js");
const mcs = require("node-mcstatus");
const base64Img = require("base64-img");
const path = require("path");
const colours = require("../../utils/colours");

module.exports = {
  name: "server",
  description: "Get Information about the Minecraft Server or Any Other Server",
  usage: "server <ip> <port>",
  async execute(message, args, client) {
    let ip;
    let port;
    const config = require("../../config.json");
    if (!args[0] && !config.mc.ip) {
      return message.channel.send("Please provide an IP");
    }

    ip = args[0] || config.mc.ip;
    port = args[1] || config.mc.port || 25565;
    const embed = new EmbedBuilder();
    try {
      const status = await mcs.statusJava(ip, port, { query: true });

      // Convert the base64 image to a PNG file and save it
      const iconPath = await saveBase64Image(
        status.icon,
        "serverIcon-" + ip + "-" + port
      );

      const attacthment = new AttachmentBuilder()
        .setName("icon.png")
        .setFile(iconPath);
      embed
        .setColor(Colors.Green)
        .setTitle("Server Information")
        .setThumbnail("attachment://icon.png")
        .addFields(
          {
            name: "IP",
            value: ip,
          },
          {
            name: "Server Version",
            value: status.version.name_clean,
          },
          {
            name: "Players",
            value: `${status.players.online}/${status.players.max}`,
          },
          {
            name: "Server Motd",
            value: status.motd.clean,
          }
        );

      return message.channel.send({
        embeds: [embed],
        files: [attacthment],
      });
    } catch (error) {
      console.log(error);
      embed
        .setColor(Colors.Red)
        .setTitle("Failed to fetch server information")
        .setDescription(error.message);
      return message.channel.send({ embeds: [embed] });
    }
  },
};

// Function to save base64 image to a PNG file and return the file path
async function saveBase64Image(base64String, filename = "serverIcon.png") {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(__dirname, "../../data/icons/" + filename);
    base64Img.img(base64String, imagePath, filename, function (err, filepath) {
      if (err) {
        console.error("Error saving base64 image:", err);
        reject(err);
      } else {
        resolve(filepath);
      }
    });
  });
}
