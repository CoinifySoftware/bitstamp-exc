const expect = require('chai').expect,
  sinon = require('sinon'),
  responses = require('./../responses.js'),
  request = require('request'),
  Bitstamp = require('../../index.js');

describe('#listTrades', () => {

  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId'
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
      },
      {
        externalId: '1239',
        type: 'limit',
        state: 'closed',
        baseCurrency: 'BCH',
        baseAmount: 1451258,
        quoteCurrency: 'USD',
        quoteAmount: -997,
        feeCurrency: 'USD',
        feeAmount: 3,
        tradeTime: new Date('2018-05-16T07:11:20.000Z'),
        raw: responses.listTransactionsResponse[9]
      }
    ]);

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/user_transactions/');
  });

  it('should use latestTrade when provided', async () => {
    const latestTrade = {
      raw: {
        datetime: '2018-05-16T07:11:19.000Z'
      }
    };

    const result = await bitstamp.listTrades(latestTrade);

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
      }
    ]);

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0].url).to.equal('https://www.bitstamp.net/api/v2/user_transactions/');
  });
});
