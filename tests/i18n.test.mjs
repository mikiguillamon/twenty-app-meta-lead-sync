import test from 'node:test';
import assert from 'node:assert/strict';
import { en, es, translate, isLanguage, readPreferredLanguage, writePreferredLanguage, translateBackendError } from '../src/front-components/i18n.ts';

test('both translation catalogs have identical keys and interpolation placeholders', () => {
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const key of Object.keys(en)){
   assert.ok(en[key].trim().length && es[key].trim().length,key);
   const placeholders = value => [...value.matchAll(/%\{(\w+)\}/g)].map(x=>x[1]).sort();
   assert.deepEqual(placeholders(en[key]),placeholders(es[key]),key);
 }
});
test('English is the default, language is stored per user by Twenty app storage', () => {
 const values=new Map();
 const store={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 assert.equal(readPreferredLanguage(store),'en');
 writePreferredLanguage(store,'es');
 assert.equal(readPreferredLanguage(store),'es');
 assert.equal(isLanguage('fr'),false);
 assert.equal(translate('en','pagesCounter',{visible:2,total:43,active:1}),'2 of 43 Pages · 1 active');
});
test('known backend errors are localized without rewriting arbitrary messages', () => {
 assert.equal(translateBackendError('en','Otro trabajo está importando este lead; se reintentará.'),en.backendImportInProgress);
 assert.equal(translateBackendError('en','custom backend detail'),'custom backend detail');
 assert.match(translateBackendError('en','Límite de Meta alcanzado. Pausado hasta 2026-10-27T14:00:00Z'),/2026-10-27T14:00:00Z/);
});