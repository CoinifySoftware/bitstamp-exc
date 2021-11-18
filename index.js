const _ = require('lodash');
const crypto = require('crypto');
const currencyHelper = require('@coinify/currency');
const async = require('async');
const { promisify } = require('util');
const errorCodes = require('./lib/error_codes.js');
const constants = require('./lib/constants.js');
const debugLogger = require('console-log-level');
const { v4: uuidv4 } = require('uuid');
const requestHelper = require('./lib/request_helper');

class Bitstamp {
  constructor({ key, secret, host, timeout, log }) {
    this.key = key;
    this.secret = secret;
    this.baseURL = host || 'https://www.bitstamp.net';
    this.log = log || debugLogger({ level: process.env.LOG_LEVEL });

    requestHelper.init({
      baseURL: this.baseURL,
      timeout: timeout || 5000
    });
  }

  getOrderBook(baseCurrency, quoteCurrency, callback) {
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

      const convertRawEntry = function convertRawEntry(entry) {
        return {
          price: parseFloat(entry[0]),
          baseAmount: currencyHelper.toSmallestSubunit(parseFloat(entry[1]), baseCurrency)
        };
      };

      const rawBids = res.bids || [];
      const rawAsks = res.asks || [];

      const orderBook = {
        baseCurrency: baseCurrency,
        quoteCurrency: quoteCurrency,
        bids: rawBids.map(convertRawEntry),
        asks: rawAsks.map(convertRawEntry)
      };

      return callback(null, orderBook);
    });
  }

  getTicker(baseCurrency, quoteCurrency, callback) {
    // First check if currency pair is supported
    const currencyPair = baseCurrency.toLowerCase() + quoteCurrency.toLowerCase();
    if (!constants.SUPPORTED_CURRENCY_PAIRS.includes(currencyPair)) {
      return callback(constructError('Currency pair not supported',
        errorCodes.MODULE_ERROR, null));
    }

    this._get(`v2/ticker/${currencyPair}`, function (err, res) {
      if (err) {
        return callback(err);
      }

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

      return callback(null, ticker);
    });
  }

  getBalance(callback) {
    this._post('v2/balance', null, function (err, res) {
      if (err) {
        return callback(err);
      }

      const balance = {
        available: {
          ETH: currencyHelper.toSmallestSubunit(res.eth_available, 'ETH'),
          BCH: currencyHelper.toSmallestSubunit(res.bch_available, 'BCH'),
          USD: currencyHelper.toSmallestSubunit(res.usd_available, 'USD'),
          BTC: currencyHelper.toSmallestSubunit(res.btc_available, 'BTC')
        },
        total: {
          ETH: currencyHelper.toSmallestSubunit(res.eth_balance, 'ETH'),
          BCH: currencyHelper.toSmallestSubunit(res.bch_balance, 'BCH'),
          USD: currencyHelper.toSmallestSubunit(res.usd_balance, 'USD'),
          BTC: currencyHelper.toSmallestSubunit(res.btc_balance, 'BTC')
        }
      };

      return callback(null, balance);
    });
  }

  getTrade(trade, callback) {
    if (!trade || !callback) {
      return callback(constructError('Trade object is a required parameter.', errorCodes.MODULE_ERROR, null));
    }

    // Extract from trade
    const { baseCurrency, quoteCurrency, raw } = trade;

    if (!baseCurrency || !quoteCurrency || !raw) {
      return callback(constructError('Trade object requires raw, baseCurrency and quoteCurrency provided',
        errorCodes.MODULE_ERROR, null));
    }

    // Extract from raw
    const { orderType, id } = raw;

    if (orderType !== constants.TYPE_SELL_ORDER && orderType !== constants.TYPE_BUY_ORDER) {
      return callback(constructError('Trade object must have a raw orderType parameter with value either \'sell\' or' +
        ' \'buy\'.', errorCodes.MODULE_ERROR, null));
    }

    this._post('v2/order_status', { id }, (err, res) => {
      if (err) {
        return callback(err);
      }

      try {
        const baseAmounts = res.transactions.map((tx) => {
          const baseAmount = currencyHelper.toSmallestSubunit(tx[baseCurrency.toLowerCase()], baseCurrency);
          return orderType === constants.TYPE_SELL_ORDER ? -baseAmount : baseAmount;
        });
        const quoteAmounts = res.transactions.map((tx) => {
          const quoteAmount = currencyHelper.toSmallestSubunit(tx[quoteCurrency.toLowerCase()], quoteCurrency);
          return orderType === constants.TYPE_BUY_ORDER ? -quoteAmount : quoteAmount;
        });

        const feeCurrency = 'USD'; // Fee is always USD for bitstamp
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
          raw: _.defaults(res, { id })
        };

        return callback(null, order);
      } catch(err) {
        return callback(err);
      }
    });
  }

  listTransactions(latestTransaction, callback) {
    /*
     * If latestTx is provided - create a date&time value to compare to, for a matching tx.
     *
     * Otherwise, create a date&time value from the UNIX epoch. This way the requests will be
     * iterated until the the response contains < 1000 objects, since in Bitstamp there cannot be transaction made
     * earlier. This way ALL transactions in the certain account will be returned.
     */
    const latestTxDate = latestTransaction ? new Date(latestTransaction.raw.datetime) : new Date(0);
    iterateRequestTxs(this, latestTxDate, (err, transactions) => {
      if (err) {
        return callback(err);
      }
      try {
        transactions = transactions.filter(tx => parseInt(tx.type) === constants.TYPE_DEPOSIT || parseInt(tx.type) === constants.TYPE_WITHDRAWAL);
        transactions = transactions.map(constructTransactionObject);
      } catch(err) {
        this.log.error({ err, transactionsRaw: JSON.stringify(transactions) }, 'Error parsing transactions');
        return callback(err);
      }
      return callback(null, transactions);
    });
  }

  async listTrades(latestTrade) {
    let latestTxDate = new Date(0);
    if (latestTrade) {
      const { raw } = latestTrade;
      if (raw.transactions) {
        latestTxDate = new Date(raw.transactions[0].datetime);
      } else {
        latestTxDate = new Date(latestTrade.raw.datetime);
      }
    }

    const iterateRequestTxsPromise = promisify(iterateRequestTxs);

    const transactions = (await iterateRequestTxsPromise(this, latestTxDate))
      .filter(tx => parseInt(tx.type) === constants.TYPE_MARKET_TRADE);

    return transactions.map( tx => {
      let baseCurrency = 'BTC',
        baseAmountMainUnit = tx.btc;

      // For ETH trades
      if (tx.eth_usd) {
        baseCurrency = 'ETH';
        baseAmountMainUnit = tx.eth;
      }

      // For BCH trades
      if (tx.bch_usd) {
        baseCurrency = 'BCH';
        baseAmountMainUnit = tx.bch;
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
        tradeTime: new Date(tx.datetime + ' UTC'),
        raw: tx
      };
    });
  }

  placeTrade(baseAmount, limitPrice, baseCurrency, quoteCurrency, callback) {
    // First check if currency pair is supported
    const currencyPair = baseCurrency.toLowerCase() + quoteCurrency.toLowerCase();
    if (!constants.SUPPORTED_CURRENCY_PAIRS.includes(currencyPair)) {
      return callback(constructError('Currency pair not supported',
        errorCodes.MODULE_ERROR, null));
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
    const amount = currencyHelper.fromSmallestSubunit(amountSubUnit, baseCurrency);
    const price = _.round(limitPrice, 2);

    /* Make the request */
    this._post(`v2/${orderType}/${currencyPair}`, { amount, price }, function (err, res) {
      if (err) {
        return callback(err);
      }

      /* Construct the custom trade response object */
      const trade = {
        baseAmount, baseCurrency, quoteCurrency,
        externalId: res.id.toString(),
        type: 'limit',
        state: 'open',
        limitPrice: price,
        raw: _.extend(res,
          {
            orderType: orderType
          })
      };

      /* All is well. Return the placed trade response */
      return callback(null, trade);
    });
  }

  async withdraw(args) {
    const { amount, currency, address } = args;

    if (!constants.SUPPORTED_WITHDRAW_CURRENCIES.includes(currency)) {
      throw constructError(`Withdrawals are not allowed for ${currency}`);
    }

    // Convert sub units to real units
    const amountRealUnit = currencyHelper.fromSmallestSubunit(amount, currency);

    // Construct request object
    const requestArgs = { address, amount: amountRealUnit, instant: 0 };

    const requestUrl = `v2/${currency.toLowerCase()}_withdrawal`;

    // Call API
    const { id: externalId } = await this._post(requestUrl, requestArgs);

    // Construct and return response
    return { externalId, state: constants.STATE_PENDING };
  }

  _get(action, callback) {
    const path = '/api/' + action + '/';

    const fn = requestHelper.get(path)
      .then(this._handleResponse)
      .catch(this._handleError);

    return callbackHelper(fn, callback);
  }

  _post(action, requestBody, callback) {
    if (typeof requestBody === 'function') {
      callback = requestBody;
    }

    if (!this.key || !this.secret) {
      return callback('Must provide key and secret to make this API request.');
    }

    const path = '/api/' + action + '/';
    const xAuth = `BITSTAMP ${this.key}`;

    const nonce = uuidv4();
    const timeInMillis = new Date().getTime();
    const apiVersion = 'v2';

    const method = 'POST';
    const host = new URL(this.baseURL).host;
    const query = '';

    const contentType = requestBody ? 'application/x-www-form-urlencoded' : ''; // empty if no request body
    const requestBodyString = requestBody ? new URLSearchParams(requestBody).toString() : '';
    const stringToSign = xAuth + method + host + path + query + contentType + nonce + timeInMillis + apiVersion + requestBodyString;

    const signer = crypto.createHmac('sha256', this.secret);
    const signature = signer.update(stringToSign).digest('hex').toUpperCase();

    const headers = {
      'Content-Type': contentType,
      'X-Auth-Version': apiVersion,
      'X-Auth-Timestamp': timeInMillis,
      'X-Auth-Nonce': nonce,
      'X-Auth-Signature': signature,
      'X-Auth': xAuth
    };

    const fn = requestHelper.post(path, requestBodyString, { headers })
      .then(this._handleResponse)
      .catch(this._handleError);

    return callbackHelper(fn, callback);
  }

  _handleResponse({ data }) {
    if (data.status === 'error') {
      throw constructError(`Error in result: ${JSON.stringify(data)}`,
        errorCodes.EXCHANGE_SERVER_ERROR, new Error(JSON.stringify(data)));
    }

    return data;
  }

  _handleError(err) {
    // Module errors - just throw
    if (err.code) {
      throw err;
    }

    const errorString = err.response && JSON.stringify(err.response.data) || err.message;
    throw constructError(`Error response: ${errorString}`, errorCodes.EXCHANGE_SERVER_ERROR, err);
  }

}

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
    self._post('v2/user_transactions', { limit: BITSTAMP_REQUEST_LIMIT, offset: offset, sort: 'desc' },
      function (err, res) {
        if (err) {
          continueIteration = false;
          return asyncCallback(err);
        }

        if (!Array.isArray(res)) {
          return callback(new Error(`Response from Bitstamp is not an array ${JSON.stringify(res)}`));
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
  // Find currency by looking at which amount is provided
  let currency;
  if (currentTx.usd && parseFloat(currentTx.usd) !== 0) {
    currency = 'USD';
  } else if (currentTx.eur && parseFloat(currentTx.eur) !== 0) {
    currency = 'EUR';
  } else if (currentTx.btc && parseFloat(currentTx.btc) !== 0) {
    currency = 'BTC';
  } else if (currentTx.eth && parseFloat(currentTx.eth) !== 0) {
    currency = 'ETH';
  } else if (currentTx.bch && parseFloat(currentTx.bch) !== 0) {
    currency = 'BCH';
  } else if (currentTx.usdc && parseFloat(currentTx.udsc) !== 0) {
    currency = 'USDC';
  }

  return {
    currency,
    amount: currencyHelper.toSmallestSubunit(parseFloat(currentTx[currency.toLowerCase()]), currency),
    // Convert externalId to string
    externalId: String(currentTx.id),
    // Convert timestamp string to ISO-8601 string (Add '+0' to force UTC interpretation of 'datetime')
    timestamp: new Date(currentTx.datetime + '+0').toISOString(),
    // Bitstamp doesn't have the concept of tx states, so they are always 'completed'
    state: constants.STATE_COMPLETED,
    type: parseInt(currentTx.type) === constants.TYPE_DEPOSIT ? 'deposit' : 'withdrawal',
    raw: currentTx
  };
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

function callbackHelper(p, callback) {
  if (typeof callback === 'function') {
    // use nodejs calling convention for callbacks
    p.then(result => {
      callback(null, result);
    }, err => {
      callback(err);
    });
  } else {
    return p;
  }
}

module.exports = Bitstamp;
