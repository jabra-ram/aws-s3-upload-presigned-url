require('dotenv').config()

const { S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client({
    region: process.env.REGION,
    credentials:{
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey:process.env.SECRET_ACCESS_KEY
    }
})

module.exports = client;