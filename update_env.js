import fs from "fs"
import path from "path";
import { fileURLToPath } from 'url';


// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to your .env file
const envFilePath = path.join('./.env');

// Function to update or add a variable to the .env file
function updateOrAddEnvVariable(key, value) {
    // Read the current content of the .env file
    return new Promise((resolve, reject) => {
        fs.readFile(envFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading .env file:', err);
                return;
            }

            // Create a regex to find the key in the file
            const regex = new RegExp(`^${key}=.*`, 'm');

            if (regex.test(data)) {
                // If the variable exists, replace its value
                const updatedData = data.replace(regex, `${key}=${value}`);
                fs.writeFile(envFilePath, updatedData, (err) => {
                    if (err) {
                        console.error('Error writing to .env file:', err);
                    } else {
                        console.log(`Successfully updated ${key} in .env file`);
                    }
                    resolve()
                });
            } else {
                // If the variable does not exist, append it
                const envVariable = `${key}=${value}\n`;
                fs.appendFile(envFilePath, envVariable, (err) => {
                    if (err) {
                        console.error('Error writing to .env file:', err);
                    } else {
                        console.log(`Successfully added ${key} to .env file`);
                    }
                    resolve()
                });
            }
        });
    })

}

export default updateOrAddEnvVariable;