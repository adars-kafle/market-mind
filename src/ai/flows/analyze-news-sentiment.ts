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
  prompt: `You are a financial analyst specializing in sentiment analysis. For the given stock ticker, you must decide if you need to fetch recent news headlines or get the overall market sentiment score to perform your analysis.

Your task is to:

1. Use the provided tools to gather relevant data (news headlines, market sentiment).
2.  Analyze the sentiment of each news headline and generate a numerical polarity score for each, ranging from -1 (very negative) to 1 (very positive).
3.  Aggregate the individual headline sentiment scores to calculate an overall sentiment score for the given ticker.
4.  Incorporate the overall market sentiment score into your analysis if you decide to use it.
5.  Provide a brief explanation of your reasoning for the assigned sentiment scores.
6. Return the headlines you used for the analysis.

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
