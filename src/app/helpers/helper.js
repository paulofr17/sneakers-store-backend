const fs = require("fs");
const path = require("path");

module.exports = {
  bytesToBase64(bytesImage) {
    return "data:image/png;base64," + bytesImage.toString("base64");
  },
  imagePathToBytes(imagePath) {
    const base64Image = fs
      .readFileSync(path.resolve(__dirname, imagePath))
      .toString("base64");
    return Buffer.from(base64Image, "base64");
  },
};
