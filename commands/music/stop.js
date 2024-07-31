module.exports = {
  name: "stop",
  description: "Stop the music",
  aliases: ["s"],
  async execute(message, args, client) {
    try {
      const player = client.manager.players.get(message.guild.id);
      if (!player) {
        return message.channel.send("No music is playing");
      }
      player.stop();
      return message.channel.send("Music has been stopped");
    } catch (error) {
      console.log(error);
    }
  },
};
