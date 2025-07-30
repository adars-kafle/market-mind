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
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Loader2, ArrowUpCircle, ArrowDownCircle, HelpCircle, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisResults } from "@/components/analysis-results";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

type SortableColumn = 'ticker' | 'companyName' | 'price' | 'changePercent' | 'marketCap' | 'overallScore' | 'expectedMove' | 'status';
type SortDirection = 'ascending' | 'descending';

export const StockTable = React.forwardRef((props, ref) => {
  const [stocks, setStocks] = React.useState<Stock[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalStocks, setTotalStocks] = React.useState(0);
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableColumn; direction: SortDirection } | null>({ key: 'marketCap', direction: 'descending' });
  const rowRefs = React.useRef<Record<string, HTMLTableRowElement | null>>({});

  const { toast } = useToast();

  const fetchStocks = React.useCallback(async (page: number) => {
    setIsLoading(true);
    setExpandedRows({});
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
  
  const sortedStocks = React.useMemo(() => {
    let sortableItems = [...stocks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const getVal = (item: Stock, key: SortableColumn) => {
            if (key === 'overallScore' || key === 'expectedMove' || key === 'status') {
                return item.analysis ? item.analysis[key] : null;
            }
            return item[key as keyof Stock];
        }

        const aVal = getVal(a, sortConfig.key);
        const bVal = getVal(b, sortConfig.key);

        if (aVal === null || bVal === null) return 0;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            if (sortConfig.key === 'marketCap') {
                const aNum = parseFloat(aVal.replace('T', '000').replace('B', ''));
                const bNum = parseFloat(bVal.replace('T', '000').replace('B', ''));
                 if (aNum < bNum) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aNum > bNum) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            }
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
        
        return 0;
      });
    }
    return sortableItems;
  }, [stocks, sortConfig]);

  const requestSort = (key: SortableColumn) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (columnName: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="h-4 w-4 ml-2" />;
    }
    return <ChevronDown className="h-4 w-4 ml-2" />;
  };

  React.useImperativeHandle(ref, () => ({
    focusOnTicker: async (ticker: string) => {
      const stockOnPage = stocks.find(s => s.ticker.toUpperCase() === ticker.toUpperCase());
      if (stockOnPage) {
        setExpandedRows(prev => ({ [ticker.toUpperCase()]: !prev[ticker.toUpperCase()] }));
        setTimeout(() => rowRefs.current[ticker.toUpperCase()]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else {
        toast({ title: "Not on current page", description: `Please navigate to the page containing ${ticker}.` });
      }
    }
  }));


  const handleToggleRow = (ticker: string) => {
    setExpandedRows(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  const totalPages = Math.ceil(totalStocks / PAGE_SIZE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('strong bullish')) return 'bg-green-600 text-white';
    if (lowerStatus.includes('bullish')) return 'bg-green-500 text-white';
    if (lowerStatus.includes('strong bearish')) return 'bg-red-600 text-white';
    if (lowerStatus.includes('bearish')) return 'bg-red-500 text-white';
    if (lowerStatus.includes('sideways')) return 'bg-yellow-500 text-black';
    return 'bg-gray-400 text-black';
  };

  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">S.N.</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('ticker')}>
                  <div className="flex items-center">Ticker {getSortIcon('ticker')}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('companyName')}>
                  <div className="flex items-center">Company Name {getSortIcon('companyName')}</div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('price')}>
                  <div className="flex items-center justify-end">Price (LTP) {getSortIcon('price')}</div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('changePercent')}>
                  <div className="flex items-center justify-end">Change {getSortIcon('changePercent')}</div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('marketCap')}>
                  <div className="flex items-center justify-end">Market Cap {getSortIcon('marketCap')}</div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => requestSort('overallScore')}>
                  <div className="flex items-center justify-center">MarketMind Score {getSortIcon('overallScore')}</div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => requestSort('expectedMove')}>
                  <div className="flex items-center justify-center">Expected Move {getSortIcon('expectedMove')}</div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => requestSort('status')}>
                  <div className="flex items-center justify-center">Status {getSortIcon('status')}</div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={10}>
                       <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : sortedStocks.map((stock, index) => (
                  <React.Fragment key={stock.ticker}>
                    <TableRow ref={el => rowRefs.current[stock.ticker] = el}>
                      <TableCell>{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                      <TableCell className="font-medium">{stock.ticker}</TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <span className={cn(stock.change >= 0 ? "text-green-600" : "text-red-600")}>
                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                         </span>
                      </TableCell>
                      <TableCell className="text-right">{stock.marketCap}</TableCell>
                      
                      {stock.analysis ? (
                        <>
                          <TableCell className="text-center font-bold">
                            <span className={cn(
                                stock.analysis.overallScore > 7 ? "text-green-600" :
                                stock.analysis.overallScore > 5.5 ? "text-green-500" :
                                stock.analysis.overallScore > 4.5 ? "text-yellow-600" :
                                "text-red-500"
                            )}>
                                {stock.analysis.overallScore.toFixed(1)}/10
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                               {stock.analysis.expectedMove > 0 && <ArrowUpCircle className="h-5 w-5 text-green-500" />}
                               {stock.analysis.expectedMove < 0 && <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                               {stock.analysis.expectedMove === 0 && <HelpCircle className="h-5 w-5 text-yellow-500" />}
                               <span className={cn("ml-1", stock.analysis.expectedMove >= 0 ? "text-green-600" : "text-red-600")}>
                                   {stock.analysis.expectedMove.toFixed(2)}%
                               </span>
                            </div>
                          </TableCell>
                           <TableCell className="text-center">
                            <Badge className={cn("text-xs", getStatusColor(stock.analysis.status))}>
                                {stock.analysis.status}
                            </Badge>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Analysis not available
                        </TableCell>
                      )}

                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleRow(stock.ticker)} className="h-8 w-8" disabled={!stock.analysis}>
                          {expandedRows[stock.ticker] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows[stock.ticker] && stock.analysis && (
                        <TableRow>
                            <TableCell colSpan={10} className="p-0">
                                <div className="p-4 bg-muted/50">
                                    <AnalysisResults 
                                        analysis={stock.analysis} 
                                        isLoading={false}
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
