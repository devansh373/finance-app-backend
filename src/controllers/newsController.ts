// import { Request, Response } from 'express';
// import { analyzeSentiment } from '../utils/sentimentAnalyzer';

// // This would simulate fetching a headline from a news API
// export const getNewsSentiment = (req: Request, res: Response) => {
//     // ⚠️ In a real app, this text would come from a news API, a comment, etc.
//     const sampleText = "The stock surged 15% today, marking a massive win for investors!";

//     try {
//         const sentimentResult = analyzeSentiment(sampleText);
        
//         return res.json({
//             text: sampleText,
//             analysis: sentimentResult,
//             suggestion: `The market opinion is **${sentimentResult.sentimentLabel}**.`,
//         });

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ msg: "Error analyzing sentiment" });
//     }
// };


import { Request, Response } from "express";
import finnhub, { 
    // getCompanyNews,
     getMarketNews, getNewsSentiment, getStockQuote } from "../services/finnhubService";
import Sentiment from "sentiment";
const sentiment = new Sentiment();


// export const fetchStocks = async (req: Request, res: Response) => {
//   try {
//     const query = req.query.q?.toString() || "";
//     if (!query) {
//       return res.status(400).json({ success: false, message: "Search query is required" });
//     }

//     const stocks = await searchStocks(query);
//     res.status(200).json({ success: true, count: stocks.length, stocks });
//   } catch (error: any) {
//     console.error("Error fetching stocks:", error.message);
//     res.status(500).json({ success: false, message: "Error fetching stocks" });
//   }
// };

// Fetch real-time quote for a stock
export const fetchStockQuote = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ success: false, message: "Symbol is required" });
    }

    const quote = await getStockQuote(symbol.toUpperCase());
    res.status(200).json({ success: true, symbol: symbol.toUpperCase(), quote });
  } catch (error: any) {
    console.error("Error fetching quote:", error.message);
    res.status(500).json({ success: false, message: "Error fetching stock quote" });
  }
};

// Fetch market news
export const fetchMarketNews = async (req: Request, res: Response) => {
  try {
    const category = req.query.category?.toString() || "general";
    const news = await getMarketNews(category);
    res.status(200).json({ success: true, count: news.length, news });
  } catch (error: any) {
    console.error("Error fetching market news:", error.message);
    res.status(500).json({ success: false, message: "Error fetching news" });
  }
};


// export const fetchCompanyNews = async (req: Request, res: Response) => {
//   try {
//     const { symbol } = req.params;

//     if (!symbol) {
//       return res.status(400).json({ success: false, message: "Stock symbol required" });
//     }

//     // Default: fetch news from past 7 days
//     const to = new Date().toISOString().split("T")[0];
//     const fromDate = new Date();
//     fromDate.setDate(fromDate.getDate() - 7);
//     const from = fromDate.toISOString().split("T")[0];

//     const news = await getCompanyNews(symbol.toUpperCase(), from, to);

//     res.status(200).json({
//       success: true,
//       symbol: symbol.toUpperCase(),
//       count: news.length,
//       news,
//     });
//   } catch (error: any) {
//     console.error("Error fetching company news:", error.message);
//     res.status(500).json({ success: false, message: "Error fetching company news" });
//   }
// };


export const fetchStockNewsWithSentiment = async (req:Request, res:Response) => {
  try {
    const { symbol } = req.params;

    // 1️⃣ Fetch news from Finnhub
    const { data: news } = await finnhub.get("/company-news", {
      params: {
        symbol,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
          .toISOString()
          .split("T")[0],
        to: new Date().toISOString().split("T")[0],
      },
    });

    // 2️⃣ Analyze sentiment for each news headline
    const analyzedNews = news.map((n:any) => {
      const analysis = sentiment.analyze(n.headline || "");
      return {
        ...n,
        sentimentScore: analysis.score,
        sentimentLabel:
          analysis.score > 1
            ? "positive"
            : analysis.score < -1
            ? "negative"
            : "neutral",
      };
    });

    // 3️⃣ Aggregate overall sentiment
    const totalScore = analyzedNews.reduce((acc:any, n:any) => acc + n.sentimentScore, 0);
    const avgScore = totalScore / analyzedNews.length || 0;
    const overall =
      avgScore > 1 ? "positive" : avgScore < -1 ? "negative" : "neutral";

    res.status(200).json({
      success: true,
      symbol,
      overallSentiment: overall,
      averageScore: avgScore.toFixed(2),
      news: analyzedNews,
    });
  } catch (err:any) {
    console.error("Error fetching news sentiment:", err.message);
    res.status(500).json({ success: false, message: "Error fetching sentiment" });
  }
};



// Fetch sentiment for specific stock
export const fetchStockSentiment = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ success: false, message: "Stock symbol required" });
    }
    const sentiment = await getNewsSentiment(symbol.toUpperCase());
    res.status(200).json({ success: true, sentiment });
  } catch (error: any) {
    console.error("Error fetching sentiment:", error.message);
    res.status(500).json({ success: false, message: "Error fetching sentiment" });
  }
};
