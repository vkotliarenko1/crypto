import { Table, Tag } from "antd";

const { Column } = Table;

export const Overbought = ({ data }) => {
  return (
    <>
      <h2>Overbought</h2>
      <Table
        dataSource={data}
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
    </>
  );
};
