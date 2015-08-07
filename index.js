var Duplex = require('stream').Duplex;

module.exports = function() {
  var stream = new Duplex();
  var pendingWriteFn = null;

  var isSocketOpen = function() {
    return (stream.socket && (stream.socket.readyState === stream.socket.OPEN));
  };

  var removeEventListener = function(target, event, listener) {
    if ('removeEventListener' in target) {
      target.removeEventListener(event, listener);
      return
    }

    target.removeListener(event, listener);
  };

  var messageListener = function(event) {
    var data = event.data;

    if (data instanceof ArrayBuffer) {
      data = new Buffer(new Uint8Array(data));
    }

    stream.push(data);
  };

  var openListener = function() {
    pendingWriteFn && pendingWriteFn();
    pendingWriteFn = null;
  };

  var socketSend = function(chunk, callback) {
    if (stream.socket.send.length === 1) {
      try {
        stream.socket.send(chunk);
      } catch (err) {
        return callback(err);
      }

      return callback();
    }

    stream.socket.send(chunk, callback);
  };

  stream.socket = null;

  stream.attach = function(socket) {
    if (this.socket) {
      removeEventListener(this.socket, 'message', messageListener);
      removeEventListener(this.socket, 'open', openListener);
    }

    this.socket = socket;

    if (this.socket.binaryType === 'blob') {
      this.socket.binaryType = 'arraybuffer';
    }

    this.socket.addEventListener('message', messageListener);
    this.socket.addEventListener('open', openListener);

    if (this.socket.readyState === this.socket.OPEN) {
      openListener();
    }

    return this;
  };

  stream._write = function(chunk, encoding, callback) {
    if (!isSocketOpen()) {
      pendingWriteFn = function() { socketSend(chunk, callback); };
      return;
    }

    socketSend(chunk, callback);
  };

  stream._read = function(size) {};

  return stream;
};
