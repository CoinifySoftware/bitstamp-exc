const expect = require('chai').expect;
const sinon = require('sinon');
const responses = require('./../responses.js');
const requestHelper = require('../../lib/request_helper');
const { initModule } =require('../helpers');

describe('#listTrades', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(requestHelper, 'post')
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

    const trades = await bitstamp.listTrades(latestTrade);

    expect(trades[0]).to.include({
      externalId: '1234',
      type: 'limit',
      state: 'closed',
      baseCurrency: 'ETH',
      baseAmount: 14512580000,
      quoteCurrency: 'USD',
      quoteAmount: -997,
      feeCurrency: 'USD',
      feeAmount: 3,
      raw: responses.listTransactionsResponse[2]
    });

    expect(trades[0].tradeTime).to.eql(new Date('2018-05-16T09:11:20.000Z'));
    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/user_transactions/');
  });
});
