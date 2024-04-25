require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// My code
const bodyParser = require('body-parser');
const url = require('url');
const dns = require('dns');
const mongoose = require('mongoose');
const { doesNotMatch } = require('assert');

mongoose.connect(process.env.MONGO_URI);

var shortenedURLSchema = new mongoose.Schema({original_url: String, short_url: Number});

var shortenedURL = mongoose.model('shortenedURL', shortenedURLSchema);

app.post('/api/shorturl', bodyParser.urlencoded({extended: true}), (req, res) => {
  try {
    var link = new URL(req.body.url);
    // URL is valid
    (dns.lookup(link.hostname, (err) => {
      if (err) res.json({error: "Invalid Hostname"}); // Host is not valid
      else {
        // Host is valid
        shortenedURL.findOne({original_url: link.href})
        .then((url) => {

          if(!url) { // If short URL doesn't exist

            // Create new shortenedURL document
            shortenedURL.where({}).countDocuments()
            .then((quantity) => {
              new shortenedURL({original_url: link.href, short_url: quantity}).save();
            });

            // Fetch and show the newly created shortenedURL document
            shortenedURL.findOne({original_url: link.href})
            .then((url) => {
              res.json({original_url: link.href, short_url: url.short_url});
            });

          }
          else // If short url does exist
            res.json({original_url: link.href, short_url: url.short_url});
        });
      }}));

  }
  catch { // URL is not valid
    res.json({error: "Invalid URL"});
  }
});

app.get('/api/shorturl/:value',)
