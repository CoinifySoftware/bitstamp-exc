const getTickerResponse =
{
  high: '597.53',
  last: '596.09',
  timestamp: '1470839254',
  bid: '596.09',
  vwap: '586.35',
  volume: '3596.69846615',
  low: '579.43',
  ask: '596.11',
  // Actual response from https://www.bitstamp.net/api/ticker/ - "open" was the only float, all others were strings
  open: 582.71
};

const getBalanceResponse =
{
  btc_reserved: '6.123',
  fee: '0.2500',
  btc_available: '0.10000069',
  usd_reserved: '0.0',
  btc_balance: '0.12345678',
  usd_balance: '51.00',
  usd_available: '49.00',
  eth_available: '0.1',
  eth_balance: '0.2',
  bch_available: '0.12',
  bch_balance: '0.21'
};

const getOrderBookResponseBTC =
{
  timestamp: '1455629907',
  bids: [
    [ '403.53', '0.81383821' ],
    [ '403.35', '1.61018019' ]
  ],
  asks: [
    [ '404.00', '19.67704402' ],
    [ '404.39', '7.36300000' ]
  ]
};

const getOrderBookResponseETH =
{
  timestamp: '1455629907',
  bids: [
    [ '700.50', '0.08' ],
    [ '699.11', '1' ]
  ],
  asks: [
    [ '700.00', '0.7' ],
    [ '710.39', '1.1' ]
  ]
};

const getTradeSellResponse =
{
  status: 'Finished',
  transactions: [
    {
      tid: 9099283,
      fee: '10.65',
      price: '252.77',
      usd: '4840.27',
      btc: '19.14890275'
    },
    {
      tid: 9094883,
      fee: '8.63',
      price: '252.77',
      usd: '300.48',
      btc: '1.14890275'
    }
  ]
};

const getTradeBuyResponseBTC =
{
  status: 'Finished',
  transactions: [
    {
      tid: 9099283,
      fee: '10.65',
      price: '252.77',
      usd: '4840.27',
      btc: '19.14890275'
    },
    {
      tid: 9094883,
      fee: '8.63',
      price: '252.77',
      usd: '300.48',
      btc: '1.14890275'
    }
  ]
};

const getTradeBuyResponseETH = {
  status: 'Finished',
  transactions: [
    {
      usd: '9.96999733',
      price: '686.99000000',
      datetime: '2018-05-16 09:11:20',
      fee: '0.03000000',
      tid: 12356,
      eth: '0.01451258',
      type: 2
    }
  ]
};

const listTransactionsResponse =
  [
    {
      fee: '0.00000000',
      btc_usd: '0.00',
      datetime: '2018-05-17 14:50:43',
      usd: 0,
      btc: 0,
      eth: '-0.01451258',
      type: '1',
      id: 66231357,
      eur: 0
    },
    {
      usd: '-9.97',
      order_id: 1234,
      datetime: '2018-05-16 09:11:20',
      fee: '0.03',
      btc: 0,
      eth: '0.01451258',
      eth_usd: 686.99,
      type: '2',
      id: 4321,
      eur: 0
    },
    {
      usd: '-9.97',
      btc_usd: 8225.14,
      order_id: 1235,
      datetime: '2018-05-16 09:11:03',
      fee: '0.03',
      btc: '0.00121213',
      type: '2',
      id: 4322,
      eur: 0
    },
    {
      usd: '-0.00',
      btc: '0.10000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: '0',
      id: 10609931,
      datetime: '2016-02-15 12:25:49'
    },
    {
      usd: '0.00',
      btc: '-13.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: '1',
      id: 9214142,
      datetime: '2015-09-03 11:40:46'
    },
    {
      usd: '-137.00',
      btc: '0.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: '0',
      id: 9214109,
      datetime: '2015-09-03 11:30:40'
    },
    {
      usd: '0.00',
      btc: '-20.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: '3',
      id: 9099290,
      datetime: '2015-08-18 14:05:53'
    },
    // EUR transaction
    {
      fee: '0.90',
      btc_usd: '0.00',
      datetime: '2018-07-10 09:23:01',
      usd: 0,
      btc: 0,
      type: '1',
      id: 69854588,
      eur: '-52486.85'
    },
    // BCH transaction
    {
      fee: '0.00000000',
      bch: '0.03655347',
      btc_usd: '0.00',
      datetime: '2018-08-22 11:46:13',
      usd: 0,
      btc: 0,
      type: '0',
      id: 72759801,
      eur: 0
    },
    {
      usd: '-9.97',
      order_id: 1239,
      datetime: '2018-05-16 09:11:20',
      fee: '0.03',
      btc: 0,
      bch: '0.01451258',
      bch_usd: 686.99,
      type: '2',
      id: 4321,
      eur: 0
    }
  ];

const placeTradeResponse =
{
  price: '460',
  amount: '0.0125',
  type: 1,
  id: 111788524,
  datetime: '2016-02-16 14:56:00.272057'
};

const placeBuyTradeInsufficientFundsResponse =
  {
    error: {
      __all__: [ 'You need 359.23 USD to open that order. You have only 125.16 USD available. Check your account balance for details.' ]
    }
  };

const placeSellTradeInsufficientFundsResponse =
  {
    error: {
      __all__: [ 'You have only 0.14141414 BTC available. Check your account balance for details.' ]
    }
  };

module.exports = {
  getTickerResponse: getTickerResponse,
  getBalanceResponse: getBalanceResponse,
  getOrderBookResponseBTC, getOrderBookResponseETH,
  getTradeSellResponse: getTradeSellResponse,
  getTradeBuyResponseBTC, getTradeBuyResponseETH,
  listTransactionsResponse: listTransactionsResponse,
  placeTradeResponse: placeTradeResponse,
  placeBuyTradeInsufficientFundsResponse: placeBuyTradeInsufficientFundsResponse,
  placeSellTradeInsufficientFundsResponse: placeSellTradeInsufficientFundsResponse
};
