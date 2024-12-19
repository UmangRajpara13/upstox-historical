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
        // Create Results directory synchronously
        fs.mkdirSync(path.join(process.cwd(), 'Results'), { recursive: true });
        console.log(`Directory './Results' created or already exists.`);

        // Create today's directory inside Results synchronously
        fs.mkdirSync(path.join(process.cwd(), 'Results', date), { recursive: true });

        console.log(`Directory './Results/${date}' created or already exists.`);

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


const filePath = path.join('Results', date, `Hammer_10cr_30D_${hours}h-${minutes}m-${seconds}s.xlsx`)

worksheet.columns = [
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Hammer Color', key: 'hammerColor', width: 5 },
    { header: 'Opens At (%)', key: 'opensAt', width: 15 },
    { header: 'High At (%)', key: 'closeToHigh', width: 15 },
    { header: 'Low wrt to prv low(%)', key: 'lowToLow', width: 15 },
    { header: 'Closes At (%)', key: 'closesAt', width: 15 },
    { header: '1% or close', key: 'one_percent_or_close', width: 15 },
    { header: 'T-P-1 Opens at', key: 't_p_1_opens_at', width: 15 },
    { header: 'T-P-1 Low at', key: 't_p_1_low_at', width: 15 },
    { header: 'Kth High %', key: 'closeToKhigh', width: 15 },
    { header: 'K no. of days', key: 'kDays', width: 15 },
    { header: 'Date of +ve ROI', key: 'kDate', width: 15 },
    { header: 'Day', key: 'day', width: 15 }
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
        const to_date = "2024-12-18" // YYYY-MM-DD
        const from_date = "2023-12-18" // YYYY-MM-DD

        const url = `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`
        const headers = {
            'Accept': 'application/json'
        }
        try {
            const response = await axios.get(url, { headers })

            if (response.data.status === 'success') {
                const all_days = response.data.data.candles  // latest day is 1st in array!

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

                        if (low <= Lowest_of_X_Days && volume * close > 100000000)

                            if (close > center_value && open > center_value
                                && high < all_days[j + 1][2]) { // check if hammer high is < prev. day's high

                                console.log(count++, ')', date.getDate(), days[date.getDay()],
                                    shortMonthNames[date.getMonth()], date.getFullYear(),
                                    '~~   ', (((t_high - close) / close) * 100).toFixed(2))

                                if (((t_high - close) / close) * 100 >= 1) { // target 1% achieved same day
                                    worksheet.addRow({
                                        name: stock.tradingsymbol,
                                        date: `${date.getDate()} ${shortMonthNames[date.getMonth()]} ${date.getFullYear()}`,
                                        hammerColor: close > open ? 'G' : 'R',
                                        opensAt: Math.round((((t_open - close) / close) * 100) * 100) / 100,
                                        closeToHigh: Math.round((((t_high - close) / close) * 100) * 100) / 100,
                                        lowToLow: Math.round((((t_low - low) / low) * 100) * 100) / 100,
                                        closesAt: Math.round((((t_close - close) / close) * 100) * 100) / 100,
                                        one_percent_or_close: 0,
                                        t_p_1_opens_at: Math.round((((t_p_1_open - close) / close) * 100) * 100) / 100,
                                        t_p_1_low_at: Math.round((((t_p_1_low - close) / close) * 100) * 100) / 100,
                                        closeToKhigh: 0,
                                        kDays: 0,
                                        kDate: `--`,
                                        day: days[date.getDay()]
                                    });
                                }
                                else {
                                    for (let k = j - 2; k > 1; k--) {
                                        const kDay = all_days[k]
                                        const kDate = new Date(kDay[0])
                                        const kOpen = kDay[1]
                                        const kHigh = kDay[2]
                                        const kLow = kDay[3]
                                        const kClose = kDay[4]

                                        // console.log(kHigh, (kHigh - close) / close)
                                        if (((kHigh - close) / close) * 100 >= 1) {
                                            // console.log('j', j, 'k', k)
                                            worksheet.addRow({
                                                name: stock.tradingsymbol,
                                                date: `${date.getDate()} ${shortMonthNames[date.getMonth()]} ${date.getFullYear()}`,
                                                hammerColor: close > open ? 'G' : 'R',
                                                opensAt: Math.round((((t_open - close) / close) * 100) * 100) / 100,
                                                closeToHigh: Math.round((((t_high - close) / close) * 100) * 100) / 100,
                                                lowToLow: Math.round((((t_low - low) / low) * 100) * 100) / 100,
                                                closesAt: Math.round((((t_close - close) / close) * 100) * 100) / 100,
                                                one_percent_or_close: Math.round((((t_close - close) / close) * 100) * 100) / 100,
                                                t_p_1_opens_at: Math.round((((t_p_1_open - close) / close) * 100) * 100) / 100,
                                                t_p_1_low_at: Math.round((((t_p_1_low - close) / close) * 100) * 100) / 100,
                                                closeToKhigh: Math.round((((kHigh - close) / close) * 100) * 100) / 100,
                                                kDays: (j - 1) - k, // -1 is correct here!
                                                kDate: `${kDate.getDate()} ${shortMonthNames[kDate.getMonth()]} ${kDate.getFullYear()}`,
                                                day: days[date.getDay()]
                                            });
                                            break;
                                        } else {
                                            continue;
                                        }
                                    }
                                }
                            }
                    }
                }

            } else {
                console.log(response);
            }

        } catch (error) {
            console.error(error)
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }
    handleExit()
}

main();
