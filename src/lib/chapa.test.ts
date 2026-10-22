import { afterEach,describe,expect,it,vi } from 'vitest';
import { verifyChapaPayment,isChapaMockEnabled } from './chapa';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()});
describe('payment verification',()=>{
  it('requires the stored amount, currency, reference and payment mode',async()=>{
    vi.stubEnv('CHAPA_SECRET_KEY','CHASECK_TEST_unit');
    const valid={status:'success',data:{status:'success',amount:'99.00',currency:'ETB',tx_ref:'sub-test',mode:'test'}};
    const mock=vi.fn();vi.stubGlobal('fetch',mock);
    for(const patch of [{},{amount:1},{currency:'USD'},{tx_ref:'other'},{mode:'live'},{status:'pending'}]) {
      mock.mockResolvedValue({ok:true,json:async()=>({...valid,data:{...valid.data,...patch}})});
      expect(await verifyChapaPayment('sub-test',99)).toBe(Object.keys(patch).length===0);
    }
  });
  it('never enables mock billing in production',()=>{
    vi.stubEnv('NODE_ENV','production');vi.stubEnv('CHAPA_MOCK','true');
    expect(isChapaMockEnabled()).toBe(false);
  });
});
