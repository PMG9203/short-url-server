const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/short-url-app",
  {
    useNewUrlParser: true
  }
);
app.use(cors());

// CREATE MODEL URL OBJECT

const Url = mongoose.model("Url", {
  longUrl: { type: String },
  shortUrl: { type: String },
  codeUrl: { type: String },
  counter: { type: Number }
});

const isAnUrl = str => {
  const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if (pattern.test(str)) {
    return true;
  }
  return false;
};

// CREATE URL OBJECT

app.post("/create", async (req, res) => {
  try {
    // CREATE longUrl
    const longUrl = req.body.longUrl;

    // VERIFY IF IS A VALID URL
    const pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (pattern.test(longUrl)) {
      // SEARCH IF URL EXIST IN BD
      for (let i = 0; i < Url.length; i++) {
        const existingUrl = await Url.findOne({ longUrl: longUrl });

        if (existingUrl === null) {
          // CREATE RANDOM STRING
          const randomString = uid2(5);

          // CREATE shortUrl
          const shortUrl =
            "https://short-url-pm-gilleron.herokuapp.com/" + randomString;

          // CREATE NEW Url
          const newUrl = new Url({
            longUrl: longUrl,
            shortUrl: shortUrl,
            codeUrl: randomString,
            counter: 0
          });

          //SAVE newURL
          await newUrl.save();
          res.json(newUrl);
          break;
        } else {
          res.status(400).json({
            error: {
              message: "Url already exists"
            }
          });
          break;
        }
      }
    } else {
      res.status(400).json({
        error: {
          message: "Url is not a valid Url"
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ URLS
app.get("/", async (req, res) => {
  try {
    const urls = await Url.find();
    return res.json(urls);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

const PORT = 3001;

app.listen(process.env.PORT || PORT, () => {
  console.log("Server started on port: " + PORT);
});
