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

const zhipuai = new ZhipuAI();

describe('zhipuai chat model', () => {
  it('should support invoke api', async () => {
    const result = await zhipuai.invoke({
      model: ModelType.ChatGLMTurbo,
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

    await new Promise((resolve) => setTimeout(resolve, 5000));

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

const prompt2 = [
  {
    role: ChatMessageRole.User,
    content: 'What is your name?',
  },
];

const meta = {
  userInfo: 'I am pigteetee',
  userName: 'pigteetee',
  botInfo: 'I am Lego Master',
  botName: 'blastz',
};

describe('zhipuai character model', () => {
  it('should support invoke api', async () => {
    const result = await zhipuai.invoke({
      model: ModelType.CharacterGLM,
      messages: prompt2,
      meta,
    });

    console.log(result);

    expect(JSON.parse(result.choices[0].content).trim()).toMatch(
      /[blast|Blast]/,
    );
  }, 10000);

  it('should support async invoke api', async () => {
    const result = await zhipuai.asyncInvoke({
      model: ModelType.CharacterGLM,
      messages: prompt2,
      meta,
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const taskResult = await zhipuai.queryAsyncInvokeResult(result.task_id);

    console.log(taskResult);

    expect(JSON.parse(taskResult.choices[0].content).trim()).toMatch(
      /[blast|Blast]/,
    );
  }, 20000);

  it(
    'should support sse invoke api',
    async () => {
      const events = await zhipuai.sseInvoke({
        model: ModelType.CharacterGLM,
        messages: prompt2,
        meta,
      });

      let result = '';

      for await (const event of events) {
        console.log(event);

        if (event.event === 'add' || event.event === 'finish') {
          result += event.data;
        }
      }

      console.log('result: ', result);

      expect(result.trim()).toMatch(/[blast|Blast]/);
    },
    5 * 60 * 1000,
  );
});
