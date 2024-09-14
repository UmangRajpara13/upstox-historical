const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

const results = [];

fs.createReadStream('NSE.csv')
    .pipe(csv())
    .on('data', (data) => {


        !/\d/.test(data.name) &&
            !data.name.includes('-') &&
            data.exchange == 'NSE_EQ' &&
            data.last_price != '0.0' && results.push(data)
    })
    .on('end', () => {
        console.log(results); // This will log the parsed CSV data

        stringify(results, { header: true }, (err, output) => {
            if (err) throw err;
            fs.writeFileSync('sanitiZED_NSE.csv', output);
        });
    });