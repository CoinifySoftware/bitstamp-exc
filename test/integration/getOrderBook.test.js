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
  });

  afterEach(() => {
    requestStub.restore();
  });

  [
    { baseCurrency: 'BTC', quoteCurrency: 'USD', bitstampSymbol: 'btcusd' },
    { baseCurrency: 'BTC', quoteCurrency: 'EUR', bitstampSymbol: 'btceur' },
    { baseCurrency: 'BCH', quoteCurrency: 'USD', bitstampSymbol: 'bchusd' },
    { baseCurrency: 'BCH', quoteCurrency: 'EUR', bitstampSymbol: 'bcheur' }
  ].forEach(({ baseCurrency, quoteCurrency, bitstampSymbol }) => {
    it(`should get and return order book for ${baseCurrency}/${quoteCurrency}`, async () => {
      requestStub.resolves({ data: responses.getOrderBookResponseBTC });
      const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

      expect(res).to.deep.equal({
        baseCurrency,
        quoteCurrency,
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
      expect(requestStub.firstCall.args[0]).to.equal(`/api/v2/order_book/${bitstampSymbol}/`);
    });
  });

  [
    { baseCurrency: 'ETH', quoteCurrency: 'USD', bitstampSymbol: 'ethusd' },
    { baseCurrency: 'ETH', quoteCurrency: 'EUR', bitstampSymbol: 'etheur' }
  ].forEach(({ baseCurrency, quoteCurrency, bitstampSymbol }) => {
    it(`should get and return order book for ${baseCurrency}/${quoteCurrency}`, async () => {
      requestStub.resolves({ data: responses.getOrderBookResponseETH });
      const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

      expect(res).to.deep.equal({
        baseCurrency,
        quoteCurrency,
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
      expect(requestStub.firstCall.args[0]).to.equal(`/api/v2/order_book/${bitstampSymbol}/`);
    });
  });

  [
    { baseCurrency: 'USDC', quoteCurrency: 'USD', bitstampSymbol: 'usdcusd' },
    { baseCurrency: 'USDC', quoteCurrency: 'EUR', bitstampSymbol: 'usdceur' }
  ].forEach(({ baseCurrency, quoteCurrency, bitstampSymbol }) => {
    it(`should get and return order book for ${baseCurrency}/${quoteCurrency}`, async () => {
      requestStub.resolves({ data: responses.getOrderBookResponseUSDC });
      const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

      expect(res).to.deep.equal({
        baseCurrency,
        quoteCurrency,
        bids: [
          { price: 0.99997, baseAmount: 4971205962000 },
          { price: 0.99995, baseAmount: 5000250006000 }
        ],
        asks: [
          { price: 1, baseAmount: 4098723412000 },
          { price: 1.00001, baseAmount: 11497596085000 }
        ]
      });

      expect(requestStub.calledOnce).to.equal(true);
      expect(requestStub.firstCall.args[0]).to.equal(`/api/v2/order_book/${bitstampSymbol}/`);
    });
  });

  [
    { baseCurrency: 'USDT', quoteCurrency: 'USD', bitstampSymbol: 'usdtusd' },
    { baseCurrency: 'USDT', quoteCurrency: 'EUR', bitstampSymbol: 'usdteur' }
  ].forEach(({ baseCurrency, quoteCurrency, bitstampSymbol }) => {
    it(`should get and return order book for ${baseCurrency}/${quoteCurrency}`, async () => {
      requestStub.resolves({ data: responses.getOrderBookResponseUSDT });
      const res = await promisify(bitstamp.getOrderBook.bind(bitstamp))(baseCurrency, quoteCurrency);

      expect(res).to.deep.equal({
        baseCurrency,
        quoteCurrency,
        bids: [
          { price: 0.99997, baseAmount: 4971205962000 },
          { price: 0.99995, baseAmount: 5000250006000 }
        ],
        asks: [
          { price: 1, baseAmount: 4098723412000 },
          { price: 1.00001, baseAmount: 11497596085000 }
        ]
      });

      expect(requestStub.calledOnce).to.equal(true);
      expect(requestStub.firstCall.args[0]).to.equal(`/api/v2/order_book/${bitstampSymbol}/`);
    });
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
