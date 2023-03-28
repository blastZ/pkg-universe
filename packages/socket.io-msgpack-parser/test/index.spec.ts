import { packer, unpacker } from '../src/index.js';

describe('msgpackr', () => {
  it('should parse null to null', () => {
    expect(unpacker.unpack(packer.pack([[null, null, null]]))).toEqual([
      [null, null, null],
    ]);
  });

  it('should parse undefined to null', () => {
    expect(
      unpacker.unpack(packer.pack([[undefined, undefined, undefined]]))
    ).toEqual([[null, null, null]]);
  });
});
