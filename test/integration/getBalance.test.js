const expect = require('chai').expect;
const { promisify } = require('util');
const sinon = require('sinon');
const responses = require('./../responses.js');
const errorCodes = require('../../lib/error_codes');
const { initModule } = require('../helpers');
const requestHelper = require('../../lib/request_helper');

describe('#getBalance', () => {

  const bitstamp = initModule();

  let requestStub;
  beforeEach(() => {
    requestStub = sinon.stub(requestHelper, 'post');
    requestStub.resolves({ data: responses.getBalanceResponse });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should get and return balance', async () => {
    const res = await promisify(bitstamp.getBalance.bind(bitstamp))();
    expect(res).to.deep.equal({
      available: {
        ETH: 100000000000, USD: 4900, BTC: 10000069, BCH: 12000000
      },
      total: {
        ETH: 200000000000, USD: 5100, BTC: 12345678, BCH: 21000000
      }
    });

    expect(requestStub.calledOnce).to.equal(true);
  });

  it('should returns an error upon request', (done) => {
    const errorCause = new Error('Some random test error');
    requestStub.rejects(errorCause);

    bitstamp.getBalance((err) => {
      try {
        expect(err.message).to.equal('Error response: Some random test error');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
        expect(err.cause).to.equal(errorCause);
      } catch(err) {
        return done(err);
      }

      done();
    });
  });

  it('should return error if data contains errorMessage', (done) => {
    requestStub.resolves({ data: { status: 'error', error: 'some error here' } });

    bitstamp.getBalance((err) => {
      try {
        expect(err.message).to.equal('Error in result: {"status":"error","error":"some error here"}');
        expect(err.code).to.equal(errorCodes.EXCHANGE_SERVER_ERROR);
        expect(err.cause).to.be.an('Error');
      } catch(err) {
        return done(err);
      }

      done();
    });
  });

});
