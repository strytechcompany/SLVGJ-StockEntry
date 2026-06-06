const bwipjs = require("bwip-js");

async function generateCode128PngDataUrl(text) {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: String(text ?? ""),
    scale: 3,
    height: 10,
    includetext: false,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });

  return `data:image/png;base64,${png.toString("base64")}`;
}

module.exports = { generateCode128PngDataUrl };

