import express from "express";
import { rateLimit } from 'express-rate-limit'
import { translate } from "google-translate-api-browser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const API_PASSWORD = process.env["TRANSLATE_PASSWORD"];

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60, // day
  max: 10,
  skip: (req) => req.body.password === API_PASSWORD,
  message: "Too many requests, please try again later.",
});

app.post("/translate", rateLimiter, (req, res) => {
    const { text, input_password, to } = req.body;

    if (!text || !input_password) { // fixed: changed `!password` to `!input_password`
        return res.status(400).send("Both text and password are required");
    }

    if (input_password !== API_PASSWORD) {
        return res.status(401).send("Invalid password");
    }

    translate(text, {
        to,
        corsUrl: "http://cors-anywhere.herokuapp.com/",
    })
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error translating text");
        });
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
