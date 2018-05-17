const request = require('request'),
  _ = require('lodash'),
  crypto = require('crypto'),
  currencyHelper = require('@coinify/currency'),
  async = require('async'),
  {promisify} = require('util'),
  errorCodes = require('./lib/error_codes.js'),
  constants = require('./lib/constants.js');

/* =================   Constructor   ================= */

const Bitstamp = function (settings) {
  this.key = settings.key;
  this.secret = settings.secret;
  this.clientId = settings.clientId;
  this.host = settings.host || constants.HOST;
  this.timeout = settings.timeout || constants.REQUEST_TIMEOUT;
};

/* =================   Helper methods   ================= */

/**
 * A helper method to initialize a GET request with its options, and call the request.
 *
 * @param {string}  action  The API endpoint that is to be requested
 * @param callback
 */
Bitstamp.prototype._get = function (action, callback) {
  const path = '/api/' + action + '/';

  const options = {
    url: this.host + path,
    method: 'GET',
    timeout: this.timeout
  };

  this._request(options, callback);
};

/**
 * A helper method to initialize a POST request with its options and data to be passed, and call the request.
 *
 * @param {string}  action  The API endpoint that is to be requested
 * @param {object}  params  An object, containing the data to be passed with the POST request
 * @param callback
 */
Bitstamp.prototype._post = function (action, params, callback) {
  if (typeof params === 'function') {
    callback = params;
  }

  if (!this.key || !this.secret || !this.clientId)
  { return callback('Must provide key, secret and client ID to make this API request.'); }

  const path = '/api/' + action + '/';
  const nonce = new Date().getTime()*10;
  const message = nonce + this.clientId + this.key;
  const signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
  const signature = signer.update(message).digest('hex').toUpperCase();

  params = _.extend({
    key: this.key,
    signature: signature,
    nonce: nonce
  }, params);

  const options = {
    url: this.host + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: this.timeout,
    form: params
  };

  this._request(options, callback);
};

const REGEX_PATTERN_BUY_ERROR_INSUFFICIENT_FUNDS =
  /^You need \d+(\.\d+)? [A-Z]{3} to open that order. You have only \d+(\.\d+)? [A-Z]{3} available. Check your account balance for details.$/;
const REGEX_PATTERN_SELL_ERROR_INSUFFICIENT_FUNDS =
  /^You have only \d+(\.\d+)? [A-Z]{3} available. Check your account balance for details.$/;

/**
 * Performs the actual request, passed from the _get or _post helper methods.
 *
 * @param {object}      params      An object, containing data that is to be passed along with the request
 * @param {function}    callback    Returns the response from the exchange server or an error, if request-response fails
 */
Bitstamp.prototype._request = function (params, callback) {
  params = _.defaultsDeep({
    headers: {'User-Agent': 'Bitstamp Node.js API Client|(github.com/CoinifySoftware/bitstamp-exc.git)'}
  }, params);

  const requestFunction = function (err, res, body) {
    if (err || !body) {
      return callback(constructError('There is an error in the response from the Bitstamp service...',
        errorCodes.EXCHANGE_SERVER_ERROR, err));
    }
    if (res.error) {
      return callback(constructError('The exchange service responded with an error...',
        errorCodes.EXCHANGE_SERVER_ERROR, res.error));
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return callback(constructError('Could not understand response from exchange server.',
        errorCodes.MODULE_ERROR, e));
    }

    /* Error response was never received when making the GET request, and the API docs don't mention anything about
     * errors, so we can only assume that the error response from a GET request has the same structure as the one
     * from the POST request (which has been received while dev/testing and we know how it looks).
     * Therefore, the implementation is based on this assumption.
     */
    if (data.error) {
      let error = constructError('There is an error in the body of the response from the exchange service...',
        errorCodes.EXCHANGE_SERVER_ERROR, new Error(JSON.stringify(data.error)));

      /* Check for known errors */
      if ( data.error.__all__ ) {
        const allErrors = data.error.__all__;

        /* Check for insufficient funds */
        const insufficientFundsErrorMessage =
          _.find(allErrors, msg => REGEX_PATTERN_BUY_ERROR_INSUFFICIENT_FUNDS.test(msg)) ||
          _.find(allErrors, msg => REGEX_PATTERN_SELL_ERROR_INSUFFICIENT_FUNDS.test(msg));
        if ( insufficientFundsErrorMessage ) {
          error = constructError(insufficientFundsErrorMessage, errorCodes.INSUFFICIENT_FUNDS);
        }
      }

      return callback(error);
    }
    return callback(null, data);

  };

  if (params.method === 'GET') {
    return request.get(params, requestFunction);
  } else if (params.method === 'POST') {
    return request.post(params, requestFunction);
  }
  return callback(constructError('The request must be either POST or GET.', errorCodes.MODULE_ERROR, null));

};

