import { NextResponse } from "next/server"

interface AlpacaQuote {
  t: string
  ap: number
  bp: number
}

interface AlpacaBar {
  c: number
  t: string
}

interface AlpacaBarsResponse {
  bars: {
    [symbol: string]: AlpacaBar[]
  }
}

function calculateMidPrice(quote: AlpacaQuote): number {
  if (quote.ap > 0 && quote.bp > 0) return (quote.ap + quote.bp) / 2
  if (quote.ap > 0) return quote.ap
  if (quote.bp > 0) return quote.bp
  return 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "LQD"

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
    },
  }

  try {
    // Step 1: Get latest quote for fallback price
    const latestUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`
    const latestRes = await fetch(latestUrl, options)
    
    let latestData: { quotes: { [symbol: string]: AlpacaQuote } } | null = null
    if (latestRes.ok && latestRes.headers.get("content-type")?.includes("application/json")) {
      try {
        latestData = (await latestRes.json()) as { quotes: { [symbol: string]: AlpacaQuote } }
      } catch (e) {
        console.warn("Failed to parse latest quote JSON:", e)
      }
    } else {
      console.warn(`Alpaca quote API returned ${latestRes.status}, using mock data`)
    }
    
    const latestQuote = latestData?.quotes?.[symbol]
    const latestDate = new Date(latestQuote?.t ?? Date.now())
    const midPrice = latestQuote ? calculateMidPrice(latestQuote) : null

    // Step 2: Get the most recent 10 bars
    const barsUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1Day&limit=10`
    const barsRes = await fetch(barsUrl, options)
    
    let barsData: AlpacaBarsResponse | null = null
    if (barsRes.ok && barsRes.headers.get("content-type")?.includes("application/json")) {
      try {
        barsData = (await barsRes.json()) as AlpacaBarsResponse
      } catch (e) {
        console.warn("Failed to parse bars JSON:", e)
      }
    } else {
      console.warn(`Alpaca bars API returned ${barsRes.status}, using mock data`)
    }
    
    const bars = barsData?.bars?.[symbol] ?? []

    const sortedBars = bars
      .filter((b) => typeof b?.c === "number")
      .sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime())

    console.log("✅ Sorted Bars:", sortedBars)

    const currentBar = sortedBars[0] ?? null
    const previousBar = sortedBars[1] ?? null

    const response = {
      symbol,
      price: currentBar?.c ?? midPrice ?? null,
      previousClose: previousBar?.c ?? midPrice ?? null,
      timestamp: currentBar?.t ?? latestQuote?.t ?? null,
      fallbackUsed: previousBar == null,
      dates: {
        current: currentBar?.t ?? null,
        previous: previousBar?.t ?? null,
        quote: latestQuote?.t ?? null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching market data:", error)
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}
