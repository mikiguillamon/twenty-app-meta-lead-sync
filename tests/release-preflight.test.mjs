import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseProblems } from '../scripts/release-preflight.mjs';

const candidate={
 name:'twenty-meta-lead-sync',
 version:'1.0.0',
 private:false,
 description:'Meta Lead Ads integration for Twenty CRM People with polling and field mappings',
 license:'MIT',
 repository:{url:'git+https://github.com/mikiguillamon/twenty-meta-lead-sync.git'},
 homepage:'https://github.com/mikiguillamon/twenty-meta-lead-sync#readme',
 bugs:{url:'https://github.com/mikiguillamon/twenty-meta-lead-sync/issues'},
 keywords:['twenty-app'],
 engines:{twenty:'>=2.50.0 <2.51.0'},
};

test('public preflight allows a properly configured version-tagged release',()=>{
 assert.deepEqual(releaseProblems(candidate,{publicRelease:true,tag:'v1.0.0'}),[]);
});
test('public preflight fails closed on private or deployment-specific packages',()=>{
 const errors=releaseProblems({...candidate,name:'twenty-meta-lead-sync-jff',private:true},{publicRelease:true,tag:'v1.0.0'});
 assert.ok(errors.some(x=>x.includes('private=false')));
 assert.ok(errors.some(x=>x.includes('deployment-specific')));
 assert.ok(errors.some(x=>x.includes('expected package name')));
});
test('preflight checks source repository, keywords and tag/version pairing',()=>{
 const errors=releaseProblems({...candidate,keywords:[],repository:{url:'https://github.com/other/repo'}},{publicRelease:true,tag:'v1.0.1'});
 assert.ok(errors.some(x=>x.includes('keyword')));
 assert.ok(errors.some(x=>x.includes('repository URL')));
 assert.ok(errors.some(x=>x.includes('tag must equal')));
});