/**
 * Make requests to fetch transactions, on chunks of 1000 objects (the response limit of Bitstamp),
 * iterate through each chunk and gather only the txs of type 'deposit' (type = 0) or 'withdrawal' (type = 1).
 * Return the constructed array of objects.
 *
 * If earliestDate is provided - check each tx whether it is newer than that and stop iteration
 * when not.
 * Otherwise, iterate until the response contains less than 1000 objects, which means this is the response which
 * contains the last transactions of the account.
 *
 * @param {Bitstamp}    self        Bitstamp module object
 * @param {earliestDate} date       The date from which to search onwards and return deposits
 * @param {function}    callback    Returns an array of user transactions as returned by bitstamp
 */
function iterateRequestTxs(self, earliestDate, callback) {
  const transactionsAll = [],
    responseLength = 1000;

  const BITSTAMP_REQUEST_LIMIT = 100;
  let continueIteration = true,
    offset = 0;

  /* The POST request function to be called arbitrary number of times in async.doWhilst() */
  const post = function (asyncCallback) {
    self._post('v2/user_transactions', {limit: BITSTAMP_REQUEST_LIMIT, offset: offset, sort: 'desc'},
      function (err, res) {
        if (err) {
          continueIteration = false;
          return asyncCallback(err);
        }

        res.every(function (tx) {
          const currentTxDateTime = new Date(tx.datetime);
          /* Check if the current transaction's timestamp is lower (further in the past) than earliest date allowed
           * If so, set the iteration flag to false and break the loop, so that the process terminates
           * and exits, and no more transactions are written in the global list of txs.
           */
          if (earliestDate > currentTxDateTime) {
            continueIteration = false;

            /* We need to break the loop, and `Array.prototype.every` stops on a returned `false` value */
            return false;
          }

          /* Add the transaction to the list of tx's to be returned */
          transactionsAll.push(tx);

          /* We need to continue the loop, and `Array.prototype.every` needs `true` to be returned, in
           * order to continue looping
           */
          return true;
        });

        if (res.length < BITSTAMP_REQUEST_LIMIT) {
          continueIteration = false;
        }
        offset += responseLength;

        return asyncCallback(err, transactionsAll);
      });
  };

  /* The check condition function for async.doWhilst() */
  const check = function () {
    return continueIteration;
  };

  /* The function to be called when the iteration cycle exits async.doWhilst() */
  const done = function (err, deposits) {
    if (err) {
      return callback(constructError('Trades could not be listed.',
        errorCodes.MODULE_ERROR, err));
    }

    return callback(null, deposits);
  };

  /* Start the iteration cycle */
  async.doWhilst(post, check, done);
}

/**
 * Converts a raw transaction object from the Bitstamp API response into an object with defined structure,
 * that is to be returned from this module.
 *
 * @param {object}  currentTx   The current transaction, from which to get data, to construct the final object
 *
 * @returns {object} tx         See the return parameter of iterateRequestTxs docs for more info
 */
function constructTransactionObject(currentTx) {
  const tx = {
    // Convert externalId to string
    externalId: String(currentTx.id),
    // Convert timestamp string to ISO-8601 string (Add '+0' to force UTC interpretation of 'datetime')
    timestamp: new Date(currentTx.datetime + '+0').toISOString(),
    // Bitstamp doesn't have the concept of tx states, so they are always 'completed'
    state: constants.STATE_COMPLETED,
    amount: 0,
    currency: '',
    type: parseInt(currentTx.type) === constants.TYPE_DEPOSIT ? 'deposit' : 'withdrawal',
    raw: currentTx
  };

  if (parseFloat(currentTx.btc) === 0) {
    tx.amount = currencyHelper.toSmallestSubunit(parseFloat(currentTx.usd), 'USD');
    tx.currency = 'USD';
  } else {
    tx.amount = currencyHelper.toSmallestSubunit(parseFloat(currentTx.btc), 'BTC');
    tx.currency = 'BTC';
  }

  return tx;
}

