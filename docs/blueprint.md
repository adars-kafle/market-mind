# **App Name**: MarketMind

## Core Features:

- Data Acquisition: Fetch ticker data from Finviz.com and third-party data provider APIs.
- Data Enrichment: Enrich acquired data by calculating technical indicators (RSI, SMA, etc.) and performing news sentiment analysis. Also finds swing high and lows to determine market structure.
- Sentiment Analysis: Generate sentiment polarity scores using a generative AI tool. The tool can access a collection of current financial news headlines as well as an overall numerical score representing overall market sentiment and it uses reasoning to decide when or if to incorporate these data sources.
- Quantitative Analysis: Implement a multi-factor scoring model to quantitatively evaluate the stock.
- Output Generation: Format the analysis results into a JSON object, including factor scores and expected price move.
- API Endpoint: Expose system functionality via a RESTful API endpoint.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to evoke trust and stability in financial analysis.
- Background color: Very light blue (#E8EAF6), almost white, creating a clean, professional backdrop.
- Accent color: Yellow-Gold (#FFC107) for highlighting key data points and calls to action.
- Body font: 'Inter', sans-serif, for clear and objective data presentation.
- Headline font: 'Space Grotesk', sans-serif, for impactful headings.
- Use simple, geometric icons to represent different data factors and scores.
- Employ a clear, well-spaced layout to ensure data readability and comprehension.