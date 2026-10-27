import assert from 'node:assert/strict';
import test from 'node:test';
import {memory} from './fixtures/sdk-stub.mjs';

const PAGE='123456789000101', FORM='123456789000102', LEAD='123456789000103';
const systemToken='EAA_TEST_TOKEN_HAS_LENGTH_GREATER_20';
process.env.META_SYSTEM_USER_TOKEN=systemToken;
const now=new Date(Date.now()-1500).toISOString();
let errorStatus=0;
let usePagination=false;
let requests=[];
globalThis.fetch=async (url, options)=>{
  requests.push({url, auth:options.headers.Authorization});
  const u=new URL(url);
  if (errorStatus) return new Response(JSON.stringify({error:{code:613,message:'Rate limited'}}),{status:errorStatus});
  if (u.pathname.endsWith('/me/accounts'))return Response.json({data:[{id:PAGE,name:'QA Page',access_token:'EAA_PAGE_TOKEN_LONGER_THAN_20'}]});
  if (u.pathname.endsWith('/leads')) {
    if (usePagination && u.searchParams.get('after')) return Response.json({data:[{id:String(Number(LEAD)+1),created_time:now,field_data:[
      {name:'full_name',values:['ANA SEGUNDA']},{name:'email',values:['ana2@example.com']},{name:'campaign',values:['Winter']}
    ]}]});
    return Response.json({data:[{id:LEAD,created_time:now,field_data:[
    {name:'full_name',values:['MARIN PEREZ, ANA']}, {name:'email',values:['ana@example.com']},{name:'campaign',values:['Autumn']}
  ]}], ...(usePagination ? {paging:{next:'https://graph.facebook.com/ignored',cursors:{after:'NEXT_MOCK_CURSOR'}}}:{}) });
  }
  throw Error(`Unexpected Meta URL: ${u.pathname}`);
};
const {scheduleForm,runFormPage}=await import('../src/lib/sync/runner.ts');
const {saveConfig,loadFormState,loadHistory,loadSession}=await import('../src/lib/sync/state.ts');
const {getActiveMetaQuota}=await import('../src/lib/meta/rate-limit.ts');
const form={id:FORM,pageId:PAGE,name:'Form QA',enabled:true,questions:[{key:'full_name',label:'Nombre'},{key:'email',label:'Email'},{key:'campaign',label:'Campaign'}],
  mappings:[{questionKey:'full_name',target:'name.fullName'},{questionKey:'email',target:'emails.primaryEmail'},{questionKey:'campaign',target:'sourceCampaign'}]};
const config={version:1,intervalMinutes:5,pages:[{id:PAGE,name:'QA Page',enabled:true}],forms:[form]};

test('end-to-end: schedule, process, deduplicate and persist per-form history without Meta secrets', async()=>{
  memory.reset();requests=[];errorStatus=0;await saveConfig(config);
  const scheduled=await scheduleForm(form);
  assert.equal(scheduled.queued,true);
  const payload=memory.jobs.get(`mls-${scheduled.runId}-0`);
  assert.equal((await runFormPage(payload,0,3)).done,true);
  assert.equal(memory.people.size,1);
  assert.equal(requests.filter(q=>new URL(q.url).pathname.endsWith('/me/accounts')).length,0,'sync must not list Pages on every batch');
  assert.equal(memory.ledger.size,1);
  const person=[...memory.people.values()][0];
  assert.deepEqual(person.name,{firstName:'ANA',lastName:'MARIN PEREZ'});
  assert.equal(person.sourceCampaign,'Autumn');
  assert.equal(person.emails.primaryEmail,'ana@example.com');
  const first=await loadFormState(FORM);
  assert.ok(first.lastSuccessAt);
  assert.equal(first.lastResult.imported,1);
  assert.equal((await loadHistory([FORM])).length,1);
  assert.ok(requests.every(q=>q.url.startsWith('https://graph.facebook.com/') && !q.url.includes('TOKEN')));
  assert.ok(requests.every(q=>q.auth?.startsWith('Bearer EAA_')));
  assert.ok(!JSON.stringify([...memory.kv.values()]).includes(systemToken));
  const scheduled2=await scheduleForm(form);
  const payload2=memory.jobs.get(`mls-${scheduled2.runId}-0`);
  await runFormPage(payload2,0,3);
  assert.equal(memory.people.size,1);
  assert.equal((await loadFormState(FORM)).lastResult.duplicate,1);
  assert.equal((await loadHistory([FORM])).length,2);
});

