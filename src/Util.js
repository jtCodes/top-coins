import cc from "cryptocompare";

export function getImgSrc(coin) {}

export function getCoinList() {}

export function fetchPrices() {
    cc
    .priceFull(
      ["BTC", "ETH", "ICX", "IOST", "ADA", "VEN", "BNB", "CTR"],
      ["USD", "BTC"]
    )
    .then(prices => {
      prices = Object.keys(prices).map(function(key) {
        return {
          coin: key,
          usd: this[key].USD.PRICE,
          btc: this[key].BTC.PRICE,
          changepct: this[key].USD.CHANGEPCT24HOUR,
          mcap: this[key].USD.MKTCAP
        };
      }, prices);
      this.setState({ prices });
    })
    .catch(console.error);
}
