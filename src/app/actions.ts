"use server";

import { analyzeNewsSentiment, type AnalyzeNewsSentimentOutput } from "@/ai/flows/analyze-news-sentiment";
import { z } from "zod";

export interface AnalysisResult {
  ticker: string;
  expectedMove: number;
  scores: {
    technicalPatterns: number;
    movingAverage: number;
    relativeStrength: number;
    shortInterest: number;
    sentiment: number;
    analystSentiment: number;
    insiderActivity: number;
    earningsCatalyst: number;
  };
  sentimentAnalysis: AnalyzeNewsSentimentOutput & { headlines: string[] };
}

const tickerSchema = z.string().min(1).max(10);

// Helper to generate a random number in a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

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

  // Mock data for sentiment analysis
  const mockNewsHeadlines = [
    `${validatedTicker} announces record Q3 earnings, beating analyst expectations.`,
    `New product launch from ${validatedTicker} receives positive initial reviews.`,
    "Analyst upgrades ${validatedTicker} to 'Strong Buy' with a new $250 price target.",
    "Global chip shortage could impact ${validatedTicker}'s production pipeline.",
    "SEC launches inquiry into ${validatedTicker}'s accounting practices."
  ];

  const mockMarketSentimentScore = randomInRange(0.3, 0.8);

  let sentimentAnalysisResult: AnalyzeNewsSentimentOutput;

  try {
    sentimentAnalysisResult = await analyzeNewsSentiment({
        ticker: validatedTicker,
        newsHeadlines: mockNewsHeadlines,
        overallMarketSentimentScore: mockMarketSentimentScore
    });
  } catch(e) {
      console.error("AI sentiment analysis failed:", e);
      // Fallback in case AI fails
      sentimentAnalysisResult = {
        sentimentPolarityScores: mockNewsHeadlines.map(() => randomInRange(-0.5, 0.5)),
        overallSentimentScore: randomInRange(-1, 1),
        reasoning: "AI analysis was unavailable. This is a fallback based on random data."
      }
  }


  // Mock quantitative scoring
  const scores = {
    technicalPatterns: randomInRange(3, 9),
    movingAverage: randomInRange(4, 9.5),
    relativeStrength: randomInRange(5, 8),
    shortInterest: randomInRange(2, 9), // High score is bad for short interest
    sentiment: (sentimentAnalysisResult.overallSentimentScore * 4.5) + 5, // Scale from [-1,1] to [0.5, 9.5]
    analystSentiment: randomInRange(6, 9),
    insiderActivity: randomInRange(3, 7),
    earningsCatalyst: randomInRange(2, 8),
  };
  
  const expectedMove = (Object.values(scores).reduce((a,b) => a+b, 0) / 80 - 0.5) * 5; // Simplified calculation for expected move %

  return {
    ticker: validatedTicker,
    expectedMove,
    scores,
    sentimentAnalysis: {
        ...sentimentAnalysisResult,
        headlines: mockNewsHeadlines
    },
  };
}
