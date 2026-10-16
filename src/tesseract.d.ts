declare module 'tesseract.js/dist/tesseract.min.js' {
  export interface OcrWorker {
    recognize(image: unknown, options?: object, output?: { blocks?: boolean; text?: boolean }): Promise<{ data: { blocks: any[] | null } }>;
    terminate(): Promise<unknown>;
  }
  export interface TesseractApi {
    createWorker(languages?: string, engineMode?: number, options?: { workerPath?: string; corePath?: string; langPath?: string; gzip?: boolean }): Promise<OcrWorker>;
  }
  export const createWorker: TesseractApi['createWorker'];
  const api: TesseractApi;
  export default api;
}
