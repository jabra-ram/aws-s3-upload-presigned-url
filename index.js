const express = require('express')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const client = require('./s3Client')
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3')
const cuid = require('cuid')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const multer = require('multer')
require('dotenv').config();
const app = express();

app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 8000;

app.get('/', async (req, res)=>{
    const allFiles = await getAllFiles();
    return res.render('home', {
        files: allFiles
    });
})

app.get('/file/:key', async (req, res)=>{
    const url = await getFileURL(req.params.key);
    return res.redirect(url);
})

app.post('/file', upload.single('file'), async (req, res)=>{
    const url = await getSignedUrlToUpload(req.file);
    await axios.put(url, req.file.buffer, {
        headers: {
          'Content-Type': req.file.mimetype,
        },
    });
    console.log('File uploaded to S3');
    return res.redirect('/');
})

app.listen(PORT, ()=> console.log(`Listening at ${PORT}`))

const getSignedUrlToUpload = async (file) => {
    const url = await getSignedUrl(client, new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: `${file.originalname}`
    }), { expiresIn: 10 })
    return url;
}

const getFileURL = async (key) => {
    const url = await getSignedUrl(client, new GetObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key
    }), { expiresIn:10 })
    return url;
}
const getAllFiles = async()=>{
    const response = await client.send(
        new ListObjectsCommand({
            Bucket:process.env.BUCKET,
        })
    )
    return response.Contents;
}