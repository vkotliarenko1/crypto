import axios from "axios";

export const getCrypto = async () => {
  const url = "https://fapi.binance.com/fapi/v1/exchangeInfo";
  try {
    const response = await axios.get(url);
    return response.data.symbols.map((s) => s.symbol);
  } catch (error) {
    console.error("Error fetching Binance Futures symbols:", error.message);
    return [];
  }
};
