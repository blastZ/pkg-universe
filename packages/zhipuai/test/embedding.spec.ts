import { ZhipuAI } from '../src/index.js';

const zhipuai = new ZhipuAI();

describe('zhipuai', () => {
  it('should work', async () => {
    const result = await zhipuai.embeddings.create({
      model: 'embedding-2',
      input: 'The quick brown fox jumped over the lazy dog',
    });

    // console.log(inspect({ result }, false, 10, true));

    expect(result.data[0].embedding[0]).toEqual(0.011979917995631695);
  });
});
