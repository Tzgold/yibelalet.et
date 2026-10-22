import type { PredictionView } from '../domain/types';

/** Apply before serializing any forecast props into a Client Component. */
export function predictionAccess(prediction: PredictionView, subscribed: boolean): PredictionView {
  if (subscribed || prediction.status === 'settled' || prediction.status === 'void') return { ...prediction, betting: subscribed ? prediction.betting : null, accessLocked: false };
  return {
    ...prediction, accessLocked: true, selection: '', probability: null, note: null,
    sourceMetadata: null, modelVersion: null, betting: null,
  };
}
