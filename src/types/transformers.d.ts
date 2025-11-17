// Type definitions for @xenova/transformers
// This file provides basic TypeScript support for the transformers.js library

declare module '@xenova/transformers' {
  export interface PipelineProgress {
    status: 'progress' | 'ready' | 'loading' | 'done';
    progress?: number;
    loaded?: number;
    total?: number;
  }

  export interface PipelineOptions {
    progress_callback?: (data: PipelineProgress) => void;
    model?: string;
    revision?: string;
  }

  export interface Environment {
    allowRemoteModels: boolean;
    allowLocalModels: boolean;
    useBrowserCache: boolean;
  }

  export const env: Environment;

  export interface FeatureExtractionPipeline {
    (text: string | string[]): Promise<number[] | number[][]>;
  }

  export function pipeline(
    task: 'feature-extraction',
    model?: string,
    options?: PipelineOptions
  ): Promise<FeatureExtractionPipeline>;
  export function pipeline(
    task: 'text-classification' | 'question-answering' | 'fill-mask',
    model?: string,
    options?: PipelineOptions
  ): Promise<unknown>;
}