
# Backtest NSE historical data using Upstox API

## Overview

Hammer.js is a Node.js script that fetches historical stock market data for all NSE-listed stocks over the past year, detects hammer candlestick patterns formed at the 30-day low, and logs the relevant details into an Excel sheet. This tool aims to assist in developing and refining trading setups.

While Hammer.js serves as an example implementation, users are encouraged to modify the script to detect other candlestick patterns and devise their own trading strategies.

## Features

- Fetches historical daily candlestick data for one year for all NSE stocks.
- Identifies hammer candlestick patterns formed at the 30-day low.
- Logs the following details into an Excel sheet:
  - Date of the hammer candlestick formation.
  - Instrument name.
  - Additional columns for analysis to support trading strategies.

## Requirements

To use Hammer.js, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/UmangRajpara13/upstox-historical.git
   ```

2. Navigate to the project directory:

   ```bash
   cd upstox-historical
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with the following keys:

   ```env
   CLIENT_ID=abc123
   API_KEY=your-api-key
   SECRET_KEY=your-secret-key
   ACCESS_TOKEN=xx.yy.zz
   ```

   - Replace `CLIENT_ID`, `API_KEY`, and `SECRET_KEY` with your credentials.
   - The `ACCESS_TOKEN` will be updated automatically by the script.

## Usage

1. Run the script:

   ```bash
   node Hammer.js
   ```

2. The script will:

   - Fetch one year of historical data for all NSE stocks.
   - Analyze the data to detect hammer candlestick patterns.
   - Logs the results into an Excel file in the \<project-root\>/logs/\<today's date\> folder

## Output

The Excel sheet includes(but not limited to):

- **Date**: The date the hammer candlestick pattern with 30 Day Low was formed.
- **Instrument Name**: The name of the stock.
- **Additional Columns**: Fields for analysis, such as:
  - Opening % for same stock next day.
  - Percentage change from the previous day.
  - Any other metrics deemed useful for creating trading setups.

## Customization

You can modify the following parameters in the script:

- **Data source**: Change the API endpoint or data-fetching mechanism.
- **Pattern criteria**: Adjust the logic for detecting hammer candles or defining the 30-day low.
- **Output format**: Customize the structure of the Excel file or add more columns.

Additionally, users can extend the script to:
- Detect other candlestick patterns (e.g., engulfing, doji, or shooting star).
- Incorporate new metrics or filters based on trading strategies.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NSE for stock market data.
- Open-source libraries used in the project.

## Disclaimer

This project is for educational and informational purposes only. Use at your own risk, and always conduct your own research before making trading decisions.