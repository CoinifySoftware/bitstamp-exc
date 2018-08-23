const chai = require('chai'),
  _ = require('lodash'),
  expect = chai.expect,
  sinon = require('sinon'),
  request = require('request'),
  Bitstamp = require('../../index.js');

chai.use(require('chai-as-promised'));

describe('withdraw', function() {
  const bitstamp = new Bitstamp({
    key: 'apikey',
    secret: 'apisecret',
    clientId: 'clientId',
    host: 'http://localhost:3000'
  });

  let args, requestStub;
  beforeEach(() => {
    args = {
      currency: 'BTC',
      amount: 10000000,
      address: 'btc_address'
    };

    requestStub = sinon.stub(request, 'post')
      .yields(null, {}, JSON.stringify({ id: 'bitstamp_id' }));
  });

  afterEach(() => {
    requestStub.restore();
  });

  it('should call bitstamp api and return response for BTC withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(args);

    expect(requestStub.calledOnce).to.equal(true);
    const [ requestArgs ] = requestStub.firstCall.args;
    expect(requestArgs.url).to.equal('http://localhost:3000/api/bitcoin_withdrawal/');
    expect(requestArgs.form.address).to.equal(args.address);
    expect(requestArgs.form.amount).to.equal(0.1);
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });
  });

  it('should call bitstamp and return response for BCH withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(_.defaults({ currency: 'BCH' }, args));

    expect(requestStub.calledOnce).to.equal(true);
    const [ requestArgs ] = requestStub.firstCall.args;
    expect(requestArgs.url).to.equal('http://localhost:3000/api/v2/bch_withdrawal/');
    expect(requestArgs.form.address).to.equal(args.address);
    expect(requestArgs.form.amount).to.equal(0.1);
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });
  });

  it('should call bitstamp and return response for ETH withdrawal', async () => {
    const withdrawal = await bitstamp.withdraw(_.defaults({ currency: 'ETH' }, args));

    expect(requestStub.calledOnce).to.equal(true);
    const [ requestArgs ] = requestStub.firstCall.args;
    expect(requestArgs.url).to.equal('http://localhost:3000/api/v2/eth_withdrawal/');
    expect(requestArgs.form.address).to.equal(args.address);
    expect(requestArgs.form.amount).to.equal(0.00001);
    expect(withdrawal).to.deep.equal({
      externalId: 'bitstamp_id',
      state: 'pending'
    });
  });

  it('should reject if currency is not BTC', async () => {
    args.currency = 'USD';

    return expect(bitstamp.withdraw(args)).to.eventually
      .be.rejectedWith('Withdrawals are not allowed for USD')
      .and.be.an.instanceOf(Error);
  });
});
