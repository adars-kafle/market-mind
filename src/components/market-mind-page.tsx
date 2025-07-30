
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAnalysis, type AnalysisResult } from "@/app/actions";
import { Header } from "@/components/header";
import { AnalysisResults } from "@/components/analysis-results";
import { StockTable } from "@/components/stock-table";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formSchema = z.object({
  ticker: z.string().min(1, "Ticker is required.").max(10, "Ticker is too long."),
});

export function MarketMindPage() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await getAnalysis(values.ticker.toUpperCase());
      setAnalysis(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-lg mx-auto py-8 md:py-12">
          <div className="text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
              AI-Powered Trading Analysis
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Get a quantitative evaluation of any equity ticker for its short-term trading potential.
            </p>
          </div>

          <div className="mt-8 md:mt-12 max-w-2xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input placeholder="Enter a stock ticker (e.g., AAPL)" className="pl-10 text-base" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="mt-8 md:mt-12">
            {(isLoading || analysis) && (
              <AnalysisResults analysis={analysis} isLoading={isLoading} />
            )}
          </div>

          <Accordion type="single" collapsible className="w-full mt-8 md:mt-12 max-w-4xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-2xl font-headline font-bold text-center">Strategy Explained</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-4 space-y-4">
                <p>MarketMind employs a multi-faceted quantitative strategy to evaluate the short-term trading potential of a stock. Our analysis is grounded in a combination of technical indicators, sentiment analysis, and fundamental data points. Each factor is scored on a 1-10 scale to provide a comprehensive outlook.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Technical Patterns:</strong> We analyze chart patterns to identify potential bullish or bearish signals. A high score indicates a favorable technical setup.</li>
                    <li><strong>Moving Average:</strong> This score reflects the stock's trend relative to its key moving averages. A high score suggests a strong upward trend.</li>
                    <li><strong>Relative Strength:</strong> Compares the stock's performance to the broader market. A high score means the stock is outperforming.</li>
                    <li><strong>Short Interest:</strong> A high score here is a bearish signal, indicating a large number of investors are betting against the stock.</li>
                    <li><strong>News Sentiment:</strong> Our AI analyzes recent news headlines to gauge market sentiment. Scores range from -1 (very negative) to +1 (very positive).</li>
                    <li><strong>Analyst Sentiment:</strong> Reflects the consensus rating from professional financial analysts.</li>
                    <li><strong>Insider Activity:</strong> Tracks buying and selling activity by company insiders. Significant buying can be a positive signal.</li>
                    <li><strong>Earnings Catalyst:</strong> Measures the potential for an upcoming earnings report to act as a significant price catalyst.</li>
                </ul>
                <p>The final "Expected Move" is a synthesized prediction based on the aggregated scores, giving you a directional insight into the stock's potential over the next trading sessions.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-8 md:my-12" />

          <div className="mt-8 md:mt-12">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Stock Market Overview</h2>
            <StockTable />
          </div>
        </div>
      </main>
    </div>
  );
}
