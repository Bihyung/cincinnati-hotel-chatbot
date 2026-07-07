import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  constructor() {
    this.pipeline = null;
    this.ready = false;
  }

  async initialize() {
    if (!this.pipeline) {
      console.log('[Embeddings] Loading model...');
      this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.ready = true;
      console.log('[Embeddings] Model ready');
    }
    return this.pipeline;
  }

  async generateEmbedding(text) {
    const pipe = await this.initialize();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  isReady() {
    return this.ready;
  }
}

export default new EmbeddingService();
