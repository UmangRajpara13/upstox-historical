import path from "path";
import fs from 'fs';
import ExcelJS from "exceljs";
import axios from "axios";
import { getInstrumentKeys } from "./historicalFunctions.js";

let all_nse_stocks
let count = 0

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const now = new Date();

const year = now.getFullYear();
const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const month = shortMonthNames[now.getMonth()]; // Get the short month name
const day = String(now.getDate()).padStart(2, '0');

const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');

const date = `${year}-${month}-${day}`

const init_strategy_file_folders = async () => {
    try {
        // Create logs directory synchronously
        fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
        console.log(`Directory './logs' created or already exists.`);

        // Create today's directory inside logs synchronously
        fs.mkdirSync(path.join(process.cwd(), 'logs', date), { recursive: true });

        console.log(`Directory './logs/${date}' created or already exists.`);

    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        process.exit(1); // Exit the process on error
    }
}

init_strategy_file_folders();


const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('My Sheet');

// Freeze the first row
worksheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 1 }
];

const filePath = path.join('Results', date, `Hammer_${hours}h-${minutes}m-${seconds}s.xlsx`)

// 

worksheet.columns = [
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Turnover', key: 'turnover', width: 18 },
    { header: 'Candle Color', key: 'candleColor', width: 5 },
    { header: 'Close Price (Entry) (Rs.)', key: 'closeAt', width: 15 },
    { header: 'NextDay Close Price (Exit) (Rs.)', key: 't_close_at', width: 15 },
    { header: 'ROI (%)', key: 'roi', width: 15 },
    { header: 'Investment', key: 'investment', width: 15 },
    { header: 'Gross P/L', key: 'grossPNL', width: 15 },
    { header: 'Charges and Taxes(~25%)', key: 'c_n_t', width: 15 },
    { header: 'DP Charges(~ Rs. 16)', key: 'dp_charge', width: 15 },
    { header: 'Net P/L', key: 'netPNL', width: 15 },
    { header: 'Win/Lose', key: 'win_lose', width: 15 },
    { header: 'Avg. Investment per year', key: 'avg_investment', width: 15 },
];

const handleExit = async () => {
    await workbook.xlsx.writeFile(filePath);
    console.log(`Data saved to ${filePath}. Exiting...`);
    process.exit(); // Exit the process
};

process.on('SIGINT', () => {
    console.log('Ctrl+C pressed. Saving data to Excel...');
    handleExit()
});
process.on('uncaughtException', () => { handleExit() });

async function main() {

    try {
        all_nse_stocks = await getInstrumentKeys()
        // console.log('CSV Data:', all_nse_stocks);
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }

    // all_nse_stocks = [{
    //     instrument_key: 'NSE_EQ|INE117A01022',
    //     // tradingsymbol: 'AARTISURF',
    // }]

    for (let i = 0; i < all_nse_stocks.length; i++) {

        const stock = all_nse_stocks[i];
        const instrument_key = stock.instrument_key
        const interval = "day" // day | 1minute 
        const to_date = "2025-01-13" // YYYY-MM-DD
        const from_date = "2023-01-01" // YYYY-MM-DD

        const url = `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`
        const headers = {
            'Accept': 'application/json'
        }
        try {
            const response = await axios.get(url, { headers })

            if (response.data.status === 'success') {  // latest day is 1st in array!
                const all_days = response.data.data.candles

                console.log(`\n ${stock.tradingsymbol}`)

                const Lows_of_X_Days = []
                const X_Days = 30

                for (let j = all_days.length - 1; j > 1; j--) {

                    const day = all_days[j];
                    const date = new Date(day[0])
                    const open = day[1]
                    const high = day[2]
                    const low = day[3]
                    const close = day[4]
                    const volume = day[5]
                    const center_value = (high - low) / 2 + low

                    // we add daily low, as we will shift it later
                    Lows_of_X_Days.length < X_Days && Lows_of_X_Days.push(low)

                    // we do not want to consider candles after X_Days, since
                    // it wont filter out hammer at X_Days
                    if (j <= all_days.length - (X_Days + 1)) {

                        const t_day = all_days[j - 1] //  the latest days' candle data is at top of the array.
                        const t_open = t_day[1]
                        const t_high = t_day[2]
                        const t_low = t_day[3]
                        const t_close = t_day[4]

                        const t_p_1_day = all_days[j - 2]
                        const t_p_1_open = t_p_1_day[1]
                        const t_p_1_high = t_p_1_day[2]
                        const t_p_1_low = t_p_1_day[3]
                        const t_p_1_close = t_p_1_day[4]

                        const Lowest_of_X_Days = Math.min(...Lows_of_X_Days)

                        Lows_of_X_Days.shift()

                        if (low <= Lowest_of_X_Days
                            && volume * close > 100000000
                        )

                            if (close > center_value && open > center_value
                                && high < all_days[j + 1][2]) { // check if hammer high is < prev. day's high

                                console.log(count++, ')', date.getDate(), days[date.getDay()],
                                    shortMonthNames[date.getMonth()], date.getFullYear(),
                                    '~~   ', (((t_high - close) / close) * 100).toFixed(2))

                                const ROI = Math.round((((t_close - close) / close) * 100) * 100) / 100
                                const investment = 10000
                                const gross_pnl = investment * ROI / 100
                                const charges = Math.abs(investment * ROI * 0.25 / 100)
                                const net_pnl = gross_pnl - charges - 16 // (dp charge = 16)
                                worksheet.addRow({
                                    date: `${date.getDate()} ${shortMonthNames[date.getMonth()]} ${date.getFullYear()}`,
                                    day: days[date.getDay()],
                                    name: stock.tradingsymbol,
                                    turnover: close * volume,
                                    candleColor: close > open ? 'G' : 'R',
                                    closeAt: close,
                                    t_close_at: t_close,
                                    roi: ROI,
                                    investment: investment,
                                    grossPNL: gross_pnl,
                                    c_n_t: charges,
                                    dp_charge: 16,
                                    netPNL: net_pnl,
                                    win_lose: net_pnl > 0 ? 'Win' : 'Lose',
                                    avg_investment: investment * count / 365,
                                });

                            }
                    }
                }

            } else {
                console.log(response);
            }

        } catch (error) {
            console.error(error.status, error.statusText, stock.tradingsymbol)
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }
    handleExit()
}

main();
