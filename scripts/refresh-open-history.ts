import { refreshOpenHistory } from '../src/pipeline/data/openfootball';
const now = new Date();
const season = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear()-1;
const cutoff = new Date(now.toISOString().slice(0,10)+'T00:00:00Z');
refreshOpenHistory([season-2,season-1,season],cutoff).then(rows=>console.log(`Training results ready: ${rows.length}`)).catch(()=>{console.error('Could not refresh training history');process.exitCode=1});
