module.exports = {
  name: "ping",
  description: "Ping Pong!",
  execute(message, args) {
    //claculate ping and send
    const ping = Date.now() - message.createdTimestamp;

    // Send ping
    message.channel.send(`Ping: ${ping}ms`);
  },
};
