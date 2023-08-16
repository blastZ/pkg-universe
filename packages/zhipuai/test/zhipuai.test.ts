import { ModelType, RequestMessageRole, ZhipuAI } from '../src/index.js';

test('zhipuai', async () => {
  const zhipuai = new ZhipuAI();

  const result = await zhipuai.invoke({
    model: ModelType.ChatGLMPro,
    messages: [
      {
        role: RequestMessageRole.User,
        content: '你好',
      },
    ],
  });

  console.log(result);
});
