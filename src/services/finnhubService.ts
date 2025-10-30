import axios from "axios";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEWS_API_KEY!;

// Generic Axios instance
const finnhub = axios.create({
  baseURL: FINNHUB_BASE_URL,
  headers: { "Content-Type": "application/json" },
  params: { token: FINNHUB_API_KEY },
});


export const searchStocks = async () => {
   const { data } = await finnhub.get("/stock/symbol", {
    //   params: { exchange: "NS" }, // National Stock Exchange of India is in premium plan
      params: { exchange: "US" }, // Free
    });
  return data; // Returns list of stocks
};
// Search stocks by name or symbol (e.g., "HDFC", "RELIANCE")
// export const searchStocks = async (query: string) => {
//   const { data } = await finnhub.get("/search", {
//     params: { q: query },
//   });
//   return data.result; // Returns list of matching stocks
// };

// Get real-time quote (current price, open, high, low, etc.)
export const getStockQuote = async (symbol: string) => {
  const { data } = await finnhub.get("/quote", {
    params: { symbol },
  });
  return data;
};


// Fetch latest market news (general or by category)
export const getMarketNews = async (category: string = "general") => {
  const { data } = await finnhub.get("/news", { params: { category } });
  return data;
};

export const getCompanyNews = async (symbol: string, from: string, to: string) => {
  const { data } = await finnhub.get("/company-news", {
    params: { symbol, from, to },
  });
  return data;
};

// Fetch sentiment for a specific stock symbol
export const getNewsSentiment = async (symbol: string) => {
  const { data } = await finnhub.get("/news-sentiment", { params: { symbol } });
  return data;
};

export default finnhub;
