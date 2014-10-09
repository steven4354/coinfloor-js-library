(function() {
	var SocketClient = require('ws');
	var crypto = require('crypto');
	var sr = require('secure-random');
	var ecp = require('./ecp.js');

	var assetCodes = {
		XBT: 63488,
		GBP: 64032
	};

	var url = "ws://api.coinfloor.co.uk/";

	var ws = new SocketClient(url);

	var eventHandlers = Object();

	module.exports = Coinfloor = (function(){
		function Coinfloor(user_id, password, api_key, onConnect){
			this.user_id = user_id;
			this.password = password;
			this.api_key = api_key;

			/*
			 * set up websocket connection
			 */
			ws.on('open', function(data){
				console.log('websocket connected to: ' + url);
				onConnect();
			});

			/*
			 * On each message call the relevant event handler
			 */
			ws.on('message', function (data, flags) {
				var msg = JSON.parse(data);
				console.log(msg);

				//if it is the welcome message then call authenticate function
				if(String(msg.notice).indexOf("Welcome") > -1){
					authenticate(user_id, password, api_key, /*msg.nonce*/ "azRzAi5rm1ry/l0drnz1vw==", function(err, res){
						if(err){
							throw(err);
						} else {
							console.log("Successfully Authenticated. Response: " + res);
						}
					});
				}

				var handler = eventHandlers[msg.notice];
				if(handler != null){
					handler(msg);
				} else {
					console.log("No handler function for notice: '" + msg.notice + "'");
				}

			});

		}

		function _do_request(request, callback){
			ws.send(JSON.stringify(request), callback);
		};

		/*
		 * Authenticates as the specified user with the given authentication cookie
		 * and passphrase.
		 */
		function authenticate(user_id, password, cookie, server_nonce, callback) {
			var passwordBuf = new Buffer(password, 'utf8');
			var user_idBuf = new Buffer(String.fromCharCode(0, 0, 0, 0, user_id >> 24 & 0xFF, user_id >> 16 & 0xFF, user_id >> 8 & 0xFF, user_id & 0xFF));

			var server_nonceBuf = new Buffer(server_nonce, 'base64');
			var client_nonceBuf = new Buffer("8IyYyvH9gujOqYJdv/BP0A==", 'base64'); //sr.randomBuffer(16);

			//generate digest to sign with private key: a SHA224 hash of the userid, the server nonce and the client nonce
			var msg = Buffer.concat([user_idBuf, server_nonceBuf, client_nonceBuf]);
			var msgDigest = crypto.createHash('sha224').update(msg).digest();

			//generate private key: a SHA224 hash of the password and packed user id
			var privateKeySeed = Buffer.concat([user_idBuf, passwordBuf]);
			var privateKey = crypto.createHash('sha224').update(privateKeySeed).digest();

			console.log('msg to sign: ' + msg.toString('hex'));
			console.log('private key: ' + privateKey.toString('hex'));

			// generate signature: sign the digest with the private key
			var signature = ecp.signECDSA(msgDigest, privateKey);

			var r = new Buffer(signature.r);
			var s = new Buffer(signature.s);

			var correctR = "P7d6nXtbKmggnnb2hyB4xXkTQNWYmFSto6tzXg==";

			console.log('actual length: ' + s.toString('base64').length);
			console.log('required length: ' + correctR.length);

			var request = {
					"tag": 1,
					"method": "Authenticate",
					"user_id": user_id,
					"cookie": cookie,
					"nonce": client_nonceBuf.toString('base64'),
					"signature": [ r.toString('base64'), s.toString('base64') ]
			};
			console.log(request);
			// _do_request(request, callback);
		};

		/*
		* add a listener for a message notice, to be called when this
		* message is received
		*/
		Coinfloor.prototype.addEventListener = function(notice, handler){
			eventHandlers[notice] = handler;
		}

		/*
		 * Retrieves all available balances of the authenticated user.
		 */
		Coinfloor.prototype.getBalances = function (callback) {
			_do_request({
				method: "GetBalances"
			}, callback);
		},

		/*
		 * Retrieves all open orders of the authenticated user.
		 */
		Coinfloor.prototype.getOrders = function (callback) {
			_do_request({
				method: "GetOrders"
			}, callback);
		};

		/*
		 * Estimates the total (in units of the counter asset) for a market order
		 * trading the specified quantity (in units of the base asset). The
		 * quantity should be positive for a buy order or negative for a sell
		 * order.
		 */
		Coinfloor.prototype.estimateBaseMarketOrder = function (base, counter, quantity, callback) {
			_do_request({
				method: "EstimateMarketOrder",
				base: base,
				counter: counter,
				quantity: quantity
			}, callback);
		};

		/*
		 * Estimates the quantity (in units of the base asset) for a market order
		 * trading the specified total (in units of the counter asset). The total
		 * should be positive for a buy order or negative for a sell order.
		 */
		Coinfloor.prototype.estimateCounterMarketOrder = function (base, counter, total, callback) {
			_do_request({
				method: "EstimateMarketOrder",
				base: base,
				counter: counter,
				total: total
			}, callback);
		};

		/*
		 * Places a limit order to trade the specified quantity (in units of the
		 * base asset) at the specified price or better. The quantity should be
		 * positive for a buy order or negative for a sell order. The price should
		 * be pre-multiplied by 10000.
		 */
		Coinfloor.prototype.placeLimitOrder = function (base, counter, quantity, price, callback) {
			_do_request({
				method: "PlaceOrder",
				base: base,
				counter: counter,
				quantity: quantity,
				price: price
			}, callback);
		};

		/*
		 * Executes a market order to trade up to the specified quantity (in units
		 * of the base asset). The quantity should be positive for a buy order or
		 * negative for a sell order.
		 */
		Coinfloor.prototype.executeBaseMarketOrder = function (base, counter, quantity, callback) {
			_do_request({
				method: "PlaceOrder",
				base: "GBP",
				counter: counter,
				quantity: quantity
			}, callback);
		};

		/*
		 * Executes a market order to trade up to the specified total (in units of
		 * the counter asset). The total should be positive for a buy order or
		 * negative for a sell order.
		 */
		Coinfloor.prototype.executeCounterMarketOrder = function (base, counter, total, callback) {
			_do_request({
				method: "PlaceOrder",
				base: base,
				counter: counter,
				total: total
			}, callback);
		},

		/*
		 * Cancels the specified open order.
		 */
		Coinfloor.prototype.cancelOrder = function (id, callback) {
			_do_request({
				method: "CancelOrder",
				id: id
			}, callback);
		};

		/*
		 * Retrieves the trailing 30-day trading volume of the authenticated user
		 * in the specified asset.
		 */
		Coinfloor.prototype.getTradeVolume = function (asset, callback) {
			_do_request({
				method: "GetTradeVolume",
				asset: asset
			}, callback);
		};

		/*
		 * Subscribes to (or unsubscribes from) the orders feed of the specified
		 * order book. Subscribing to feeds does not require authentication.
		 */
		Coinfloor.prototype.watchOrders =  function (base, counter, watch, callback) {
			_do_request({
				method: "WatchOrders",
				base: base,
				counter: counter,
				watch: watch
			}, callback);
		};

		/*
		 * Subscribes to (or unsubscribes from) the ticker feed of the specified
		 * order book. Subscribing to feeds does not require authentication.
		 */
		Coinfloor.prototype.watchTicker = function (base, counter, watch, callback) {
			_do_request({
				method: "WatchTicker",
				base: assetCodes[base],
				counter: assetCodes[counter],
				watch: watch
			}, callback);
		};

		return Coinfloor;

	})();

}).call(this);
