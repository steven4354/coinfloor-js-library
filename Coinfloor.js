(function() {
	var SocketClient = require('ws');
	var ecdsa = require('ecdsa');
	var crypto = require('crypto');
	var sr = require('secure-random');

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

			//set up websocket connection
			ws.on('open', function(){
				var msg = JSON.parse(data);
				var nonce = msg.nonce;
				console.log('websocket connected to: ' + url);
				authenticate(user_id, password, api_key, nonce, function(){console.log("authenticated");})
				onConnect();
			});
		}

		/*
		 * add a listener for a message notice, to be called when this
		 * message is received
		 */
		Coinfloor.prototype.addEventListener = function(notice, handler){
			eventHandlers[notice] = handler;
		}

		/*
		 * On each message call the relevant event handler
		 */
		ws.on('message', function (data, flags) {
			var msg = JSON.parse(data);
			console.log(msg);
			var handler = eventHandlers[msg.notice];
			if(handler != null){
				handler(msg);
			}
		});

		function _do_request(request, callback){
			ws.send(JSON.stringify(request));
		};

		/*
		 * Authenticates as the specified user with the given authentication cookie
		 * and passphrase.
		 */
		function authenticate(user_id, password, api_key, server_nonce, callback) {
			// var packed_user_id = String.fromCharCode(0, 0, 0, 0, this.user_id >> 24 & 0xFF, this.user_id >> 16 & 0xFF, this.user_id >> 8 & 0xFF, this.user_id & 0xFF);
			// var client_nonce = sr.randomBuffer(16);
			//
			// //create random private key
			// var privateKey = sr.randomBuffer(16);
			// var ck = new CoinKey(privateKey, true); // true => compressed public key / addresses
			//
			// var msg = new Buffer("hello world!", 'utf8');
			// var shaMsg = crypto.createHash('sha256').update(msg).digest();
			// var signature = ecdsa.sign(shaMsg, privateKey);
			// var isValid = ecdsa.verify(shaMsg, signature, ck.publicKey);
			// console.log(isValid); //true
			// console.log(ck);

			_do_request({
				method: "Authenticate"
			}, callback);
		};

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
