// ============================================================
// DOM ELEMENTS
// ============================================================

const tickerInput = document.getElementById("ticker");
const researchButton = document.getElementById("researchBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const report = document.getElementById("report");

const companyName = document.getElementById("companyName");
const companyTicker = document.getElementById("companyTicker");

const currentPrice = document.getElementById("currentPrice");
const peRatio = document.getElementById("peRatio");
const marketCap = document.getElementById("marketCap");
const week52High = document.getElementById("weekHigh");
const week52Low = document.getElementById("weekLow");

const sentiment = document.getElementById("sentiment");
const risksList = document.getElementById("risks");
const sourcesList = document.getElementById("sources");
const timestamp = document.getElementById("timestamp");


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function setHidden(element, hidden) {

    if (!element) {
        return;
    }

    element.classList.toggle("hidden", hidden);
}


function setText(element, value) {

    if (!element) {
        return;
    }

    element.textContent = value;
}


// ============================================================
// PRICE FORMATTING
// ============================================================

function formatPrice(value, ticker = "") {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "N/A";
    }

    const normalizedTicker =
        ticker.trim().toUpperCase();


    // Indian NSE / BSE stocks

    if (
        normalizedTicker.endsWith(".NS") ||
        normalizedTicker.endsWith(".BO")
    ) {

        return "₹" + number.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
    }


    // Finnhub / US stocks

    return "$" + number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );
}


// ============================================================
// P/E RATIO FORMATTING
// ============================================================

function formatRatio(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "N/A";
    }

    return number.toFixed(2);
}


// ============================================================
// MARKET CAP FORMATTING
// ============================================================

function formatLargeNumber(value, ticker = "") {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "N/A";
    }

    const normalizedTicker =
        ticker.trim().toUpperCase();


    // --------------------------------------------------------
    // Indian stocks
    // --------------------------------------------------------
    //
    // Indian API reports market cap in ₹ crore.
    //
    // Example:
    //
    // 1,643,256.18 crore
    //
    // = ₹16.43 lakh crore
    // --------------------------------------------------------

    if (
        normalizedTicker.endsWith(".NS") ||
        normalizedTicker.endsWith(".BO")
    ) {

        if (number >= 100000) {

            return (
                "₹" +
                (number / 100000).toFixed(2) +
                "L Cr"
            );
        }


        if (number >= 1000) {

            return (
                "₹" +
                (number / 1000).toFixed(2) +
                "K Cr"
            );
        }


        return (
            "₹" +
            number.toLocaleString("en-IN") +
            " Cr"
        );
    }


    // --------------------------------------------------------
    // Finnhub stocks
    // --------------------------------------------------------
    //
    // Finnhub reports market cap in millions of USD.
    // --------------------------------------------------------

    const marketCapValue =
        number * 1e6;


    if (marketCapValue >= 1e12) {

        return (
            "$" +
            (marketCapValue / 1e12).toFixed(2) +
            "T"
        );
    }


    if (marketCapValue >= 1e9) {

        return (
            "$" +
            (marketCapValue / 1e9).toFixed(2) +
            "B"
        );
    }


    if (marketCapValue >= 1e6) {

        return (
            "$" +
            (marketCapValue / 1e6).toFixed(2) +
            "M"
        );
    }


    return (
        "$" +
        marketCapValue.toLocaleString("en-US")
    );
}


// ============================================================
// LOADING STATE
// ============================================================

function showLoading() {

    setHidden(loading, false);
    setHidden(report, true);
    setHidden(errorMessage, true);


    if (researchButton) {

        researchButton.disabled = true;
        researchButton.textContent = "Researching...";
    }
}


function hideLoading() {

    setHidden(loading, true);


    if (researchButton) {

        researchButton.disabled = false;
        researchButton.textContent = "Research Stock";
    }
}


// ============================================================
// ERROR HANDLING
// ============================================================

function showError(message) {

    hideLoading();

    setHidden(report, true);


    if (errorMessage) {

        errorMessage.textContent = message;

        setHidden(
            errorMessage,
            false
        );
    }
}


function clearError() {

    if (!errorMessage) {
        return;
    }

    errorMessage.textContent = "";

    setHidden(
        errorMessage,
        true
    );
}


// ============================================================
// RENDER RISKS
// ============================================================

function renderRisks(risks) {

    if (!risksList) {
        return;
    }

    risksList.innerHTML = "";


    if (
        !risks ||
        risks.length === 0
    ) {

        const li =
            document.createElement("li");

        li.textContent =
            "No specific risks identified.";

        risksList.appendChild(li);

        return;
    }


    risks.forEach((risk) => {

        const li =
            document.createElement("li");

        li.textContent = risk;

        risksList.appendChild(li);
    });
}


