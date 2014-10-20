var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);
// var coinfloor = new Coinfloor(1, "opensesame", "HGREqcILTz8blHa/jsUTVTNBJlg=", onConnect);


function onConnect(){
  coinfloor.watchTicker("XBT", "GBP", true, function(){});
};

coinfloor.addEventListener("TickerChanged", function(){console.log("ticker changed listener"); /*coinfloor.getBalances();*/});
// coinfloor.addEventListener("GetBalances", function(balances){console.log(balances);});
