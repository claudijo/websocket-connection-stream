var expect = require('expect.js');
var sinon = require('sinon');
var connectionStream = require('..');
var helpers = require('./helpers');

var commonSuite = function() {
  it('should send outgoing messages', function() {
    this.streamingConnection.write('hello');
    this.streamingConnection.write('world');

    expect(this.fakeConnection.send.args[0][0]).to.eql(new Buffer('hello'));
    expect(this.fakeConnection.send.args[1][0]).to.eql(new Buffer('world'));
  });

  it('should handle incoming messages of Buffer type', function(done) {
    this.streamingConnection.on('readable', function() {
      var chunk = this.read();
      expect(chunk.toString()).to.be('hello');
      done();
    });

    this.fakeConnection.emit('message', { data: new Buffer('hello') });
  });

  it('should handle incoming messages of ArrayBuffer type', function(done) {
    var message = 'hello';

    var arrBuff = new ArrayBuffer(message.length);
    var arrBuffView = new Uint8Array(arrBuff);

    for (var i = 0; i < message.length; i++) {
      arrBuffView[i] = message.charCodeAt(i);
    }

    this.streamingConnection.on('readable', function() {
      var chunk = this.read();
      expect(chunk.toString()).to.be(message);
      done();
    });

    this.fakeConnection.emit('message', { data: arrBuff });
  });

  it('should expose websocket instance', function() {
    expect(this.streamingConnection.socket).to.be(this.fakeConnection);
  });

  it('should emit error event if sending is erroneous', function(done) {
    this.streamingConnection.on('error', function(err) {
      expect(err).to.be.an(Error);
      done();
    });

    this.fakeConnection._shouldThrow = true;
    this.streamingConnection.write('hello');
  });

  it('should not send if socket is not open', function() {
    this.fakeConnection.readyState = this.fakeConnection.CLOSED;
    this.streamingConnection.write('hello');
    expect(this.fakeConnection.send.callCount).to.be(0);
  });

  it('it should send pending messages when socket opens', function() {
    this.fakeConnection.readyState = this.fakeConnection.CLOSED;

    this.streamingConnection.write('hello');
    this.streamingConnection.write('world');

    this.fakeConnection._openSocket();

    expect(this.fakeConnection.send.args[0][0]).to.eql(new Buffer('hello'));
    expect(this.fakeConnection.send.args[1][0]).to.eql(new Buffer('world'));
  });
};

var nodeWebsocketSuite = function() {
  it('should remove message listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeNodeWebSocketConnection());

    expect(this.fakeConnection.removeListener.args[0][0]).to.be(this.fakeConnection.addEventListener.args[0][0]);
    expect(this.fakeConnection.removeListener.args[0][1]).to.be(this.fakeConnection.addEventListener.args[0][1]);
  });

  it('should remove open listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeNodeWebSocketConnection());

    expect(this.fakeConnection.removeListener.args[1][0]).to.be(this.fakeConnection.addEventListener.args[1][0]);
    expect(this.fakeConnection.removeListener.args[1][1]).to.be(this.fakeConnection.addEventListener.args[1][1]);
  });

  it('should return stream when attaching socket', function() {
    var streamingConnection = this.streamingConnection.attach(new helpers.FakeNodeWebSocketConnection());

    expect(streamingConnection).to.be(this.streamingConnection);
  });
};

var browserWebsocketSuite = function() {
  it('should remove message listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeBrowserWebSocketConnection());

    expect(this.fakeConnection.removeEventListener.args[0][0]).to.be(this.fakeConnection.addEventListener.args[0][0]);
    expect(this.fakeConnection.removeEventListener.args[0][1]).to.be(this.fakeConnection.addEventListener.args[0][1]);
  });

  it('should remove open listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeBrowserWebSocketConnection());

    expect(this.fakeConnection.removeEventListener.args[1][0]).to.be(this.fakeConnection.addEventListener.args[1][0]);
    expect(this.fakeConnection.removeEventListener.args[1][1]).to.be(this.fakeConnection.addEventListener.args[1][1]);
  });

  it('should return stream when attaching socket', function() {
    var streamingConnection = this.streamingConnection.attach(new helpers.FakeBrowserWebSocketConnection());

    expect(streamingConnection).to.be(this.streamingConnection);
  });

  it('should set connection binary type to arraybuffer', function() {
    expect(this.fakeConnection.binaryType).to.be('arraybuffer');
  });

  it('should sending pending messages when attaching already open socket', function() {
    var alreadyOpenSocket = new helpers.FakeNodeWebSocketConnection();
    sinon.spy(alreadyOpenSocket, 'send');

    this.fakeConnection.readyState = this.fakeConnection.CLOSED;

    this.streamingConnection.write('hello');
    this.streamingConnection.write('world');

    this.streamingConnection.attach(alreadyOpenSocket);

    expect(alreadyOpenSocket.send.args[0][0]).to.eql(new Buffer('hello'));
    expect(alreadyOpenSocket.send.args[1][0]).to.eql(new Buffer('world'));
  });
};

describe('Connection Stream', function() {
  beforeEach(function() {
    this.streamingConnection = connectionStream();
  });

  afterEach(function() {
    this.streamingConnection = null;
  });

  describe('with node web socket connection', function() {
    beforeEach(function() {
      this.fakeConnection = new helpers.FakeNodeWebSocketConnection();
      sinon.spy(this.fakeConnection, 'send');
      sinon.spy(this.fakeConnection, 'removeListener');
      sinon.spy(this.fakeConnection, 'addEventListener');
      this.streamingConnection.attach(this.fakeConnection);
    });

    afterEach(function() {
      this.fakeConnection.send.restore();
      this.fakeConnection.removeListener.restore();
      this.fakeConnection.addEventListener.restore();
      this.fakeConnection = null;
    });

    commonSuite();

    nodeWebsocketSuite();
  });

  describe('with browser web socket connection', function() {
    beforeEach(function() {
      this.fakeConnection = new helpers.FakeBrowserWebSocketConnection();
      sinon.spy(this.fakeConnection, 'send');
      sinon.spy(this.fakeConnection, 'removeEventListener');
      sinon.spy(this.fakeConnection, 'addEventListener');
      this.streamingConnection.attach(this.fakeConnection);
    });

    afterEach(function() {
      this.fakeConnection.send.restore();
      this.fakeConnection.removeEventListener.restore();
      this.fakeConnection.addEventListener.restore();
      this.fakeConnection = null;
    });

    commonSuite();

    browserWebsocketSuite();
  });
});
