# Autonomous Financial Research Agent

An AI-powered financial research agent that autonomously gathers stock
market data and recent financial news, analyzes the information using
Gemini, identifies potential risks, and returns validated structured
company research through a FastAPI REST API and web interface.

The system supports both **US equities** and **Indian NSE/BSE equities**
using dedicated market-data providers.

## Live Demo

**Production URL:**
https://autonomous-financial-research-agent-pz4k.onrender.com

The deployed application has been successfully tested with:

-   `AAPL`
-   `RELIANCE.NS`

## Overview

Given a stock ticker such as `AAPL` or `RELIANCE.NS`, the agent:

1.  Determines the appropriate market-data provider from the ticker.
2.  Retrieves current and fundamental financial metrics.
3.  Searches the web for recent financial news.
4.  Uses Gemini to analyze the collected information.
5.  Determines recent news sentiment.
6.  Identifies potential financial and business risks.
7.  Produces a validated structured response using Pydantic.
8.  Exposes the research through a FastAPI REST API.
9.  Renders the result through a browser-based frontend.

### Supported market routing

  Ticker format             Market                         Data provider
  ------------------------- ------------------------------ ---------------
  `AAPL`, `MSFT`, `GOOGL`   US / other supported markets   Finnhub
  `RELIANCE.NS`, `TCS.NS`   NSE                            Indian API
  `RELIANCE.BO`, `TCS.BO`   BSE                            Indian API

## Architecture

``` text
                         User
                          |
                          v
                Browser Web Interface
                 HTML + CSS + JavaScript
                          |
                          v
                    FastAPI REST API
                          |
                          v
                   LangChain Agent
                          |
                          v
                Gemini 3.5 Flash-Lite
                          |
                +---------+---------+
                |                   |
                v                   v
         Stock Data Tool       News Search Tool
                |                   |
        +-------+-------+           v
        |               |          DDGS
        v               v           |
     Finnhub       Indian API       |
        |               |           |
        v               v           |
     US Stocks      NSE / BSE       |
        |               |           |
        +-------+-------+-----------+
                |
                v
          Financial Metrics
                |
                v
        Gemini Risk Analysis
                |
                v
       Pydantic Validation
                |
                v
       Structured JSON Response
                |
                v
          Browser Results
```

## Tech Stack

### Backend

-   Python 3.13
-   FastAPI
-   Uvicorn
-   LangChain
-   LangChain Google GenAI
-   Gemini 3.5 Flash-Lite
-   Pydantic
-   Requests
-   python-dotenv

### Financial Data

-   Finnhub --- US stock market data
-   Indian API --- NSE/BSE market data

### Web Search

-   DDGS

### Frontend

-   HTML5
-   CSS3
-   Vanilla JavaScript

### Testing

-   Pytest

### Deployment

-   Render
-   GitHub

## Project Structure

``` text
financial_agent/
│
├── app/
│   ├── __init__.py
│   ├── agent.py
│   ├── config.py
│   ├── logging_config.py
│   ├── main.py
│   ├── schemas.py
│   └── tools.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── tests/
│   ├── test_schemas.py
│   └── test_tools.py
│
├── .env
├── .env.example
├── .gitignore
├── pytest.ini
├── README.md
└── requirements.txt
```

## Core Components

### LangChain Agent

**File:** `app/agent.py`

Creates the autonomous research agent using Gemini and the available
financial research tools.

The agent uses native tool calling and structured Pydantic output rather
than relying on manually parsed free-form LLM responses.

### Stock Data Tool

**File:** `app/tools.py`

The `get_stock_data` tool retrieves:

-   Company name
-   Current stock price
-   P/E ratio
-   Market capitalization
-   52-week high
-   52-week low
-   Retrieval timestamp

Provider selection is based on the ticker:

``` text
Ticker ends with .NS or .BO
        |
        +----> Indian API

All other supported tickers
        |
        +----> Finnhub
```

### News Search Tool

**File:** `app/tools.py`

The `get_recent_news` tool searches the web for recent financial news
related to the requested company or ticker.

The tool returns up to three relevant search results containing title,
URL, and search-result summary.

### Pydantic Schemas

**File:** `app/schemas.py`

Defines the validated response structure:

-   `FinancialMetrics`
-   `RiskAnalysis`
-   `Source`
-   `CompanyOverview`

The structured response contains company information, financial metrics,
news sentiment, potential risks, sources, and a data timestamp.

### FastAPI

**File:** `app/main.py`

Provides:

``` text
GET /
GET /health
GET /research?ticker=AAPL
```

## API Usage

Start the application locally:

``` powershell
.venv\Scriptsctivate
uvicorn app.main:app --reload
```

Open:

``` text
http://127.0.0.1:8000
```

Interactive API documentation:

``` text
http://127.0.0.1:8000/docs
```

Example requests:

``` text
GET /research?ticker=AAPL
GET /research?ticker=RELIANCE.NS
```

