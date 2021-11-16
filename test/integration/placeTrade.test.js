const expect = require('chai').expect;
const { promisify } = require('util');
const _ = require('lodash');
const sinon = require('sinon');
const responses = require('./../responses.js');
const constants = require('../../lib/constants');
const errorCodes = require('../../lib/error_codes');
const axios = require('axios');
const { initModule } = require('../helpers');

describe('#placeTrade', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(axios, 'post');
    requestStub.resolves({ data: responses.placeTradeResponse });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should round price to 2 decimals before placing trade', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/sell/btcusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.0125&price=460.12');
  });

  it('should place a sell trade (BTC) on the exchange and return response', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/sell/btcusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.0125&price=460');
  });

  it('should place a buy trade (BTC) on the exchange and return response', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/buy/btcusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.0125&price=455');
  });

  it('should place a sell trade (BCH) on the exchange and return response', async () => {
    const baseAmount = -1250000; // negative means sell
    const limit = 700.919;
    const baseCurrency = 'BCH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: -1250000,
      baseCurrency: 'BCH',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 700.92,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_SELL_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/sell/bchusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.0125&price=700.92');
  });

  it('should place a buy trade (BCH) on the exchange and return response', async () => {
    const baseAmount = 1250000; // positive means buy
    const limit = 1230.00;
    const baseCurrency = 'BCH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.placeTrade.bind(bitstamp))(baseAmount, limit, baseCurrency, quoteCurrency);
    expect(res).to.deep.equal({
      baseAmount: 1250000,
      baseCurrency: 'BCH',
      quoteCurrency: 'USD',
      externalId: '111788524',
      type: 'limit',
      state: 'open',
      limitPrice: 1230,
      raw: _.extend(responses.placeTradeResponse, { orderType: constants.TYPE_BUY_ORDER })
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/buy/bchusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.0125&price=1230');
  });

  it('should place a sell trade (ETH) on the exchange and return response', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/sell/ethusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.00000125&price=700.92');
  });

  it('should place a buy trade (ETH) on the exchange and return response', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/buy/ethusd/');
    expect(requestStub.firstCall.args[1]).to.equal('amount=0.00000125&price=1230');
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
    bitstamp.placeTrade(-123456, null, 'BTC', 'USD', function (err) {
      expect(err.message).to.equal('The limit price must be a positive number.');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });

});
