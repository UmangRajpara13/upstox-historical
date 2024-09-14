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

const filePath = 'Analysis/trial.xlsx'

worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Date', key: 'date', width: 30 },
    { header: 'Open To Low %', key: 'openToLow', width: 30 },
    { header: 'Open To Close %', key: 'openToClose', width: 30 }
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


    all_nse_stocks = [{
        instrument_key: 'NSE_EQ|INE879I01012',
        tradingsymbol: 'AADHARHFC',
    }]


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

                if (all_days[0][4] * all_days[0][5] > 10000000) {

                    console.log(`\n ${stock.tradingsymbol}`)

                    const Highs_of_10days = []

                    for (let j = all_days.length - 1; j > 1; j--) {

                        const day = all_days[j];
                        const date = new Date(day[0])
                        const open = day[1]
                        const high = day[2]
                        const low = day[3]
                        const close = day[4]
                        const center_value = (high - low) / 2 + low

                        const nextDay = all_days[j - 1]
                        const nOpen = nextDay[1]
                        const nHigh = nextDay[2]
                        const nLow = nextDay[3]
                        const nClose = nextDay[4]


                        Highs_of_10days.length < 10 && Highs_of_10days.push(high)
                        // console.log(Highs_of_10days)

                        if (j <= all_days.length - 11) {

                            const High_of_10days = Math.max(...Highs_of_10days)

                            // console.log('<<10>>', high, High_of_10days, Highs_of_10days)

                            Highs_of_10days.shift()

                            if (high >= High_of_10days)
                                if (close < center_value && open < center_value) {
                                    // console.log(date.getDate(), months[date.getMonth()], date.getFullYear())
                                    // console.log('<<10>>', High_of_10days, Highs_of_10days)
                                    // console.log(open, high, low, close)
                                    if (nOpen > 1.01 * close && nOpen < high) {
                                        console.log(count++, ')', date.getDate(), months[date.getMonth()], date.getFullYear())
                                        console.log(`   ${((nOpen - nLow) / nOpen) * 100}`)
                                        worksheet.addRow({
                                            name: stock.tradingsymbol,
                                            date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
                                            openToLow: (((nOpen - nLow) / nOpen) * 100).toFixed(2),
                                            openToClose: (((nOpen - nClose) / nOpen) * 100).toFixed(2)
                                        });
                                        // low_upto.push(((nOpen - nLow) / nOpen) * 100)
                                    }
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
    // console.log(low_upto.sort((a, b) => a - b))
    // console.log('min%', Math.min(...low_upto), 'max%', Math.max(...low_upto))
    await workbook.xlsx.writeFile('Analysis/trial.xlsx');
}

main();
