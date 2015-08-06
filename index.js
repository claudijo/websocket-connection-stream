var Duplex = require('stream').Duplex;

module.exports = function() {
  var stream = new Duplex();
  var pendingWrite = null;

  var messageListener = function(event) {
    var data = event.data;

    if (data instanceof ArrayBuffer) {
      data = new Buffer(new Uint8Array(data));
    }

    stream.push(data);
  };

  var isSocketOpen = function() {
    return stream.socket && stream.socket.readyState === 1;
  };

  var openListener = function() {
    if (pendingWrite) {
      socketSend(pendingWrite.chunk, pendingWrite.callback);
      pendingWrite = null;
    }
  };

  var socketSend = function(chunk, callback) {
    if (stream.socket.send.length === 1) {
      try {
        stream.socket.send(chunk);
      } catch (err) {
        return callback(err);
      }

      callback();
      return;
    }

    stream.socket.send(chunk, callback);
  };

  stream.socket = null;

  stream.attach = function(socket) {
    if (this.socket) {
      if ('removeEventListener' in this.socket) {
        this.socket.removeEventListener('message', messageListener);
        this.socket.removeEventListener('open', openListener);
      } else {
        this.socket.removeListener('message', messageListener);
        this.socket.removeListener('open', openListener);
      }
    }

    this.socket = socket;
    this.socket.addEventListener('message', messageListener);
    this.socket.addEventListener('open', openListener);

    if (this.socket.binaryType === 'blob') {
      this.socket.binaryType = 'arraybuffer';
    }

    return this;
  };

  stream._write = function(chunk, encoding, callback) {
    if (!isSocketOpen()) {
      pendingWrite = { chunk: chunk, callback: callback };
      return;
    }

    socketSend(chunk, callback);
  };

  stream._read = function(size) {};

  return stream;
};
