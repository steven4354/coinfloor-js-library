var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var assetCodes = {
  XBT: 63488,
  GBP: 64032
};

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);

//the onConnect function is called when successfully authenticated
function onConnect(){
  coinfloor.watchTicker(assetCodes["XBT"], assetCodes["GBP"], true, function(msg){console.log(msg)});

  coinfloor.getBalances(function(msg){console.log(msg)})

  coinfloor.estimateBaseMarketOrder(assetCodes["XBT"], assetCodes["GBP"], 500, function(msg){
    console.log(msg);
  })
};

coinfloor.addEventListener("TickerChanged", function(msg){
  console.log("new ticker:");
  console.log(msg);
});
