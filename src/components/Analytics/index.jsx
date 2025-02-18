import { useState } from "react";
import { Row, Col, Table, Tag, Button } from "antd";
import { CRYPTO_LIST } from "../../constants";
import { getData } from "../../services/getData";
import { calculateRSI } from "../../utils/calculateRSI";
import { Overbought } from "../Tables/Overbought";

import "./style.css";

const { Column } = Table;

export const Analytics = () => {
  const [data, setData] = useState({
    oversold: [],
    overbought: [],
    all: [],
    buy: [],
    sell: [],
    buyRSI: [],
    sellRSI: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchRSI = async () => {
    setLoading(true);
    try {
      const symbols = CRYPTO_LIST;
      const period = 14;
      const results = [];

      const promises = symbols.map(async (symbol) => {
        try {
          const data = await getData(symbol);

          const prices = data.map((price) => parseFloat(price[4]));
          if (prices.length < period) return null;

          const rsi = calculateRSI(prices);
          const smaSignalRSI = checkSignals(prices, rsi);
          const smaSignal = checkSignals(prices);

          // Рассчитываем MACD
          const { macdLine, signalLine, histogram } = calculateMACD(prices);
          const lastMacd = macdLine[macdLine.length - 1];
          const lastSignal = signalLine[signalLine.length - 1];
          const macdSignal = lastMacd > lastSignal ? "BUY" : "SELL";

          return { symbol, rsi, smaSignalRSI, smaSignal, macdSignal };
        } catch (err) {
          console.error(`Ошибка для ${symbol}:`, err.message);
          return null;
        }
      });

      const resolvedResults = await Promise.all(promises);

      for (const result of resolvedResults) {
        if (result) {
          results.push(result);
        }
      }

      const all = results;

      const oversold = all.sort((a, b) => a.rsi - b.rsi).slice(0, 10);
      const overbought = all.sort((a, b) => b.rsi - a.rsi).slice(0, 10);
      const sellRSI = all.filter((item) => item.smaSignalRSI === "SELL");
      const buyRSI = all.filter((item) => item.smaSignalRSI === "BUY");
      const sell = all.filter((item) => item.smaSignal === "SELL");
      const buy = all.filter((item) => item.smaSignal === "BUY");
      const macdBuy = all.filter((item) => item.macdSignal === "BUY");
      const macdSell = all.filter((item) => item.macdSignal === "SELL");

      setData({
        oversold,
        overbought,
        all,
        buy,
        sell,
        buyRSI,
        sellRSI,
        macdBuy,
        macdSell,
      });
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1); // Коэффициент сглаживания
    const emaValues = [data[0]]; // Первое значение EMA равно первому значению данных

    for (let i = 1; i < data.length; i++) {
      const ema = data[i] * k + emaValues[i - 1] * (1 - k);
      emaValues.push(ema);
    }

    return emaValues;
  };

  const calculateMACD = (
    prices,
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9
  ) => {
    const fastEMA = calculateEMA(prices, fastPeriod);
    const slowEMA = calculateEMA(prices, slowPeriod);

    // MACD Line: Разница между быстрой и медленной EMA
    const macdLine = fastEMA.map((value, index) => value - slowEMA[index]);

    // Signal Line: EMA от MACD Line
    const signalLine = calculateEMA(macdLine, signalPeriod);

    // Histogram: Разница между MACD Line и Signal Line
    const histogram = macdLine.map((value, index) => value - signalLine[index]);

    return { macdLine, signalLine, histogram };
  };

  const calculateSMA = (data, period) => {
    const smaValues = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, value) => acc + value, 0);
      smaValues.push(sum / period);
    }
    return smaValues;
  };

  function checkSignals(prices, rsi, fastPeriod = 9, slowPeriod = 21) {
    if (prices.length < slowPeriod) return null;

    const fastSMA = calculateSMA(prices, fastPeriod);
    const slowSMA = calculateSMA(prices, slowPeriod);

    const lastFastSMA = fastSMA[fastSMA.length - 1];
    const lastSlowSMA = slowSMA[slowSMA.length - 1];

    const previousFastSMA = fastSMA[fastSMA.length - 2];
    const previousSlowSMA = slowSMA[slowSMA.length - 2];

    if (previousFastSMA < previousSlowSMA && lastFastSMA > lastSlowSMA) {
      if (!rsi) return "BUY";
      if (rsi < 35) return "BUY";
    } else if (previousFastSMA > previousSlowSMA && lastFastSMA < lastSlowSMA) {
      if (!rsi) return "SELL";
      if (rsi > 65) return "SELL";
    }
    return "HOLD";
  }

  const refresh = () => {
    fetchRSI();
  };

  return (
    <Row gutter={[40, 40]}>
      <Col span={24}>
        <h1>Total count: {data.all.length}</h1>
      </Col>
      <Col span={24}>
        <Button type="primary" onClick={refresh}>
          Refresh
        </Button>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>Buy</h2>
        <Table
          dataSource={data.buy}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignal"
            key="smaSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
          <Column
            title="MACD Signal"
            dataIndex="macdSignal"
            key="macdSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>Sell</h2>
        <Table
          dataSource={data.sell}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignal"
            key="smaSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
          <Column
            title="MACD Signal"
            dataIndex="macdSignal"
            key="macdSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>MACD Buy</h2>
        <Table
          dataSource={data.macdBuy}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="MACD Signal"
            dataIndex="macdSignal"
            key="macdSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>

      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>MACD Sell</h2>
        <Table
          dataSource={data.macdSell}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"red"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="MACD Signal"
            dataIndex="macdSignal"
            key="macdSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>Buy RSI</h2>
        <Table
          dataSource={data.buyRSI}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignal"
            key="smaSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>Sell RSI</h2>
        <Table
          dataSource={data.sellRSI}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignal"
            key="smaSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <Overbought data={data.overbought} />
      </Col>
      <Col sm={{ span: 12 }} xs={{ span: 24 }}>
        <h2>Oversold</h2>
        <Table
          dataSource={data.oversold}
          pagination={false}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"green"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignalRSI"
            key="smaSignalRSI"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>

      <Col span={24}>
        <h2>All</h2>
        <Table
          dataSource={data.all}
          style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
        >
          <Column
            title="Name"
            dataIndex="symbol"
            key="name"
            render={(value, record) => (
              <Tag color={"blue"} key={value}>
                {value.toUpperCase()}
              </Tag>
            )}
          />
          <Column title="RSI" dataIndex="rsi" key="rsi" />
          <Column
            title="Signal"
            dataIndex="smaSignal"
            key="smaSignal"
            render={(value) => (
              <Tag
                color={
                  value === "BUY" ? "green" : value === "SELL" ? "red" : "blue"
                }
              >
                {value}
              </Tag>
            )}
          />
        </Table>
      </Col>
    </Row>
  );
};
