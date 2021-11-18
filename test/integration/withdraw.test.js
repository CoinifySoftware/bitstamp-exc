const chai = require('chai');
const _ = require('lodash');
const expect = chai.expect;
const sinon = require('sinon');
const requestHelper = require('../../lib/request_helper');
const { initModule } = require('../helpers');

chai.use(require('chai-as-promised'));

describe('withdraw', function () {

  const bitstamp = initModule();

  let args, requestStub;
  beforeEach(() => {
    args = {
      currency: 'BTC',
      amount: 10000000,
      address: 'btc_address'
    };

    requestStub = sinon.stub(requestHelper, 'post')
      .resolves({ data: { id: 'bitstamp_id' } });
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should call bitstamp api and return response for BTC withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(args);
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });

    expect(requestStub.calledOnce).to.equal(true);
    const [ path, requestBody ] = requestStub.firstCall.args;
    expect(path).to.equal('/api/v2/btc_withdrawal/');
    expect(requestBody).to.equal('address=btc_address&amount=0.1&instant=0');
  });

  it('should call bitstamp and return response for BCH withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(_.defaults({ currency: 'BCH' }, args));
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });

    expect(requestStub.calledOnce).to.equal(true);
    const [ path, requestBody ] = requestStub.firstCall.args;
    expect(path).to.equal('/api/v2/bch_withdrawal/');
    expect(requestBody).to.equal('address=btc_address&amount=0.1&instant=0');
  });

  it('should call bitstamp and return response for ETH withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(_.defaults({ currency: 'ETH' }, args));
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });

    expect(requestStub.calledOnce).to.equal(true);
    const [ path, requestBody ] = requestStub.firstCall.args;
    expect(path).to.equal('/api/v2/eth_withdrawal/');
    expect(requestBody).to.equal('address=btc_address&amount=0.00001&instant=0');
  });

  it('should reject if currency is not BTC', async () => {
    args.currency = 'USD';

    return expect(bitstamp.withdraw(args)).to.eventually
      .be.rejectedWith('Withdrawals are not allowed for USD')
      .and.be.an.instanceOf(Error);
  });
});
