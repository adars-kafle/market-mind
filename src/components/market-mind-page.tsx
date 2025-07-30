
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
import { Header } from "@/components/header";
import { StockTable } from "@/components/stock-table";

const formSchema = z.object({
  ticker: z.string().min(1, "Ticker is required.").max(10, "Ticker is too long."),
});

export function MarketMindPage() {
  const [isSearching, setIsSearching] = React.useState(false);
  const stockTableRef = React.useRef<{ focusOnTicker: (ticker: string) => void }>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSearching(true);
    try {
        if (stockTableRef.current) {
            stockTableRef.current.focusOnTicker(values.ticker.toUpperCase());
        }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: errorMessage,
      });
    } finally {
      setIsSearching(false);
      form.reset();
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
                           <Input placeholder="Enter a stock ticker to find in the table (e.g., AAPL)" className="pl-10 text-base" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-12 md:mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Market Overview</h2>
            <StockTable ref={stockTableRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
