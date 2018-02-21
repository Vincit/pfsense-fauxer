const crypto = require('crypto');
const axios = require('axios');
const https = require('https');

class FauxApi {
  /**
   * Options
   *
   * host: https://mypfsense.sensetive.org
   * key: '<faux api key>'
   * secret: '<faux api secret>'
   * path?: defaults to /fauxapi/v1
   * timeout?: defaults to 15000
   * fakeTimestamp?:
   *   Date object to use in header generation.
   *   Defaults to false. Used for testing and debugging.
   * fakeNonce?:
   *   Nonce seed to use in header generation.
   *   Defaults to false. Used for testing and debugging.
   */
  constructor({
    host,
    path = '/fauxapi/v1',
    key,
    secret,
    timeout = 15000,
    allowSelfSignedSsl = false,
    fakeTimestamp = false,
    fakeNonce = false
  }) {
    this.secret = secret;
    this.key = key;

    // testing and debugging purposes
    this.fakeTimestamp = fakeTimestamp;
    this.fakeNonce = fakeNonce;

    this.axios = axios.create({
      baseURL: host + path,
      timeout,
      headers: {'Content-Type': 'application/json'}
    });

    if (allowSelfSignedSsl) {
      this.axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
    }

    this.axios.interceptors.request.use(
      config => {
        config.headers['fauxapi-auth'] = this.authHeader();
        return config;
      },
      error => {
        // Do something with request error
        return Promise.reject(error);
      }
    );
  }

  authHeader() {
    // timestamp format 20180118Z071917 (yyyymmddZhhmmss)
    const isoDate = (this.fakeTimestamp || new Date()).toISOString();
    const timestamp = isoDate
      .slice(0, 19)
      .replace(/[:-]/g, '')
      .replace('T', 'Z');

    const nonce = crypto
      .createHash('md5')
      .update('' + (this.fakeNonce || Math.random()))
      .digest('hex')
      .slice(0, 8);

    const preHash = `${this.secret}${timestamp}${nonce}`;
    const hash = crypto
      .createHash('sha256')
      .update(preHash)
      .digest('hex');

    return `${this.key}:${timestamp}:${nonce}:${hash}`;
  }

  functionCall(name, ...args) {
    const body = {function: name};

    if (args && args.length > 0) {
      body.args = args;
    }

    return this.axios
      .post('/?action=function_call', {
        function: name,
        args
      })
      .then(res => res.data);
  }
}

module.exports = {
  FauxApi
};
