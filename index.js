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

mongoose.connect(process.env.MONGO_URI);

var shortenedURLSchema = new mongoose.Schema({
  original_url: {type: String},
  short_url: {type: Number}
});
var shortenedURL = mongoose.model('shortenedURL', shortenedURLSchema);

app.post('/api/shorturl', bodyParser.urlencoded({extended: true}), (req, res) => {
  try {
    var link = new URL(req.body.url);
  }
  catch { // If URL is invalid
    res.json({error: "Invalid URL"});
    return;
  }
  dns.lookup(link.hostname, (err, address) => {
    
    if (!address) // If host is invalid
      res.json({error: "Invalid URL"});
    else {

      // Fetch shortenedURL of the posted URL
      shortenedURL.findOne({original_url: link.href})
      .then((url) => {

        if(!url) { // If it doesn't exist

          // Create and send new shortenedURL document
          shortenedURL.countDocuments()
          .then((quantity) => {
            new shortenedURL({original_url: link.href, short_url: quantity}).save();
            res.json({original_url: link.href, short_url: quantity});
          });
        }
        else // If it exists
          res.json({original_url: link.href, short_url: url.short_url});
      });
    }
  });       
});

app.get('/api/shorturl/:value', (req, res) => {
  shortenedURL.findOne({short_url: req.params.value})
  .then((sUrl) => {
    if(sUrl)
      res.redirect(sUrl.original_url);
    else
      res.json({error: "Short URL does not exist"});
  });
});
