const expect = require('chai').expect;
const { promisify } = require('util');
const sinon = require('sinon');
const responses = require('./../responses.js');
const { initModule } = require('../helpers');
const requestHelper = require('../../lib/request_helper');

describe('#listTransactions', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(requestHelper, 'post')
      .resolves({ data: responses.listTransactionsResponse });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should return error if currency cannot be found', (done) => {
    const response = [ {
      fee: '0.00000000',
      datetime: '2018-05-17 14:50:43',
      type: '1',
      id: 66231357
    } ];

    requestStub
      .resolves({ data: response });

    return bitstamp.listTransactions(null, (err, response) => {
      expect(err).to.not.equal(null);
      expect(response).to.equal(undefined);
      done();
    });
  });

  it('should get all transactions', async () => {
    const res = await promisify(bitstamp.listTransactions.bind(bitstamp))(null);

    expect(res).to.deep.equal([
      {
        currency: 'USDC',
        amount: -999729000,
        externalId: '170164205',
        timestamp: '2021-05-05T09:49:34.060Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[0]
      },
      {
        currency: 'ETH',
        amount: -14512580000,
        externalId: '66231357',
        timestamp: '2018-05-17T14:50:43.000Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[1]
      },
      {
        currency: 'BTC',
        amount: 10000000,
        externalId: '10609931',
        timestamp: '2016-02-15T12:25:49.000Z',
        state: 'completed',
        type: 'deposit',
        raw: responses.listTransactionsResponse[4]
      },
      {
        currency: 'BTC',
        amount: -1300000000,
        externalId: '9214142',
        timestamp: '2015-09-03T11:40:46.000Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[5]
      },
      {
        currency: 'USD',
        amount: -13700,
        externalId: '9214109',
        timestamp: '2015-09-03T11:30:40.000Z',
        state: 'completed',
        type: 'deposit',
        raw: responses.listTransactionsResponse[6]
      },
      {
        currency: 'EUR',
        amount: -5248685,
        externalId: '69854588',
        timestamp: '2018-07-10T09:23:01.000Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[8]
      },
      {
        currency: 'BCH',
        amount: 3655347,
        externalId: '72759801',
        timestamp: '2018-08-22T11:46:13.000Z',
        state: 'completed',
        type: 'deposit',
        raw: responses.listTransactionsResponse[9]
      }
    ]);

    expect(requestStub.calledOnce).to.equal(true);
    expect(requestStub.firstCall.args[0]).to.equal('/api/v2/user_transactions/');
    expect(requestStub.firstCall.args[1]).to.equal('limit=100&offset=0&sort=desc');
  });

  it('should use latestTransaction', async () => {
    const latestTransaction = {
      raw: {
        id: 9214142,
        datetime: '2018-01-01 11:40:46'
      }
    };

    const res = await promisify(bitstamp.listTransactions.bind(bitstamp))(latestTransaction);

    expect(res).to.deep.equal([
      {
        currency: 'USDC',
        amount: -999729000,
        externalId: '170164205',
        timestamp: '2021-05-05T09:49:34.060Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[0]
      },
      {
        currency: 'ETH',
        amount: -14512580000,
        externalId: '66231357',
        timestamp: '2018-05-17T14:50:43.000Z',
        state: 'completed',
        type: 'withdrawal',
        raw: responses.listTransactionsResponse[1]
      }
    ]);
  });
});
