"use server";

import { analyzeNewsSentiment, type AnalyzeNewsSentimentOutput } from "@/ai/flows/analyze-news-sentiment";
import { z } from "zod";

export interface AnalysisResult {
  ticker: string;
  expectedMove: number;
  overallScore: number;
  status: string;
  scores: {
    sentiment: number;
    technicalPatterns: number;
    relativeStrength: number;
    shortInterest: number;
    earningsCatalyst: number;
    insiderActivity: number;
    analystSentiment: number;
  };
  sentimentAnalysis: AnalyzeNewsSentimentOutput;
}

export interface Stock {
    ticker: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: string;
    analysis?: AnalysisResult;
}

const tickerSchema = z.string().min(1).max(10);

// Helper to generate a random number in a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const mockStocks: Omit<Stock, 'analysis'>[] = [
    { ticker: "AAPL", companyName: "Apple Inc.", price: 172.25, change: 1.50, changePercent: 0.88, marketCap: "2.8T" },
    { ticker: "MSFT", companyName: "Microsoft Corp.", price: 340.54, change: -0.23, changePercent: -0.07, marketCap: "2.5T" },
    { ticker: "GOOGL", companyName: "Alphabet Inc.", price: 138.58, change: 2.12, changePercent: 1.55, marketCap: "1.7T" },
    { ticker: "AMZN", companyName: "Amazon.com, Inc.", price: 140.80, change: -1.40, changePercent: -0.98, marketCap: "1.4T" },
    { ticker: "NVDA", companyName: "NVIDIA Corp.", price: 475.69, change: 5.11, changePercent: 1.09, marketCap: "1.2T" },
    { ticker: "TSLA", companyName: "Tesla, Inc.", price: 250.22, change: -4.89, changePercent: -1.92, marketCap: "798B" },
    { ticker: "META", companyName: "Meta Platforms, Inc.", price: 325.48, change: 1.20, changePercent: 0.37, marketCap: "830B" },
    { ticker: "BRK.B", companyName: "Berkshire Hathaway", price: 360.41, change: 0.78, changePercent: 0.22, marketCap: "780B" },
    { ticker: "JPM", companyName: "JPMorgan Chase & Co.", price: 155.15, change: -1.05, changePercent: -0.67, marketCap: "460B" },
    { ticker: "V", companyName: "Visa Inc.", price: 245.23, change: 0.99, changePercent: 0.41, marketCap: "510B" },
    { ticker: "DIS", companyName: "Walt Disney Co", price: 91.30, change: -0.54, changePercent: -0.59, marketCap: "167B" },
    { ticker: "PYPL", companyName: "PayPal Holdings, Inc.", price: 63.21, change: 1.11, changePercent: 1.79, marketCap: "70B" },
    { ticker: "NFLX", companyName: "Netflix, Inc.", price: 440.76, change: -3.14, changePercent: -0.71, marketCap: "195B" },
    { ticker: "ADBE", companyName: "Adobe Inc.", price: 550.99, change: 2.30, changePercent: 0.42, marketCap: "250B" },
    { ticker: "CRM", companyName: "Salesforce, Inc.", price: 220.88, change: -1.90, changePercent: -0.85, marketCap: "215B" },
];

function getStatusFromReasoning(reasoning: string): string {
    const lowercasedReasoning = reasoning.toLowerCase();
    if (lowercasedReasoning.includes("strong bullish") || /60-80/.test(lowercasedReasoning)) {
        return "Strong Bullish (60-80)";
    }
    if (lowercasedReasoning.includes("bullish") || /40-80/.test(lowercasedReasoning)) {
        return "Bullish (40-80)";
    }
    if (lowercasedReasoning.includes("strong bearish") || /40-20/.test(lowercasedReasoning)) {
        return "Strong Bearish (40-20)";
    }
    if (lowercasedReasoning.includes("bearish") || /60-20/.test(lowercasedReasoning)) {
        return "Bearish (60-20)";
    }
    if (lowercasedReasoning.includes("sideways") || /40-60/.test(lowercasedReasoning) || /60-40/.test(lowercasedReasoning)) {
        return "Sideways (40-60)";
    }
    return "Neutral";
}