/**
 * Constructs and returns an Error node.js native object, attaches a message and a pre-declared error code to it,
 * and the original error data, if provided.
 * @param {string} message     Human readable error message
 * @param {string} errorCode   Machine readable error message code
 * @param {object} errorCause  The raw/original error data  that the system
 *                             responded with and provides detailed information about the cause of the error
 * @returns {Error}
 */
function constructError(message, errorCode, errorCause) {
  const error = new Error(message);
  error.code = errorCode;
  if (errorCause) {
    error.cause = errorCause;
  }

  return error;
}

/* =================   API endpoints exposed methods   ================= */

/**
 * Returns ticker data for a specified currency pair
 *
 * @param {string}      baseCurrency    The currency code (3 chars) of the the base currency of the exchange
 * @param {string}      quoteCurrency   The currency code (3 chars) of the quote currency of the exchange
 * @param {function}    callback        Returns the ticker information object:
 *                                      {
 *                                        "baseCurrency": "BTC",
 *                                        "quoteCurrency": "USD",
 *                                        "bid": 649.89,
 *                                        "ask": 650.12,
 *                                        "lastPrice": 649.97,
 *                                        "high24Hours": 652.55,
 *                                        "low24Hours": 634.98,
 *                                        "vwap24Hours": 647.37,
 *                                        "volume24Hours": 1234567890 // 12.3456789 BTC
 *                                      }
 */
Bitstamp.prototype.getTicker = function (baseCurrency, quoteCurrency, callback) {
  // First check if currency pair is supported
  const currencyPair = baseCurrency.toLowerCase() + quoteCurrency.toLowerCase();
  if (!constants.SUPPORTED_CURRENCY_PAIRS.includes(currencyPair)) {
    return callback(constructError('Currency pair not supported',
      errorCodes.MODULE_ERROR, null));
  }

  /*
   * Call the ticker endpoint
   */
  this._get(`v2/ticker/${currencyPair}`, function (err, res) {
    if (err) {
      return callback(err);
    }

    /*
     * Construct result object
     */
    const ticker = {
      baseCurrency: baseCurrency,
      quoteCurrency: quoteCurrency,
      bid: parseFloat(res.bid),
      ask: parseFloat(res.ask),
      lastPrice: parseFloat(res.last),
      high24Hours: parseFloat(res.high),
      low24Hours: parseFloat(res.low),
      vwap24Hours: parseFloat(res.vwap),
      volume24Hours: currencyHelper.toSmallestSubunit(parseFloat(res.volume), baseCurrency)
    };

    /*
     * Return result object
     */
    return callback(null, ticker);
  });
};

/**
 * Returns the current order book of Bitstamp in a custom organized look
 *
 * @param {string}      baseCurrency    The currency code (3 chars) of the the base currency of the exchange
 * @param {string}      quoteCurrency   The currency code (3 chars) of the quote currency of the exchange
 * @param {function}    callback        Returns the customized Order Book data object
 *          orderBook:
 *             {
 *              baseCurrency: "BTC", // The currency of baseAmount
 *              quoteCurrency: "USD", // The currency to determine the price <quoteCurrency>/baseCurrency>
 *              asks: [ // List of entries with bitcoins for sale, sorted by lowest price first
 *               {
 *                 price: 450.65,
 *                 baseAmount: 44556677 // 0.44556677 BTC for sale
 *               }
 *               // ... more ask entries
 *             ],
 *             bids: [ // List of entries for buying bitcoins, sorted by most highest price first
 *               {
 *                 price: 450.31,
 *                 baseAmount: 33445566 // Someone wants to buy 0.33445566 BTC
 *               }
 *               // ... more bid entries
 *             ]
 *           }
 */
