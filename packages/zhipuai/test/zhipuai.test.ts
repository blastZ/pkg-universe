import { ModelType, RequestMessageRole, ZhipuAI } from '../src/index.js';

describe('zhipuai', () => {
  let zhipuai = new ZhipuAI();

  it('should support invoke api', async () => {
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

  it('should support async invoke api', async () => {
    const result = await zhipuai.asyncInvoke({
      model: ModelType.ChatGLMPro,
      messages: [
        {
          role: RequestMessageRole.User,
          content: '你好',
        },
      ],
    });

    console.log(result);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const taskResult = await zhipuai.queryAsyncInvokeResult(result.task_id);

    console.log(taskResult);
  });
});
