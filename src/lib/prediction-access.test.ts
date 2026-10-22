import { describe, expect, it } from 'vitest';
import { DemoRepository } from '../data/demo/demo-repository';
import { predictionAccess } from './prediction-access';

describe('subscriber forecast access',()=>{
  it('removes paid fields before serialization for every open prediction state',async()=>{
    const tip=await new DemoRepository().getSampleOpenTip();
    expect(tip).not.toBeNull();
    for(const status of ['upcoming','live','pending_settlement','postponed'] as const) {
      const locked=predictionAccess({...tip!,status},false);
      expect(locked).toMatchObject({accessLocked:true,selection:'',probability:null,note:null,sourceMetadata:null,modelVersion:null,betting:null});
      expect(locked.match.id).toBe(tip!.match.id);
      expect(predictionAccess({...tip!,status},true).selection).toBe(tip!.selection);
    }
  });
  it('keeps settled records inspectable without a subscription',async()=>{
    const tip=(await new DemoRepository().getSampleOpenTip())!;
    expect(predictionAccess({...tip,status:'settled'},false)).toMatchObject({selection:tip.selection,accessLocked:false});
    expect(predictionAccess({...tip,status:'void'},false).accessLocked).toBe(false);
  });
});
