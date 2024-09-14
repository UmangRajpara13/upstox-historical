const ExcelJS = require('exceljs');

async function createExcelFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    worksheet.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'First Name', key: 'firstName', width: 30 },
        { header: 'Last Name', key: 'lastName', width: 30 }
    ];

    worksheet.addRow({ id: 1, firstName: 'John', lastName: 'Doe' });
    worksheet.addRow({ id: 2, firstName: 'Jane', lastName: 'Smith' });

    await workbook.xlsx.writeFile('data.xlsx');
    console.log('Excel file created!');
}

createExcelFile()