import { parseArgs } from 'node:util';
import { runPipeline } from '../src/pipeline/run';

const { values } = parseArgs({ options: {
  date: { type: 'string', default: new Date().toISOString().slice(0, 10) },
  only: { type: 'string' }, 'skip-claude': { type: 'boolean', default: false }, limit: { type: 'string' },
} });
if (values.only && values.only !== 'seed' && values.only !== 'settle') throw new Error('--only must be seed or settle');
if (process.env.PROVIDER_MOCK === '1' || process.env.ANALYSIS_MOCK === '1') throw new Error('Mock data cannot be published into live profiles. Use unit tests for mock runs.');
runPipeline({ date: values.date!, only: values.only as 'seed' | 'settle' | undefined,
  skipClaude: values['skip-claude'], limit: values.limit === undefined ? undefined : Number(values.limit),
}).then((result) => console.log(JSON.stringify(result))).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Pipeline failed'); process.exitCode = 1;
});
