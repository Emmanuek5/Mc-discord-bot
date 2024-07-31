const { OpenAI } = require("openai");
const config = require("../config.json");
const openai = new OpenAI({
  apiKey: config.open_apikey,
});
const fs = require("fs");

/**
 * Create a transcription of the given audio file.
 *
 * @param {string} audioFilePath - the file path of the audio file
 * @return {Promise<string>} the transcribed text
 */
async function createTranscription(audioFilePath) {
  const audioFileStream = fs.createReadStream(audioFilePath);
  const res = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFileStream,
  });
  return res.text;
}

async function getSummary(text) {
  const system =
    "You are a helpful assistant. You summarize the text given to you and give the summary in 100 words or less explaining the key points. You will give the title, the summary and the key points and they should be properly annotated.";
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: system,
      },
      { role: "user", content: text },
    ],
  });
  return res.choices[0].message.content;
}

module.exports = {
  createTranscription,
  getSummary,
};
