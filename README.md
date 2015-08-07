# Websocket Connection Stream

Thin stream wrapper around a websocket connection. Compatible with
[ws](https://github.com/websockets/ws) connection instances and
[native browser WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
connections.

The module will enqueue incoming data until the provided underlying websocket is
open.

Error handling and life cycle management in general (creating, closing,
reconnecting etc) for the connection are _not_ handled by the module, and should
instead be handled by the user. The main exception to this is that the module
will listen to the provided socket's `open` event and enqueue messages until a
closed socket is opened.

This for instance enables the possibility to reconnect an unintentionally lost
connection to a server, by attaching a new websocket, without automatically
ending the stream and disrupting any stream plumbing down the line.

## Install

```js
npm install websocket-connection-stream
```

## Usage

* Create a websocket connection stream and attach a websocket connection to the
stream.
* Do some stream plumbing.
* Handle life cycle events outside the websocket connection stream.

### websocketConnectionStream()

Module exports a factory function that returns a websocket connection stream
instance, which is a duplex stream.

### websocketConnectionStreamInstance.attach(websocketConnection)

Attaches a websocket connection to the stream. Returns the websocket connection
stream instance.

### websocketConnectionStreamInstance.socket

Property that holds the underlying websocket connection.

## Examples

### In browser (using [Browserify](https://github.com/substack/node-browserify))

```js
var ws = new WebSocket('ws://ws.example.org');

var wsStream = require('websocket-connection-stream')().attach(ws);

getSomeReadableStreamSomehow().pipe(wsStream).pipe(getWritableStreamSomehow());

ws.addEventListener('close', function() {
  // Possibly reconnect by creating a new websocket connection and attaching it
  // to existing websocket connection stream.
});
```

### In Node (using the [ws](https://github.com/websockets/ws) module)

```js
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  var wsStream = require('websocket-connection-stream')().attach(ws);

  getSomeReadableStreamSomehow().pipe(wsStream).pipe(getWritableStreamSomehow());

  ws.on('close', function() {
    // Possibly tell others that user disconnected.

    // Manually dispose the stream.
    wsStream.end();
  });
});
```

## Test

Run unit tests:

```js
npm test
```

## License

[MIT](LICENSE)



