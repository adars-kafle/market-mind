'use server';

/**
 * @fileOverview An AI agent that analyzes the sentiment of news headlines for a given stock ticker.
 *
 * - analyzeNewsSentiment - A function that analyzes the sentiment of news headlines.
 * - AnalyzeNewsSentimentInput - The input type for the analyzeNewsSentiment function.
 * - AnalyzeNewsSentimentOutput - The return type for the analyzeNewsSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mock function to get financial news
const getFinancialNews = ai.defineTool(
    {
      name: 'getFinancialNews',
      description: 'Get the latest financial news headlines for a given stock ticker.',
      inputSchema: z.object({
        ticker: z.string().describe('The stock ticker symbol.'),
      }),
      outputSchema: z.array(z.string()),
    },
    async ({ticker}) => {
      // In a real application, you would fetch this from a news API
      return [
        `${ticker} announces record Q3 earnings, beating analyst expectations.`,
        `New product launch from ${ticker} receives positive initial reviews.`,
        `Analyst upgrades ${ticker} to 'Strong Buy' with a new $250 price target.`,
        `Global chip shortage could impact ${ticker}'s production pipeline.`,
        `SEC launches inquiry into ${ticker}'s accounting practices.`
      ];
    }
);

// Mock function to get market sentiment
const getMarketSentiment = ai.defineTool(
    {
        name: 'getMarketSentiment',
        description: 'Gets the overall market sentiment score.',
        inputSchema: z.object({}),
        outputSchema: z.object({
            score: z.number().describe('A numerical score from -1 (very negative) to 1 (very positive).'),
        }),
    },
    async () => {
        // In a real application, this could be a complex calculation.
        return { score: Math.random() * 1.4 - 0.7 }; // Random score between -0.7 and 0.7
    }
);


const AnalyzeNewsSentimentInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to analyze.'),
});
export type AnalyzeNewsSentimentInput = z.infer<typeof AnalyzeNewsSentimentInputSchema>;

const AnalyzeNewsSentimentOutputSchema = z.object({
  sentimentPolarityScores: z
    .array(z.number())
    .describe('An array of numerical polarity scores, one for each news headline.'),
  overallSentimentScore: z
    .number()
    .describe('An overall numerical score representing the aggregated sentiment of the news headlines.'),
  reasoning: z.string().describe('The reasoning the model used to determine the sentiment.'),
  headlines: z.array(z.string()).describe('The news headlines that were analyzed.'),
});
export type AnalyzeNewsSentimentOutput = z.infer<typeof AnalyzeNewsSentimentOutputSchema>;

export async function analyzeNewsSentiment(input: AnalyzeNewsSentimentInput): Promise<AnalyzeNewsSentimentOutput> {
  return analyzeNewsSentimentFlow(input);
}

const analyzeNewsSentimentPrompt = ai.definePrompt({
  name: 'analyzeNewsSentimentPrompt',
  input: {schema: AnalyzeNewsSentimentInputSchema},
  output: {schema: AnalyzeNewsSentimentOutputSchema},
  tools: [getFinancialNews, getMarketSentiment],
  prompt: `You are a financial analyst specializing in sentiment analysis and quantitative trading strategies based on the "Unconventional RSI" and "20 SMA High/Low Band" methodologies. For the given stock ticker, you must perform an analysis based on a specific set of rules. You can use tools to fetch news or get market sentiment if you determine it's necessary for your analysis.

Your entire analysis MUST adhere to the following trading strategy:

**Core Strategy: Swing Trading with Unconventional RSI and Magic Bands**

**1. Trend Identification (Unconventional RSI)**:
    *   **RSI Range Shifts**: The market trend is defined ONLY by these RSI ranges. Your analysis MUST state which range the stock is in.
        *   **(40-80)**: Bullish
        *   **(60-80)**: Strong Bullish
        *   **(40-60) OR (60-40)**: Sideways
        *   **(60-20)**: Bearish
        *   **(40-20)**: Strong Bearish
    *   **Key Levels**: RSI 40 acts as support in a bull market. RSI 60 acts as resistance in a bear market.

**2. Key Tools & Rules**:
    *   **20-SMA High/Low "Magic Bands"**:
        *   **Slope**: The slope of the SMAs must be upward for long positions and downward for short positions. No trades in a sideways market.
        *   **Market Structure**: This is a MANDATORY condition. The market *must* be forming higher tops and higher bottoms for a long position, and lower tops and lower bottoms for a short position. Do not initiate a trade if this structure is not present.
    *   **GFS (Grandfather-Father-Son) 5-Star Setup (Multi-Timeframe Analysis)**:
        *   **Timeframes**: Daily (grandfather), Hourly (father), and 15-Minute (son). "Higher Timeframe Rules".
        *   **5-Star Long**: Monthly RSI > 60, Weekly RSI > 60, Daily RSI > 60/40.
        *   **5-Star Short**: Monthly RSI above 60, Weekly RSI < 40, Daily RSI < 40/60.

**Your Task**:

1.  Decide if you need to use tools to gather data (news, sentiment scores).
2.  Analyze the sentiment of each news headline you fetch and generate a numerical polarity score for each (-1 to 1).
3.  Aggregate individual scores to calculate an overall sentiment score for the ticker.
4.  Provide a step-by-step reasoning for your analysis. Your reasoning MUST EXPLICITLY state the current RSI Range Shift (e.g., "The stock is in a Strong Bullish trend with an RSI range of 60-80.") and reference the market structure and Magic Band rules. Explain how the current conditions for the ticker align (or don't align) with the strategy.
5.  Return the headlines you used for the analysis.

Ticker: {{{ticker}}}
`,
});

const analyzeNewsSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeNewsSentimentFlow',
    inputSchema: AnalyzeNewsSentimentInputSchema,
    outputSchema: AnalyzeNewsSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeNewsSentimentPrompt(input);
    return output!;
  }
);
