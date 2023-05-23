import tokenTracker from "./utils/token-tracker.js";
import { readFile } from 'fs/promises';
const tokensToTrack = JSON.parse(await readFile(new URL('./tokensTracked.json', import.meta.url)));
// import coingecko from "./utils/coingecko";
import dexIndexer from "./utils/dex-indexer.js";
import tzkt from "./utils/tzkt.js";
import fs from "fs";
import ejs from "ejs";

// format number to US dollar
let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const tokens = [];

try {
    const allTokensMetadata = await dexIndexer.getAllTokens();
    const xtzUsd = await tzkt.getXtzUsdPrice();
    const xtzUsdHistory = await tzkt.getXtzUsdHistory();

    const tokenFeed = await tokenTracker.getTokenFeed(xtzUsd, xtzUsdHistory);
    console.log(tokenFeed)
    
    for (let i = 0; i < tokensToTrack.length; i++) {
      const value = tokensToTrack[i];
      value.id = `${value.tokenAddress}_${value.tokenId || 0}`;

      const tokenData = value;
      const token = await tokenTracker.calculateTokenData(
        tokenData,
        tokenFeed,
        allTokensMetadata,
        xtzUsd
      );

      if (token) {
        tokens.push({
          ...token,
        });
      }
    }
  } catch (error) {
    console.log(error);
}
function compare( a, b ) {
    if ( a.mktCapUsd < b.mktCapUsd ){
    return 1;
    }
    if ( a.mktCapUsd > b.mktCapUsd ){
    return -1;
    }
    return 0;
}

tokens.sort(compare)

tokens.map(token => {
    token.volume24Usd = USDollar.format(Math.round(token.volume24Usd * 100) / 100);
    token.usdValue = USDollar.format(Math.round(token.usdValue * 100) / 100);
    token.mktCapUsd = USDollar.format(Math.round(token.mktCapUsd * 100) / 100);
    token.change7DayUsdPercent = Math.round(token.change7DayUsd * 100) / 100;
})

// Get the date
function getOrdinalSuffix(day) {
  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = day % 10;
  const suffixIndex = lastDigit <= 3 ? lastDigit : 0;
  return suffixes[suffixIndex];
}

const currentDate = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthIndex = currentDate.getMonth();
const monthName = monthNames[monthIndex];
const day = currentDate.getDate();
const year = currentDate.getFullYear();
const formattedDate = `${monthName} ${day}${getOrdinalSuffix(day)}, ${year}`;

console.log(tokens)
const topTokens = tokens.slice(0,10);
const logoSrc = "https://drive.google.com/uc?export=view&id=1pwJPYxQOeX9txlv9r09qqEgmKCHbV6nD"
ejs.renderFile('campaign.ejs', { logoSrc, topTokens, formattedDate }, (err, html) => {
    if (err) throw err;

    // Write the HTML to a file
    fs.writeFile('campaign.html', html, (err) => {
      if (err) throw err;
      console.log('HTML file written');
    });
});

