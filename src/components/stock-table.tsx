"use client";

import * as React from "react";
import { getStocks, getStockByTicker, getAnalysis, type Stock, type AnalysisResult } from "@/app/actions";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResults } from "@/components/analysis-results";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 5;

export const StockTable = React.forwardRef((props, ref) => {
  const [stocks, setStocks] = React.useState<Stock[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalStocks, setTotalStocks] = React.useState(0);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [analysisCache, setAnalysisCache] = React.useState<Record<string, AnalysisResult>>({});
  const [loadingAnalysis, setLoadingAnalysis] = React.useState<Record<string, boolean>>({});
  const rowRefs = React.useRef<Record<string, HTMLTableRowElement | null>>({});

  const { toast } = useToast();

  const fetchStocks = React.useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const { stocks: fetchedStocks, total } = await getStocks(page, PAGE_SIZE);
      setStocks(fetchedStocks);
      setTotalStocks(total);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch stock data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchStocks(currentPage);
  }, [currentPage, fetchStocks]);

  React.useImperativeHandle(ref, () => ({
    focusOnTicker: async (ticker: string) => {
      const stockOnPage = stocks.find(s => s.ticker === ticker);
      if (stockOnPage) {
        setExpandedRows(prev => ({ [ticker]: !prev[ticker] }));
        if (!analysisCache[ticker]) {
           handleToggleRow(ticker);
        }
        setTimeout(() => rowRefs.current[ticker]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else {
        const stock = await getStockByTicker(ticker);
        if (stock) {
          // This is a simplified approach. A full implementation would require
          // calculating the correct page for the ticker and navigating to it.
          toast({ title: "Stock Found", description: `${ticker} is not on the current page. Please navigate to the relevant page.`});
        } else {
          toast({ variant: "destructive", title: "Not Found", description: `Stock with ticker ${ticker} could not be found.` });
        }
      }
    }
  }));


  const handleToggleRow = async (ticker: string) => {
    setExpandedRows(prev => ({ ...prev, [ticker]: !prev[ticker] }));

    if (!analysisCache[ticker]) {
      setLoadingAnalysis(prev => ({...prev, [ticker]: true}));
      try {
        const result = await getAnalysis(ticker);
        setAnalysisCache(prev => ({...prev, [ticker]: result}));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: errorMessage,
        });
        setExpandedRows(prev => ({ ...prev, [ticker]: false }));
      } finally {
        setLoadingAnalysis(prev => ({...prev, [ticker]: false}));
      }
    }
  };

  const totalPages = Math.ceil(totalStocks / PAGE_SIZE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead className="text-right">Price (LTP)</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                       <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : stocks.map((stock) => (
                  <React.Fragment key={stock.ticker}>
                    <TableRow ref={el => rowRefs.current[stock.ticker] = el}>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleRow(stock.ticker)} className="h-8 w-8">
                          {loadingAnalysis[stock.ticker] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : expandedRows[stock.ticker] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{stock.ticker}</TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <span className={cn(stock.change >= 0 ? "text-green-600" : "text-red-600")}>
                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                         </span>
                      </TableCell>
                      <TableCell className="text-right">{stock.marketCap}</TableCell>
                    </TableRow>
                    {expandedRows[stock.ticker] && (
                        <TableRow>
                            <TableCell colSpan={6} className="p-0">
                                <div className="p-4 bg-muted/50">
                                    <AnalysisResults 
                                        analysis={analysisCache[stock.ticker] || null} 
                                        isLoading={loadingAnalysis[stock.ticker] || false}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                  </React.Fragment>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
});

StockTable.displayName = "StockTable";
