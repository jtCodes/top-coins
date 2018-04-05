import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import TableExamplePositiveNegative from "./Table";
import TodoList from "./Todo";
import axios from "axios";
import api from "binance";
import cc from "cryptocompare";
import { Icon, Table, Container, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import abbreviate from "number-abbreviate";
import Img from "react-image";
import { fetchPrices } from "./Util";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      column: null,
      prices: [],
      direction: null,
      coinList: {}
    };
    this.onClick = this.onClick.bind(this);
  }

  // get coinlist that contains the imgurl info then fetch the price because
  // the url is needed everytime price's state updates
  componentDidMount() {
    cc
      .coinList()
      .then(coinList => {
        this.state.coinList = coinList;
      })
      .then(res => {
        this.fetchPrices(false);
      })
      .catch(console.error);
  }

  handleSort = clickedColumn => () => {
    const { column, prices, direction, coinList } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        prices: prices.sort(function(a, b) {
          let item1 = a[clickedColumn];
          let item2 = b[clickedColumn];
          if (item1 < item2) {
            return -1;
          }
          if (item1 > item2) {
            return 1;
          }
          return 0;
        }),
        direction: "ascending"
      });

      return;
    }
    this.setState({
      prices: prices.reverse(),
      direction: direction === "ascending" ? "descending" : "ascending"
    });
  };

  fetchPrices(refresh) {
    const { column, prices, direction, coinList } = this.state;
    cc
      .priceFull(
        ["BTC", "ETH", "ICX", "IOST", "ADA", "VEN", "BNB", "CTR", "TRX"],
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

        if (refresh) {
          this.setState({
            prices: prices.sort(function(a, b) {
              let item1 = a[column];
              let item2 = b[column];
              if (item1 < item2) {
                return -1;
              }
              if (item1 > item2) {
                return 1;
              }
              return 0;
            })
          });

          // sort method always return list in ascending order
          // this cond ensures the user's prefer state remain unchanged
          if (direction === "descending") {
            this.setState({
              prices: prices.reverse()
            });
          }
        }
      })
      .catch(console.error);
  }

  onClick(e) {
    const refresh = true;
    this.fetchPrices(refresh);
  }

  render() {
    const { column, prices, direction, coinList } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <p className="App-intro">Crypto Tracker</p>
        <Container text>
          <Table sortable celled fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={column === "coin" ? direction : null}
                  onClick={this.handleSort("coin")}
                >
                  Name
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === "usd" ? direction : null}
                  onClick={this.handleSort("usd")}
                >
                  USD
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === "btc" ? direction : null}
                  onClick={this.handleSort("btc")}
                >
                  BTC
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === "changepct" ? direction : null}
                  onClick={this.handleSort("changepct")}
                >
                  1D Change
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === "mcap" ? direction : null}
                  onClick={this.handleSort("mcap")}
                >
                  Market Cap
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {prices.map(price => (
                <Table.Row key={price.coin}>
                  <Table.Cell>
                    <img
                      src={
                        "https://www.cryptocompare.com/" +
                        coinList.Data[price.coin].ImageUrl
                      }
                      alt="icon"
                      height="25"
                      width="25"
                    />{" "}
                    {price.coin}
                  </Table.Cell>
                  <Table.Cell> ${Number(price.usd).toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    {" "}
                    {price.coin == "BTC" ? 1 : price.btc}
                  </Table.Cell>
                  <Table.Cell
                    className={price.changepct > 0 ? "positive" : "negative"}
                  >
                    {price.changepct.toFixed(2)}%
                  </Table.Cell>
                  <Table.Cell> {abbreviate(price.mcap)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button onClick={this.onClick}>Refresh Data</Button>
        </Container>
      </div>
    );
  }
}
export default App;
