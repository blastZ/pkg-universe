import type { Image } from 'canvas';
import type {
  QRCodeErrorCorrectionLevel,
  QRCodeRenderersOptions,
} from 'qrcode';

export type DotType =
  | 'dot'
  | 'dot-small'
  | 'tile'
  | 'rounded'
  | 'square'
  | 'diamond'
  | 'star'
  | 'fluid'
  | 'fluid-line'
  | 'stripe'
  | 'stripe-column';

export type CornerType =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'rounded-circle'
  | 'circle-rounded'
  | 'circle-star'
  | 'circle-diamond';

export interface Logo {
  src: Image['src'];
  logoRadius?: number;
  borderRadius?: number;
  borderColor?: string;
  bgColor?: string;
  borderWidth?: number;
}

export interface Options {
  width?: number;
  qrcode?: QRCodeRenderersOptions;
  logo?: Logo;
  dots?: {
    type?: DotType;
    color?: string;
  };
  corners?: {
    type?: CornerType;
    color?: string;
    radius?:
      | number
      | {
          inner: number;
          outer: number;
        };
  };
}

export type RequiredOptions = Options & {
  width: number;
  qrcode: {
    margin: number;
    color: {
      dark: string;
      light: string;
    };
    errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  };
  logo: Required<
    Pick<Logo, 'bgColor' | 'borderWidth' | 'borderRadius' | 'logoRadius'>
  > &
    Logo;
  dots: {
    type: DotType;
    color: string;
  };
  corners: {
    type: CornerType;
    color: string;
  };
};

export const defaultOptions = {
  width: 380,
  qrcode: {
    margin: 4,
    color: {
      dark: '#000',
      light: '#fff',
    },
  },
  logo: {
    bgColor: '#fff',
    borderWidth: 10,
    borderRadius: 8,
    logoRadius: 0,
  },
  dots: {
    type: 'square' as DotType,
    color: '#000',
  },
  corners: {
    type: 'square' as CornerType,
    color: '#000',
  },
};
