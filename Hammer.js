const { getInstrumentKeys } = require("./historicalFunctions");
const axios = require('axios');
const ExcelJS = require('exceljs');


let all_nse_stocks
const error_stocks = []
let count = 0
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const low_upto = []

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('My Sheet');

const filePath = 'Analysis/Hammer10D_1Cr_newToLogic_kDays_LessHigh_RED.xlsx'

worksheet.columns = [
    { header: 'Name', key: 'name', width: 18 },
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Close To Next High %', key: 'closeToNhigh', width: 15 },
    { header: 'Close To Kth High %', key: 'closeToKhigh', width: 15 },
    { header: 'K no. of days', key: 'kDays', width: 15 },
    { header: 'Date of +ve ROI', key: 'kDate', width: 15 },
    { header: '', key: 'noValue', width: 10 }

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
    //     instrument_key: 'NSE_EQ|INE09EO01013',
    //     tradingsymbol: 'AARTISURF',
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

                const Lows_of_10days = []
                const X_Days = 10

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


                    // if (open > 300) {
                    //     continue;
                    // }

                    Lows_of_10days.length < 10 && Lows_of_10days.push(low)
                    // console.log(Lows_of_10days)

                    if (j <= all_days.length - 11) {

                        const Lowest_of_10days = Math.min(...Lows_of_10days)

                        // console.log('<<10>>', high, Lowest_of_10days, Lows_of_10days)

                        Lows_of_10days.shift()


                        if (low <= Lowest_of_10days && volume * close > 10000000)

                            if (close < open && close > center_value
                                && open > center_value && high < all_days[j + 1][2]) {

                                console.log(count++, ')', date.getDate(),
                                    months[date.getMonth()], date.getFullYear(),
                                    '~~   ', (((nHigh - close) / close) * 100).toFixed(2))

                                if (((nHigh - close) / close) * 100 >= 1) {
                                    worksheet.addRow({
                                        name: stock.tradingsymbol,
                                        date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
                                        closeToNhigh: Number((((nHigh - close) / close) * 100)).toFixed(2),
                                        closeToKhigh: 0,
                                        kDays: 0,
                                        kDate: `--`,
                                        noValue: ``,
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
                                                date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
                                                closeToNhigh: Number((((nHigh - close) / close) * 100)).toFixed(2),
                                                closeToKhigh: Number((((kHigh - close) / close) * 100)).toFixed(2),
                                                kDays: (j - 1) - k, // -1 is correct here!
                                                kDate: `${kDate.getDate()} ${months[kDate.getMonth()]} ${kDate.getFullYear()}`,
                                                noValue: ``,
                                            });
                                            break;
                                        } else {
                                            continue
                                        }
                                    }
                                }
                            }
                    }
                }
            })
            .catch(error => {
                console.error(error)
            });
    }
    await workbook.xlsx.writeFile(filePath);
}

main();