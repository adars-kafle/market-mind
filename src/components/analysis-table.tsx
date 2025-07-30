"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { scoreIcons, scoreTitles } from "./analysis-results";
import { cn } from "@/lib/utils";

interface AnalysisTableProps {
  scores: { [key: string]: number };
}

const getScoreColor = (key: string, score: number) => {
    if (key === 'shortInterest') {
        return score > 5 ? "bg-red-500" : "bg-green-500";
    }
    return score > 6 ? "bg-green-500" : score < 4 ? "bg-red-500" : "bg-yellow-500";
}

const getSentiment = (key: string, score: number) => {
    const isGood = (key === 'shortInterest' && score <= 5) || (key !== 'shortInterest' && score > 6);
    const isBad = (key === 'shortInterest' && score > 5) || (key !== 'shortInterest' && score < 4);

    if (isGood) return "Positive";
    if (isBad) return "Negative";
    return "Neutral";
}

export function AnalysisTable({ scores }: AnalysisTableProps) {
    const [progress, setProgress] = React.useState<{ [key: string]: number }>({});

    React.useEffect(() => {
        const newProgress: { [key: string]: number } = {};
        Object.keys(scores).forEach(key => {
            newProgress[key] = scores[key] * 10;
        });
        const timer = setTimeout(() => setProgress(newProgress), 100);
        return () => clearTimeout(timer);
    }, [scores]);


  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Factor</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Outlook</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(scores).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium flex items-center gap-2">
                    {scoreIcons[key]}
                    {scoreTitles[key]}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-4">
                        <span className="font-bold w-10">{value.toFixed(1)}/10</span>
                        <Progress value={progress[key] || 0} className="w-[150px] h-2" indicatorClassName={getScoreColor(key, value)} />
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <span className={cn(
                        "font-semibold",
                        getSentiment(key, value) === "Positive" && "text-green-600",
                        getSentiment(key, value) === "Negative" && "text-red-600",
                        getSentiment(key, value) === "Neutral" && "text-gray-500"
                    )}>
                        {getSentiment(key, value)}
                    </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

declare module "@/components/ui/progress" {
    interface ProgressProps {
        indicatorClassName?: string;
    }
}
