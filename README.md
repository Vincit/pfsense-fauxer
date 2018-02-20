# pfSense faux-api client for Node

Simple client lib for communicating with pfSense faux-api qith node.

```js
const FauxApi = require('./src/faux-api').FauxApi;

/**
 * Example how to implement your custom faux api functions
 */
class Api extends FauxApi {
  async getCerts() {
    const config = await this.functionCall('parse_config');
    return config.data.return.cert;
  }
}

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
const api = new Api({
  host: 'https://mypsfsensehostname.example.org',
  allowSelfSignedSsl: true,
  key: '<fauxapikey>',
  secret: '<fauxapisecret>'
});

// api.functionCall('<function name>', '<arg1>', '<arg2>', '<arg3>', '<arg4>', ...) 
api.functionCall('openvpn_get_active_servers')
  .then(r => console.dir(r.data, {colors: true, depth: null}))
  .catch(err => console.dir(err.response.data, {colors: true, depth: null}));
```