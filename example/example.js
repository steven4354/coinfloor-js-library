var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);

//the onConnect function is called when sucessfully authenticated
function onConnect(){
  coinfloor.watchTicker("XBT", "GBP", true, function(){});

  // coinfloor.getBalances(function(msg){
  //   console.log("balance received:");
  //   console.log(msg);
  //   console.log('\n');
  // });

  coinfloor.estimateBaseMarketOrder("XBT", "GBP", 0.05, function(msg){
    console.log(msg);
  })
};

// coinfloor.addEventListener("TickerChanged", function(msg){
//   console.log("new ticker:");
//   console.log(msg);
//   coinfloor.getOrders(function(msg){
//     console.log("orders:");
//     console.log(msg);
//     console.log('\n');
//   });
// });
