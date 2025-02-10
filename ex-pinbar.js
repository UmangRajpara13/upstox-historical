import path from "path";
import fs from 'fs';
import ExcelJS from "exceljs";
import axios from "axios";
import { getInstrumentKeys } from "./historicalFunctions.js";


let all_nse_stocks
let count = 0
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('My Sheet');

// Freeze the first row
worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
];

const filePath = 'Analysis/pinbar_100cr_10D.xlsx'

worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'candle color', key: 'candleColor', width: 5 },
    { header: 'Open To Low %', key: 'openToLow', width: 15 },
    { header: 'Open To Close %', key: 'openToClose', width: 15 },
    { header: 'Day', key: 'day', width: 15 },
];

const handleExit = async () => {
    console.log('Ctrl+C pressed. Saving data to Excel...');
    await workbook.xlsx.writeFile(filePath);
    console.log(`Data saved to ${filePath}. Exiting...`);
    process.exit(); // Exit the process
};

process.on('SIGINT', handleExit);

async function main() {
    try {
        all_nse_stocks = await getInstrumentKeys()
        // console.log('CSV Data:', all_nse_stocks);
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }


    // all_nse_stocks = [{
    //     instrument_key: 'NSE_EQ|INE879I01012',
    //     tradingsymbol: 'AADHARHFC',
    // }]


    for (let i = 0; i < all_nse_stocks.length; i++) {

        const stock = all_nse_stocks[i];
        const instrument_key = stock.instrument_key
        const interval = "day" // day | 1minute 
        const to_date = "2024-09-06" // YYYY-MM-DD
        const from_date = "2023-09-06" // YYYY-MM-DD

        const url = `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`
        const headers = {
            'Accept': 'application/json'
        }


        await axios.get(url, { headers })
            .then(response => {
                // console.log(response.data.data.candles);
                const all_days = response.data.data.candles

                console.log(`\n ${stock.tradingsymbol}`)

                const highs_of_x_days = []
                const x_days = 11

                for (let j = all_days.length - 1; j > 1; j--) {

                    const day = all_days[j];
                    const date = new Date(day[0])
                    const open = day[1]
                    const high = day[2]
                    const low = day[3]
                    const close = day[4]
                    const volume = day[5]
                    const center_value = (high - low) / 2 + low

                    const nextDay = all_days[j - 1]
                    const nOpen = nextDay[1]
                    const nHigh = nextDay[2]
                    const nLow = nextDay[3]
                    const nClose = nextDay[4]


                    highs_of_x_days.length < x_days && highs_of_x_days.push(high)
                    // console.log(highs_of_x_days)

                    if (j <= all_days.length - (x_days + 1)) {

                        const high_of_x_days = Math.max(...highs_of_x_days)

                        // console.log('<<10>>', high, high_of_x_days, highs_of_x_days)

                        highs_of_x_days.shift()

                        if (high >= high_of_x_days && volume * close > 1000000000)
                            if (close < center_value && open < center_value) {

                                // console.log(date.getDate(), months[date.getMonth()], date.getFullYear())

                                if (nOpen > 1.01 * close && nOpen < high) {
                                    console.log(count++, ')', date.getDate(), months[date.getMonth()], date.getFullYear(),
                                        ((nOpen - nLow) / nOpen) * 100)
                                        
                                    worksheet.addRow({
                                        name: stock.tradingsymbol,
                                        date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
                                        candleColor: close > open ? 'G' : 'R',
                                        openToLow: Math.round((((nOpen - nLow) / nOpen) * 100) * 100) / 100,
                                        openToClose: Math.round((((nOpen - nClose) / nOpen) * 100) * 100) / 100,
                                        day: days[date.getDay()]
                                    });
                                }
                            }
                    }
                }
            })
            .catch(error => {
                console.error(error)
                // error_stocks.push(error)
                // console.error(`Error: ${error.response.status} - ${error.response.data} `);
            });
    }
    await workbook.xlsx.writeFile(filePath);
}

main();
