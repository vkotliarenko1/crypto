import { useState, useEffect } from "react";
import { CRYPTO_LIST } from "../../constants";
import { getData } from "../../services/getData";
import { calculateRSI } from "../../utils/calculateRSI";
import { Row, Col, Table, Tag, Button } from "antd";

import "./style.css";

const { Column } = Table;

export const RSI = () => {
  const [data, setData] = useState({
    oversold: [],
    overbought: [],
    all: [],
    but: [],
    sell: [],
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
          const smaSignal = checkSignals(prices, rsi);

          return { symbol, rsi, smaSignal };
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
      const sell = all.filter((item) => item.smaSignal === "SELL");
      const buy = all.filter((item) => item.smaSignal === "BUY");

      setData({ oversold, overbought, all, buy, sell });
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  function calculateSMA(data, period) {
    const smaValues = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, value) => acc + value, 0);
      smaValues.push(sum / period);
    }
    return smaValues;
  }

  function checkSignals(prices, rsi, fastPeriod = 9, slowPeriod = 21) {
    if (prices.length < slowPeriod) return null;

    const fastSMA = calculateSMA(prices, fastPeriod);
    const slowSMA = calculateSMA(prices, slowPeriod);

    const lastFastSMA = fastSMA[fastSMA.length - 1];
    const lastSlowSMA = slowSMA[slowSMA.length - 1];

    const previousFastSMA = fastSMA[fastSMA.length - 2];
    const previousSlowSMA = slowSMA[slowSMA.length - 2];

    if (previousFastSMA < previousSlowSMA && lastFastSMA > lastSlowSMA) {
      if (rsi < 30) return "BUY";
    } else if (previousFastSMA > previousSlowSMA && lastFastSMA < lastSlowSMA) {
      if (rsi > 70) return "SELL";
    }
    return "HOLD";
  }

  const refresh = () => {
    fetchRSI();
  };

  return (
    <Row gutter={[40, 40]}>
      <Col span={12}>
        <h1>Total count: {data.all.length}</h1>
      </Col>
      <Col span={12}>
        <Button onClick={refresh}>Refresh</Button>
      </Col>
      <Col span={12} xs={{ span: 24 }}>
        <h2>Overbought</h2>
        <Table
          dataSource={data.overbought}
          pagination={false}
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
      <Col span={12} xs={{ span: 24 }}>
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
      <Col span={12} xs={{ span: 24 }}>
        <h2>Buy</h2>
        <Table
          dataSource={data.buy}
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
      <Col span={12} xs={{ span: 24 }}>
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
