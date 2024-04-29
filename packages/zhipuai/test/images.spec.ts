import { ZhipuAI } from '../src/index.js';

const zhipuai = new ZhipuAI();

describe('zhipuai', () => {
  it('should work', async () => {
    const result = await zhipuai.images.generate({
      model: 'cogview-3',
      prompt: 'A cute cat',
    });

    // console.log(inspect({ result }, false, 10, true));

    expect(result.data[0].url).toBeDefined();
  }, 15000);
});
