const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');


module.exports = {

    getInstrumentKeys: async () => {
        return new Promise((resolve, reject) => {
            fs.createReadStream('./sanitiZED_NSE.csv')
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data)
                })
                .on('end', () => {
                    // console.log(results); // This will log the parsed CSV data
                    resolve(results);
                }).on('error', (error) => {
                    reject(error);
                });
        })
    }
}