from datetime import datetime, timezone

import yfinance as yf
from ddgs import DDGS
from langchain_core.tools import tool


@tool
def get_stock_data(ticker: str) -> str:
    """
    Fetch current and historical financial metrics for a stock ticker.

    Returns company name, current price, P/E ratio, market cap,
    52-week high, and 52-week low.
    """

    ticker = ticker.strip().upper()

    if not ticker:
        return "Error: Stock ticker cannot be empty."

    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info:
            return f"Error: No financial data found for ticker {ticker}."

        company_name = info.get("longName") or info.get("shortName") or ticker

        current_price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
        )

        pe_ratio = (
            info.get("trailingPE")
            or info.get("forwardPE")
        )

        market_cap = info.get("marketCap")
        week_52_high = info.get("fiftyTwoWeekHigh")
        week_52_low = info.get("fiftyTwoWeekLow")

        retrieved_at = datetime.now(timezone.utc).isoformat()

        return (
            f"Company: {company_name}\n"
            f"Ticker: {ticker}\n"
            f"Current Price: {current_price}\n"
            f"P/E Ratio: {pe_ratio}\n"
            f"Market Cap: {market_cap}\n"
            f"52-Week High: {week_52_high}\n"
            f"52-Week Low: {week_52_low}\n"
            f"Retrieved At: {retrieved_at}"
        )

    except Exception as exc:
        return f"Error retrieving stock data for {ticker}: {exc}"


@tool
def get_recent_news(query: str) -> str:
    """
    Search the web for recent news related to a company or stock ticker.

    Returns up to three relevant search results.
    """

    query = query.strip()

    if not query:
        return "Error: Search query cannot be empty."

    try:
        search_query = f"{query} stock financial news"

        results = DDGS().text(
            search_query,
            max_results=3
        )

        if not results:
            return f"No recent news found for: {query}"

        formatted_results = []

        for index, result in enumerate(results, start=1):
            title = result.get("title", "No title")
            url = result.get("href", "")
            snippet = result.get("body", "No description available")

            formatted_results.append(
                f"{index}. {title}\n"
                f"URL: {url}\n"
                f"Summary: {snippet}"
            )

        return "\n\n".join(formatted_results)

    except Exception as exc:
        return f"Error searching for news about {query}: {exc}"