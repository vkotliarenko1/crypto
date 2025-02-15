import axios from "axios";

export const getData = async (symbol) => {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`;
  const { data } = await axios.get(url);
  return data;
};
