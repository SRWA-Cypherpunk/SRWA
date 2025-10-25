import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';

export const publicKey = (property = 'publicKey') => {
  const layout = BufferLayout.blob(32, property);
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  layout.decode = (buffer: Buffer, offset?: number) => new PublicKey(decode(buffer, offset));
  layout.encode = (key: PublicKey, buffer: Buffer, offset?: number) =>
    encode(key.toBuffer(), buffer, offset);
  return layout;
};

export const uint64 = (property = 'uint64') => {
  const layout = BufferLayout.blob(8, property);
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  layout.decode = (buffer: Buffer, offset?: number) => {
    const data = decode(buffer, offset) as Buffer;
    return new BN(
      [...data].reverse().map((i) => `00${i.toString(16)}`.slice(-2)).join(''),
      16
    );
  };
  layout.encode = (num: BN, buffer: Buffer, offset?: number) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 8) {
      const zeroPad = Buffer.alloc(8);
      b.copy(zeroPad);
      b = zeroPad;
    }
    return encode(b, buffer, offset);
  };
  return layout;
};

export const int64 = (property = 'int64') => {
  const layout = BufferLayout.blob(8, property);
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  layout.decode = (buffer: Buffer, offset?: number) => {
    const data = decode(buffer, offset) as Buffer;
    const isNegative = data[7] & 0x80;
    if (isNegative) {
      const inverted = Buffer.from(data.map((byte) => byte ^ 0xff));
      const negated = new BN(
        Array.from(inverted)
          .reverse()
          .map((i) => `00${i.toString(16)}`.slice(-2))
          .join(''),
        16
      ).addn(1);
      return negated.neg();
    }
    return new BN(
      [...data].reverse().map((i) => `00${i.toString(16)}`.slice(-2)).join(''),
      16
    );
  };
  layout.encode = (num: BN, buffer: Buffer, offset?: number) => {
    const value = num.isNeg() ? num.neg().toTwos(64) : num;
    const a = value.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 8) {
      const zeroPad = Buffer.alloc(8, num.isNeg() ? 0xff : 0x00);
      b.copy(zeroPad);
      b = zeroPad;
    }
    return encode(b, buffer, offset);
  };
  return layout;
};

export const uint128 = (property = 'uint128') => {
  const layout = BufferLayout.blob(16, property);
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  layout.decode = (buffer: Buffer, offset?: number) => {
    const data = decode(buffer, offset) as Buffer;
    return new BN(
      [...data].reverse().map((i) => `00${i.toString(16)}`.slice(-2)).join(''),
      16
    );
  };
  layout.encode = (num: BN, buffer: Buffer, offset?: number) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 16) {
      const zeroPad = Buffer.alloc(16);
      b.copy(zeroPad);
      b = zeroPad;
    }
    return encode(b, buffer, offset);
  };
  return layout;
};

export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property
  );

  const decode = rsl.decode.bind(rsl);
  const encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer: Buffer, offset?: number) => {
    const data = decode(buffer, offset);
    return data.chars.toString('utf8');
  };

  rsl.encode = (str: string, buffer: Buffer, offset?: number) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
      length: str.length,
      lengthPadding: 0,
    };
    return encode(data, buffer, offset);
  };

  return rsl;
};
