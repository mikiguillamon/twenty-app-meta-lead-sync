import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLeadToPerson, validateMappings, normalizePersonFields, builtinFields, splitFullName } from '../src/lib/mapping/person.ts';
const F = [...builtinFields(),
 {name:'customerBudget',type:'NUMBER',label:'Presupuesto'},
 {name:'acceptConsent',type:'BOOLEAN',label:'Consentimiento'},
 {name:'preferredDate',type:'DATE',label:'Fecha'},
 {name:'productInterest',type:'SELECT',label:'Interés',options:[{value:'BASIC',label:'Básico'},{value:'PRO',label:'Pro'}]},
];
const lead = { id:'123456789012345', created_time:'2026-10-21T09:00:00+0000',field_data:[
 {name:'full_name',values:['CASTRO CLARES, IZAN']}, {name:'email', values:['IZAN@EXAMPLE.COM']},
 {name:'phone_number',values:['+34 600 123 456']}, {name:'budget',values:['1.234']},
 {name:'consent',values:['sí']}, {name:'date',values:['2026-11-03']}, {name:'product',values:['Premium']},
]};
const mappings = [
 {questionKey:'full_name',target:'name.fullName'},
 {questionKey:'email',target:'emails.primaryEmail'},
 {questionKey:'phone_number',target:'phones.primaryPhoneNumber'},
 {questionKey:'budget',target:'customerBudget'},
 {questionKey:'consent',target:'acceptConsent'},
 {questionKey:'date',target:'preferredDate'},
 {questionKey:'product',target:'productInterest',replacements:{Premium:'PRO'}},
];
const questions=mappings.map(m=>({key:m.questionKey}));
test('splits surnames, comma and separated names',()=>{
 assert.deepEqual(splitFullName('CASTRO CLARES, IZAN'),{firstName:'IZAN',lastName:'CASTRO CLARES'});
 assert.deepEqual(splitFullName('Jane Doe Smith'),{firstName:'Jane',lastName:'Doe Smith'});
});
test('maps composite and numeric/date/select/boolean fields without duplicating PII',()=>{
 const r=mapLeadToPerson(lead,validateMappings(mappings,questions,F),F);
 assert.deepEqual(r.issues,[]);
 assert.deepEqual(r.draft.name,{firstName:'IZAN',lastName:'CASTRO CLARES'});
 assert.deepEqual(r.draft.emails,{primaryEmail:'izan@example.com'});
 assert.deepEqual(r.draft.phones,{primaryPhoneNumber:'+34600123456'});
 assert.equal(r.draft.customerBudget,1.234);
 assert.equal(r.draft.acceptConsent,true);
 assert.equal(r.draft.preferredDate,'2026-11-03');
 assert.equal(r.draft.productInterest,'PRO');
});
test('missing email and phone yields NEEDS_REVIEW errors, never a blind Person',()=>{
 const r=mapLeadToPerson({...lead,field_data:[{name:'budget',values:['oops']}]},mappings,F);
 assert.ok(r.issues.some(x=>x.includes('No hay email')));
 assert.ok(r.issues.some(x=>x.includes('Número inválido')));
});
test('invalid email with multiple addresses rejected',()=>{
 const r=mapLeadToPerson({...lead,field_data:[{name:'email',values:['alice@mail.com;bob@mail.com']}]},mappings,F);
 assert.ok(r.issues.some(x=>x.includes('Email inválido')));
});
test('mapping rejects unknown targets, unknown questions and duplicates',()=>{
 assert.throws(()=>validateMappings([{questionKey:'email',target:'root.admin'}],questions,F));
 assert.throws(()=>validateMappings([{questionKey:'private',target:'customerBudget'}],questions,F));
 assert.throws(()=>validateMappings([mappings[1],mappings[1]],questions,F));
 assert.throws(()=>validateMappings([{questionKey:'email',target:'productInterest',replacements:{test:1}}],questions,F));
});
test('field metadata is limited to Person, whitelist types, and supports custom select options',()=>{
 const objects={data:{objects:[{id:'person-oid',nameSingular:'person',fields:[
 {name:'name',type:'FULL_NAME'},{name:'rating',type:'NUMBER',label:'Rating',objectMetadataId:'person-oid'},
 {name:'internal',type:'TEXT',label:'Internal',objectMetadataId:'other'},
 {name:'choice',type:'SELECT',label:'Choice',objectMetadataId:'person-oid',options:[{value:'RED',label:'Red'}]},
 {name:'secretRelation',type:'RELATION',label:'Relation'},
 ]}]}};
 const f=normalizePersonFields(objects);
 assert.ok(f.some(x=>x.name==='rating'));
 assert.equal(f.find(x=>x.name==='choice').options[0].value,'RED');
 assert.ok(!f.some(x=>x.name==='internal'));
 assert.ok(!f.some(x=>x.name==='secretRelation'));
});
