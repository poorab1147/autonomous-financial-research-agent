from typing import List

from pydantic import BaseModel, Field


class FinancialMetrics(BaseModel):
    """Core financial metrics retrieved for a company."""

    current_price: float | None = Field(
        default=None,
        description="Current stock price"
    )

    pe_ratio: float | None = Field(
        default=None,
        description="Trailing price-to-earnings ratio"
    )

    market_cap: float | None = Field(
        default=None,
        description="Current market capitalization"
    )

    week_52_high: float | None = Field(
        default=None,
        description="52-week highest stock price"
    )

    week_52_low: float | None = Field(
        default=None,
        description="52-week lowest stock price"
    )


class RiskAnalysis(BaseModel):
    """Risk and sentiment assessment."""

    recent_news_sentiment: str = Field(
        description="Overall sentiment: Positive, Neutral, or Negative"
    )

    potential_risks: List[str] = Field(
        default_factory=list,
        description="Potential financial or business risks"
    )


class Source(BaseModel):
    """Information source used by the agent."""

    name: str
    url: str | None = None


class CompanyOverview(BaseModel):
    """Final structured response from the financial research agent."""

    ticker: str
    company_name: str

    financial_metrics: FinancialMetrics

    risk_analysis: RiskAnalysis

    sources: List[Source] = Field(
        default_factory=list
    )

    data_timestamp: str