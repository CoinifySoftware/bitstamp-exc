const expect = require('chai').expect,
  _ = require('lodash'),
  {promisify} = require('util'),
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  errorCodes = require('../../lib/error_codes'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#getTrade', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  let requestStub;
  afterEach(() => {
    requestStub.restore();
  });

  it('should get sell trade', async () => {
    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify(responses.getTradeSellResponse));
    const trade = {
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      feeCurrency: 'USD',
      raw: {
        id: 108670705,
        orderType: 'sell'
      },
      createTime: '2015-09-03 11:40:46'
    };

    const res = await promisify(bitstamp.getTrade.bind(bitstamp))(trade);

    expect(res).to.deep.equal({
      externalId: '108670705',
      type: 'limit',
      state: 'closed',
      baseAmount: -2029780550,
      quoteAmount: 514075,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      feeAmount: 1928,
      feeCurrency: 'USD',
      raw: _.defaults(responses.getTradeSellResponse, {id: trade.raw.id})
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/order_status/');
    expect(requestStub.firstCall.args[0].form.id).to.equal(trade.raw.id);
  });

  it('should get buy order (BTC)', async () => {
    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify(responses.getTradeBuyResponseBTC));

    const trade = {
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      feeCurrency: 'USD',
      raw: {
        id: 108670705,
        orderType: 'buy',
        datetime: '2015-09-03 11:40:46'
      }
    };

    const res = await promisify(bitstamp.getTrade.bind(bitstamp))(trade);
    expect(res).to.deep.equal({
      externalId: '108670705',
      type: 'limit',
      state: 'closed',
      baseAmount: 2029780550,
      quoteAmount: -514075,
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      feeAmount: 1928,
      feeCurrency: 'USD',
      raw: _.defaults(responses.getTradeBuyResponseBTC, {id: trade.raw.id})
    });

    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/order_status/');
    expect(requestStub.firstCall.args[0].form.id).to.equal(trade.raw.id);
  });

  it('should get buy order (ETH)', async () => {
    const trade = {
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      feeCurrency: 'USD',
      raw: {
        id: 108670705,
        orderType: 'buy',
        datetime: '2015-09-03 11:40:46'
      }
    };

    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify(responses.getTradeBuyResponseETH));


    const res = await promisify(bitstamp.getTrade.bind(bitstamp))(trade);
    expect(res).to.deep.equal({
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      feeCurrency: 'USD',
      externalId: '108670705',
      type: 'limit',
      state: 'closed',
      baseAmount: 14512580000,
      quoteAmount: -997,
      feeAmount: 3,
      raw: _.defaults(responses.getTradeBuyResponseETH, {id: trade.raw.id})
    });

    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/order_status/');
    expect(requestStub.firstCall.args[0].form.id).to.equal(trade.raw.id);
  });

  it('should return error when baseCurrency is missing', (done) => {
    bitstamp.getTrade({}, (err) => {
      expect(err.message).to.equal('Trade object requires raw, baseCurrency, quoteCurrency and feeCurrency provided');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });

  it('returns an error about wrong orderType in the \'raw\' property of the input object', (done) => {
    const trade = {
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      feeCurrency: 'USD',
      raw: {
        id: 123124
      }
    };

    bitstamp.getTrade(trade, (err) => {
      expect(err.message).to.equal('Trade object must have a raw orderType parameter with value either \'sell\' or' +
        ' \'buy\'.');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });

  it('returns an error about missing required trade object input argument', (done) => {
    bitstamp.getTrade(null, (err) => {
      expect(err.message).to.equal('Trade object is a required parameter.');
      expect(err.code).to.equal(errorCodes.MODULE_ERROR);
      expect(err.cause).to.equal(undefined);

      done();
    });
  });
});
