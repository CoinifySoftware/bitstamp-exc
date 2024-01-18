const expect = require('chai').expect;
const { promisify } = require('util');
const sinon = require('sinon');
const responses = require('./../responses.js');
const requestHelper = require('../../lib/request_helper');
const { initModule } = require('../helpers');

describe('#getTicker', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(requestHelper, 'get');
    requestStub.resolves({ data: responses.getTickerResponse });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return ticker data (BTC)', async () => {
    const baseCurrency = 'BTC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getTicker.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'BTC',
      quoteCurrency: 'USD',
      bid: 596.09,
      ask: 596.11,
      lastPrice: 596.09,
      high24Hours: 597.53,
      low24Hours: 579.43,
      vwap24Hours: 586.35,
      volume24Hours: 359669846615
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/ticker/btcusd/');
  });

  it('should get and return ticker data (BCH)', async () => {
    const baseCurrency = 'BCH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getTicker.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'BCH',
      quoteCurrency: 'USD',
      bid: 596.09,
      ask: 596.11,
      lastPrice: 596.09,
      high24Hours: 597.53,
      low24Hours: 579.43,
      vwap24Hours: 586.35,
      volume24Hours: 359669846615
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/ticker/bchusd/');
  });

  it('should get and return ticker data (ETH)', async () => {
    const baseCurrency = 'ETH';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getTicker.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'ETH',
      quoteCurrency: 'USD',
      bid: 596.09,
      ask: 596.11,
      lastPrice: 596.09,
      high24Hours: 597.53,
      low24Hours: 579.43,
      vwap24Hours: 586.35,
      volume24Hours: 3596698466150000
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/ticker/ethusd/');
  });

  it('should get and return ticker data (USDC)', async () => {
    const baseCurrency = 'USDC';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getTicker.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'USDC',
      quoteCurrency: 'USD',
      bid: 596.09,
      ask: 596.11,
      lastPrice: 596.09,
      high24Hours: 597.53,
      low24Hours: 579.43,
      vwap24Hours: 586.35,
      volume24Hours: 359669846615
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/ticker/usdcusd/');
  });

  it('should get and return ticker data (USDT)', async () => {
    const baseCurrency = 'USDT';
    const quoteCurrency = 'USD';

    const res = await promisify(bitstamp.getTicker.bind(bitstamp))(baseCurrency, quoteCurrency);

    expect(res).to.deep.equal({
      baseCurrency: 'USDT',
      quoteCurrency: 'USD',
      bid: 596.09,
      ask: 596.11,
      lastPrice: 596.09,
      high24Hours: 597.53,
      low24Hours: 579.43,
      vwap24Hours: 586.35,
      volume24Hours: 359669846615
    });

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/ticker/usdtusd/');
  });
});
