var util = require('util');
var EventEmitter = require('events').EventEmitter;

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

// Fake browser WebSocket connection

var FakeBrowserWebSocketConnection = function() {
  FakeWebSocketConnectionBase.call(this);
};

util.inherits(FakeBrowserWebSocketConnection, FakeWebSocketConnectionBase);

FakeBrowserWebSocketConnection.prototype.send = function(data) {
  if (this.readyState !== FakeWebSocketConnectionBase.OPEN) {
    throw new Error('INVALID_ACCESS_ERROR');
  }
};

FakeBrowserWebSocketConnection.prototype.removeEventListener = function(event, listener) {
  this.emitter.removeListener.apply(this.emitter, arguments);
};

// Fake node WebSocket connection
var FakeNodeWebSocketConnection = function() {
  FakeWebSocketConnectionBase.call(this);
};

util.inherits(FakeNodeWebSocketConnection, FakeWebSocketConnectionBase);

FakeNodeWebSocketConnection.prototype.send = function(data, callback) {
  if (this.readyState !== FakeWebSocketConnectionBase.OPEN) {
    return callback(new Error('INVALID_ACCESS_ERROR'));
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
