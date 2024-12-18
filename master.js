import axios from "axios";
import { configDotenv } from "dotenv";
import ExcelJS from "exceljs";
configDotenv()

const apiUrl = 'https://mtrade.arhamshare.com';
const isNumberRegex = /^-?\d*(\.\d+)?$/;
const sanitizeString = (str) => str.replace(/\s+/g, '').toLowerCase();

// ExchangeSegment|ExchangeInstrumentID|InstrumentType|Name|Description|Series| NameWithSeries|InstrumentID|PriceBand.High|PriceBand.Low|
// FreezeQty|TickSize|LotSize|Multiplier|DisplayName|ISIN|PriceNumerator|PriceDenominator|DetailedDescription| ExtendedSurvIndicator|
// CautionIndicator|GSMIndicator
// NSECM|10845|8|771KL42|771KL42-SG|SG|771KL42-SG|1100100010845|105|95|999999|0.01|100|1|771KL42|IN2020220058|1|1|SDL KL 7.71% 2042-SG|0|-1|-1

const nsecm_columns = [
    { header: 'Exchange Segment', key: 'exchange_segment', width: 15 },
    { header: 'Exchange Instrument ID', key: 'exchange_instrument_id', width: 15 },
    { header: 'InstrumentType', key: 'instrument_type', width: 15 },
    { header: 'Name', key: 'instrument_name', width: 15 },
    { header: 'Description', key: 'description', width: 15 },
    { header: 'Series', key: 'series', width: 15 },
    { header: 'Name With Series', key: 'name_with_series', width: 15 },
    { header: 'Instrument ID', key: 'instrument_id', width: 15 },
    { header: 'PriceBand High', key: 'price_band_high', width: 15 },
    { header: 'PriceBand Low', key: 'price_band_low', width: 15 },
    { header: 'Freeze Qty', key: 'freeze_qty', width: 15 },
    { header: 'Tick Size', key: 'tick_size', width: 15 },
    { header: 'Lot Size', key: 'lot_size', width: 15 },
    { header: 'Multiplier', key: 'multiplier', width: 15 },
    { header: 'Display Name', key: 'display_name', width: 15 },
    { header: 'ISIN', key: 'isin', width: 15 },
    { header: 'Price Numerator', key: 'price_numerator', width: 15 },
    { header: 'Price Denominator', key: 'price_denominator', width: 15 },
    { header: 'Detailed Description', key: 'detailed_description', width: 15 },
    { header: 'Extended SurvIndicator', key: 'extended_surv_indicator', width: 15 },
    { header: 'Caution Indicator', key: 'caution_indicator', width: 15 },
    { header: 'GSM Indicator', key: 'gsm_indicator', width: 15 },
];

// ExchangeSegment|ExchangeInstrumentID|InstrumentType|Name|Description|Series| NameWithSeries|InstrumentID|PriceBand.High
// |PriceBand.Low|FreezeQty|TickSize|LotSize|Multiplier| UnderlyingInstrumentId|UnderlyingIndexName|ContractExpiration|StrikePrice
// |OptionType|DisplayName| PriceNumerator|PriceDenominator|DetailedDescription
// NSEFO|9028052|4|AARTIIND|AARTIIND24NOV24DECFUT|FUTSTK|AARTIIND-FUTSTK|2100109028052|12.85|-12.85|40001|0.05|1000|1|-1||2024-11-28T14:30:00|AARTIIND 28NOV26DEC SPD|1|1|AARTIIND24NOV24DECFUT

const nsefo_nsecd_columns = [
    ...nsecm_columns.slice(0, 13),
    { header: 'UnderlyingInstrumentId', key: 'underlying_instrument_id', width: 15 },
    { header: 'UnderlyingIndexName', key: 'underlying_index_name', width: 15 },
    { header: 'ContractExpiration', key: 'contract_expiration', width: 15 },
    { header: 'StrikePrice', key: 'strike_price', width: 15 },
    { header: 'OptionType', key: 'option_type', width: 15 },
    { header: 'DisplayName', key: 'display_name', width: 15 },
    { header: 'PriceNumerator', key: 'price_numerator', width: 15 },
    { header: 'PriceDenominator', key: 'price_denominator', width: 15 },
    { header: 'DetailedDescription', key: 'detailed_description', width: 15 },
];

const index_columns = [
    { header: 'Exchange Segment', key: 'exchangeSeg', width: 15 },
    { header: 'Exchange Instrument Id', key: 'exchange_instrument_id', width: 15 },
    { header: 'Name', key: 'name', width: 15 }
];

