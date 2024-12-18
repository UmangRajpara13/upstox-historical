import XLSX from 'xlsx'

// Load the workbook
const file ='./logs/2024-Dec-10/Hammer_100cr_30D_09h-41m-07s'
const workbook = XLSX.readFile(`${file}.xlsx`);

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON format
const data = XLSX.utils.sheet_to_json(worksheet);

// Sort the data by date (assuming the date column is named 'Date')
data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

// Convert the sorted data back to a worksheet
const sortedWorksheet = XLSX.utils.json_to_sheet(data);

// Replace the old sheet with the sorted one
workbook.Sheets[sheetName] = sortedWorksheet;

// Write the updated workbook to a new file
XLSX.writeFile(workbook, `${file}_Sorted.xlsx`);
