# WebSocket Connection Stream

Thin stream wrapper around a websocket connection (i.e. an object that has a
`send` method for outgoing messages and that fires a `message` event with a `data`
property for incoming messages). Compatible with [ws](https://github.com/websockets/ws)
connection instances and [native browser WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
connections.

The module will enqueue incoming data until the underlying websocket is open.

Error handling and life cycle management in general (creating, closing,
reconnecting etc) for the connection is not handled by the module, and should
instead be handled by the user.

## Usage

Create a websocket connection stream and attach a open connection to the stream.

Any life cycle events are handled outside the connection stream. For example
attach a new WebSocket instance to reconnect after an unintentional
disconnection.

Do some stream plumbing.

### require('websocket-connection-stream')

Module exports a factory function that returns a websocket connection stream
instance, which is a duplex stream.

### websocketConnectionStreamInstance.attach(websocketConnection)

Attaches a websocket connection to the stream. Returns the websocket connection
stream instance.

### websocketConnectionStreamInstance.socket

Property that holds the underlying socket.

## Examples

### In browser (using Browserify)

```js
var websocketConnectionStream = require('websocket-connection-stream');
var ws = new WebSocket('ws://ws.example.org');
var wsStream = websocketConnectionStream().attach(ws);

getSomeReadableStreamSomehow().pipe(wsStream).pipe(getWritableStreamSomehow());

ws.addEventListener('close', function() {
  // Possibly reconnect by creating a new websocket connection and attaching it
  // to existing connectionStream.
});
```


### In Node (using the [ws](https://github.com/websockets/ws) module)

```js
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  var connectionStream = require('websocket-connection-stream')();
  var wsStream = connectionStream.attach(ws);

  ws.on('close', function() {
    // Possible tell others that user disconnected.
  });

  getSomeReadableStreamSomehow().pipe(wsStream).pipe(getWritableStreamSomehow());
});
```



