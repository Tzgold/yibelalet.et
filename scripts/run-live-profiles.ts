import { parseArgs } from 'node:util';
import { runLiveProfiles } from '../src/pipeline/live-profiles';
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Nairobi'}).format(new Date());
const {values}=parseArgs({options:{date:{type:'string',default:today},days:{type:'string',default:'2'},'dry-run':{type:'boolean',default:false},'refresh-history':{type:'boolean',default:false},'settle-only':{type:'boolean',default:false}}});
runLiveProfiles({date:values.date!,days:Number(values.days),dryRun:values['dry-run'],refreshHistory:values['refresh-history'],settleOnly:values['settle-only']}).then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error instanceof Error?error.message:'Live forecast run failed');process.exitCode=1});
