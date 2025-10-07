import { NextRequest } from "next/server"

// Check for required environment variables
if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
  console.error("Missing required Alpaca API environment variables")
}

const ALPACA_API_KEY = process.env.APCA_API_KEY_ID ?? ""
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY ?? ""
const DATA_URL = "https://data.alpaca.markets"

// Log environment variable status on startup
console.log("API Configuration Status:", {
  hasApiKey: !!ALPACA_API_KEY,
  hasApiSecret: !!ALPACA_API_SECRET,
  dataUrl: DATA_URL,
})

interface AlpacaQuote {
  ap: number // ask price
  as: number // ask size
  bp: number // bid price
  bs: number // bid size
  t: string // timestamp
}

interface AlpacaResponse {
  [symbol: string]: AlpacaQuote[]
}

// Generate mock data for fallback
function generateMockData(ticker: string) {
  const basePrice =
    {
      SUSC: 108.5, //  US Corporate Bond Token
      LQD: 107.25, // iShares iBoxx $ Investment Grade Corporate Bond ETF
    }[ticker] || 100.0

  const data = []
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 90) // Get last 90 days

  // Generate data for each day in the range
  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // Calculate days from start for trend
    const daysSinceStart = Math.floor(
      (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Create a slight upward trend with some random variation
    const dayFactor = 1 + daysSinceStart * 0.0002 // Small daily increase
    const randomFactor = 0.997 + Math.random() * 0.006 // ±0.3% random variation
    const price = basePrice * dayFactor * randomFactor

    // Add small intraday variation
    const variance = price * 0.001 // 0.1% intraday variance
    const open = price + (Math.random() - 0.5) * variance
    const close = price + (Math.random() - 0.5) * variance
    const high = Math.max(open, close) + Math.random() * variance * 0.5
    const low = Math.min(open, close) - Math.random() * variance * 0.5

    // Volume between 100K-300K for bonds
    const volume = Math.floor(100000 + Math.random() * 200000)

    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]

    data.push({
      time: formattedDate,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      quote: {
        t: new Date(date).toISOString(),
        ap: Math.round((close + variance * 0.5) * 100) / 100,
        bp: Math.round((close - variance * 0.5) * 100) / 100,
        as: Math.floor(volume / 2),
        bs: Math.floor(volume / 2),
      },
    })
  }

  return data
}

