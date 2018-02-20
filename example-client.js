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
 * .pfsense-fauxer.js should contain

  module.export = {
    host: 'https://pfsense.host.name.example.org',
    key: 'fauxapikeytoconnect',
    secret: 'api-secret-to-connect',
    allowSelfSignedSsl: true
  };

 */
const api = new Api(require('./.pfsense-fauxer'));

const [node, script, funcName, ...funcArgs] = process.argv;

/**
 * Fetch ALL certs.
 *
 * Usage:
 *
 * node example-client.js <function-name> [<param1> <param2> ...]
 *
 * for example:
 *
 * node example-client.js openvpn_get_active_servers
 *
 * node example-client.js getCerts
 */

switch (funcName) {
  case 'getCerts':
    api
      .getCerts()
      .then(r => console.dir(r, {colors: true, depth: null}))
      .catch(console.error);
    break;
  default:
    api
      .functionCall(funcName || 'openvpn_get_active_servers', ...funcArgs)
      .then(r => console.dir(r.data, {colors: true, depth: null}))
      .catch(err => console.dir(err.response.data, {colors: true, depth: null}));
}
