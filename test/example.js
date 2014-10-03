var Coinfloor = require('../coinfloor_api.js');
var credentials = require('./testCredentials.js');

var coinfloor = new Coinfloor(credentials.coinfloorID, credentials.password, credentials.api_key);


coinfloor.connect()
//coinfloor.authenticate;
