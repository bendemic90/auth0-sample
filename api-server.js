const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const authConfig = require("./src/auth_config.json");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa")
require('dotenv').config();

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = process.env.APP_ORIGIN || `http://localhost:${appPort}`;

if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Please make sure that auth_config.json is in place and populated"
  );
}

const authorizeAccessToken = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"]
});

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

app.get("/api/public", (req, res) => {
  res.send({
    msg: "You called the public API!"
  });
});

app.get("/api/protected", authorizeAccessToken, (req, res) => {
  res.send({
    msg: "You called the protected API"
  })
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
