const expect = require('chai').expect;
const { promisify } = require('util');
const sinon = require('sinon');
const responses = require('./../responses.js');
const requestHelper = require('../../lib/request_helper');
const { initModule } = require('../helpers');

describe('#getOrderBook', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(requestHelper, 'get');
    requestStub.resolves({ data: responses.getOrderBookResponseBTC });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return order book for BTCUSD', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/order_book/btcusd/');
  });

  it('should get and return order book for BCHUSD', async () => {
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
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/order_book/bchusd/');
  });

  it('should get and return order book for ETHUSD', async () => {
    requestStub.resolves({ data: responses.getOrderBookResponseETH });

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
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/order_book/ethusd/');
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
