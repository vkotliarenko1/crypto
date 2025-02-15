import { useState, useEffect } from "react";

import { CRYPTO_LIST } from "../../constants";
import { getData } from "../../services/getData";
import { calculateRSI } from "../../utils/calculateRSI";
import { Row, Col, Table, Tag } from "antd";

import "./style.css";

const { Column } = Table;

export const RSI = () => {
  const [data, setData] = useState({ oversold: [], overbought: [], all: [] });
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
          return { symbol, rsi };
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

      setData({ oversold, overbought, all });
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRSI();
    setInterval(() => {
      fetchRSI();
    }, 1000 * 60);
  }, []);

  return (
    <Row gutter={[40, 40]}>
      <Col span={24}>
        <h1>Total count: {data.all.length}</h1>
      </Col>
      <Col span={12}>
        <h2>Overbought</h2>
        <Table
          dataSource={data.overbought}
          pagination={false}
          style={{ "box-shadow": "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
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
        </Table>
      </Col>
      <Col span={12}>
        <h2>Oversold</h2>
        <Table
          dataSource={data.oversold}
          pagination={false}
          style={{ "box-shadow": "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
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
        </Table>
      </Col>
      <Col span={24}>
        <h2>All</h2>
        <Table
          dataSource={data.all}
          style={{ "box-shadow": "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
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
        </Table>
      </Col>
    </Row>
  );
};
