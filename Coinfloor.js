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

	module.exports = Coinfloor = (function(){
		function Coinfloor(user_id, password, api_key){
			this.user_id = user_id;
			this.password = password;
			this.api_key = api_key;
			// this.url = "ws://api.coinfloor.co.uk/";


		}

		//set up websocket connection
		ws.on('open', function(){
			console.log('websocket connected to: ' + url);

			/**************/
			var request = {
				method: "WatchTicker",
				base: assetCodes["XBT"],
				counter: assetCodes["GBP"],
				watch:true
			};
			_do_request(request);
			/**************/

		});

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
		// Coinfloor.prototype.authenticate = function (callback) {
		// 	var packed_user_id = String.fromCharCode(0, 0, 0, 0, this.user_id >> 24 & 0xFF, this.user_id >> 16 & 0xFF, this.user_id >> 8 & 0xFF, this.user_id & 0xFF);
		// 	var client_nonce = sr.randomBuffer(16);
		//
		// 	//TODO: use ECDSA library here
		//
		// 	//create random private key
		// 	var privateKey = sr.randomBuffer(16);
		// 	var ck = new CoinKey(privateKey, true); // true => compressed public key / addresses
		//
		// 	var msg = new Buffer("hello world!", 'utf8');
		// 	var shaMsg = crypto.createHash('sha256').update(msg).digest();
		// 	var signature = ecdsa.sign(shaMsg, privateKey);
		// 	var isValid = ecdsa.verify(shaMsg, signature, ck.publicKey);
		// 	console.log(isValid); //true
		// 	console.log(ck);
		//
		// };

		/*
		 * Retrieves all available balances of the authenticated user.
		 */
		Coinfloor.prototype.getBalances = function (callback) {
			this._do_request({
				method: "GetBalances"
			}, callback);
		},

		/*
		 * Retrieves all open orders of the authenticated user.
		 */
		Coinfloor.prototype.getOrders = function (callback) {
			this._do_request({
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
			this._do_request({
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
			this._do_request({
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
			this._do_request({
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
			this._do_request({
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
			this._do_request({
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
			this._do_request({
				method: "CancelOrder",
				id: id
			}, callback);
		};

		/*
		 * Retrieves the trailing 30-day trading volume of the authenticated user
		 * in the specified asset.
		 */
		Coinfloor.prototype.getTradeVolume = function (asset, callback) {
			this._do_request({
				method: "GetTradeVolume",
				asset: asset
			}, callback);
		};

		/*
		 * Subscribes to (or unsubscribes from) the orders feed of the specified
		 * order book. Subscribing to feeds does not require authentication.
		 */
		Coinfloor.prototype.watchOrders =  function (base, counter, watch, callback) {
			this._do_request({
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
				base: base,
				counter: counter,
				watch: watch
			}, callback);
		};

		/*
		 * A user-supplied callback that is invoked when an available balance of
		 * the authenticated user has changed.
		 */
		this.onBalanceChanged = null;

		/*
		 * A user-supplied callback that is invoked when an order is opened. Only
		 * events pertaining to the authenticated user's own orders are reported to
		 * this callback unless the client is subscribed to the orders feed of an
		 * order book.
		 */
		this.onOrderOpened = null;

		/*
		 * A user-supplied callback that is invoked when two orders are matched
		 * (and thus a trade occurs). Only events pertaining to the authenticated
		 * user's own orders are reported to this callback unless the client is
		 * subscribed to the orders feed of an order book.
		 */
		this.onOrdersMatched = null;

		/*
		 * A user-supplied callback that is invoked when an order is closed. Only
		 * events pertaining to the authenticated user's own orders are reported to
		 * this callback unless the client is subscribed to the orders feed of an
		 * order book.
		 */
		this.onOrderClosed = null;

		/*
		 * A user-supplied callback that is invoked when a ticker changes. Events
		 * are reported to this callback only if the client is subscribed to the
		 * ticker feed of an order book.
		 */
		this.onTickerChanged = function(msg){console.log("ticker changed");};

		var eventHandlers = {
					TickerChanged: this.onTickerChanged,
					OrderClosed: this.onOrderClosed,
					OrdersMatched: this.onOrdersMatched,
					OrderOpened: this.onOrderOpened,
					BalanceChanged: this.onBalanceChanged
				};

		return Coinfloor;

	})();

}).call(this);
