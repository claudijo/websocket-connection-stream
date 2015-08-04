var expect = require('expect.js');
var sinon = require('sinon');
var connectionStream = require('..');
var helpers = require('./helpers');

var commonSuite = function() {
  it('should send outgoing message', function(done) {
    this.streamingConnection.write('hello');

    setTimeout(function() {
      expect(this.fakeConnection.send.args[0][0]).to.eql(new Buffer('hello'));
      done();
    }.bind(this), 0);
  });

  it('should push incoming messages', function(done) {
    this.streamingConnection.on('readable', function() {
      var chunk = this.read();
      expect(chunk.toString()).to.be('hello');
      done();
    });

    this.fakeConnection.emit('message', { data: new Buffer('hello') });
  });

  it('should expose websocket instance', function() {
    expect(this.streamingConnection.socket).to.be(this.fakeConnection);
  });

  it('should emit error event if sending is unsuccessful', function(done) {
    this.streamingConnection.on('error', function(err) {
      expect(err).to.be.an(Error);
      done();
    });

    this.fakeConnection.readyState = this.fakeConnection.CLOSED;

    this.streamingConnection.write('hello');
  });
};

var nodeWebsocketSuite = function() {
  it('should remove message listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeNodeWebSocketConnection());

    expect(this.fakeConnection.removeListener.args[0][0]).to.be(this.fakeConnection.addEventListener.args[0][0]);
    expect(this.fakeConnection.removeListener.args[0][1]).to.be(this.fakeConnection.addEventListener.args[0][1]);
  });
};

var browserWebsocketSuite = function() {
  it('should remove message listener from old socket when attaching new socket', function() {
    this.streamingConnection.attach(new helpers.FakeNodeWebSocketConnection());

    expect(this.fakeConnection.removeEventListener.args[0][0]).to.be(this.fakeConnection.addEventListener.args[0][0]);
    expect(this.fakeConnection.removeEventListener.args[0][1]).to.be(this.fakeConnection.addEventListener.args[0][1]);
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
