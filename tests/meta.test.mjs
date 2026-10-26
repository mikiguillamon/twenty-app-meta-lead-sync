import test from 'node:test';
import assert from 'node:assert/strict';
import { MetaGraphClient, MetaGraphError, parsePageTokens, resolvePageToken, discoverPages } from '../src/lib/meta/graph.ts';

const makeResponse = (value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const secret='EAA_SECRET_NOT_FOR_URL_1234567890';
const mockClient=(onRequest)=>new MetaGraphClient(async(url,options)=>{
 assert.ok(!url.includes(secret),'Token must never be in the URL');
 assert.equal(options.headers.Authorization,`Bearer ${secret}`);
 return onRequest(new URL(url));
});
test('System Token paginates /me/accounts and resolves a page token in memory',async()=>{
 const calls=[];
 const client=mockClient(url=>{
  calls.push(url.searchParams.get('after'));
  return makeResponse(url.searchParams.has('after')? {data:[{id:'22222222222',name:'Page B',access_token:'EAA_PAGE_TWO_TOKEN_XYZ_012345'}]} :
   {data:[{id:'11111111111',name:'Page A',access_token:'EAA_PAGE_ONE_TOKEN_XYZ_012345'}],paging:{cursors:{after:'opaque-next'},next:'https://graph.facebook.com/?after=opaque-next'}});
 });
 const pages=await client.listManagedPages(secret);
 assert.equal(pages.length,2);
 assert.deepEqual(calls,[null,'opaque-next']);
 const token=await resolvePageToken('22222222222',{systemToken:secret},client);
 assert.equal(token,'EAA_PAGE_TWO_TOKEN_XYZ_012345');
});
test('fetch leads with fixed date filters and cursor, never follows untrusted next URL',async()=>{
 const urls=[];
 const client=mockClient(url=>{
  urls.push(url);
  return makeResponse({data:[{id:'777777777777',created_time:'2026-10-21T10:00:00+0000',field_data:[]}],
   paging:{cursors:{after:'cursor-with-?#'},next:'https://evil.example/steal'}});
 });
 const p=await client.leadsPage('333333333333',secret,1000000,2000000);
 assert.equal(p.after,'cursor-with-?#');
 const filtering=JSON.parse(urls[0].searchParams.get('filtering'));
 assert.deepEqual(filtering,[{field:'time_created',operator:'GREATER_THAN_OR_EQUAL',value:1000000},
  {field:'time_created',operator:'LESS_THAN',value:2000001}]);
 assert.equal(urls[0].pathname,'/v25.0/333333333333/leads');
});
test('permanent Meta token error is distinguished from transient rate limit',async()=>{
 const denied=mockClient(()=>makeResponse({error:{code:190,message:'This method must be called with a Page Access Token'}},400));
 await assert.rejects(denied.leadsPage('333333333333',secret,1,3), e=>e instanceof MetaGraphError && !e.retryable);
 const limited=mockClient(()=>makeResponse({error:{code:4,message:'Rate limit'}},429));
 await assert.rejects(limited.leadsPage('333333333333',secret,1,3), e=>e instanceof MetaGraphError && e.retryable);
});
test('credentials are workspace-scoped input and never persisted by the Graph client',async()=>{
 assert.deepEqual(parsePageTokens(`{"22222222222":"${secret}"}`), {'22222222222':secret});
 assert.throws(()=>parsePageTokens('{"invalid": "EAA123456789123456"}'));
 assert.throws(()=>parsePageTokens('{"333333333333": "password"}'));
 const client=mockClient(url=>makeResponse({id:'333333333333',name:'Direct page'}));
 const pages=await discoverPages({pageTokens:{'333333333333':secret}},client);
 assert.equal(pages.length,1);
 assert.equal('token' in pages[0],false);
});
