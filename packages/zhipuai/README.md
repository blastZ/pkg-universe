# ZhipuAI Library

The [ZhipuAI](https://open.bigmodel.cn) library provides convenient access to the [ZhipuAI API](https://open.bigmodel.cn/dev/api) from js applications. It's full compatible with [OpenAI Node.js SDK](https://github.com/openai/openai-node).

## Installation

```bash
npm install zhipuai
```

## Usage

```ts
import { ZhipuAI } from 'zhipuai';

const zhipuai = new ZhipuAI({
  apiKey: process.env['ZHIPUAI_API_KEY'],
});

const completion = await zhipuai.chat.completions.create({
  model: 'glm-4',
  messages: [{ role: 'user', content: 'Say this is a test' }],
});
```

## Streaming Response

```ts
const stream = await zhipuai.chat.completions.create({
  model: 'glm-4',
  messages: [{ role: 'user', content: 'Say this is a test' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## ZhipuAI Special Features

ZhipuAI support create chat completion tasks, and retrieve the result later by task id.

```ts
const { id } = await zhipuai.chat.completions.tasks.create({
  model: 'glm-3-turbo',
  messages,
});

const result = await zhipuai.chat.completions.tasks.retrieve({
  id,
});
```

## License

MIT
