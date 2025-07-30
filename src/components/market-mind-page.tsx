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
            <AnalysisResults analysis={analysis} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
