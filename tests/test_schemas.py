from app.schemas import CompanyOverview


def test_company_overview_schema():
    result = CompanyOverview(
        ticker="AAPL",
        company_name="Apple Inc.",
        financial_metrics={
            "current_price": 332.89,
            "pe_ratio": 38.17,
            "market_cap": 4858257080320,
            "week_52_high": 345.34,
            "week_52_low": 243.42,
        },
        risk_analysis={
            "recent_news_sentiment": "Positive",
            "potential_risks": [
                "Elevated valuation"
            ],
        },
        sources=[],
        data_timestamp="2026-10-06T00:00:00Z",
    )

    assert result.ticker == "AAPL"
    assert result.financial_metrics.current_price > 0
    assert len(result.risk_analysis.potential_risks) > 0