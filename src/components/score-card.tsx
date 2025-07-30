"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  colorClass: string;
}

export function ScoreCard({ title, score, icon, colorClass }: ScoreCardProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => setProgress(score * 10), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getSentiment = (score: number) => {
    if (score > 7) return "Strong";
    if (score > 4) return "Neutral";
    return "Weak";
  };
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-6 w-6 ${colorClass} text-white rounded-md flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{score.toFixed(1)}/10</div>
        <p className="text-xs text-muted-foreground">{getSentiment(score)} outlook</p>
        <Progress value={progress} className={`mt-4 h-2 [&>*]:${colorClass}`} />
      </CardContent>
    </Card>
  );
}
