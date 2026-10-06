const tickerInput = document.getElementById("ticker");
const researchBtn = document.getElementById("researchBtn");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const report = document.getElementById("report");

researchBtn.addEventListener("click", researchStock);

tickerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        researchStock();
    }
});

async function researchStock() {
    const ticker = tickerInput.value.trim().toUpperCase();

    if (!ticker) {
        showError("Please enter a stock ticker.");
        return;
    }

    hideError();
    report.classList.add("hidden");
    loading.classList.remove("hidden");
    researchBtn.disabled = true;

    try {
        const response = await fetch(
            `/research?ticker=${encodeURIComponent(ticker)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to complete financial research."
            );
        }

        displayReport(data);

    } catch (error) {
        showError(error.message);
    } finally {
        loading.classList.add("hidden");
        researchBtn.disabled = false;
    }
}

function displayReport(data) {
    document.getElementById("companyTicker").textContent =
        data.ticker;

    document.getElementById("companyName").textContent =
        data.company_name;

    document.getElementById("currentPrice").textContent =
        formatNumber(data.financial_metrics.current_price);

    document.getElementById("peRatio").textContent =
        formatNumber(data.financial_metrics.pe_ratio);

    document.getElementById("marketCap").textContent =
        formatLargeNumber(data.financial_metrics.market_cap);

    document.getElementById("weekHigh").textContent =
        formatNumber(data.financial_metrics.week_52_high);

    document.getElementById("weekLow").textContent =
        formatNumber(data.financial_metrics.week_52_low);

    document.getElementById("sentiment").textContent =
        data.risk_analysis.recent_news_sentiment;

    const risks = document.getElementById("risks");
    risks.innerHTML = "";

    for (const risk of data.risk_analysis.potential_risks) {
        const li = document.createElement("li");
        li.textContent = risk;
        risks.appendChild(li);
    }

    const sources = document.getElementById("sources");
    sources.innerHTML = "";

    for (const source of data.sources) {
        const div = document.createElement("div");
        div.className = "source";

        const link = document.createElement("a");
        link.href = source.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = source.name;

        div.appendChild(link);
        sources.appendChild(div);
    }

    document.getElementById("timestamp").textContent =
        formatTimestamp(data.data_timestamp);

    report.classList.remove("hidden");
}

function formatNumber(value) {
    if (value === null || value === undefined) {
        return "N/A";
    }

    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2
    });
}

function formatLargeNumber(value) {
    if (value === null || value === undefined) {
        return "N/A";
    }

    const number = Number(value);

    if (number >= 1e12) {
        return "$" + (number / 1e12).toFixed(2) + "T";
    }

    if (number >= 1e9) {
        return "$" + (number / 1e9).toFixed(2) + "B";
    }

    if (number >= 1e6) {
        return "$" + (number / 1e6).toFixed(2) + "M";
    }

    return "$" + number.toLocaleString();
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "N/A";
    }

    return new Date(timestamp).toLocaleString();
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function hideError() {
    errorBox.classList.add("hidden");
}