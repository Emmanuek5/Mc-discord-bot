const {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");
const {
  PermissionsBitField,
  GuildMember,
  EmbedBuilder,
  AttachmentBuilder,
  Colors,
  Message,
} = require("discord.js");
const { createListeningStream } = require("../../utils/createListeningStream");
const fs = require("fs");
const { sleep } = require("../../utils/functions");
const path = require("path");
const { createTranscription, getSummary } = require("../../utils/aiFunctions");
module.exports = {
  name: "transcribe",
  description: "Record your voice channel and summarize what was said",
  aliases: ["t"],
  usage: "transcribe ",
  required_permission: PermissionsBitField.Flags.Administrator.toString(),
  /**
   * A function to execute a series of actions for voice connection and recording.
   *
   * @param {Message} message - the message object
   * @param {array} args - the arguments array
   * @param {object} client - the client object
   * @return {Promise<void>} a promise representing the completion of the function
   */
  async execute(message, args, client) {
    const embed = new EmbedBuilder();

    let connection = getVoiceConnection(message.guild.id);

    if (!connection) {
      if (
        message.member instanceof GuildMember &&
        message.member.voice.channel
      ) {
        const channel = message.member.voice.channel;
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: false,
          selfMute: false,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        let resource = createAudioResource(
          "https://cdn.discordapp.com/attachments/1071848731911147651/1206705691948224642/recording.mp3?ex=65dcfb40&is=65ca8640&hm=ac305a5279608b43e5ee1065b6cf8c8ce2c6e665a2f39c09198abc73d86184af&",
          {
            inlineVolume: true,
          }
        );
        resource.volume.setVolume(2);
        player.play(resource);
        connection.subscribe(player);
      } else {
        await message.reply("Join a voice channel and then try that again!");
        return;
      }
    }

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
      const receiver = connection.receiver;
      embed.setTitle("Transcribing...");
      embed.setColor(Colors.Blue);
      embed.setDescription(
        `If u stop speaking for 5 seconds, the transcription will end.`
      );
      let m = await message.reply({ embeds: [embed] });
      const filename = await createListeningStream(receiver, message).then(
        async (filename) => {
          embed.setTitle("Recording Complete");
          embed.setDescription(`Transcribing and Summarizing what was said...`);
          embed.setColor(Colors.Blue);
          m.edit({ embeds: [embed] }).then(async (message) => {
            const ToText = await createTranscription(filename);
            const summary = ToText;
            embed.setTitle("Transcription Complete");
            embed.setColor(Colors.Green);
            embed.setDescription(` Here is the summary: \n ${summary}`);
            m.edit({ embeds: [embed] });
            fs.unlinkSync(filename);
          });
        }
      );
    } catch (error) {
      console.warn(error);
      await message.reply("Failed to record, please try again later!");
      return;
    }
  },
};
