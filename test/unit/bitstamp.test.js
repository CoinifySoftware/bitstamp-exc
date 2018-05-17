const sinon = require('sinon'),
  request = require('request'),
  responses = require('./../responses.js'),
  should = require('chai').should(),
  expect = require('chai').expect,
  exchange = require('../../index.js'),
  constants = require('../../lib/constants.js'),
  errorCodes = require('../../lib/error_codes.js');

describe('Bitstamp Exchange Service Tests ->', function () {
  const bitstamp = new exchange({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
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
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

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
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeSellTradeInsufficientFundsResponse));

      bitstamp.placeTrade(-1250000, 460.00, 'BTC', 'USD', function(err, result) {
        if (!err) {
          return done(err);
        }

        expect(result).to.equal(undefined);
        expect(err.message).to.equal(responses.placeSellTradeInsufficientFundsResponse.error.__all__[0]);
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
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

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
      requestPostStub.yields(null, {}, JSON.stringify(responses.placeBuyTradeInsufficientFundsResponse));

      bitstamp.placeTrade(1250000, 460.00, 'BTC', 'USD', function(err, result) {
        if (!err) {
          return done(err);
        }

        expect(result).to.equal(undefined);
        expect(err.message).to.equal(responses.placeBuyTradeInsufficientFundsResponse.error.__all__[0]);
        expect(err.code).to.equal(errorCodes.INSUFFICIENT_FUNDS);
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
        expect(err.message).to.equal('Currency pair not supported');
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
    const errorCause = new Error('Some random test error');
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
    const exchangeError = new Error('Some random test error');
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
    const exchangeErrorMsg = 'Some random test error';
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
