const { getFilters } = require("ytsr");

const pkg = {
  Ytsr: require("ytsr"),
};

async function ytsrSearch(search) {
  const srF1 = await pkg.Ytsr.getFilters(search);
  const srF = srF1.get("Type").get("Video");
  const sr = await pkg.Ytsr(srF.url);

  console.log(sr)
  // console.log(sr)
};

ytsrSearch("Goularte")
