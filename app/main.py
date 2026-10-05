import logging

from fastapi import FastAPI, HTTPException, Query

from app.agent import research_company
from app.logging_config import setup_logging
from app.schemas import CompanyOverview

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Autonomous Financial Research Agent",
    description=(
        "An AI-powered financial research agent using "
        "Gemini, LangChain, yfinance, and web search."
    ),
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Autonomous Financial Research Agent API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "financial-research-agent",
    }


@app.get("/research", response_model=CompanyOverview)
def research(
    ticker: str = Query(
        ...,
        min_length=1,
        description="Stock ticker symbol, e.g. AAPL",
    )
):
    ticker = ticker.strip().upper()

    logger.info("Research request received for %s", ticker)

    try:
        result = research_company(ticker)

        logger.info("Research completed for %s", ticker)

        return result

    except Exception as exc:
        error_message = str(exc)

        if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:
            logger.warning("Gemini quota exceeded for %s", ticker)

            raise HTTPException(
                status_code=429,
                detail=(
                    "Gemini API quota has been exceeded. "
                    "Please wait for the quota to reset or use a "
                    "project with higher API limits."
                ),
            ) from exc

        logger.exception("Research failed for %s", ticker)

        raise HTTPException(
            status_code=500,
            detail="Financial research failed.",
        ) from exc