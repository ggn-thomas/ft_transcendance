declare module 'qrcode' {
  interface QRCodeRenderersOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<void>;

  export function toDataURL(
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<string>;
}
