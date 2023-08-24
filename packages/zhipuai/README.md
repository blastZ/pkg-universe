# ZhipuAI Library

The [ZhipuAI](https://open.bigmodel.cn) library provides convenient access to the [ZhipuAI API](https://open.bigmodel.cn/dev/api) from js applications.

## Installation

```bash
npm install zhipuai
```

## Usage

```ts
import { ChatMessageRole, ModelType, ZhipuAI } from 'zhipuai';

const zhipuai = new ZhipuAI();

const prompt = [
  {
    role: ChatMessageRole.User,
    content: '1 + 1 = ?',
  },
  {
    role: ChatMessageRole.Assistant,
    content: '2',
  },
  {
    role: ChatMessageRole.User,
    content: '3 + 3 = ?',
  },
];

// Invoke API
const invokeData = await zhipuai.invoke({
  model: ModelType.ChatGLMPro,
  messages: prompt,
});

// Async Invoke API
const asyncInvokeData = await zhipuai.asyncInvoke({
  model: ModelType.ChatGLMPro,
  messages: prompt,
});

// Query Aync Invoke Result API
const queryAsyncInvokeResultData = await zhipuai.queryAsyncInvokeResult(
  asyncInvokeData.task_id,
);

// SSE Invoke API
const events = await zhipuai.sseInvoke({
  model: ModelType.ChatGLMPro,
  messages: prompt,
});

for await (const event of events) {
  // handle event
}
```

## License

MIT
