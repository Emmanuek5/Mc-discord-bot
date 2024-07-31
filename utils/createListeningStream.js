const { createWriteStream } = require("fs");
const { pipeline } = require("stream");
const { EndBehaviorType, VoiceReceiver } = require("@discordjs/voice");
const prism = require("prism-media");
const path = require("path");
const fs = require("fs");

function createListeningStream(receiver, message) {
  return new Promise((resolve, reject) => {
    const opusStream = receiver.subscribe(message.author.id, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 5000,
      },
    });

    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000,
      }),
      pageSizeControl: {
        maxPackets: 10,
      },
    });

    const filename = `./data/recordings/${Date.now()}-${
      message.channel.id
    }.mp3`;

    if (!fs.existsSync(filename)) {
      fs.mkdirSync(path.dirname(filename), { recursive: true });
    }
    const out = createWriteStream(filename);

    pipeline(opusStream, oggStream, out, (err) => {
      if (err) {
        console.warn(`❌ Error recording file ${filename} - ${err.message}`);
        reject(err);
      } else {
        resolve(filename);
      }
    });
  });
}

module.exports = { createListeningStream };
