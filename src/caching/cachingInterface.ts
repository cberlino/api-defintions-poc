export interface CachingInterface {
  fetch(key: string): Promise<{ [key: string]: any }>;
}
