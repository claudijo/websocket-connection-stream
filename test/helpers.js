var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Base socket connection
 * @constructor
 */

var FakeWebSocketConnectionBase = function() {
  this.readyState = FakeWebSocketConnectionBase.OPEN;
  this.emitter = new EventEmitter();
};

FakeWebSocketConnectionBase.CONNECTING = 0;
FakeWebSocketConnectionBase.OPEN = 1;
FakeWebSocketConnectionBase.CLOSING = 2;
FakeWebSocketConnectionBase.CLOSED = 3;

FakeWebSocketConnectionBase.prototype.addEventListener = function(event, listener) {
  this.emitter.on.apply(this.emitter, arguments);
};

FakeWebSocketConnectionBase.prototype.emit = function(event, data) {
  this.emitter.emit.apply(this.emitter, arguments);
};

FakeWebSocketConnectionBase.prototype._openSocket = function() {
  this.readyState = FakeWebSocketConnectionBase.OPEN;
  this.emitter.emit('open');
};

/**
 * Fake browser WebSocket connection
 * @constructor
 */

var FakeBrowserWebSocketConnection = function() {
  FakeWebSocketConnectionBase.call(this);

  this.binaryType = "blob";
};

util.inherits(FakeBrowserWebSocketConnection, FakeWebSocketConnectionBase);

FakeBrowserWebSocketConnection.prototype.send = function(data) {
  if (this._shouldThrow) {
    throw new Error('Socket error');
  }
};

FakeBrowserWebSocketConnection.prototype.removeEventListener = function(event, listener) {
  this.emitter.removeListener.apply(this.emitter, arguments);
};

/**
 * Fake node WebSocket connection
 * @constructor
 */

var FakeNodeWebSocketConnection = function() {
  FakeWebSocketConnectionBase.call(this);
};

util.inherits(FakeNodeWebSocketConnection, FakeWebSocketConnectionBase);

FakeNodeWebSocketConnection.prototype.send = function(data, callback) {
  if (this._shouldThrow) {
    return callback(new Error('Socket error'));
  }

  callback();
};

FakeNodeWebSocketConnection.prototype.removeListener = function(event, listener) {
  this.emitter.removeListener.apply(this.emitter, arguments);
};

module.exports = {
  FakeNodeWebSocketConnection: FakeNodeWebSocketConnection,
  FakeBrowserWebSocketConnection: FakeBrowserWebSocketConnection
};
