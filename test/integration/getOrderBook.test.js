const expect = require('chai').expect,
  { promisify } = require('util'),
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#getOrderBook', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(request, 'get');
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return order book for BTCUSD', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.getOrderBookResponseBTC));

    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      bids: [
        { price: 403.53, baseAmount: 81383821 },
        { price: 403.35, baseAmount: 161018019 }
      ],
      asks: [
        { price: 404, baseAmount: 1967704402 },
        { price: 404.39, baseAmount: 736300000 }
      ]
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/v2/order_book/btcusd/');
  });

  it('should get and return order book for BCHUSD', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.getOrderBookResponseBTC));

    const baseCurrency = 'BCH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'BCH',
      quoteCurrency: 'USD',
      bids: [
        { price: 403.53, baseAmount: 81383821 },
        { price: 403.35, baseAmount: 161018019 }
      ],
      asks: [
        { price: 404, baseAmount: 1967704402 },
        { price: 404.39, baseAmount: 736300000 }
      ]
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/v2/order_book/bchusd/');
  });

  it('should get and return order book for ETHUSD', async () => {
    requestStub.yields(null, {}, JSON.stringify(responses.getOrderBookResponseETH));

    const baseCurrency = 'ETH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      bids: [
        { price: 700.5, baseAmount: 80000000000 },
        { price: 699.11, baseAmount: 1000000000000 }
      ],
      asks: [
        { price: 700, baseAmount: 700000000000 },
        { price: 710.39, baseAmount: 1100000000000 }
      ]
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('http://localhost:3000/api/v2/order_book/ethusd/');
  });

  it('should throw err if currency pair is not supported', (done) => {
    const baseCurrency = 'XMR';
    const quoteCurrency = 'USD';

    bitstamp.getOrderBook(baseCurrency, quoteCurrency, (err) => {
      expect(err.message).to.equal('Currency pair not supported');

      done();
    });
  });

});
