import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import assign = require( 'lodash/assign');
import startsWith =require('lodash/startsWith') ;
import * as Url from 'url';
import Http, { makeHttp, serializeRes, serializeHeaders } from 'swagger-client/lib/http';
import Resolver, { clearCache } from './resolver';
import resolveSubtree from 'swagger-client/lib/subtree-resolver';
import { makeApisTagOperation } from 'swagger-client/lib/interfaces';
import { execute, buildRequest, baseUrl } from 'swagger-client/lib/execute';
import { opId } from 'swagger-client/lib/helpers';
Swagger.http = Http;
Swagger.makeHttp = makeHttp.bind(null, Swagger.http);
Swagger.resolve = Resolver;
Swagger.resolveSubtree = resolveSubtree;
Swagger.execute = execute;
Swagger.serializeRes = serializeRes;
Swagger.serializeHeaders = serializeHeaders;
Swagger.clearCache = clearCache;
Swagger.makeApisTagOperation = makeApisTagOperation;
Swagger.buildRequest = buildRequest;
Swagger.helpers = {
  opId: opId
};
Swagger.getBaseUrl = baseUrl;

function Swagger(url) {
  var _this = this;

  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // Allow url as a separate argument
  if (typeof url === 'string') {
    opts.url = url;
  } else {
    opts = url;
  }

  if (!(this instanceof Swagger)) {
    return new (Swagger as any)(opts);
  }

  assign(this, opts);
  var prom = this.resolve().then(function () {
    if (!_this.disableInterfaces) {
      assign(_this, Swagger.makeApisTagOperation(_this));
    }

    return _this;
  }); // Expose this instance on the promise that gets returned

  prom.client = this;
  return prom;
}

Swagger.prototype = {
  http: Http,
  execute: function execute(options) {
    this.applyDefaults();
    return Swagger.execute(_objectSpread({
      spec: this.spec,
      http: this.http,
      securities: {
        authorized: this.authorizations
      },
      contextUrl: typeof this.url === 'string' ? this.url : undefined,
      requestInterceptor: this.requestInterceptor || null,
      responseInterceptor: this.responseInterceptor || null
    }, options));
  },
  resolve: function resolve() {
    var _this2 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Swagger.resolve(_objectSpread({
      spec: this.spec,
      url: this.url,
      http: this.http || this.fetch,
      allowMetaPatches: this.allowMetaPatches,
      useCircularStructures: this.useCircularStructures,
      requestInterceptor: this.requestInterceptor || null,
      responseInterceptor: this.responseInterceptor || null
    }, options)).then(function (obj) {
      _this2.originalSpec = _this2.spec;
      _this2.spec = obj.spec;
      _this2.errors = obj.errors;
      return _this2;
    });
  }
};

Swagger.prototype.applyDefaults = function applyDefaults() {
  var spec = this.spec;
  var specUrl = this.url; // TODO: OAS3: support servers here

  if (specUrl && startsWith(specUrl, 'http')) {
    var parsed = Url.parse(specUrl);

    if (!spec.host) {
      spec.host = parsed.host;
    }

    if (!spec.schemes) {
      spec.schemes = [parsed.protocol.replace(':', '')];
    }

    if (!spec.basePath) {
      spec.basePath = '/';
    }
  }
}; // add backwards compatibility with older versions of swagger-ui
// Refs https://github.com/swagger-api/swagger-ui/issues/6210


var helpers = Swagger.helpers;
export { helpers };
export default Swagger;