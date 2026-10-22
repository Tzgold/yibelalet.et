/** Presentation only: keep the original published forecast snapshot intact. */
export function predictionCopy(note: string | null): string {
  return (note ?? '')
    .replace(/The result probabilities are \d+(?:\.\d+)?% home, \d+(?:\.\d+)?% draw and \d+(?:\.\d+)?% away\.\s*/g, 'The model identifies this as a closely balanced fixture. ')
    .replace(/\s*\(\d+(?:\.\d+)?%\)/g, '')
    .replace(/\s+and\s+\d+(?:\.\d+)?% selection probability/g, '')
    .replace(/\b\d+(?:\.\d+)?%\s*/g, '')
    .replace(/pre-match probability forecast/g, 'pre-match forecast')
    .trim();
}
