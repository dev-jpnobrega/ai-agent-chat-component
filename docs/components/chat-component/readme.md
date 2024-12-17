# chat-component



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description              | Type     | Default     |
| ------------ | ------------ | ------------------------ | -------- | ----------- |
| `chatUid`    | `chat-uid`   | The Chat identifier      | `string` | `undefined` |
| `context`    | `context`    | The Initial Context chat | `string` | `undefined` |
| `greetings`  | `greetings`  | The greetings            | `string` | `undefined` |
| `identifier` | `identifier` | The Agent identifier     | `string` | `undefined` |
| `language`   | `language`   | The language             | `string` | `undefined` |


## Events

| Event      | Description                                                                               | Type               |
| ---------- | ----------------------------------------------------------------------------------------- | ------------------ |
| `receiver` | Event emitter for the receiver event. This event is triggered when a message is received. | `CustomEvent<any>` |
| `send`     | Event emitted when a message is sent.                                                     | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
