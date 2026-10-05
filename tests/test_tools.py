from app.tools import get_stock_data


def test_stock_data_tool():
    result = get_stock_data.invoke(
        {"ticker": "AAPL"}
    )

    assert isinstance(result, str)
    assert "AAPL" in result
    assert "Current Price" in result