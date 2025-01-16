const xsenv = require("@sap/xsenv");
const axios = require("axios");
const xssec = require("@sap/xssec");
const { constants } = require("./constants");

xsenv.loadEnv();
oCredentials = xsenv.readServices(constants.xsuaa)[constants.xsuaa].credentials;

// Using XSSEC to fetch the creds.
const oServ = new xssec.XsuaaService(oCredentials);
oServ.fetchClientCredentialsToken().then((value) => console.log(value));
oServ
  .fetchPasswordToken(constants.username, constants.password)
  .then((value) => console.log(value.access_token));

// Fetching Using Axios
axios
  .post(
    oCredentials.url + "/oauth/token",
    {
      grant_type: "password",
      username: constants.username,
      password: constants.password,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: oCredentials.clientid,
        password: oCredentials.clientsecret,
      },
    }
  )
  .then((response) => {
    sAccessToken = response?.data?.access_token;

    // Manually validating the fetched credentials
    const authService = new xssec.XsuaaService(oCredentials);
    const secContext = xssec
      .createSecurityContext(authService, {
        jwt: sAccessToken,
      })
      .then(
        (value) => {
          console.log(value.getUserInfo());
        },
        (reason) => {
          console.log(reason.statusCode, reason.message);
        }
      );
  });
