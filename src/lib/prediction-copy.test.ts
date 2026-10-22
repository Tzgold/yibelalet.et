import { expect, it } from 'vitest';
import { predictionCopy } from './prediction-copy';

it('hides old confidence copy without removing match evidence or editing the snapshot', () => {
  const original = 'Result: Arsenal to win (63.0%). Expected goals: Arsenal 1.90, Chelsea 1.20.';
  expect(predictionCopy(original)).toBe('Result: Arsenal to win. Expected goals: Arsenal 1.90, Chelsea 1.20.');
  expect(original).toContain('63.0%');
  expect(predictionCopy('The result probabilities are 40.0% home, 30.0% draw and 30.0% away. Evidence: 12 matches.')).toBe('The model identifies this as a closely balanced fixture. Evidence: 12 matches.');
  expect(predictionCopy(null)).toBe('');
});
