const expect = require('chai').expect,
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#listTrades', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify(responses.listTransactionsResponse));
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('it should list trades with correct currency', async () => {
    const result = await bitstamp.listTrades();

    expect(result).to.deep.equal([
      {
        externalId: '1234',
        type: 'limit',
        state: 'closed',
        baseCurrency: 'ETH',
        baseAmount: 14512580000,
        quoteCurrency: 'USD',
        quoteAmount: -997,
        feeCurrency: 'USD',
        feeAmount: 3,
        tradeTime: new Date('2018-05-16T07:11:20.000Z'),
        raw: responses.listTransactionsResponse[1]
      },
      {
        externalId: '1235',
        type: 'limit',
        state: 'closed',
        baseCurrency: 'BTC',
        baseAmount: 121213,
        quoteCurrency: 'USD',
        quoteAmount: -997,
        feeCurrency: 'USD',
        feeAmount: 3,
        tradeTime: new Date('2018-05-16T07:11:03.000Z'),
        raw: responses.listTransactionsResponse[2]
      }
    ]);
  });

  it('should use latestTrade when provided', async () => {

  });
});
