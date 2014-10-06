var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);

function onConnect(){
  coinfloor.watchTicker("XBT", "GBP", true, function(){});
  // coinfloor.getBalances();
};

coinfloor.addEventListener("TickerChanged", function(){console.log("ticker changed listener");});
