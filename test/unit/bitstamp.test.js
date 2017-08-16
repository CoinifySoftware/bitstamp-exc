var sinon = require('sinon'),
  request = require('request'),
  responses = require('./../responses.js'),
  should = require('chai').should(),
  expect = require('chai').expect,
  exchange = require('../../index.js'),
  constants = require('../../lib/constants.js'),
  errorCodes = require('../../lib/error_codes.js');

describe('Bitstamp Exchange Service Tests ->', function () {
  var bitstamp = new exchange({
    key: "apikey",
    secret: "apisecret",
    clientId: "clientId",
    host: "http://localhost:3000"
  });

  /* =================   Testing response data consistency   ================= */

  describe('Get Ticker endpoint', function () {

    before(function (done) {
      sinon.stub(request, 'get').yields(null, {}, JSON.stringify(responses.getTickerResponse));
      done();
    });

    after(function (done) {
      request.get.restore();
      done();
    });

    it('correctly parses the ticker data', function (done) {
      bitstamp.getTicker('BTC', 'USD', function (err, ticker) {
        if (err) {
          return done(err);
        }

        expect(request.get.calledOnce).to.equal(true);
        expect(ticker).to.be.an('object');

        expect(ticker).to.have.property('baseCurrency');
        expect(ticker).to.have.property('quoteCurrency');
        expect(ticker).to.have.property('bid');
        expect(ticker).to.have.property('ask');
        expect(ticker).to.have.property('lastPrice');
        expect(ticker).to.have.property('high24Hours');
        expect(ticker).to.have.property('low24Hours');
        expect(ticker).to.have.property('vwap24Hours');
        expect(ticker).to.have.property('volume24Hours');

        expect(ticker.baseCurrency).to.equal('BTC');
        expect(ticker.quoteCurrency).to.equal('USD');

        expect(ticker.bid).to.equal(596.09);
        expect(ticker.ask).to.equal(596.11);
        expect(ticker.lastPrice).to.equal(596.09);
        expect(ticker.high24Hours).to.equal(597.53);
        expect(ticker.low24Hours).to.equal(579.43);
        expect(ticker.vwap24Hours).to.equal(586.35);
        expect(ticker.volume24Hours).to.equal(359669846615);

        done();
      });
    })

  });

  /* GET ORDER BOOK */
  describe('Get Order Book endpoint', function () {
    before(function (done) {
      sinon.stub(request, 'get').yields(null, {}, JSON.stringify(responses.getOrderBookResponse));
      done();
    });

    after(function (done) {
      request.get.restore();
      done();
    });

    it('gets the order book, duuuuh...', function (done) {
      bitstamp.getOrderBook('btc', 'uSD', function (err, result) {
        if (err) {
          return done(err);
        }

        request.get.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result.baseCurrency).to.equal('BTC');
        expect(result.quoteCurrency).to.equal('USD');

        expect(result).to.have.property('asks');
        expect(result).to.have.property('bids');

        expect(result.asks[0].price).to.equal(404);
        expect(result.asks[0].baseAmount).to.equal(1967704402);
        expect(result.asks[1].price).to.equal(404.39);
        expect(result.asks[1].baseAmount).to.equal(736300000);

        expect(result.bids[0].price).to.equal(403.53);
        expect(result.bids[0].baseAmount).to.equal(81383821);
        expect(result.bids[1].price).to.equal(403.35);
        expect(result.bids[1].baseAmount).to.equal(161018019);

        done();
      });
    });
  });

  /* GET BALANCE */
  describe('Get Balance endpoint', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getBalanceResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('gets the balance of the account', function (done) {
      bitstamp.getBalance(function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result).to.have.property('available');
        expect(result).to.have.property('total');
        expect(result.available.USD).to.equal(4900);
        expect(result.available.BTC).to.equal(10000069);

        expect(result.total.USD).to.equal(5100);
        expect(result.total.BTC).to.equal(12345678);

        done();
      });
    });
  });

  /* GET TRADE - sell */
  describe('Get Trade endpoint - SELL order', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeSellResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    var trade = {
      raw: {
        id: 108670705,
        orderType: 'sell'
      },
      createTime: '2015-09-03 11:40:46'
    };
    it('gets the requested sell trade', function (done) {
      bitstamp.getTrade(trade, function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result.id).to.be.an('undefined');
        expect(result.externalId).to.be.a('string');
        expect(result.externalId).to.equal(trade.raw.id.toString());
        expect(result.type).to.equal('limit');
        expect(result.state).to.equal('closed');
        expect(result.baseAmount).to.equal(-2029780550);
        expect(result.baseCurrency).to.equal('BTC');
        expect(result.quoteAmount).to.equal(514075);
        expect(result.quoteCurrency).to.equal('USD');
        expect(result.feeAmount).to.equal(1928);
        expect(result.feeCurrency).to.equal('USD');
        // Raw ID from raw input trade should be echoed back in raw output
        expect(result.raw.id).to.equal(trade.raw.id);
        expect(result.raw).to.have.property('status');
        expect(result.raw).to.have.property('transactions');
        expect((result.raw.transactions).length).to.equal(2);

        done();
      });
    });
  });

  /* GET TRADE - buy */
  describe('Get Trade endpoint - BUY order', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    var trade = {
      raw: {
        id: 108670705,
        orderType: 'buy',
        datetime: '2015-09-03 11:40:46'
      }
    };
    it('gets the requested buy trade', function (done) {
      bitstamp.getTrade(trade, function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result).to.have.property('baseAmount');
        expect(result.externalId).to.be.a('string');
        expect(result.externalId).to.equal(trade.raw.id.toString());
        expect(result.baseAmount).to.equal(2029780550);
        expect(result.quoteAmount).to.equal(-514075);
        expect(result.feeAmount).to.equal(1928);
        // Raw ID from raw input trade should be echoed back in raw output
        expect(result.raw.id).to.equal(trade.raw.id);
        expect((result.raw.transactions).length).to.equal(2);

        done();
      });
    });
  });

  /* GET TRANSACTIONS - all */
  describe('List Transactions endpoint - ALL, with NULL argument for lastTx', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.listTransactionsResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('gets all transactions that exist in the Bitstamp account', function (done) {
      bitstamp.listTransactions(null, function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('array');

        expect(result.length).to.equal(3);

        expect(result[0].id).to.be.an('undefined');
        expect(result[0].externalId).to.equal('10609931');
        expect(result[0].timestamp).to.equal('2016-02-15T12:25:49.000Z');
        expect(result[0].state).to.equal('completed');
        expect(result[0].amount).to.equal(10000000);
        expect(result[0].currency).to.equal('BTC');
        expect(result[0].type).to.equal('deposit');
        expect(result[0]).to.have.property('raw');
        expect(result[0].createTime).to.be.an('undefined');

        expect(result[1].id).to.be.an('undefined');
        expect(result[1].externalId).to.equal('9214142');
        expect(result[1].timestamp).to.equal('2015-09-03T11:40:46.000Z');
        expect(result[1].state).to.equal('completed');
        expect(result[1].amount).to.equal(-1300000000);
        expect(result[1].currency).to.equal('BTC');
        expect(result[1].type).to.equal('withdrawal');
        expect(result[1]).to.have.property('raw');
        expect(result[1].createTime).to.be.an('undefined');

        done();
      });
    });
  });

  /* GET TRANSACTIONS - from lastTx given */
  describe('List Transactions endpoint - from lastTx', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.listTransactionsResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    var latestTransaction = {
      raw: {
        id: 9214142,
        datetime: '2015-09-03 11:40:46'
      }
    };
    it('gets transactions after the lastTx provided, including', function (done) {
      bitstamp.listTransactions(latestTransaction, function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('array');

        expect(result.length).to.equal(2);

        expect(result[0].id).to.be.an('undefined');
        expect(result[0].externalId).to.equal('10609931');
        expect(result[0].timestamp).to.equal('2016-02-15T12:25:49.000Z');
        expect(result[0].state).to.equal('completed');
        expect(result[0].amount).to.equal(10000000);
        expect(result[0].currency).to.equal('BTC');
        expect(result[0].type).to.equal('deposit');
        expect(result[0]).to.have.property('raw');
        expect(result[0].createTime).to.be.an('undefined');

        expect(result[1].id).to.be.an('undefined');
        expect(result[1].externalId).to.equal('9214142');
        expect(result[1].timestamp).to.equal('2015-09-03T11:40:46.000Z');
        expect(result[1].state).to.equal('completed');
        expect(result[1].amount).to.equal(-1300000000);
        expect(result[1].currency).to.equal('BTC');
        expect(result[1].type).to.equal('withdrawal');
        expect(result[1]).to.have.property('raw');
        expect(result[1].createTime).to.be.an('undefined');

        done();
      });
    });
  });

  /* GET Trades - all */
  describe('List Trades endpoint - ALL, with NULL argument for lastTrade', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.listTransactionsResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('gets all trades that exist in the Bitstamp account', function () {
      return bitstamp.listTrades(null)
      .then((result) => {
        request.post.called.should.be.equal(true);
        result.should.be.an('array');

        expect(result.length).to.equal(3);

        expect(result[0]).to.deep.equal({
          baseAmount: 4906037,
          baseCurrency: "BTC",
          externalId: "24870681",
          feeAmount: 14,
          feeCurrency: "USD",
          quoteAmount: -12437,
          quoteCurrency: "USD",
          tradeTime: new Date('2017-06-14 20:28:33'),
          raw: {
            usd: '-124.37',
            btc: '0.04906037',
            btc_usd: '2535.01',
            order_id: 24870681,
            fee: '0.14000000',
            type: 2,
            id: 16180467,
            datetime: '2017-06-14 20:28:33'
          },
          state: "closed",
          type: "limit"
        });

        expect(result[1]).to.deep.equal({
          baseAmount: 9790521,
          baseCurrency: "BTC",
          externalId: "24882718",
          feeAmount: 28,
          feeCurrency: "USD",
          quoteAmount: -24926,
          quoteCurrency: "USD",
          tradeTime: new Date('2016-06-14 20:46:46'),
          raw: {
            btc: "0.09790521",
            btc_usd: "2545.96",
            datetime: "2016-06-14 20:46:46",
            fee: "0.28000000",
            id: 16181386,
            order_id: 24882718,
            type: 2,
            usd: "-249.26",
          },
          state: "closed",
          type: "limit"
        });

        expect(result[2]).to.deep.equal({
          baseAmount: 2174610,
          baseCurrency: "BTC",
          externalId: "24880122",
          feeAmount: 7,
          feeCurrency: "USD",
          quoteAmount: -5521,
          quoteCurrency: "USD",
          tradeTime: new Date('2016-06-14 20:42:58'),
          raw: {
            btc: "0.02174610",
            btc_usd: "2538.97",
            datetime: "2016-06-14 20:42:58",
            fee: "0.07000000",
            id: 16181233,
            order_id: 24880122,
            type: 2,
            usd: "-55.21",
          },
          state: "closed",
          type: "limit"
        });

      });
    });
  });

  /* GET TRADES - from lastTrade given */
  describe('List Trades endpoint - from lastTrade', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.listTransactionsResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    var latestTrade = {
      raw: {
        id: 9214142,
        datetime: '2017-01-01 00:00:00'
      }
    };

    var latestTrade2 = {
      raw: {
        transactions: [
          {
            id: 9214142,
            datetime: '2017-01-01 00:00:00'
          }
        ]
      }
    };


    it('gets trades after the lastTx provided, including', function () {
      return bitstamp.listTrades(latestTrade)
      .then(result => {

        request.post.called.should.be.equal(true);
        result.should.be.an('array');

        expect(result.length).to.equal(1);


        expect(result[0]).to.deep.equal({
          baseAmount: 4906037,
          baseCurrency: "BTC",
          externalId: "24870681",
          feeAmount: 14,
          feeCurrency: "USD",
          quoteAmount: -12437,
          quoteCurrency: "USD",
          tradeTime: new Date('2017-06-14 20:28:33'),
          raw: {
            usd: '-124.37',
            btc: '0.04906037',
            btc_usd: '2535.01',
            order_id: 24870681,
            fee: '0.14000000',
            type: 2,
            id: 16180467,
            datetime: '2017-06-14 20:28:33'
          },
          state: "closed",
          type: "limit"
        }
        );

      });
    });

    it('gets trades after the lastTx provided, including (handle different format of raw', function () {
      return bitstamp.listTrades(latestTrade2)
        .then(result => {

          request.post.called.should.be.equal(true);
          result.should.be.an('array');

          expect(result.length).to.equal(1);


          expect(result[0]).to.deep.equal({
            baseAmount: 4906037,
            baseCurrency: "BTC",
            externalId: "24870681",
            feeAmount: 14,
            feeCurrency: "USD",
            quoteAmount: -12437,
            quoteCurrency: "USD",
            tradeTime: new Date('2017-06-14 20:28:33'),
            raw: {
              usd: '-124.37',
              btc: '0.04906037',
              btc_usd: '2535.01',
              order_id: 24870681,
              fee: '0.14000000',
              type: 2,
              id: 16180467,
              datetime: '2017-06-14 20:28:33'
            },
            state: "closed",
            type: "limit"
          }
          );

        });
    });
  });

  /* PLACE TRADE - sell order */
  describe('Place Trade endpoint - sell order', function () {
    let requestPostStub;

    beforeEach(function() {
      requestPostStub = sinon.stub(request, 'post');
    });

    afterEach(function () {
      requestPostStub.restore();
    });

    it('places a sell trade on the exchange and returns a response object', function (done) {
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));;

      bitstamp.placeTrade(-1250000, 460.00, 'BTC', 'USD', function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result.id).to.be.an('undefined');
        expect(result.externalId).to.be.a('string');
        expect(result.externalId).to.equal(responses.placeTradeResponse.id.toString());
        expect(result.type).to.equal('limit');
        expect(result.state).to.equal('open');
        expect(result.baseAmount).to.equal(-1250000);
        expect(result.baseCurrency).to.equal('BTC');
        expect(result.quoteCurrency).to.equal('USD');
        expect(result.limitPrice).to.equal(460);
        expect(result).to.have.property('raw');
        expect(result.raw.orderType).to.equal(constants.TYPE_SELL_ORDER);
        expect(result.createTime).to.be.an('undefined');

        done();
      });
    });

    it('returns "insufficient_funds" error if trade cannot be placed due to insufficient funds', function(done) {
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeSellTradeInsufficientFundsResponse))

      bitstamp.placeTrade(-1250000, 460.00, 'BTC', 'USD', function(err, result) {
        if (!err) {
          return done(err);
        }

        expect(result).to.equal(undefined);
        expect(err.message).to.equal(responses.placeSellTradeInsufficientFundsResponse.error['__all__'][0]);
        expect(err.code).to.equal(errorCodes.INSUFFICIENT_FUNDS);
        expect(err.cause).to.equal(undefined);

        done();

      });
    });
  });

  /* PLACE TRADE - sell order */
  describe('Place Trade endpoint - buy order', function () {
    let requestPostStub;

    beforeEach(function() {
      requestPostStub = sinon.stub(request, 'post');
    });

    afterEach(function () {
      requestPostStub.restore();
    });

    it('places a buy trade on the exchange and returns a response object', function (done) {
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse))

      bitstamp.placeTrade(1250000, 460.00, 'BTC', 'USD', function (err, result) {
        if (err) {
          return done(err);
        }

        request.post.called.should.be.equal(true);
        result.should.be.an('object');

        expect(result.id).to.be.an('undefined');
        expect(result.externalId).to.be.a('string');
        expect(result.externalId).to.equal(responses.placeTradeResponse.id.toString());
        expect(result.baseAmount).to.equal(1250000);
        expect(result.raw.orderType).to.equal(constants.TYPE_BUY_ORDER);

        done();
      });
    });

    it('returns "insufficient_funds" error if trade cannot be placed due to insufficient funds', function(done) {
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeBuyTradeInsufficientFundsResponse))

      bitstamp.placeTrade(1250000, 460.00, 'BTC', 'USD', function(err, result) {
        if (!err) {
          return done(err);
        }

        expect(result).to.equal(undefined);
        expect(err.message).to.equal(responses.placeBuyTradeInsufficientFundsResponse.error['__all__'][0]);
        expect(err.code).to.equal(errorCodes.INSUFFICIENT_FUNDS);
        expect(err.cause).to.equal(undefined);

        done();

      });
    });
  });

  /* =================   Testing wrong input to the endpoints   ================= */

  /* GET ORDER BOOK - wrong currency input */
  describe('Get Order Book endpoint', function () {
    before(function (done) {
      sinon.stub(request, 'get').yields(null, {}, JSON.stringify(responses.getOrderBookResponse));
      done();
    });

    after(function (done) {
      request.get.restore();
      done();
    });

    it('returns an error about wrong currency input', function (done) {
      bitstamp.getOrderBook('bStc', 'EUR', function (err, result) {
        request.get.called.should.be.equal(false);

        expect(result).to.equal(undefined);
        expect(err.message).to.equal('Bitstamp only supports BTC and USD as base and quote currencies, respectively.');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* GET TRADE - wrong orderType property value */
  describe('Get Trade endpoint - wrong orderType property value', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    var trade = {
      id: 108670705,
      raw: {
        orderType: 'hakuna matata'
      },
      createTime: '2015-09-03 11:40:46'
    };
    it('returns an error about wrong orderType in the \'raw\' property of the input object', function (done) {
      bitstamp.getTrade(trade, function (err, result) {
        request.post.called.should.be.equal(false);

        expect(result).to.equal(undefined);
        expect(err.message).to.equal('Trade object must have a raw orderType parameter with value either \'sell\' or' +
          ' \'buy\'.');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* GET TRADE - missing input object */
  describe('Get Trade endpoint - missing input object', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error about missing required trade object input argument', function (done) {
      bitstamp.getTrade(null, function (err, result) {
        request.post.called.should.be.equal(false);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('Trade object is a required parameter.');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* PLACE TRADE - wrong currency inputs */
  describe('Place Trade endpoint - wrong currency inputs', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error about wrong currency input arguments', function (done) {
      bitstamp.placeTrade(-123456, 460.84, 'bStc', 'EUR', function (err, result) {
        request.post.called.should.be.equal(false);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('Base and Quote currencies should be BTC and USD, respectively');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* PLACE TRADE - wrong baseAmount input */
  describe('Place Trade endpoint - wrong baseAmount input', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error about wrong baseAmount input input argument', function (done) {
      bitstamp.placeTrade(null, 460.84, 'BTC', 'USD', function (err, result) {
        request.post.called.should.be.equal(false);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('The base amount must be a number.');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* PLACE TRADE - wrong limitPrice input */
  describe('Place Trade endpoint - wrong limitPrice input', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify(responses.getTradeBuyResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error about wrong limitPrice input argument', function (done) {
      bitstamp.placeTrade(-123456, null, 'BTC', 'USD', function (err, result) {
        request.post.called.should.be.equal(false);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('The limit price must be a positive number.');
        expect(err.code).to.equal(errorCodes.MODULE_ERROR);
        expect(err.cause).to.equal(undefined);

        done();
      });
    });
  });

  /* =================   Testing wrong requests OR errors in the response   ================= */

  describe('Error from the request', function () {
    var errorCause = new Error('Some random test error');
    before(function (done) {
      sinon.stub(request, 'post').yields(errorCause, {}, JSON.stringify(responses.getBalanceResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error upon request', function (done) {
      bitstamp.getBalance(function (err, result) {
        request.post.called.should.be.equal(true);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('There is an error in the response from the Bitstamp service...');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
        expect(err.cause).to.equal(errorCause);

        done();
      });
    });
  });

  describe('No body data in the response', function () {
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, null);
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error upon request', function (done) {
      bitstamp.getBalance(function (err, result) {
        request.post.called.should.be.equal(true);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('There is an error in the response from the Bitstamp service...');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);

        done();
      });
    });
  });

  describe('Error message in the response object', function () {
    var exchangeError = new Error('Some random test error');
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {error: exchangeError}, JSON.stringify(responses.getBalanceResponse));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error upon request', function (done) {
      bitstamp.getBalance(function (err, result) {
        request.post.called.should.be.equal(true);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('The exchange service responded with an error...');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
        expect(err.cause).to.equal(exchangeError);

        done();
      });
    });
  });

  describe('Error message in the data attribute in the response object', function () {
    var exchangeErrorMsg = 'Some random test error';
    before(function (done) {
      sinon.stub(request, 'post').yields(null, {}, JSON.stringify({error: exchangeErrorMsg}));
      done();
    });

    after(function (done) {
      request.post.restore();
      done();
    });

    it('returns an error upon request', function (done) {
      bitstamp.getBalance(function (err, result) {
        request.post.called.should.be.equal(true);
        expect(result).to.equal(undefined);
        expect(err.message).to.equal('There is an error in the body of the response from the exchange service...');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
        expect(err.cause).to.be.an('Error');
        expect(err.cause.message).to.equal(JSON.stringify(exchangeErrorMsg));

        done();
      });
    });
  });

  /* end */
});
