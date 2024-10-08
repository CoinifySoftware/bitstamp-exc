const TYPE_SELL_ORDER = 'sell';
const TYPE_BUY_ORDER = 'buy';

const TYPE_DEPOSIT = 0;
const TYPE_WITHDRAWAL = 1;
const TYPE_MARKET_TRADE = 2;

const STATE_PENDING = 'pending';
const STATE_COMPLETED = 'completed';

const SUPPORTED_WITHDRAW_CURRENCIES = [ 'ETH', 'BTC', 'BCH' ];
const SUPPORTED_CURRENCY_PAIRS = [ 'btcusd', 'btceur', 'ethusd', 'etheur', 'bchusd', 'bcheur', 'usdcusd', 'usdceur', 'usdtusd', 'usdteur' ];

module.exports = {
  TYPE_SELL_ORDER,
  TYPE_BUY_ORDER,
  TYPE_DEPOSIT,
  TYPE_WITHDRAWAL,
  TYPE_MARKET_TRADE,
  STATE_PENDING,
  STATE_COMPLETED,
  SUPPORTED_WITHDRAW_CURRENCIES,
  SUPPORTED_CURRENCY_PAIRS
};
