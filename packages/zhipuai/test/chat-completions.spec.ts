import { ZhipuAI, type ChatCompletionMessageParams } from '../src/index.js';

const messages: ChatCompletionMessageParams[] = [
  {
    role: 'system',
    content: 'You MUST answer with only the result number.',
  },
  {
    role: 'user',
    content: '1 + 1 = ?',
  },
  {
    role: 'assistant',
    content: '2',
  },
  {
    role: 'user',
    content: '2 + 2 = ?',
  },
  {
    role: 'assistant',
    content: '4',
  },
  {
    role: 'user',
    content: '3 + 3 = ?',
  },
];

const zhipuai = new ZhipuAI();

describe('zhipuai', () => {
  it('should work with non streaming', async () => {
    const result = await zhipuai.chat.completions.create({
      model: 'glm-3-turbo',
      messages,
    });

    // console.log(inspect({ result }, false, 10, true));

    expect(result.choices[0].message.content).toEqual('6');
  });

  it('should work with streaming', async () => {
    const completion = await zhipuai.chat.completions.create({
      model: 'glm-3-turbo',
      messages,
      stream: true,
    });

    let result = '';
    for await (const chunk of completion) {
      // console.log(inspect({ chunk }, false, 10, true));

      result += chunk.choices[0].delta.content;
    }

    expect(result === '6');
  });

  it('should work with tasks', async () => {
    const result = await zhipuai.chat.completions.tasks.create({
      model: 'glm-3-turbo',
      messages,
    });

    // console.log(inspect({ result }, false, 10, true));

    expect(result.id).toBeDefined();

    const retrieveResult = await zhipuai.chat.completions.tasks.retrieve({
      id: result.id,
    });

    // console.log(inspect({ retrieveResult }, false, 10, true));

    expect(retrieveResult.id).toBeDefined();
  }, 10000);
});
