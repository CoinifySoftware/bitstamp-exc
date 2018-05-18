const expect = require('chai').expect,
  { promisify } = require('util'),
  _ = require('lodash'),
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  constants = require('../../lib/constants'),
  errorCodes = require('../../lib/error_codes'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#placeTrade', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId'
  });

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(request, 'post');
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should round price to 2 decimals before placing trade', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

    const baseAmount = -1250000; // negative means sell
    const limit = 460.123;
    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: -1250000,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 460.12,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_SELL_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/sell/btcusd/');
    expect(requestStub.firstCall.args[0].form.amount).to.equal(0.0125);
    expect(requestStub.firstCall.args[0].form.price).to.equal(460.12);
  });

  it('should place a sell trade (BTC) on the exchange and return response', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

    const baseAmount = -1250000; // negative means sell
    const limit = 460.00;
    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: -1250000,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 460,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_SELL_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/sell/btcusd/');
    expect(requestStub.firstCall.args[0].form.amount).to.equal(0.0125);
    expect(requestStub.firstCall.args[0].form.price).to.equal(460);
  });

  it('should place a buy trade (BTC) on the exchange and return response', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

    const baseAmount = 1250000; // positive means buy
    const limit = 455.00;
    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: 1250000,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 455,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_BUY_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/buy/btcusd/');
    expect(requestStub.firstCall.args[0].form.amount).to.equal(0.0125);
    expect(requestStub.firstCall.args[0].form.price).to.equal(455);
  });

  it('should place a sell trade (ETH) on the exchange and return response', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

    const baseAmount = -1250000; // negative means sell
    const limit = 700.919;
    const baseCurrency = 'ETH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: -1250000,
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 700.92,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_SELL_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/sell/ethusd/');
    expect(requestStub.firstCall.args[0].form.amount).to.equal(0.00000125);
    expect(requestStub.firstCall.args[0].form.price).to.equal(700.92);
  });

  it('should place a buy trade (ETH) on the exchange and return response', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeTradeResponse));

    const baseAmount = 1250000; // positive means buy
    const limit = 1230.00;
    const baseCurrency = 'ETH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: 1250000,
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 1230,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_BUY_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/buy/ethusd/');
    expect(requestStub.firstCall.args[0].form.amount).to.equal(0.00000125);
    expect(requestStub.firstCall.args[0].form.price).to.equal(1230);
  });

  it('should return "insufficient_funds" error if trade cannot be placed due to insufficient funds', (done) => {
    requestStub.yields(null, {}, JSON.stringify(responses.placeBuyTradeInsufficientFundsResponse));

    const baseAmount = 1250000; // positive means buy
    const limit = 1230.00;
    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    bitstamp.placeTrade(baseAmount, limit, baseCurrency, quoteCurrency, (err) => {
      expect(err.message).to.equal(responses.placeBuyTradeInsufficientFundsResponse.error.__all__[0]);
      expect(err.code).to.equal(errorCodes.INSUFFICIENT_FUNDS);
      expect(err.cause).to.equal(undefined);
      done();
    });
  });

  it('should return error when currency pair is not supported', (done) => {
    bitstamp.placeTrade(-123456, 460.84, 'bStc', 'EUR', function (err) {
      expect(err.message).to.equal('Currency pair not supported');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });

  it('should return error when baseAmount is null', (done) => {
    bitstamp.placeTrade(null, 460.84, 'BTC', 'USD', function (err) {
      expect(err.message).to.equal('The base amount must be a number.');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });

  it('should return error when limitPrice is null', (done) => {
    bitstamp.placeTrade(-123456, null, 'BTC', 'USD', function (err, result) {
      expect(err.message).to.equal('The limit price must be a positive number.');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });


});