## Example Response

Values change according to current market data and model analysis.

``` json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc",
  "financial_metrics": {
    "current_price": 333.63,
    "pe_ratio": 37.76,
    "market_cap": 4868618.5,
    "week_52_high": 345.34,
    "week_52_low": 243.42
  },
  "risk_analysis": {
    "recent_news_sentiment": "Neutral",
    "potential_risks": [
      "High valuation multiples",
      "Macroeconomic pressures impacting consumer electronics demand",
      "Regulatory and antitrust concerns"
    ]
  },
  "sources": [],
  "data_timestamp": "2026-10-06T20:35:32+00:00"
}
```

## Health Check

``` text
GET /health
```

Expected response:

``` json
{
  "status": "healthy",
  "service": "financial-research-agent"
}
```

## Environment Setup

Create a virtual environment:

``` powershell
python -m venv .venv
```

Activate it on Windows:

``` powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

``` powershell
pip install -r requirements.txt
```

Create `.env`:

``` env
GEMINI_API_KEY=your_gemini_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
INDIAN_API_KEY=your_indian_api_key_here
```

Never commit `.env` to GitHub. Use `.env.example` as the safe template.

## Configuration

**File:** `app/config.py`

Required environment variables:

``` text
GEMINI_API_KEY
FINNHUB_API_KEY
INDIAN_API_KEY
```

The configured Gemini model is:

``` text
gemini-3.5-flash-lite
```

## Testing

Run:

``` powershell
pytest -v
```

Current automated tests cover:

-   Pydantic schema validation
-   Stock-data tool execution

Expected result:

``` text
2 passed
```

The production application was also manually verified with `AAPL` and
`RELIANCE.NS`.

## Error Handling

The application handles:

-   Empty ticker input
-   Financial data retrieval failures
-   Web-search failures
-   Gemini API failures
-   Gemini API quota/rate-limit errors
-   Invalid external API responses

Gemini quota exhaustion is converted into an HTTP `429` response rather
than exposing internal stack traces.

## Deployment

The application is deployed on Render.

Build command:

``` bash
pip install -r requirements.txt
```

Start command:

``` bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required Render environment variables:

``` text
GEMINI_API_KEY
FINNHUB_API_KEY
INDIAN_API_KEY
PYTHON_VERSION=3.13.1
```

Automatic deployment is enabled from the GitHub `main` branch.

## Production Verification

### AAPL

Successfully verified:

-   Current price
-   P/E ratio
-   Market capitalization
-   52-week high
-   52-week low
-   Risk analysis
-   News sentiment
-   Sources
-   Timestamp

### RELIANCE.NS

Successfully verified:

-   NSE current price
-   P/E ratio
-   Market capitalization
-   52-week high
-   52-week low
-   Risk analysis
-   News sentiment
-   Sources
-   Timestamp

Both tests succeeded on the live Render deployment.

## Git Versioning

The working production milestone can be tagged with:

``` bash
git tag v1.0.0
git push origin v1.0.0
```

This creates a stable Git milestone for the first successfully deployed
version.

## Limitations

-   External market data may be delayed, incomplete, or temporarily
    unavailable.
-   Market coverage depends on the respective data providers.
-   Web-search results depend on indexed sources and search-provider
    availability.
-   Gemini usage is subject to API quotas and rate limits.
-   AI-generated risk analysis is not guaranteed to be complete or
    correct.
-   This project is intended for educational and research purposes and
    does not provide financial advice.

## Future Improvements

-   Historical price trend analysis
-   RSI and moving averages
-   SEC filing analysis
-   Indian regulatory filing analysis
-   Financial statement analysis
-   Multi-company comparison
-   Portfolio-level research
-   Persistent research history
-   Redis/API caching
-   Background task execution
-   Authentication and API keys
-   Docker deployment
-   More comprehensive automated tests
-   Streaming research progress
-   Scheduled research reports
-   PDF report generation
-   More robust source attribution
-   Provider fallback strategies

## Resume-Relevant Highlights

This project demonstrates experience with:

-   AI agent development
-   LLM tool calling
-   Structured LLM outputs
-   Pydantic schema validation
-   REST API development
-   External API integration
-   Financial-data provider integration
-   Web search integration
-   Error handling
-   Environment-based secret management
-   Automated testing
-   Cloud deployment
-   Production debugging
-   Multi-market data routing

Suggested resume description:

> **Autonomous Financial Research Agent** --- Built an AI-powered
> financial research agent using Python, LangChain, Gemini 3.5
> Flash-Lite, FastAPI, Finnhub, Indian market APIs, and web search;
> implemented tool calling and structured Pydantic outputs to retrieve
> market metrics, analyze recent news, identify potential risks, and
> serve research through a deployed REST API.

## Disclaimer

This project is an educational financial research system.

It does not constitute investment, financial, tax, or legal advice.
Users should independently verify information before making financial
decisions.
