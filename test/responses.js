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
  usd_available: '49.00'
};

const getOrderBookResponse =
{
  timestamp: '1455629907',
  bids: [
    ['403.53', '0.81383821'],
    ['403.35', '1.61018019']
  ],
  asks: [
    ['404.00', '19.67704402'],
    ['404.39', '7.36300000']
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

const getTradeBuyResponse =
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

const listTransactionsResponse =
  [
    {usd: '-124.37',
      btc: '0.04906037',
      btc_usd: '2535.01',
      order_id: 24870681,
      fee: '0.14000000',
      type: 2,
      id: 16180467,
      datetime: '2017-06-14 20:28:33'},
    {usd: '-249.26',
      btc: '0.09790521',
      btc_usd: '2545.96',
      order_id: 24882718,
      fee: '0.28000000',
      type: 2,
      id: 16181386,
      datetime: '2016-06-14 20:46:46'},
    {usd: '-55.21',
      btc: '0.02174610',
      btc_usd: '2538.97',
      order_id: 24880122,
      fee: '0.07000000',
      type: 2,
      id: 16181233,
      datetime: '2016-06-14 20:42:58'},
    {
      usd: '-0.00',
      btc: '0.10000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: 0,
      id: 10609931,
      datetime: '2016-02-15 12:25:49'
    },
    {
      usd: '0.00',
      btc: '-13.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: 1,
      id: 9214142,
      datetime: '2015-09-03 11:40:46'
    },
    {
      usd: '-137.00',
      btc: '0.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: 0,
      id: 9214109,
      datetime: '2015-09-03 11:30:40'
    },
    {
      usd: '0.00',
      btc: '-20.00000000',
      btc_usd: '0.00',
      order_id: null,
      fee: '0.00',
      type: 3,
      id: 9099290,
      datetime: '2015-08-18 14:05:53'
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
      __all__: ['You need 359.23 USD to open that order. You have only 125.16 USD available. Check your account balance for details.']
    }
  };

const placeSellTradeInsufficientFundsResponse =
  {
    error: {
      __all__: ['You have only 0.14141414 BTC available. Check your account balance for details.']
    }
  };

module.exports = {
  getTickerResponse: getTickerResponse,
  getBalanceResponse: getBalanceResponse,
  getOrderBookResponse: getOrderBookResponse,
  getTradeSellResponse: getTradeSellResponse,
  getTradeBuyResponse: getTradeBuyResponse,
  listTransactionsResponse: listTransactionsResponse,
  placeTradeResponse: placeTradeResponse,
  placeBuyTradeInsufficientFundsResponse: placeBuyTradeInsufficientFundsResponse,
  placeSellTradeInsufficientFundsResponse: placeSellTradeInsufficientFundsResponse
};
