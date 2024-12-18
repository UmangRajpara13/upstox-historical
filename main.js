import { configDotenv } from "dotenv";
import { createNsecmFutures, master, masterRead } from "./master.js";
import updateOrAddEnvVariable from "./update_env.js";
import fs from 'fs';

configDotenv();

const today = new Date().toISOString().split('T')[0]; // Get yyyy-mm-dd format

export async function main() {
    console.log('Environment :', process.env.NODE_ENV)
    // Get today's date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set time to midnight for today's date

    // Get the last date from the environment variable
    const lastDateStr = process.env.master_update_day;
    const lastDateParts = lastDateStr.split('-'); // Split the date string into parts
    const lastDate = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]); // Create a Date object (month is 0-indexed)
    lastDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    // Compare dates to check if midnight has passed

    if (now > lastDate) {
        console.log("Midnight has passed, Fetching Master...");
        await master();
        await updateOrAddEnvVariable("master_update_day", today)
    } else {
        console.log("It is still before midnight wrt the stored date.");
    }

    // await masterRead('index')
    await masterRead('nsecm')
    await masterRead('nsefo')

    // await masterRead('nsecd')

    createNsecmFutures()
    await masterRead('nsecm_futures')

}

