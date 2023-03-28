import { Packr } from 'msgpackr';

import { config } from './config.js';
import { Packet } from './interfaces/index.js';

export const packer = new Packr(config);

export class Encoder {
  encode(packet: Packet) {
    return [packer.pack(packet)];
  }
}