// ============================================================
// RENDER SOURCES
// ============================================================

function renderSources(sources) {

    if (!sourcesList) {
        return;
    }

    sourcesList.innerHTML = "";


    if (
        !sources ||
        sources.length === 0
    ) {

        const message =
            document.createElement("p");

        message.textContent =
            "No sources available.";

        sourcesList.appendChild(message);

        return;
    }


    sources.forEach((source) => {

        const item =
            document.createElement("div");

        item.className = "source-item";


        if (source.url) {

            const link =
                document.createElement("a");

            link.href = source.url;

            link.target = "_blank";

            link.rel =
                "noopener noreferrer";

            link.textContent =
                source.name ||
                source.url;

            item.appendChild(link);

        } else {

            item.textContent =
                source.name ||
                "Unknown source";
        }


        sourcesList.appendChild(item);
    });
}


// ============================================================
// RENDER COMPLETE REPORT
// ============================================================

function renderResults(data) {

    console.log(
        "Rendering research results:",
        data
    );


    const ticker =
        data.ticker || "";


    const metrics =
        data.financial_metrics || {};


    const riskAnalysis =
        data.risk_analysis || {};


    // --------------------------------------------------------
    // Company
    // --------------------------------------------------------

    setText(
        companyName,
        data.company_name ||
        "Unknown Company"
    );


    setText(
        companyTicker,
        ticker
    );


    // --------------------------------------------------------
    // Financial Metrics
    // --------------------------------------------------------

    setText(
        currentPrice,
        formatPrice(
            metrics.current_price,
            ticker
        )
    );


    setText(
        peRatio,
        formatRatio(
            metrics.pe_ratio
        )
    );


    setText(
        marketCap,
        formatLargeNumber(
            metrics.market_cap,
            ticker
        )
    );


    setText(
        week52High,
        formatPrice(
            metrics.week_52_high,
            ticker
        )
    );


    setText(
        week52Low,
        formatPrice(
            metrics.week_52_low,
            ticker
        )
    );


    // --------------------------------------------------------
    // Risk Analysis
    // --------------------------------------------------------

    setText(
        sentiment,
        riskAnalysis.recent_news_sentiment ||
        "N/A"
    );


    renderRisks(
        riskAnalysis.potential_risks
    );


    // --------------------------------------------------------
    // Sources
    // --------------------------------------------------------

    renderSources(
        data.sources
    );


    // --------------------------------------------------------
    // Timestamp
    // --------------------------------------------------------

    if (data.data_timestamp) {

        const date =
            new Date(
                data.data_timestamp
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            setText(
                timestamp,
                date.toLocaleString()
            );

        } else {

            setText(
                timestamp,
                data.data_timestamp
            );
        }

    } else {

        setText(
            timestamp,
            ""
        );
    }


    // --------------------------------------------------------
    // Show report
    // --------------------------------------------------------

    hideLoading();

    setHidden(
        report,
        false
    );
}


// ============================================================
// RESEARCH REQUEST
// ============================================================

async function researchStock() {

    clearError();


    // Make sure ticker input exists

    if (!tickerInput) {

        showError(
            "Ticker input field was not found."
        );

        console.error(
            "Missing #ticker element."
        );

        return;
    }


    const ticker =
        tickerInput.value.trim();


    if (!ticker) {

        showError(
            "Please enter a stock ticker."
        );

        return;
    }


    showLoading();


    try {

        console.log(
            `Starting research for ${ticker}...`
        );


        const response =
            await fetch(
                `/research?ticker=${encodeURIComponent(ticker)}`
            );


        console.log(
            "Research response status:",
            response.status
        );


        let data;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "The server returned an invalid response."
            );
        }


        if (!response.ok) {

            const detail =
                data.detail ||
                "Unable to complete financial research.";

            throw new Error(detail);
        }


        console.log(
            "Research completed successfully:",
            data
        );


        renderResults(data);


    } catch (error) {

        console.error(
            "Research request failed:",
            error
        );


        showError(
            error.message ||
            "Something went wrong while researching the stock."
        );
    }
}


// ============================================================
// BUTTON EVENT
// ============================================================

if (researchButton) {

    researchButton.addEventListener(
        "click",
        researchStock
    );


    console.log(
        "Financial Research Agent initialized successfully."
    );

} else {

    console.error(
        "Research button #researchBtn was not found."
    );
}