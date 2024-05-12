require('dotenv').config();
const express = require('express');
const cors = require('cors');
const url = require('url');
const dns = require('dns');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI);

var shortenedURLSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

var shortenedURL = mongoose.model('shortenedURL', shortenedURLSchema);

// front page
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// request short URL
app.post('/api/shorturl', (req, res) => {
  try {
    var link = new URL(req.body.url);
  }
  catch { // if URL is invalid
    res.json({error: "Invalid URL"});
    return;
  }
  dns.lookup(link.hostname, async (err, address) =>
  {
    if (!address) // if host is invalid
      res.json({error: "Invalid Hostname"});
    else
    {
      const url = await shortenedURL.findOne({original_url: link.href});
      if(url) // fetch existing short URL
        res.json({original_url: link.href, short_url: url.short_url});
      else
      { // create new short URL
        const count = await shortenedURL.countDocuments();
        new shortenedURL({original_url: link.href, short_url: count}).save();
        res.json({original_url: link.href, short_url: count});
      }
    }
  });       
});

// redirect to shortened URL
app.get('/api/shorturl/:value', async (req, res) => {
  const url = await shortenedURL.findOne({short_url: req.params.value});
  if(url)
    res.redirect(url.original_url);
  else
    res.json({error: "Short URL does not exist"});
});
