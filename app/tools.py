from datetime import datetime, timezone

import requests
from ddgs import DDGS
from langchain_core.tools import tool

from app.config import(FINNHUB_API_KEY,INDIAN_API_KEY,)


FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

@tool
def get_stock_data(ticker: str) -> str:
    """
    Fetch current and fundamental financial metrics for a stock ticker.

    Uses Indian API for NSE/BSE stocks and Finnhub for other stocks.
    """
    ticker = ticker.strip().upper()

    if not ticker:
        return "Error: Stock ticker cannot be empty."

    try:
        # ---------------------------------------------------------
        # Indian stocks: NSE (.NS) / BSE (.BO)
        # ---------------------------------------------------------
        if ticker.endswith(".NS") or ticker.endswith(".BO"):
            indian_name = ticker.rsplit(".", 1)[0]

            headers = {
                "X-Api-Key": INDIAN_API_KEY
            }

            response = requests.get(
                "https://stock.indianapi.in/stock",
                params={"name": indian_name},
                headers=headers,
                timeout=20,
            )

            response.raise_for_status()
            data = response.json()

            if "error" in data:
                return (
                    f"Error retrieving Indian stock data "
                    f"for {ticker}: {data['error']}"
                )

            company_name = data.get(
                "companyName",
                ticker
            )

            current_price_data = data.get(
                "currentPrice",
                {}
            )

            if ticker.endswith(".NS"):
                current_price = current_price_data.get("NSE")
            else:
                current_price = current_price_data.get("BSE")

            # Reusable stock details contain the cleanest
            # fundamental metrics.
            reusable = data.get(
                "stockDetailsReusableData",
                {}
            )

            pe_ratio = reusable.get(
                "pPerEBasicExcludingExtraordinaryItemsTTM"
            )

            market_cap = reusable.get("marketCap")

            week_52_high = data.get("yearHigh")
            week_52_low = data.get("yearLow")

            retrieved_at = datetime.now(
                timezone.utc
            ).isoformat()

            return (
                f"Company: {company_name}\n"
                f"Ticker: {ticker}\n"
                f"Market: {'NSE' if ticker.endswith('.NS') else 'BSE'}\n"
                f"Current Price: {current_price}\n"
                f"P/E Ratio: {pe_ratio}\n"
                f"Market Cap: {market_cap}\n"
                f"52-Week High: {week_52_high}\n"
                f"52-Week Low: {week_52_low}\n"
                f"Retrieved At: {retrieved_at}"
            )

        # ---------------------------------------------------------
        # US / other supported stocks: Finnhub
        # ---------------------------------------------------------
        headers = {
            "X-Finnhub-Token": FINNHUB_API_KEY
        }

        profile_response = requests.get(
            f"{FINNHUB_BASE_URL}/stock/profile2",
            params={"symbol": ticker},
            headers=headers,
            timeout=20,
        )

        profile_response.raise_for_status()
        profile = profile_response.json()

        quote_response = requests.get(
            f"{FINNHUB_BASE_URL}/quote",
            params={"symbol": ticker},
            headers=headers,
            timeout=20,
        )

        quote_response.raise_for_status()
        quote = quote_response.json()

        metrics_response = requests.get(
            f"{FINNHUB_BASE_URL}/stock/metric",
            params={
                "symbol": ticker,
                "metric": "all",
            },
            headers=headers,
            timeout=20,
        )

        metrics_response.raise_for_status()
        metrics_data = metrics_response.json()

        metric = metrics_data.get("metric", {})

        company_name = (
            profile.get("name")
            or profile.get("ticker")
            or ticker
        )

        current_price = quote.get("c")

        pe_ratio = metric.get(
            "peBasicExclExtraTTM"
        )

        if pe_ratio is None:
            pe_ratio = metric.get("peTTM")

        market_cap = metric.get(
            "marketCapitalization"
        )

        week_52_high = metric.get(
            "52WeekHigh"
        )

        week_52_low = metric.get(
            "52WeekLow"
        )

        retrieved_at = datetime.now(
            timezone.utc
        ).isoformat()

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

    except requests.RequestException as exc:
        return (
            f"Error retrieving stock data for {ticker}: "
            f"{exc}"
        )

    except Exception as exc:
        return (
            f"Error retrieving stock data for {ticker}: "
            f"{exc}"
        )

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
            max_results=3,
        )

        if not results:
            return f"No recent news found for: {query}"

        formatted_results = []

        for index, result in enumerate(results, start=1):
            title = result.get("title", "No title")
            url = result.get("href", "")
            snippet = result.get(
                "body",
                "No description available",
            )

            formatted_results.append(
                f"{index}. {title}\n"
                f"URL: {url}\n"
                f"Summary: {snippet}"
            )

        return "\n\n".join(formatted_results)

    except Exception as exc:
        return (
            f"Error searching for news about {query}: "
            f"{exc}"
        )