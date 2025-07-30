import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StrategyDetails() {
  return (
    <div className="space-y-6 text-foreground">
      <p className="text-lg">
        This page uses a sophisticated swing trading strategy based on a combination of technical indicators, primarily the Relative Strength Index (RSI) and a custom 20-period Simple Moving Average (SMA) High/Low band. The goal is to identify and trade with the prevailing market trend.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Trading Timeframes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type of Trading</TableHead>
                <TableHead>Holding Timeframe</TableHead>
                <TableHead>Charting Timeframe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Day Trading</TableCell>
                <TableCell>Minutes to hours</TableCell>
                <TableCell>5-minutes & 15-minute chart</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Swing Trading</TableCell>
                <TableCell>(1-5) days</TableCell>
                <TableCell>60 minute and Daily charts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Positional Trading</TableCell>
                <TableCell>Weeks to Months</TableCell>
                <TableCell>Daily and Weekly Charts</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>(BTST/STBT) Trading</TableCell>
                <TableCell>2-days</TableCell>
                <TableCell>15-minutes & Hourly Charts</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core Strategy: 20-SMA High/Low "Magic Band"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>This is a trend-following strategy. The primary conditions for entering a trade are:</p>
            <ul className="list-disc space-y-2 pl-5">
                <li><span className="font-semibold">MA Slope:</span> The slope of the 20-period SMAs (of High and Low) must be upward for a long position and downward for a short position. No trades are initiated if the MAs are moving sideways.</li>
                <li><span className="font-semibold">Market Structure (Mandatory):</span> For a long position, the price chart must show a pattern of higher tops and higher bottoms. For a short position, it must show lower tops and lower bottoms. This market structure must be confirmed before entry.</li>
                <li><span className="font-semibold">Entry Point:</span> Entries are made near the SMA band, in the direction of the trend.</li>
                <li><span className="font-semibold">Exit Point:</span> Exits are made away from the band as the price extends. Trailing stops are managed based on the low of the previous 2-3 candles.</li>
            </ul>
             <blockquote className="mt-6 border-l-2 pl-6 italic">
              "If we don’t have perfect setup, we won’t Trade"
            </blockquote>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>RSI Unconventional Strategy & Range Shifts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>Instead of using RSI for simple overbought/oversold signals, we use it to define the market trend through "Range Shifts".</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>RSI Range</TableHead>
                        <TableHead>Market Trend</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>40-80</TableCell>
                        <TableCell>Bullish</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>60-80</TableCell>
                        <TableCell>Strong Bullish</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>60-20</TableCell>
                        <TableCell>Bearish</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>40-20</TableCell>
                        <TableCell>Strong Bearish</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>40-60</TableCell>
                        <TableCell>Sideways / Trendless</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <ul className="list-disc space-y-2 pl-5 mt-4">
                <li>In a bull market, an RSI reading of <span className="font-semibold">40</span> is considered the support level or "oversold."</li>
                <li>In a bear market, an RSI reading of <span className="font-semibold">60</span> is considered the resistance level or "overbought."</li>
            </ul>
             <blockquote className="mt-6 border-l-2 pl-6 italic">
                “Higher Timeframe Rules”
            </blockquote>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Timeframe Analysis (Grandfather-Father-Son)</CardTitle>
        </CardHeader>
        <CardContent>
            <p>We use a top-down approach to ensure we are trading in harmony with the larger trend.</p>
            <ul className="list-disc space-y-2 pl-5 mt-4">
                <li><span className="font-semibold">Grandfather:</span> Daily Chart (sets the primary, long-term trend)</li>
                <li><span className="font-semibold">Father:</span> Hourly Chart (sets the intermediate trend)</li>
                <li><span className="font-semibold">Son:</span> 15-Minute Chart (used for trade entry and management)</li>
            </ul>
             <p className="mt-4">A <span className="font-semibold">5-Star Setup</span> occurs when all timeframes align, presenting the highest probability trades.</p>
        </CardContent>
      </Card>
    </div>
  )
}
