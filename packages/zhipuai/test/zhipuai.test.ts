import { ChatMessageRole, ModelType, ZhipuAI } from '../src/index.js';

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
    content: '2 + 2 = ?',
  },
  {
    role: ChatMessageRole.Assistant,
    content: '4',
  },
  {
    role: ChatMessageRole.User,
    content: '3 + 3 = ?',
  },
];

describe('zhipuai', () => {
  const zhipuai = new ZhipuAI();

  it('should support invoke api', async () => {
    const result = await zhipuai.invoke({
      model: ModelType.ChatGLMPro,
      messages: prompt,
    });

    console.log(result);

    expect(JSON.parse(result.choices[0].content).trim()).toEqual('6');
  });

  it('should support async invoke api', async () => {
    const result = await zhipuai.asyncInvoke({
      model: ModelType.ChatGLMPro,
      messages: prompt,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const taskResult = await zhipuai.queryAsyncInvokeResult(result.task_id);

    console.log(taskResult);

    expect(JSON.parse(taskResult.choices[0].content).trim()).toEqual('6');
  }, 10000);

  it(
    'should support sse invoke api',
    async () => {
      const events = await zhipuai.sseInvoke({
        model: ModelType.ChatGLMPro,
        messages: prompt,
      });

      let result = '';

      for await (const event of events) {
        console.log(event);

        if (event.event === 'add' || event.event === 'finish') {
          result += event.data;
        }
      }

      console.log('result: ', result);

      expect(result.trim()).toEqual('6');
    },
    5 * 60 * 1000,
  );
});
