const axios = require('axios');
const express = require('express');
const { getDailyIntervalData, getInstrumentKeys } = require('./historicalFunctions');
const app = express()
const { writeFileSync, existsSync, statSync, unlinkSync } = require("fs")

const port = 3000
let access_token = null

app.get('/', (req, res) => {

    res.send('Hello World!')
    console.log(req.query.code)
    
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://api.upstox.com/v2/login/authorization/token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        data: {
            code: req.query.code,
            client_id: `88eb7ac9-54e2-4cbd-9e1e-522f29bc7488`,
            client_secret: `nabgxn53wz`,
            redirect_uri: `http://localhost:3000`,
            grant_type: `authorization_code`
        }
    };

    const getAccessToken = () => {
        axios(config)
            .then((response) => {
                // res.send('Access Token Received!')
                access_token = response.data.access_token
                writeFileSync('token.txt', access_token)
                // console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            })
            ;
    }

    if (existsSync('token.txt')) {
        if (statSync('token.txt').birthtime.getDate() == new Date().getDate()) {
            null;
        } else {
            unlinkSync('token.txt')
            getAccessToken()
        }
    } else getAccessToken()

    setTimeout(() => { getInstrumentKeys() }, 200)

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})