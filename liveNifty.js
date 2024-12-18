import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv()

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.upstox.com/v2/market-quote/ltp?instrument_key=NSE_INDEX|Nifty Bank',
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`

    },
};

let myObject = {
    Bank_Nifty: "Initial Value"
};

function updateValue() {

    axios(config)
        .then((response) => {
            // console.log(JSON.stringify(response.data.data['NSE_INDEX:Nifty Bank'].last_price));
            // console.log(Object.values(response.data.data));
            // // Generate a new random value or update as needed
            myObject.Bank_Nifty = `${response.data.data['NSE_INDEX:Nifty Bank'].last_price}`;
            // // Clear the console and print the updated object
            console.clear();
            console.log(myObject);
        })
        .catch((error) => {
            console.log(error);
        });


}

// Update the value every 2 seconds
setInterval(updateValue, 2000);