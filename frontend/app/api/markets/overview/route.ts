import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4200";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || "dev-test-key-12345";

// Popular stocks to display
const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "TSLA", name: "Tesla, Inc." },
  { ticker: "MSFT", name: "Microsoft Corporation" },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com, Inc." },
  { ticker: "NVDA", name: "NVIDIA Corporation" },
  { ticker: "META", name: "Meta Platforms, Inc." },
  { ticker: "IBM", name: "IBM Corporation" },
];

export async function GET() {
  try {
    // Get quotes from backend Alpaca service
    const symbols = POPULAR_STOCKS.map((s) => s.ticker).join(",");
    const response = await fetch(
      `${BACKEND_URL}/alpaca/quotes/latest?symbols=${symbols}`,
      {
        headers: {
          "x-api-key": BACKEND_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform quotes to match frontend format
    const stocks = POPULAR_STOCKS.map((stock) => {
      const quote = data.quotes?.[stock.ticker];

      if (quote) {
        const midPrice = (quote.ap + quote.bp) / 2;
        return {
          ticker: stock.ticker,
          name: stock.name,
          price: midPrice,
          change: 0, // Would need historical data
          changePercent: 0,
          volume: "N/A",
          marketCap: "N/A",
          dataSource: "alpaca-rest",
          askPrice: quote.ap,
          bidPrice: quote.bp,
          timestamp: quote.t,
        };
      }

      return null;
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      stocks,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching market overview:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market overview",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
