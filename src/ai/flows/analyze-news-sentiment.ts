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

const AnalyzeNewsSentimentInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to analyze.'),
  newsHeadlines: z.array(z.string()).describe('An array of news headlines related to the stock ticker.'),
  overallMarketSentimentScore: z.number().describe('An overall numerical score representing market sentiment.'),
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
});
export type AnalyzeNewsSentimentOutput = z.infer<typeof AnalyzeNewsSentimentOutputSchema>;

export async function analyzeNewsSentiment(input: AnalyzeNewsSentimentInput): Promise<AnalyzeNewsSentimentOutput> {
  return analyzeNewsSentimentFlow(input);
}

const analyzeNewsSentimentPrompt = ai.definePrompt({
  name: 'analyzeNewsSentimentPrompt',
  input: {schema: AnalyzeNewsSentimentInputSchema},
  output: {schema: AnalyzeNewsSentimentOutputSchema},
  prompt: `You are a financial analyst specializing in sentiment analysis of news headlines related to specific stock tickers.

You will receive an array of news headlines and an overall market sentiment score. Your task is to:

1.  Analyze the sentiment of each news headline and generate a numerical polarity score for each, ranging from -1 (very negative) to 1 (very positive).
2.  Aggregate the individual headline sentiment scores to calculate an overall sentiment score for the given ticker.
3.  Incorporate the overall market sentiment score into your analysis, considering its potential influence on the ticker's sentiment.
4.  Provide a brief explanation of your reasoning for the assigned sentiment scores.

Here's the information you have:

Ticker: {{{ticker}}}
News Headlines:
{{#each newsHeadlines}}
- {{{this}}}
{{/each}}
Overall Market Sentiment Score: {{{overallMarketSentimentScore}}}

Provide your analysis in the following JSON format:
{
"sentimentPolarityScores": [ /* numerical scores for each headline */ ],
  "overallSentimentScore": /* aggregated sentiment score */,
  "reasoning": /* explanation of your reasoning */
}
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