async function init_excelsheet(exchangeSegment, columns) {

    console.log(`Fetching Master for ${exchangeSegment} Segment`)

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(exchangeSegment);

    // Freeze the first row
    worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    worksheet.columns = columns;

    await axios.post(`${apiUrl}/apimarketdata/instruments/master`, {
        "exchangeSegmentList": [
            exchangeSegment
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        response.data["result"].split("\n").forEach(instrument => {
            // console.log(instrument)

            const values = instrument.split('|')
            // console.log(values)

            const row = {
                exchange_segment: values[0],
                exchange_instrument_id: values[1] || null,
                instrument_type: values[2] || null,
                instrument_name: values[3] || null,
                description: values[4] || null,
                series: values[5] || null,
                name_with_series: values[6] || null,
                instrument_id: values[7] || null,
                price_band_high: values[8] || null,
                price_band_low: values[9] || null,
                freeze_qty: values[10] || null,
                tick_size: values[11] || null,
                lot_size: values[12] || null,
                multiplier: values[13] || null,
            }

            if (exchangeSegment == "NSECM") {
                worksheet.addRow({
                    ...row,
                    display_name: values[14] || null,
                    isin: values[15] || null,
                    price_numerator: values[16] || null,
                    price_denominator: values[17] || null,
                    detailed_description: values[18] || null,
                    extended_surv_indicator: values[19] || null,
                    caution_indicator: values[20] || null,
                    gsm_indicator: values[21] || null,
                });
            } else {
                worksheet.addRow({
                    ...row,
                    underlying_instrument_id: values[14] || null,
                    underlying_index_name: values[15] || null,
                    contract_expiration: values[16] || null,
                    strike_price: isNumberRegex.test(values[17]) ? values[17] : null,
                    option_type: isNumberRegex.test(values[17]) ? values[18] : null,
                    display_name: isNumberRegex.test(values[17]) ? values[19] : values[17],
                    price_numerator: isNumberRegex.test(values[17]) ? values[20] : values[18],
                    price_denominator: isNumberRegex.test(values[17]) ? values[21] : values[19],
                    detailed_description: isNumberRegex.test(values[17]) ? values[22] : values[20],
                });
            }
        });
        // console.log(response.data["result"].split("\n"))
    }).catch(error => {
        console.log(error)
    })
    await workbook.xlsx.writeFile(`${exchangeSegment.toLowerCase()}.xlsx`);
}

async function init_index(exchangeSegment, worksheet) {
    return new Promise((resolve, reject) => {
        console.log(`Fetching Index ${exchangeSegment}`)
        axios.get(`${apiUrl}/apimarketdata/instruments/indexlist`, {
            params: {
                'exchangeSegment': exchangeSegment
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response) => {
            // console.log(response.data)
            if (response.data["result"].indexList) {
                for (let i = 0; i < response.data["result"].indexList.length; i++) {
                    const index = response.data["result"].indexList[i];
                    worksheet.addRow({
                        exchangeSeg: exchangeSegment,
                        exchange_instrument_id: index.split('_')[1],
                        name: index.split('_')[0]
                    })
                }
            }
            resolve(worksheet)
        }).catch(error => {
            console.log(error)
            reject(error)
        })
    })
}

export async function master() {

    await init_excelsheet("NSECM", nsecm_columns);

    await init_excelsheet("NSEFO", nsefo_nsecd_columns);

    // await init_excelsheet("NSECD", nsefo_nsecd_columns);

    // let workbook = new ExcelJS.Workbook();
    // let worksheet = null;

    // worksheet = workbook.addWorksheet('index');
    // worksheet.columns = index_columns;

    // // Freeze the first row
    // worksheet.views = [
    //     { state: 'frozen', xSplit: 0, ySplit: 1 }
    // ];

    // console.log(typeof worksheet)

    worksheet = await init_index(1, worksheet); // NSECM
    worksheet = await init_index(2, worksheet); // NSEFO
    // worksheet = await init_index(3, worksheet);
    // worksheet = await init_index(11, worksheet);

    // await workbook.xlsx.writeFile(`index.xlsx`);
}

let nsecmWorksheet,
    nsefoWorksheet,
    nsecdWorksheet,
    indexWorksheet,
    nscecm_futures_worksheet = null;

export async function masterRead(segment) {
    const filePath = `${segment}.xlsx`
    console.log(`Reading master list of ${segment}`)
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    if (segment === `nsecm`) { nsecmWorksheet = workbook.getWorksheet(1) }
    if (segment === `nsefo`) { nsefoWorksheet = workbook.getWorksheet(1) }
    // if (segment === `index`) { indexWorksheet = workbook.getWorksheet(1) }
    // if (segment === `nsecd`) { nsecdWorksheet = workbook.getWorksheet(1) }
    if (segment === `nsecm_futures`) { nscecm_futures_worksheet = workbook.getWorksheet(1) }
}


const nsecm_futures_columns = [
    { header: 'Exchange Segment', key: 'exchange_segment', width: 15 },
    { header: 'ISIN', key: 'isin', width: 15 },
    { header: 'Name', key: 'instrument_name', width: 15 },
    { header: 'Exchange Instrument ID', key: 'exchange_instrument_id', width: 15 },
    { header: 'Series', key: 'series', width: 15 },
    { header: 'InstrumentType', key: 'instrument_type', width: 15 },
    { header: 'Description', key: 'description', width: 15 },
    { header: 'Name With Series', key: 'name_with_series', width: 15 },
    { header: 'Instrument ID', key: 'instrument_id', width: 15 },
    { header: 'PriceBand High', key: 'price_band_high', width: 15 },
    { header: 'PriceBand Low', key: 'price_band_low', width: 15 },
    { header: 'Freeze Qty', key: 'freeze_qty', width: 15 },
    { header: 'Tick Size', key: 'tick_size', width: 15 },
    { header: 'Lot Size', key: 'lot_size', width: 15 },
    { header: 'Multiplier', key: 'multiplier', width: 15 },
    { header: 'Display Name', key: 'display_name', width: 15 },
    { header: 'Price Numerator', key: 'price_numerator', width: 15 },
    { header: 'Price Denominator', key: 'price_denominator', width: 15 },
    { header: 'Detailed Description', key: 'detailed_description', width: 15 },
    { header: 'Extended SurvIndicator', key: 'extended_surv_indicator', width: 15 },
    { header: 'Caution Indicator', key: 'caution_indicator', width: 15 },
    { header: 'GSM Indicator', key: 'gsm_indicator', width: 15 },
];

const InstrumentIdColumn = 8;

const workbook = new ExcelJS.Workbook();

let nsecm_futures = {}

// process.on('SIGINT', async () => {
//     console.log('Ctrl+C pressed. Saving data to Excel...');
//     await workbook.xlsx.writeFile(`nsecm_futures.xlsx`);
//     process.exit(0)
// });

export async function createNsecmFutures() {
    console.log('preparing nsecm_futures')
    nscecm_futures_worksheet = workbook.addWorksheet('nsecm_futures');
    nscecm_futures_worksheet.columns = nsecm_futures_columns;

    nsefoWorksheet.eachRow((nsefoRow, nsefoRowNumber) => {

        const nsefoExchangeInstrumentId = nsefoRow.getCell(14).value;
        console.log(nsefoExchangeInstrumentId)

        nsecmWorksheet.eachRow((nsecmRow, rowNumber) => {

            const exchangeSegment = nsecmRow.getCell(1).value;
            const isin = nsecmRow.getCell(16).value; // P = 16
            const exchangeInstrumentID = nsecmRow.getCell(InstrumentIdColumn).value;
            const exchangeSymbolName = nsecmRow.getCell(4).value;
            const series = nsecmRow.getCell(6).value;

            if (Number(exchangeInstrumentID) == Number(nsefoExchangeInstrumentId)) {
                console.log(exchangeInstrumentID, nsefoExchangeInstrumentId)

                nsecm_futures[exchangeInstrumentID] = {
                    exchange_segment: exchangeSegment || null,
                    isin: isin || null,
                    exchange_instrument_id: exchangeInstrumentID || null,
                    instrument_name: exchangeSymbolName || null,
                    series: series || null,
                }
            }

        })
    })
    for (const key in nsecm_futures) {
        nscecm_futures_worksheet.addRow(nsecm_futures[key])
    }
    await workbook.xlsx.writeFile(`nsecm_futures.xlsx`);
}

export async function GetInstrumentId(instrument) {
    return new Promise(async (resolve, reject) => {

        const searchKey = instrument.name
        const valueColumn = 2; // Column A=1, B=2 ; 2 because all exchangeInstrumentId is in column 2
        const eventCode = instrument?.eventCode; // Column A=1, B=2 ; 2 because all exchangeInstrumentId is in column 2

        let worksheet = null;

        if (instrument.segment === `nsecm`) { worksheet = nsecmWorksheet }
        if (instrument.segment === `nsefo`) { worksheet = nsefoWorksheet }
        if (instrument.segment === `nsecd`) { worksheet = nsecdWorksheet }
        if (instrument.segment === `index`) { worksheet = indexWorksheet }
        if (instrument.segment === `nsecm_futures`) { worksheet = nscecm_futures_worksheet }

        let resultValue = null;
        let exchangeSegment = null;
        let keyColumn;

        if (instrument.segment === 'index') {
            if (instrument.name.startsWith('NIFTY')) {
                exchangeSegment = 1;
            }
            else {
                exchangeSegment = 11;
            }
            keyColumn = 3;
        }
        if (instrument.segment === 'nsecm') { exchangeSegment = 1; keyColumn = 4; }
        if (instrument.segment === 'nsefo') { exchangeSegment = 2; keyColumn = 5; }
        if (instrument.segment === 'nsecm_futures') { exchangeSegment = xx; keyColumn = 3; }
        // if (instrument.segment === 'nsecd') { exchangeSegment = 3; keyColumn = 4; }

        try {
            worksheet.eachRow((row, rowNumber) => {
                const keyCellValue = row.getCell(keyColumn).value; // Get value from the key column
                if (sanitizeString(keyCellValue) === sanitizeString(searchKey)) {
                    resultValue = row.getCell(valueColumn).value; // Get value from the target column

                    resolve({
                        name: searchKey,
                        exchangeSegment: exchangeSegment,
                        exchangeInstrumentID: resultValue,
                        eventCode: eventCode
                    })
                }
            });
        } catch (error) {
            reject(error)
        }
    })
}