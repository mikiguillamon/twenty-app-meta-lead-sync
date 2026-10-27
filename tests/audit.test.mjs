import test from 'node:test';
import assert from 'node:assert/strict';
import { memory } from './fixtures/sdk-stub.mjs';
import { appendAudit, readAudit } from '../src/lib/sync/audit.ts';

test('audit allowlists fields and does not persist secrets or arbitrary details', async()=>{
 memory.reset();
 const runId='11111111-1111-4111-8111-111111111111';
 const formId='123456789000102';
 await appendAudit({runId,formId,level:'ERROR',kind:'RATE_LIMIT',httpStatus:403,metaCode:4,
  ...{token:'EAA_SECRET_SHOULD_NOT_PERSIST',email:'ana@example.com',error:'private message'}});
 const events=await readAudit([runId]);
 assert.equal(events.length,1);
 assert.equal(events[0].httpStatus,403);
 const dump=JSON.stringify([...memory.kv.values()]);
 assert.ok(!dump.includes('EAA_SECRET'));
 assert.ok(!dump.includes('ana@example.com'));
 assert.ok(!dump.includes('private message'));
});

test('audit retains only 60 entries per run and excludes invalid run identifiers',async()=>{
 memory.reset();
 const runId='22222222-2222-4222-8222-222222222222';
 for(let i=0;i<65;i++)await appendAudit({runId,formId:'123456789000102',level:'INFO',kind:'PAGE',page:i});
 assert.equal((await readAudit([runId])).length,60);
 assert.equal((await readAudit([runId]))[0].page,64);
 await appendAudit({runId:'bad-key',formId:'123456789000102',level:'INFO',kind:'QUEUED'});
 assert.equal((await readAudit(['bad-key'])).length,0);
});
