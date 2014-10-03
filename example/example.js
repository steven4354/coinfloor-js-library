var Coinfloor = require('../Coinfloor.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key, onConnect);

var onTickerChanged = function(){console.log("ticker changed listener");};

function onConnect(){
  coinfloor.watchTicker("XBT", "GBP", true, function(){});
  // coinfloor.onTickerChanged = onTickerChanged;
  coinfloor.addEventListener("TickerChanged", onTickerChanged);
};



// coinfloor.watchTicker("XBT", "GBP", true, function(){});

// coinfloor.getTicker(function(err, res){
//     if(err) throw(err);
//
//     console.log(res);
// });
