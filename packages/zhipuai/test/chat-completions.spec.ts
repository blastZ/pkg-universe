import { inspect } from 'node:util';

import { ZhipuAI } from '../src/index.js';

describe('zhipuai', () => {
  it('should work with non streaming', async () => {
    const zhipuai = new ZhipuAI();

    const result = await zhipuai.chat.completions.create({
      model: 'glm-3-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a calculator now. Please answer the result directly. For example:\n' +
            'user: 1 + 1 = ?\nyou: 2\n\n' +
            'user: 2 + 5 = ?\nyou: 7\n\n' +
            'user: 5 + 8 = ?\nyou: 13\n\n',
        },
        {
          role: 'user',
          content: '1 + 2 = ?',
        },
      ],
    });

    console.log(inspect({ result }, false, 10, true));
  });
});