Bitstamp.prototype.getOrderBook = function (baseCurrency, quoteCurrency, callback) {
  // First check if currency pair is supported
  const currencyPair = baseCurrency.toLowerCase() + quoteCurrency.toLowerCase();
  if (!constants.SUPPORTED_CURRENCY_PAIRS.includes(currencyPair)) {
    return callback(constructError('Currency pair not supported',
      errorCodes.MODULE_ERROR, null));
  }

  this._get(`v2/order_book/${currencyPair}`, function (err, res) {
    if (err) {
      return callback(err);
    }

    /* Declare the orderBook object with the currency pair */
    const orderBook = {
      baseCurrency: baseCurrency,
      quoteCurrency: quoteCurrency
    };

    /* Organize the Order Book values in a custom way */
    const convertRawEntry = function convertRawEntry(entry) {
      return {
        price: parseFloat(entry[0]),
        baseAmount: currencyHelper.toSmallestSubunit(parseFloat(entry[1]), baseCurrency)
      };
    };
    const rawBids = res.bids || [];
    const rawAsks = res.asks || [];

    /* Declare and assign the organized bids and asks to the orderBook object */
    orderBook.bids = rawBids.map(convertRawEntry);
    orderBook.asks = rawAsks.map(convertRawEntry);

    return callback(null, orderBook);
  });
};

/**
 * Returns the available and total balance amounts of the account.
 *
 * @param {function}    callback Returns the customized balance object
 *                      balance: {
 *                          available: {
 *                                  USD: <int subunit amount>,
 *                                  BTC: <int subunit amount>
 *                              }
 *                          total: {
 *                                  USD: <int subunit amount>,
 *                                  BTC: <int subunit amount>
 *                              }
 *                      }
 */
Bitstamp.prototype.getBalance = function (callback) {
  this._post('v2/balance', null, function (err, res) {
    if (err) {
      return callback(err);
    }

    const balance = {
      available: {
        ETH: currencyHelper.toSmallestSubunit(res.eth_available, 'ETH'),
        USD: currencyHelper.toSmallestSubunit(res.usd_available, 'USD'),
        BTC: currencyHelper.toSmallestSubunit(res.btc_available, 'BTC')
      },
      total: {
        ETH: currencyHelper.toSmallestSubunit(res.eth_balance, 'ETH'),
        USD: currencyHelper.toSmallestSubunit(res.usd_balance, 'USD'),
        BTC: currencyHelper.toSmallestSubunit(res.btc_balance, 'BTC')
      }
    };

    return callback(null, balance);
  });
};

/**
 * Fetches a trade object which contains the status and an array of the transactions to that trade.
 * Constructs and returns an object with trade currency pair and accummulated amounts from all transactions
 * of the trade.
 *
 * @param {object}  trade   An object that contains data about the trade to be fetched. Must have at least the
 *                          following structure:
 * trade:
 * {
 *    baseCurrency: 'BTC',
 *    quoteCurrency: 'USD,
 *    feeCurrency: 'USD',
 *    raw: {
 *        id: <int> the_trade_id,
 *        <string> order_type
 *        createTime: ISO-8601 timestamp
 *    },
 *
 * }
 * @param {function}    callback    Returns the found and customized trade object:
 *  {
 *    type: 'limit',
 *    state: 'closed',
 *    baseAmount: -200000000, // Sold 2.00000000 BTC...
 *    quoteAmount: 74526, // ... for 745.26 USD
 *    baseCurrency: 'BTC' // Currency of the baseAmount
 *    quoteCurrency: 'USD' // Currency of the quoteAmount
 *    feeAmount: 11, // We paid 0.11 USD to the exchange as commission for the order
 *    feeCurrency: 'USD', // Currency of the feeAmount
 *    raw: {}, // Exchange-specific object
 *  }
 */
