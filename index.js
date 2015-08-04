var Duplex = require('stream').Duplex;

module.exports = function() {
  var stream = new Duplex();

  var messageListener = function(event) {
    stream.push(event.data);
  };

  stream.socket = null;

  stream.attach = function(socket) {
    if (this.socket) {
      if ('removeEventListener' in this.socket) {
        this.socket.removeEventListener('message', messageListener);
      } else {
        this.socket.removeListener('message', messageListener);
      }
    }

    this.socket = socket;
    this.socket.addEventListener('message', messageListener);
  };

  stream._write = function(chunk, encoding, callback) {
    if (this.socket.send.length === 1) {
      try {
        this.socket.send(chunk);
      } catch (err) {
        return callback(err);
      }

      return;
    }

    this.socket.send(chunk, callback);
  };

  stream._read = function(size) {};

  return stream;
};
