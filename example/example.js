var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);

function onConnect(){
  console.log("Successfully authenticated");
  coinfloor.watchTicker("XBT", "GBP", true, function(){});
};

coinfloor.addEventListener("TickerChanged", function(msg){
  console.log("new ticker:");
  console.log(msg);
  coinfloor.getBalances(function(msg){
    console.log("balance received:");
    console.log(msg);
    console.log('\n');
  });
  coinfloor.getOrders(function(msg){
    console.log("orders:");
    console.log(msg);
    console.log('\n');
  });
});