Bitstamp.prototype.getTrade = function (trade, callback) {
  if (!trade || !callback) {
    return callback(constructError('Trade object is a required parameter.', errorCodes.MODULE_ERROR, null));
  }

  // Extract from trade
  const {baseCurrency, quoteCurrency, feeCurrency, raw} = trade;

  if (!baseCurrency || !quoteCurrency || !feeCurrency || !raw) {
    return callback(constructError('Trade object requires raw, baseCurrency, quoteCurrency and feeCurrency provided',
      errorCodes.MODULE_ERROR, null));
  }

  // Extract from raw
  const {orderType, id} = raw;

  if (orderType !== constants.TYPE_SELL_ORDER && orderType !== constants.TYPE_BUY_ORDER) {
    return callback(constructError('Trade object must have a raw orderType parameter with value either \'sell\' or' +
      ' \'buy\'.', errorCodes.MODULE_ERROR, null));
  }

  this._post('order_status', {id}, (err, res) => {
    if (err) {
      return callback(err);
    }

    const baseAmounts = res.transactions.map((tx) => {
      const baseAmount = currencyHelper.toSmallestSubunit(tx[baseCurrency.toLowerCase()], baseCurrency);
      return orderType === constants.TYPE_SELL_ORDER ? -baseAmount : baseAmount;
    });
    const quoteAmounts = res.transactions.map((tx) => {
      const quoteAmount = currencyHelper.toSmallestSubunit(tx[quoteCurrency.toLowerCase()], quoteCurrency);
      return orderType === constants.TYPE_BUY_ORDER ? -quoteAmount : quoteAmount;
    });

    const feeAmounts = res.transactions.map(tx => currencyHelper.toSmallestSubunit(tx.fee, feeCurrency));

    const order = {
      baseCurrency, quoteCurrency, feeCurrency,
      externalId: id.toString(),
      type: 'limit',
      state: res.status.toLowerCase() === 'finished' ? 'closed' : 'open',
      baseAmount: _.sum(baseAmounts),
      quoteAmount: _.sum(quoteAmounts),
      feeAmount: _.sum(feeAmounts),
      // Add ID to raw result
      raw: _.defaults(res, {id})
    };

    return callback(null, order);
  });
};

/**
 * Returns a list of transactions objects, starting from the latest one, descending, fetched from your Bitstamp
 * account.
 * If the `latestTransaction` is provided, then fetch the transactions from the provided one, onwards.
 * Otherwise, return ALL transactions.
 *
 * @param {object}      latestTransaction   The deposit object, onwards from which to start fetching deposits. Must have
 *                                          a 'datetime' attribute with a value of a valid Date format
 * @param {function}    callback            Returns the found transactions
 */
Bitstamp.prototype.listTransactions = function (latestTransaction, callback) {
  const self = this;
  /*
   * If latestTx is provided - create a date&time value to compare to, for a matching tx.
   *
   * Otherwise, create a date&time value from the UNIX epoch. This way the requests will be
   * iterated until the the response contains < 1000 objects, since in Bitstamp there cannot be transaction made
   * earlier. This way ALL transactions in the certain account will be returned.
   */
  const latestTxDate = latestTransaction ? new Date(latestTransaction.raw.datetime) : new Date(0);
  iterateRequestTxs(self, latestTxDate, (err, transactions) => {
    if (err) {
      return callback(err);
    }
    transactions = transactions.filter(tx => parseInt(tx.type) === constants.TYPE_DEPOSIT || parseInt(tx.type) === constants.TYPE_WITHDRAWAL);
    transactions = transactions.map(constructTransactionObject);
    return callback(null, transactions);
  });
};

/**
 * Returns a list of trade objects, starting from the latest one, descending, fetched from your Bitstamp
 * account.
 * If the `latestTrade` is provided, then fetch the transactions from the provided one, onwards.
 * Otherwise, return ALL trades.
 *
 * @param latestTrade
 * @returns {Promise} Resolves to an array of trades
 */
Bitstamp.prototype.listTrades = function (latestTrade) {
  let latestTxDate = new Date(0);
  if (latestTrade) {
    const {raw} = latestTrade;
    if (raw.transactions) {
      latestTxDate = new Date(raw.transactions[0].datetime);
    }
    else {
      latestTxDate = new Date(latestTrade.raw.datetime);
    }
  }

  const iterateRequestTxsPromise = promisify(iterateRequestTxs);
  return iterateRequestTxsPromise(this, latestTxDate)
    .then((transactions) => {
      // console.dir(transactions, {colors: true});
      transactions = transactions.filter(tx => parseInt(tx.type) === constants.TYPE_MARKET_TRADE);
      return transactions.map( tx => {
        let baseCurrency = 'BTC',
          baseAmountMainUnit = tx.btc;
        if (tx.eth_usd) {
          baseCurrency = 'ETH';
          baseAmountMainUnit = tx.eth;
        }

        return {
          baseCurrency,
          baseAmount: currencyHelper.toSmallestSubunit(parseFloat(baseAmountMainUnit), baseCurrency),
          externalId: tx.order_id.toString(),
          type: 'limit',
          state: 'closed',
          quoteCurrency: 'USD',
          quoteAmount: currencyHelper.toSmallestSubunit(parseFloat(tx.usd), 'USD'),
          feeCurrency: 'USD',
          feeAmount: currencyHelper.toSmallestSubunit(parseFloat(tx.fee), 'USD'),
          tradeTime: new Date(tx.datetime),
          raw: tx
        };
      });
    });
};

