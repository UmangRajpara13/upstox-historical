// Import the required modules
const XLSX = require('xlsx');
const fs = require('fs');

const slab_negatives = []
const slab_0 = []
const slab_0_0p5 = []
const slab_0p5_1 = []
const slab_1_2 = []
const slab_2_3 = []
const slab_3_4 = []
const slab_more_than_4 = []


// Function to read an XLSX file
function readXlsxFile(filePath) {
    // Read the file
    const workbook = XLSX.readFile(filePath);

    // Get the names of all sheets
    const sheetNames = workbook.SheetNames;

    // Read the first sheet
    const worksheet = workbook.Sheets[sheetNames[0]];
    // console.log(worksheet)
    // Convert the sheet to JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Log the data to the console
    console.log(filePath, 'Total:', jsonData.length);

    for (let index = 0; index < jsonData.length; index++) {
        const day = jsonData[index];
        day[2] = Number(day[2])
        if (day[2] < 0.00) { slab_negatives.push(day); continue; }
        if (day[2] == 0) { slab_0.push(day); continue; }
        if (0 < day[2] < 0.5) { slab_0_0p5.push(day); continue; }
        if (0.5 <= day[2] < 1) { slab_0p5_1.push(day); continue; }
        if (1 <= day[2] < 2) { slab_1_2.push(day); continue; }
        if (2 <= day[2] < 3) { slab_2_3.push(day); continue; }
        if (3 <= day[2] < 4) { slab_3_4.push(day); continue; }
        if (4 <= day[2]) { slab_more_than_4.push(day); continue; }
    }

    console.log(`
        (Negatives) ---- ${slab_negatives.length} ---- ${(slab_negatives.length / jsonData.length).toFixed(2)}\n
        (0) ---- ${slab_0.length} ---- ${(slab_0.length / jsonData.length).toFixed(2)}\n
        (0 to 0.5) ---- ${slab_0_0p5.length} ---- ${(slab_0_0p5.length / jsonData.length).toFixed(2)}\n
        (0.5 to 1) ---- ${slab_0p5_1.length} ---- ${(slab_0p5_1.length / jsonData.length).toFixed(2)}\n
        (1 to 2) ---- ${slab_1_2.length} ---- ${(slab_1_2.length / jsonData.length).toFixed(2)}\n
        (2 to 3) ---- ${slab_2_3.length} ---- ${(slab_2_3.length / jsonData.length).toFixed(2)}\n
        (3 to 4) ---- ${slab_3_4.length} ---- ${(slab_3_4.length / jsonData.length).toFixed(2)}\n
        (More than 4) ---- ${slab_more_than_4.length} ---- ${(slab_more_than_4.length / jsonData.length).toFixed(2)}`)
}

// Specify the path to your XLSX file
// const filePath = 'Analysis/data_all_turnover.xlsx';
// const filePath = 'Analysis/data_TO_10Cr.xlsx';
// const filePath = 'Analysis/data_TO_5Cr.xlsx';
// const filePath = 'Analysis/data_TO_1Cr.xlsx';
// const filePath = 'Analysis/Hammer10D_TO_1Cr_newToLogic_kDays.xlsx';
const filePath = 'Analysis/Hammer10D_1Cr_newToLogic_kDays_LessHigh.xlsx';
// const filePath = 'Analysis/Hammer10D_1Cr_newToLogic_kDays_LessHigh_Less400.xlsx';

// Call the function to read the file
readXlsxFile(filePath);