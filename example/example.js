var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);
// var coinfloor = new Coinfloor(1, "opensesame", "HGREqcILTz8blHa/jsUTVTNBJlg=", onConnect);


function onConnect(){
  console.log("Successfully authenticated");
  coinfloor.watchTicker("XBT", "GBP", true, function(){});
};

coinfloor.addEventListener("TickerChanged", function(msg){
  console.log("new ticker:");
  console.log(msg);
});
