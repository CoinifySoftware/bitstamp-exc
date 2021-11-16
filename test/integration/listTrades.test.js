const expect = require('chai').expect;
const sinon = require('sinon');
const responses = require('./../responses.js');
const axios = require('axios');
const { initModule } =require('../helpers');

describe('#listTrades', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(axios, 'post')
      .resolves({ data: responses.listTransactionsResponse });
  });

  afterEach(() => {
    requestStub.restore();
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
        raw: responses.listTransactionsResponse[2]
      }
    ]);

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('https://www.bitstamp.net/api/v2/user_transactions/');
  });
});