async function fetchHistoricalData(
  ticker: string,
  retryCount = 0
): Promise<any[]> {
  try {
    // If no API keys configured, return mock immediately
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return generateMockData(ticker)
    }
    // Use fixed dates from the UI
    const startStr = "2025-04-05"
    const endStr = "2025-07-04"

    console.log("Date range:", {
      start: startStr,
      end: endStr,
      now: new Date().toISOString(),
    })

    let allAuctions: any[] = []
    let nextPageToken: string | null = null
    let seenTokens = new Set<string>()
    let pageCount = 0
    const MAX_PAGES = 10

    while (pageCount < MAX_PAGES) {
      let url = `${DATA_URL}/v2/stocks/${ticker}/auctions?start=${startStr}&end=${endStr}&limit=10000`
      if (nextPageToken) {
        url += `&page_token=${nextPageToken}`
      }

      console.log("Fetching auctions page:", {
        pageCount,
        url,
        nextPageToken,
      })

      const response = await fetch(url, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
      })

      if (!response.ok) {
        console.warn("Alpaca returned non-200:", response.status)
        // Fallback early on auth/rate limits
        if (response.status === 401 || response.status === 403 || response.status === 429) {
          return generateMockData(ticker)
        }
        // Other errors: break and use whatever collected or mock
        return generateMockData(ticker)
      }

      const data = await response.json()

      // Check if we have valid auctions data
      if (
        !data.auctions ||
        !Array.isArray(data.auctions) ||
        data.auctions.length === 0
      ) {
        console.log("No more auctions available, stopping pagination")
        break
      }

      allAuctions = allAuctions.concat(data.auctions)

      if (!data.next_page_token) {
        console.log("No next page token, finished fetching")
        break
      }

      if (seenTokens.has(data.next_page_token)) {
        console.log("Duplicate page token detected, stopping pagination")
        break
      }

      nextPageToken = data.next_page_token
      if (nextPageToken) {
        seenTokens.add(nextPageToken)
      }
      pageCount++
    }

    console.log("Finished fetching auctions:", {
      totalAuctions: allAuctions.length,
      totalPages: pageCount,
    })

    if (allAuctions.length === 0) {
      console.log("No auctions found for the specified date range")
      return []
    }

    // Process auctions into daily OHLC data
    const dailyData = new Map()

    for (const auction of allAuctions) {
      const date = auction.d // Use the date field directly

      // Initialize the daily data if not exists
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          t: date,
          o: null, // Will be set by opening auction
          h: -Infinity,
          l: Infinity,
          c: null, // Will be set by closing auction
          v: 0,
        })
      }

      const dayData = dailyData.get(date)

      // Process opening auctions
      if (auction.o && Array.isArray(auction.o)) {
        for (const trade of auction.o) {
          if (dayData.o === null) {
            dayData.o = trade.p // Set opening price from first opening auction
          }
          dayData.h = Math.max(dayData.h, trade.p)
          dayData.l = Math.min(dayData.l, trade.p)
          dayData.v += trade.s
        }
      }

      // Process closing auctions
      if (auction.c && Array.isArray(auction.c)) {
        for (const trade of auction.c) {
          dayData.h = Math.max(dayData.h, trade.p)
          dayData.l = Math.min(dayData.l, trade.p)
          dayData.c = trade.p // Last closing auction price becomes the close
          dayData.v += trade.s
        }
      }

      // If we somehow don't have an opening price, use the first price we saw
      if (dayData.o === null && dayData.c !== null) {
        dayData.o = dayData.c
      }

      // Reset infinity values if no trades
      if (dayData.h === -Infinity) dayData.h = dayData.o || 0
      if (dayData.l === Infinity) dayData.l = dayData.o || 0
    }

    // Convert to array and sort by date
    const result = Array.from(dailyData.values())
      .filter((day) => day.o !== null && day.c !== null) // Only include days with valid data
      .sort((a, b) => a.t.localeCompare(b.t))

    console.log("Processed daily data:", {
      days: result.length,
      firstDay: result[0]?.t,
      lastDay: result[result.length - 1]?.t,
      sampleData: result[0],
    })

    return result
  } catch (error: any) {
    console.error("Error fetching historical data for " + ticker + ":", error)

    if (retryCount < 3) {
      console.log("Waiting 2 seconds before retry...")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return fetchHistoricalData(ticker, retryCount + 1)
    }

    // On persistent errors, return mock data
    return generateMockData(ticker)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    console.log("API Configuration Status:", {
      hasApiKey: !!ALPACA_API_KEY,
      hasApiSecret: !!ALPACA_API_SECRET,
      dataUrl: DATA_URL,
    })

    // Get the ticker from the URL params
    const { ticker } = await params

    // Validate ticker
    if (!ticker || typeof ticker !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid ticker symbol",
        }),
        { status: 400 }
      )
    }

    const historicalData = await fetchHistoricalData(ticker)

    if (!historicalData || historicalData.length === 0) {
      // last resort: mock
      const mock = generateMockData(ticker)
      const latestMock = mock[mock.length - 1]
      const currentPrice = latestMock?.close ?? 108.5
      const estimatedShares = 100000000
      const marketCap = currentPrice * estimatedShares
      return new Response(
        JSON.stringify({
          ticker: ticker,
          currentPrice,
          priceChange: 0,
          priceChangePercent: 0,
          volume: latestMock?.volume ?? 200000,
          marketCap: Math.round(marketCap),
          historicalData: mock,
          dataSource: "mock",
        })
      )
    }

    // Get the latest and previous quotes
    const latestQuote = historicalData[historicalData.length - 1]
    const prevQuote = historicalData[historicalData.length - 2] || latestQuote

    // Calculate price changes
    const currentPrice = latestQuote.c ?? 0
    const priceChange = currentPrice - (prevQuote?.c ?? currentPrice)
    const priceChangePercent = prevQuote?.c ? (priceChange / prevQuote.c) * 100 : 0
    
    // Get volume from latest quote (v field) or calculate average
    const volume = latestQuote?.v ?? historicalData.reduce((sum, d) => sum + (d.v ?? 0), 0) / historicalData.length
    
    // Calculate market cap (rough estimate: price * estimated shares outstanding)
    // For ETFs/bonds, use a default market cap calculation
    const estimatedShares = 100000000 // Rough estimate for popular stocks/ETFs
    const marketCap = currentPrice * estimatedShares

    return new Response(
      JSON.stringify({
        ticker: ticker,
        currentPrice,
        priceChange,
        priceChangePercent,
        volume: Math.round(volume),
        marketCap: Math.round(marketCap),
        historicalData,
        dataSource: "alpaca",
      })
    )
  } catch (error) {
    console.error(error)
    // final fallback
    const { ticker } = await params
    const mock = generateMockData(ticker)
    const latestMock = mock[mock.length - 1]
    const currentPrice = latestMock?.close ?? 108.5
    const estimatedShares = 100000000
    const marketCap = currentPrice * estimatedShares
    return new Response(
      JSON.stringify({
        ticker: ticker,
        currentPrice,
        priceChange: 0,
        priceChangePercent: 0,
        volume: latestMock?.volume ?? 200000,
        marketCap: Math.round(marketCap),
        historicalData: mock,
        dataSource: "mock",
      })
    )
  }
}