test('Meta 429 activates shared cooldown and fails safely without moving cursor',async()=>{
  memory.reset();requests=[];await saveConfig(config);
  const scheduled=await scheduleForm(form);
  const payload=memory.jobs.get(`mls-${scheduled.runId}-0`);
  errorStatus=429;
  await runFormPage(payload,0,3);
  assert.ok(await getActiveMetaQuota());
  const state=await loadFormState(FORM);
  assert.equal(state.lastSuccessAt,undefined);
  assert.ok(state.lastError?.includes('Pausado hasta'));
  assert.equal((await loadSession(scheduled.runId)),null);
  assert.equal((await loadHistory([FORM]))[0].status,'FAILED');
  assert.equal(memory.people.size,0);
  errorStatus=0;memory.reset();
});


test('two pages: idempotent job replay does not count page twice',async()=>{
  memory.reset();await saveConfig(config);errorStatus=0;usePagination=true;
  const scheduled=await scheduleForm(form);
  const first=memory.jobs.get(`mls-${scheduled.runId}-0`);
  const firstResult=await runFormPage(first,0,3);
  assert.equal(firstResult.done,false);
  assert.equal(firstResult.stats.imported,1);
  await runFormPage(first,0,3); // retry of a fully committed page
  const second=memory.jobs.get(`mls-${scheduled.runId}-1`);
  assert.equal(second.after,'NEXT_MOCK_CURSOR');
  const last=await runFormPage(second,0,3);
  assert.equal(last.done,true);
  assert.equal(last.stats.imported,2);
  assert.equal(last.stats.pages,2);
  assert.equal(memory.people.size,2);
  assert.equal((await loadHistory([FORM])).length,1);
  usePagination=false;
});

test('ledger creation with successful minimal Twenty response imports instead of leaving CLAIMED', async () => {
  memory.reset(); requests=[]; errorStatus=0; usePagination=false;
  memory.ledgerMinimalResponse=true;
  await saveConfig(config);
  const scheduled=await scheduleForm(form);
  const job=memory.jobs.get(`mls-${scheduled.runId}-0`);
  const result=await runFormPage(job,0,3);
  assert.equal(result.done,true);
  assert.equal(memory.people.size,1);
  assert.equal([...memory.ledger.values()][0].status,'PROCESSED');
  assert.equal((await loadFormState(FORM)).lastResult.imported,1);
  const next=await scheduleForm(form);
  await runFormPage(memory.jobs.get(`mls-${next.runId}-0`),0,3);
  assert.equal(memory.people.size,1);
  assert.equal((await loadFormState(FORM)).lastResult.duplicate,1);
  memory.ledgerMinimalResponse=false;
});

test('confirmed force-once bypasses local pause for one page without moving cursor on a paginated result',async()=>{
  memory.reset();requests=[];errorStatus=429;usePagination=false;await saveConfig(config);
  const initial=await scheduleForm(form);
  await runFormPage(memory.jobs.get(`mls-${initial.runId}-0`),0,3);
  assert.ok(await getActiveMetaQuota());
  errorStatus=0;usePagination=true;
  const forced=await scheduleForm(form,{forceOnce:true});
  assert.equal(forced.queued,true);
  await runFormPage(memory.jobs.get(`mls-${forced.runId}-0`),0,3);
  assert.equal(memory.people.size,1);
  const state=await loadFormState(FORM);
  assert.equal(state.lastSuccessAt,undefined);
  assert.match(state.lastError,/una página/);
  assert.equal(memory.jobs.has(`mls-${forced.runId}-1`),false);
  usePagination=false;memory.reset();
});

test('successful Person POST with no ID is recovered without duplicate creation',async()=>{
 memory.reset();requests=[];errorStatus=0;usePagination=false;await saveConfig(config);
 memory.personMinimalResponse=true;
 const job1=await scheduleForm(form,{forceOnce:true});
 await runFormPage(memory.jobs.get(`mls-${job1.runId}-0`),0,3);
 assert.equal(memory.people.size,1);
 assert.equal([...memory.ledger.values()][0].status,'PROCESSED');
 const job2=await scheduleForm(form,{forceOnce:true});
 await runFormPage(memory.jobs.get(`mls-${job2.runId}-0`),0,3);
 assert.equal(memory.people.size,1);
});
