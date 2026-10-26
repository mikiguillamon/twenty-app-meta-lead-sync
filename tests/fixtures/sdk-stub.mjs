export const memory = {
  kv: new Map(), people: new Map(), ledger: new Map(), jobs: new Map(), seq: 0,
  reset() { this.kv.clear();this.people.clear();this.ledger.clear();this.jobs.clear();this.seq=0; },
};
export const kv = {
  async get(key) { return memory.kv.has(key) ? structuredClone(memory.kv.get(key)) : null; },
  async set(key,value) { memory.kv.set(key,structuredClone(value)); },
  async delete(key) { return memory.kv.delete(key); },
};
export class RetryableLogicFunctionError extends Error {}
export async function enqueueJobs({jobs}) {
  for (const job of jobs) { if (!memory.jobs.has(job.jobId)) memory.jobs.set(job.jobId, job.payload); }
  return {jobIds:jobs.map(job=>job.jobId)};
}
const extractFilter = (filter = '') => {
  const match = /^(leadgenId|emails\.primaryEmail|phones\.primaryPhoneNumber)\[eq\]:([\w.@+-]+)$/.exec(filter);
  if (!match) throw new Error(`REST filter inválido: ${filter}`);
  return {field:match[1],value:match[2]};
};
export class RestApiClient {
  constructor(options) { if (options?.runAs !== 'application') throw Error('Test requires application role'); }
  async get(path, {query} = {}) {
    if (path === '/rest/metadata/objects') return {data:{objects:[{id:'person-meta',nameSingular:'person',fields:[{name:'sourceCampaign',label:'Campaña',type:'TEXT',isCustom:true}]}]}};
    if (path === '/rest/metadata/fields') return {data:{fields:[]}};
    if (path === '/rest/people') {
      const {field,value} = extractFilter(query.filter);
      return {data:{people:[...memory.people.values()].filter(p=> {
        const v = field === 'emails.primaryEmail' ? p.emails?.primaryEmail : p.phones?.primaryPhoneNumber;
        return v === value;
      }).slice(0,1).map(p=>({id:p.id}))}};
    }
    if (path === '/rest/metaSyncSubmissions') {
      const {field,value}=extractFilter(query.filter);
      if (field !== 'leadgenId') throw Error('ledger filter');
      return {data:{metaSyncSubmissions:[...memory.ledger.values()].filter(r=>r.leadgenId===value).slice(0,1)}};
    }
    throw Error(`GET unexpected: ${path}`);
  }
  async post(path, data) {
    const id = `00000000-0000-4000-8000-${(++memory.seq).toString().padStart(12,'0')}`;
    if (path === '/rest/people') { memory.people.set(id,{id,...structuredClone(data)});return {data:{id}}; }
    if (path === '/rest/metaSyncSubmissions') {
      if ([...memory.ledger.values()].some(v=>v.leadgenId===data.leadgenId)) throw Error('unique index violation');
      memory.ledger.set(id,{id,...structuredClone(data),updatedAt:new Date().toISOString()});return {data:{id}};
    }
    throw Error(`POST unexpected: ${path}`);
  }
  async patch(path, data) {
    const [group,id] = /^\/rest\/(people|metaSyncSubmissions)\/(.+)$/.exec(path)?.slice(1) ?? [];
    const store=group==='people'?memory.people:group==='metaSyncSubmissions'?memory.ledger:null;
    if (!store?.has(id)) throw Error('Unknown record');
    store.set(id,{...store.get(id),...structuredClone(data),updatedAt:new Date().toISOString()});return {data:{id}};
  }
}
export class MetadataApiClient {
  async query() {return {findOneApplication:{id:'app-in-own-workspace'}};}
  async mutation() {return {};}
}
