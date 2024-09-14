const axios = require('axios');



const instrument_key = "NSE_EQ|INE628A01036"
const interval = "day" // day | 1minute 
const to_date = "2024-09-06" // YYYY-MM-DD
const from_date = "2024-08-06" // YYYY-MM-DD

const url = `https://api.upstox.com/v2/historical-candle/${instrument_key}/${interval}/${to_date}/${from_date}`
// const url = `https://api.upstox.com/v2/historical-candle/intraday/${instrument_key}/${interval}/`
const headers = {
    'Accept': 'application/json'
}

axios.get(url, { headers })
    .then(response => {
        console.log(response.data.data.candles);
    })
    .catch(error => {
        // console.error(error)
        console.error(`Error: ${error.response.status} - ${error.response.data} `);
    });