/**
 * Place a limit BUY or SELL trade (order), depending on the sign of the baseAmount provided.
 * SELL if amount is negative
 * BUY if amount is positive
 *
 * @param {int}         baseAmount      The amount in base currency to buy or sell on the exchange; If negative amount,
 *                                      place sell limit order. If positive amount, place buy limit order. Denominated in
 *                                      smallest sub-unit of the base currency
 * @param {number}       limitPrice      The minimum/maximum rate that you want to sell/buy for. If baseAmount is negative, this
 *                                      is the minimum rate to sell for. If baseAmount is positive, this is the maximum rate to
 *                                      buy for. limitPrice must always strictly positive
 * @param {string}      baseCurrency    The exchange's base currency. For Bitstamp it is always BTC
 * @param {string}      quoteCurrency   The exchange's quote currency. For Bitstamp it is always USD
 * @param {function}    callback        Returns the customized data object of the placed trade object data
 */
Bitstamp.prototype.placeTrade = function (baseAmount, limitPrice, baseCurrency, quoteCurrency, callback) {
  baseCurrency = baseCurrency.toUpperCase();
  quoteCurrency = quoteCurrency.toUpperCase();
  if (baseCurrency !== 'BTC' || quoteCurrency !== 'USD') {
    return callback(constructError('Base and Quote currencies should be BTC and USD, respectively', errorCodes.MODULE_ERROR, null));
  }
  if (baseAmount === undefined || typeof baseAmount !== 'number' || baseAmount === 0) {
    return callback(constructError('The base amount must be a number.', errorCodes.MODULE_ERROR, null));
  }
  if (limitPrice === undefined || typeof limitPrice !== 'number' || limitPrice < 0) {
    return callback(constructError('The limit price must be a positive number.', errorCodes.MODULE_ERROR, null));
  }

  /* Decide whether to place a BUY or a SELL trade */
  const orderType = baseAmount < 0 ? constants.TYPE_SELL_ORDER : constants.TYPE_BUY_ORDER;
  const amountSubUnit = orderType === constants.TYPE_SELL_ORDER ? baseAmount * -1 : baseAmount;

  /* The amount passed to the method is denominated in smallest sub-unit, but Bitstamp API requires
   * the amount to be in main-unit, so we convert it.
   */
  const amountMainUnit = currencyHelper.fromSmallestSubunit(amountSubUnit, 'BTC');

  /* Make the request */
  this._post(orderType, {amount: amountMainUnit, price: limitPrice}, function (err, res) {
    if (err) {
      return callback(err);
    }

    /* Construct the custom trade response object */
    const trade = {
      externalId: res.id.toString(),
      type: 'limit',
      state: 'open',
      baseAmount: baseAmount,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      limitPrice: limitPrice,
      raw: _.extend(res,
        {
          orderType: orderType
        })
    };

    /* All is well. Return the placed trade response */
    return callback(null, trade);
  });
};


/**
 * Withdraw money from the exchange
 *
 * @param  {object}  args
 * @param  {integer} args.amount   Amount to withdraw in subunits
 * @param  {string}  args.currency Currency of the amount
 * @param  {string}  args.address  Address to withdraw to (btc_address)
 * @return {Promise<object>}       Resolves in a object like this
 *                                 {
 *                                   externalId: 'asdba',
 *                                   state: 'pending'
 *                                 }
 */
Bitstamp.prototype.withdraw = async function(args) {
  const {amount, currency, address} = args;

  if (currency !== 'BTC') {
    throw constructError('Only BTC withdrawals are allowed');
  }

  // Convert sub units to real units
  const amountRealUnit = currencyHelper.fromSmallestSubunit(amount, currency);

  // Construct request object
  const requestArgs = {address, amount: amountRealUnit, instant: 0};

  // Transform request function to a promise function
  const postFn = promisify(this._post).bind(this);

  // Call API
  const {id: externalId} = await postFn('bitcoin_withdrawal', requestArgs);

  // Construct and return response
  return {externalId, state: constants.STATE_PENDING};
};

module.exports = Bitstamp;
