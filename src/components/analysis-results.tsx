"use client";
import type { AnalysisResult } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Activity,
  Scaling,
  TrendingDown,
  Smile,
  Users,
  Shield,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  HelpCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScoreCard } from "@/components/score-card";
import { cn } from "@/lib/utils";


interface AnalysisResultsProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
}

const scoreIcons: { [key: string]: React.ReactNode } = {
  technicalPatterns: <TrendingUp className="h-4 w-4" />,
  relativeStrength: <Scaling className="h-4 w-4" />,
  shortInterest: <TrendingDown className="h-4 w-4" />,
  sentiment: <Smile className="h-4 w-4" />,
  analystSentiment: <Users className="h-4 w-4" />,
  insiderActivity: <Shield className="h-4 w-4" />,
  earningsCatalyst: <Zap className="h-4 w-4" />,
};

const scoreTitles: { [key: string]: string } = {
  technicalPatterns: "Technical Score",
  relativeStrength: "Relative Strength",
  shortInterest: "Short Interest",
  sentiment: "News Sentiment",
  analystSentiment: "Analyst Sentiment",
  insiderActivity: "Insider Activity",
  earningsCatalyst: "Earnings Catalyst",
};

const getScoreColor = (key: string, score: number) => {
    if (key === 'shortInterest') {
        return score > 5 ? "bg-red-500" : "bg-green-500";
    }
    return score > 6 ? "bg-green-500" : score < 4 ? "bg-red-500" : "bg-yellow-500";
}


export function AnalysisResults({ analysis, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!analysis) {
    return null;
  }
  
  const getOverallSentiment = (score: number) => {
      if (score > 7) return { text: "Strong Bullish", color: "text-green-600" };
      if (score > 5.5) return { text: "Bullish", color: "text-green-500" };
      if (score > 4.5) return { text: "Neutral", color: "text-yellow-500" };
      if (score > 3) return { text: "Bearish", color: "text-red-500" };
      return { text: "Strong Bearish", color: "text-red-600" };
  }

  const overallSentiment = getOverallSentiment(analysis.overallScore);
  const moveDirection = analysis.expectedMove > 0 ? "up" : analysis.expectedMove < 0 ? "down" : "neutral";

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>Overall Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Overall Score</h4>
                  <p className={cn("text-4xl font-bold mt-1", overallSentiment.color)}>
                      {analysis.overallScore.toFixed(1)}/10
                  </p>
                  <p className={cn("text-sm font-semibold mt-1", overallSentiment.color)}>
                      {overallSentiment.text}
                  </p>
              </div>
              <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Expected Move</h4>
                   <div className="flex items-center justify-center mt-1">
                      {moveDirection === 'up' && <ArrowUpCircle className="h-10 w-10 text-green-500" />}
                      {moveDirection === 'down' && <ArrowDownCircle className="h-10 w-10 text-red-500" />}
                      {moveDirection === 'neutral' && <HelpCircle className="h-10 w-10 text-yellow-500" />}
                      <span className={cn("text-4xl font-bold ml-2", moveDirection === 'up' ? 'text-green-600' : moveDirection === 'down' ? 'text-red-600' : 'text-yellow-600' )}>
                        {analysis.expectedMove.toFixed(2)}%
                      </span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-1">in the short-term</p>
              </div>
              <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Final Insight</h4>
                  <p className={cn("text-lg font-semibold mt-2", overallSentiment.color)}>
                      {analysis.overallScore > 7 && "Strong buy candidate based on multiple factors."}
                      {analysis.overallScore > 5.5 && analysis.overallScore <= 7 && "Favorable conditions for a long position."}
                      {analysis.overallScore > 4.5 && analysis.overallScore <= 5.5 && "Neutral outlook. Wait for a clearer signal."}
                      {analysis.overallScore > 3 && analysis.overallScore <= 4.5 && "Unfavorable conditions. Consider a short position."}
                      {analysis.overallScore <= 3 && "Strong sell candidate. High bearish signal."}
                  </p>
              </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Sentiment Analysis</CardTitle>
          <CardDescription>Generated by MarketMind's AI engine for {analysis.ticker}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground italic">"{analysis.sentimentAnalysis.reasoning}"</p>
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>View Headline Sentiment Breakdown</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                    {analysis.sentimentAnalysis.headlines.map((headline, index) => {
                        const score = analysis.sentimentAnalysis.sentimentPolarityScores[index];
                        const badgeColor = score > 0.2 ? 'bg-green-500 hover:bg-green-600' : score < -0.2 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600';
                        return (
                            <li key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted">
                                <span>{headline}</span>
                                <Badge className={badgeColor}>{score.toFixed(2)}</Badge>
                            </li>
                        );
                    })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <div>
          <h3 className="text-xl font-headline font-semibold mb-4 text-center">Detailed Analysis Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysis.scores).map(([key, value]) => (
                  <ScoreCard 
                      key={key}
                      title={scoreTitles[key]}
                      score={value}
                      icon={scoreIcons[key]}
                      colorClass={getScoreColor(key, value)}
                  />
              ))}
          </div>
      </div>
    </div>
  );
}


function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-center">
           <div>
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-10 w-28 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto mt-2" />
           </div>
            <div>
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-10 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mt-2" />
           </div>
            <div>
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-14 w-full" />
           </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-2" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-2 w-full mt-4" />
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
