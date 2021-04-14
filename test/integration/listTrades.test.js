const expect = require('chai').expect;
const sinon = require('sinon');
const responses = require('./../responses.js');
const request = require('request');
const Bitstamp = require('../../index.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);


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
    requestStub
      .yields(null, {}, '{}');


    await expect(bitstamp.listTrades()).to.eventually.be.rejectedWith('Response from Bitstamp is not an array {}');
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
