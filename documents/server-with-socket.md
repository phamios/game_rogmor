# Websocket again 
Because cloud registration is not so easy as I imagined. 

```tsx
let wsServer = 'ws:/188.166.45.33:8080';
let ws = new WebSocket(wsServer);

ws.onerror = console.warn;
ws.onopen = () => {
  ws.send('I searching the land of Rogmor!');
}
```