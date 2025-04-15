import * as tf from '@tensorflow/tfjs';
import ml from './mlInterface.js';

class MLIntegration {
  // Train a simple model using vectors from the database
  async trainModel() {
    const vectors = ml.exportVectors();

    // Ensure all vectors are numeric and have the same length
    if (vectors.length === 0 || !vectors.every(v => Array.isArray(v) && v.every(Number.isFinite))) {
      console.log(vectors);
      throw new Error('Invalid or empty vectors. Ensure all vectors are numeric.');
    }

    const tensor = tf.tensor(vectors);

    // Example: Dummy labels for training
    const labels = tf.tensor(vectors.map(() => Math.random() > 0.5 ? 1 : 0));

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [vectors[0].length], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });

    await model.fit(tensor, labels, { epochs: 10 });
    console.log('Model trained successfully');
    return model;
  }

  // Use a pre-trained model for predictions
  async predict(queryVector, model) {
    const tensor = tf.tensor([queryVector]);
    const prediction = model.predict(tensor);
    return prediction.array();
  }

}

const mlIntegration = new MLIntegration();

export default mlIntegration;