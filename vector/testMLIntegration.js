import mlIntegration from './mlIntegration.js';
import ml from './mlInterface.js';

(async () => {
  // Step 1: Populate the vector database with some dummy data
  ml.setEmbedding('key1', [0.1, 0.2, 0.3]);
  ml.setEmbedding('key2', [0.4, 0.5, 0.6]);
  ml.setEmbedding('key3', [0.7, 0.8, 0.9]);

  // Step 2: Train the model using the vectors
  const model = await mlIntegration.trainModel();

  // Step 3: Test predictions with a query vector
  const queryVector = [0.15, 0.25, 0.35];
  const predictions = await mlIntegration.predict(queryVector, model);

  console.log('Predictions:', predictions);
})();