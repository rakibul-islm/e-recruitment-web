declare module 'mammoth/mammoth.browser.min.js' {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }, options?: { convertImage?: unknown }): Promise<{ value: string }>;
  export const images: { imgElement(convert: (image: unknown) => Promise<{ src: string }>): unknown };
}
