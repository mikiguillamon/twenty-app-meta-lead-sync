import test from 'node:test';import assert from 'node:assert/strict';
import { safeError,requireMetaId } from '../src/lib/validation.ts';
import { secondsForSync,shouldSchedule,isRunActive,sumCounters } from '../src/lib/sync/policy.ts';
test('only numeric Meta IDs in Graph paths',()=>{
 assert.equal(requireMetaId('1234567890123'),'1234567890123');
 for (const val of ['123/api','../../../path','evil.com','123?access_token=X','']) assert.throws(()=>requireMetaId(val));
});
test('errors sanitize tokens and URLs',()=>{
 const err=safeError(new Error('Bad Bearer EAAabc123456789; access_token=EAA1234567 https://example.com/t?access_token=EAA123'));
 assert.ok(!err.includes('EAA'));
 assert.ok(!err.includes('https://'));
});
test('full historical imports max 90 days, cursor overlap 300 seconds, regular cadence',()=>{
 const now=Date.UTC(2026,9,26,20,0,0);
 const hist=secondsForSync(undefined,now,true);
 assert.equal(hist.untilSec-hist.sinceSec,90*86400);
 const regular=secondsForSync(new Date(now-900000).toISOString(),now,false);
 assert.equal(regular.sinceSec,Math.floor((now-900000)/1000)-300);
 assert.equal(shouldSchedule(5,new Date(now-240000).toISOString(),now),false);
 assert.equal(shouldSchedule(5,new Date(now-300000).toISOString(),now),true);
 assert.equal(isRunActive({activeRunId:'x',activeStartedAt:new Date(now-2*60000).toISOString()},now),true);
});
test('page counters merge without losing categories',()=>{
 assert.deepEqual(sumCounters({imported:2,linked:1,duplicate:0,review:0,failed:0,pages:1},{imported:1,linked:0,duplicate:2,review:1,failed:0,pages:1}),{imported:3,linked:1,duplicate:2,review:1,failed:0,pages:2});
});
