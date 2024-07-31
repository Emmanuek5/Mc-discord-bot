const fs = require("fs");
class Swearwords {
  constructor(filepath) {
    this.swearwords = [];
    this.filepath = filepath;
    this.load();
  }

  load() {
    const fs = require("fs");
    const swearwords = fs.readFileSync(this.filepath, "utf8").split("\n");
    swearwords.forEach((word) => {
      this.swearwords.push(word.toLowerCase().replace(/\s/g, ""));
    });
  }

  isSwear(word) {
    for (let i = 0; i < this.swearwords.length; i++) {
      if (this.swearwords[i] === word) {
        return true;
      }
    }
  }

  clear() {
    this.swearwords = [];
  }

  add(word) {
    fs.writeFileSync(this.filepath, this.swearwords.join("\n"));
  }
}

module.exports = Swearwords;
