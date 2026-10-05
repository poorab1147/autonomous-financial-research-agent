\# Autonomous Financial Research Agent



An AI-powered financial research agent that autonomously gathers stock market data and recent financial news, analyzes the information using Gemini, and returns structured company research through a FastAPI REST API.



\## Overview



The project combines an LLM agent with external financial and web-search tools.



Given a stock ticker such as `AAPL`, the agent:



1\. Retrieves financial metrics using `yfinance`

2\. Searches for recent financial news

3\. Uses Gemini to analyze the collected information

4\. Identifies recent news sentiment

5\. Identifies potential financial/business risks

6\. Produces validated structured output using Pydantic

7\. Exposes the research through a FastAPI REST API



\## Architecture



```text

Client

&#x20; |

&#x20; v

FastAPI REST API

&#x20; |

&#x20; v

LangChain Agent

&#x20; |

&#x20; v

Gemini 3.8 Flash

&#x20; |

&#x20; +----------------------+

&#x20; |                      |

&#x20; v                      v

yfinance              DDGS Search

&#x20; |                      |

&#x20; v                      v

Stock Metrics        Recent News

&#x20; |                      |

&#x20; +----------+-----------+

&#x20;            |

&#x20;            v

&#x20;      Gemini Analysis

&#x20;            |

&#x20;            v

&#x20;    Pydantic Validation

&#x20;            |

&#x20;            v

&#x20;      Structured JSON

```



\## Tech Stack



\- Python 3.13

\- FastAPI

\- Uvicorn

\- LangChain

\- LangChain Google GenAI

\- Gemini 3.8 Flash

\- yfinance

\- DDGS

\- Pydantic

\- python-dotenv

\- Pytest



\## Project Structure



```text

financial\_agent/

│

├── app/

│   ├── \_\_init\_\_.py

│   ├── agent.py

│   ├── config.py

│   ├── logging\_config.py

│   ├── main.py

│   ├── schemas.py

│   └── tools.py

│

├── tests/

│   ├── test\_schemas.py

│   └── test\_tools.py

│

├── .env

├── .env.example

├── .gitignore

├── pytest.ini

├── README.md

└── requirements.txt

```



\## Core Components



\### Agent



`app/agent.py`



Creates the LangChain agent using Gemini and the financial research tools.



The agent uses native tool calling and structured output rather than manually parsing free-form LLM responses.



\### Financial Data Tool



`app/tools.py`



Uses `yfinance` to retrieve:



\- Current stock price

\- P/E ratio

\- Market capitalization

\- 52-week high

\- 52-week low



\### News Search Tool



Uses DDGS to search the web for recent financial news related to a company or ticker.



\### Pydantic Schemas



`app/schemas.py`



Defines the validated response structure:



\- Company information

\- Financial metrics

\- News sentiment

\- Potential risks

\- Sources

\- Data timestamp



\### FastAPI



`app/main.py`



Provides:



```text

GET /

GET /health

GET /research?ticker=AAPL

```



\## API Usage



Start the server:



```bash

uvicorn app.main:app --reload

```



Open the interactive API documentation:



```text

http://127.0.0.1:8000/docs

```



Example request:



```text

GET /research?ticker=AAPL

```



Example response structure:



```json

{

&#x20; "ticker": "AAPL",

&#x20; "company\_name": "Apple Inc.",

&#x20; "financial\_metrics": {

&#x20;   "current\_price": 332.89,

&#x20;   "pe\_ratio": 38.17,

&#x20;   "market\_cap": 4858257080320,

&#x20;   "week\_52\_high": 345.34,

&#x20;   "week\_52\_low": 243.42

&#x20; },

&#x20; "risk\_analysis": {

&#x20;   "recent\_news\_sentiment": "Positive",

&#x20;   "potential\_risks": \[

&#x20;     "Elevated valuation"

&#x20;   ]

&#x20; },

&#x20; "sources": \[],

&#x20; "data\_timestamp": "2026-10-06T00:00:00Z"

}

```



Values in the response change according to the latest available market data and model analysis.



\## Health Check



The API includes a health endpoint:



```text

GET /health

```



Response:



```json

{

&#x20; "status": "healthy",

&#x20; "service": "financial-research-agent"

}

```



\## Testing



Run the automated tests:



```bash

pytest -v

```



Current test coverage includes:



\- Pydantic schema validation

\- Stock-data tool execution



Expected result:



```text

2 passed

```



\## Environment Setup



Create a virtual environment:



```bash

python -m venv .venv

```



Activate it on Windows:



```cmd

.venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Create a `.env` file:



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key\_here

```



Never commit the `.env` file to GitHub.



\## Configuration



The Gemini model is configured in:



```text

app/config.py

```



The API key is loaded from the environment using `python-dotenv`.



\## Error Handling



The API includes handling for:



\- Invalid or empty ticker input

\- Financial data retrieval failures

\- Web-search failures

\- Gemini API failures

\- Gemini API quota/rate-limit errors



Gemini quota exhaustion is returned as an HTTP `429` response instead of exposing internal stack traces to the API consumer.



\## Limitations



\- Financial information is retrieved from external services and may be delayed or unavailable.

\- Web-search results depend on the availability and quality of indexed sources.

\- Gemini API usage is subject to the configured project's rate limits and quotas.

\- This project is intended for educational and research purposes and does not provide financial advice.



\## Future Improvements



Possible extensions include:



\- Historical price trend analysis

\- Technical indicators such as RSI and moving averages

\- SEC filing analysis

\- Financial statement analysis

\- Portfolio-level research

\- Multi-company comparison

\- Persistent research history

\- Redis/API caching

\- Background task execution

\- Authentication and API keys

\- Docker deployment

\- Cloud deployment

\- Automated report generation



\## Disclaimer



This project is an educational financial research system.



It does not constitute investment, financial, tax, or legal advice. Users should independently verify information before making financial decisions.