export async function getStocks(page: number, pageSize: number): Promise<{stocks: Stock[], total: number}> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedStocks = mockStocks.slice(start, end);
    
    // In a real app, you might do this fetching in parallel
    const stocksWithAnalysis: Stock[] = [];
    for (const stock of paginatedStocks) {
        try {
            const analysis = await getAnalysis(stock.ticker);
            stocksWithAnalysis.push({ ...stock, analysis });
        } catch (error) {
            console.error(`Failed to get analysis for ${stock.ticker}`, error);
            // Add stock without analysis if the call fails
            stocksWithAnalysis.push({ ...stock, analysis: undefined });
        }
    }

    return {
        stocks: stocksWithAnalysis,
        total: mockStocks.length,
    };
}

export async function getStockByTicker(ticker: string): Promise<Stock | undefined> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const stock = mockStocks.find(stock => stock.ticker.toUpperCase() === ticker.toUpperCase());
    if (stock) {
        const analysis = await getAnalysis(ticker);
        return { ...stock, analysis };
    }
    return undefined;
}


export async function getAnalysis(ticker: string): Promise<AnalysisResult> {
  // Validate ticker
  const validation = tickerSchema.safeParse(ticker);
  if (!validation.success) {
    throw new Error("Invalid ticker symbol.");
  }
  const validatedTicker = validation.data;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate potential API error for demonstration
  if (validatedTicker.toUpperCase() === "ERR") {
    throw new Error("Failed to fetch data from Finviz. The service may be down.");
  }

  let sentimentAnalysisResult: AnalyzeNewsSentimentOutput;
  let status: string;

  try {
    sentimentAnalysisResult = await analyzeNewsSentiment({
        ticker: validatedTicker,
    });
    status = getStatusFromReasoning(sentimentAnalysisResult.reasoning);
  } catch(e) {
      console.error("AI sentiment analysis failed:", e);
      // Fallback in case AI fails
      sentimentAnalysisResult = {
        sentimentPolarityScores: [0,0,0,0,0].map(() => randomInRange(-0.5, 0.5)),
        overallSentimentScore: randomInRange(-1, 1),
        reasoning: "AI analysis was unavailable. This is a fallback based on random data.",
        headlines: [
            `${validatedTicker} announces record Q3 earnings, beating analyst expectations.`,
            `New product launch from ${validatedTicker} receives positive initial reviews.`,
            `Analyst upgrades ${validatedTicker} to 'Strong Buy' with a new $250 price target.`,
            `Global chip shortage could impact ${validatedTicker}'s production pipeline.`,
            `SEC launches inquiry into ${validatedTicker}'s accounting practices.`
        ]
      }
      status = "Neutral";
  }


  // Mock quantitative scoring based on specified weights
  const scores = {
    sentiment: (sentimentAnalysisResult.overallSentimentScore * 4.5) + 5, // 20%
    technicalPatterns: randomInRange(3, 9.5), // 20% (RSI, MAs)
    relativeStrength: randomInRange(2, 9),   // 20%
    shortInterest: randomInRange(2, 7),      // 10% (High score is bad)
    earningsCatalyst: randomInRange(4, 9),   // 15%
    insiderActivity: randomInRange(3, 8),    // 7%
    analystSentiment: randomInRange(5, 9),   // 8%
  };
  
  // Simplified weighted calculation for expected move %
  const weightedScore = 
      (scores.sentiment * 0.20) +
      (scores.technicalPatterns * 0.20) +
      (scores.relativeStrength * 0.20) +
      ((10 - scores.shortInterest) * 0.10) + // Invert short interest score
      (scores.earningsCatalyst * 0.15) +
      (scores.insiderActivity * 0.07) +
      (scores.analystSentiment * 0.08);

  const expectedMove = (weightedScore / 10 - 0.5) * 5; 

  return {
    ticker: validatedTicker,
    expectedMove,
    overallScore: weightedScore,
    scores,
    sentimentAnalysis: sentimentAnalysisResult,
    status,
  };
}
