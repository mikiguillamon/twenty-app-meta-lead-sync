import React, { useCallback, useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { useColorScheme } from 'twenty-sdk/front-component';
import { getUiPalette, type UiPalette } from './ui-theme.ts';
import type { HistoryEvent, MappingRule, MetaForm, MetaPage, PersonField, WorkspaceConfig } from '../lib/types.ts';

type Screen = 'connections'|'pages'|'forms'|'mapping'|'sync';
type FormState = { formId: string; activeRunId?: string; lastSuccessAt?: string; lastAttemptAt?: string; lastError?: string; lastResult?: Record<string, number> };
type AdminData = { config: WorkspaceConfig; states: FormState[]; history: HistoryEvent[]; fields: PersonField[];
  metadataError?: string; credentials: { systemConfigured: boolean; pageTokensConfigured: boolean } };
const api = new RestApiClient();
type ThemeStyles = ReturnType<typeof createStyles>;
const createStyles = (theme: UiPalette) => {
  const spacing: React.CSSProperties = { boxSizing: 'border-box', padding: 20, marginBottom: 16, border: '1px solid ' + theme.border, borderRadius: 10, background: theme.surface, color: theme.text };
  const labelStyle: React.CSSProperties = { display:'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: theme.text };
  const inputStyle: React.CSSProperties = { boxSizing:'border-box', width:'100%', minHeight:39, padding:'9px 11px', borderRadius:7, border:'1px solid '+theme.controlBorder, background:theme.control, color:theme.text, colorScheme:theme.colorScheme, fontFamily:'inherit', fontSize:14 };
  const buttonStyle: React.CSSProperties = { border:'1px solid '+theme.neutralBorder, background:theme.neutralButton, padding:'9px 13px', borderRadius:7, cursor:'pointer', color:theme.neutralText, marginRight:8, marginTop:6, fontFamily:'inherit', fontSize:13, colorScheme:theme.colorScheme };
  const primaryStyle: React.CSSProperties = { ...buttonStyle, borderColor:theme.primaryButton, background:theme.primaryButton, color:theme.primaryText };
  const small: React.CSSProperties = { fontSize:13, color:theme.textMuted, lineHeight:1.5 };
  const checkStyle: React.CSSProperties = { accentColor:theme.accent, colorScheme:theme.colorScheme, width:16, height:16, flexShrink:0 };
  return {spacing,labelStyle,inputStyle,buttonStyle,primaryStyle,small,checkStyle};
};
function Button({children,onClick,styles,primary=false,disabled=false}: {children: React.ReactNode; onClick:()=>void;styles:ThemeStyles;primary?:boolean;disabled?:boolean}) {
  return <button type="button" disabled={disabled} onClick={onClick} style={{ ...(primary ? styles.primaryStyle:styles.buttonStyle), opacity:disabled ? 0.5 : 1, cursor:disabled?'not-allowed':'pointer' }}>{children}</button>;
}
function Subhead({title,description,styles}:{title:string;description?:string;styles:ThemeStyles}) {
  return <div style={{marginBottom:16}}><h3 style={{margin:'0 0 6px',fontSize:18,color:styles.spacing.color}}>{title}</h3>{description && <p style={{...styles.small,margin:0}}>{description}</p>}</div>;
}
const summarize = (value: unknown): string => {
  const e=value as {message?:string;body?:{message?:string}};
  return (e?.body?.message || e?.message || 'Error de red desconocido').replace(/EAA\S+/g, '[secreto]').slice(0,240);
};

export function AdminPanel({screen}:{screen:Screen}) {
  const colorScheme = useColorScheme();
  const theme = getUiPalette(colorScheme === 'dark' ? 'dark' : 'light');
  const styles = createStyles(theme);
  const {spacing,labelStyle,inputStyle,small,checkStyle} = styles;
  const [data,setData] = useState<AdminData|null>(null);
  const [config,setConfig] = useState<WorkspaceConfig|null>(null);
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState('');
  const [systemToken,setSystemToken] = useState('');
  const [pageTokenJson,setPageTokenJson] = useState('');
  const [mappingFormId,setMappingFormId] = useState<string>('');
  const [syncFormId,setSyncFormId] = useState<string>('');
  const [retryReview,setRetryReview] = useState(false);
  const refresh = useCallback(async () => {
    const result = await api.get('/s/meta-sync/state') as AdminData;
    setData(result); setConfig(result.config);
    setMappingFormId(id => result.config.forms.some(f=>f.id===id) ? id : (result.config.forms[0]?.id ?? ''));
    return result;
  },[]);
  useEffect(() => { void refresh().catch(e => setStatus(`Error de acceso o conexión: ${summarize(e)}`)); },[refresh]);
  const run = async (work:()=>Promise<unknown>, success='Acción completada.') => {
    setBusy(true);setStatus('');
    try { await work(); await refresh(); setStatus(success); }
    catch(e) { setStatus(`Error: ${summarize(e)}`); }
    finally { setBusy(false); }
  };
  const save = () => {
    if (!config) return;
    void run(async()=> { await api.post('/s/meta-sync/save-config',{config}); }, 'Configuración guardada en este workspace.');
  };
  const patchPage = (id:string, enabled:boolean) => setConfig(old => old ? {...old,pages:old.pages.map(p=>p.id===id?{...p,enabled}:p),
    forms:old.forms.map(f=>f.pageId===id && !enabled? {...f,enabled:false}:f)}:old);
  const patchForm = (id:string, updates:Partial<MetaForm>) => setConfig(old=>old? {...old,forms:old.forms.map(f=>f.id===id?{...f,...updates}:f)}:old);
  const patchMap = (form:MetaForm,questionKey:string,target:string) => {
    const rest=form.mappings.filter(r=>r.questionKey!==questionKey);
    if (target) rest.push({questionKey,target});
    patchForm(form.id,{mappings:rest});
  };
  const validationThenSaveSystem = () => void run(async()=>{
    if (!systemToken.trim()) throw new Error('Introduce un System User Token');
    await api.post('/s/meta-sync/validate-token',{ mode:'system',token:systemToken.trim() });
    await new MetadataApiClient().mutation({ updateOneApplicationVariable: { __args:{ key:'META_SYSTEM_USER_TOKEN', value: systemToken.trim() } } });
    setSystemToken('');
  },'System User Token validado y almacenado como secreto del workspace.');
  const validationThenSavePages = () => void run(async()=>{
    const raw:unknown=JSON.parse(pageTokenJson);
    if (!raw || Array.isArray(raw) || typeof raw!=='object') throw new Error('Formato esperado: {"PAGE_ID":"PAGE_TOKEN"}');
    for (const [pageId,token] of Object.entries(raw)) await api.post('/s/meta-sync/validate-token',{mode:'page',pageId,token});
    await new MetadataApiClient().mutation({updateOneApplicationVariable:{__args:{key:'META_PAGE_TOKENS_JSON',value:JSON.stringify(raw)}}});
    setPageTokenJson('');
  },'Page Tokens validados y guardados; el JSON reemplaza al conjunto anterior.');
  const clearToken = (key: 'META_SYSTEM_USER_TOKEN' | 'META_PAGE_TOKENS_JSON') => void run(async () => {
    await new MetadataApiClient().mutation({ updateOneApplicationVariable: { __args: { key, value: '' } } });
  }, key === 'META_SYSTEM_USER_TOKEN' ? 'System User Token borrado en este workspace.' : 'Page Tokens borrados en este workspace.');
  const forms = config?.forms ?? [];
  const pages = config?.pages ?? [];
  const selectedForm = forms.find(f=>f.id===mappingFormId);
  const selectedFields = data?.fields ?? [];

  return <div style={{maxWidth:940,width:'100%',padding:'8px 12px 24px',boxSizing:'border-box',fontFamily:'inherit',lineHeight:1.5,color:theme.text,colorScheme:theme.colorScheme}}>
    <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap',marginBottom:14}}>
      <h2 style={{fontSize:22,margin:0,color:theme.text}}>Meta Lead Sync</h2>
      <span style={small}>Beta privada · Twenty 2.50 · configuración exclusiva de este workspace</span>
    </div>
    {data?.metadataError && <p role="alert" style={{color:theme.errorText}}>No se pudieron cargar todos los campos personalizados: {data.metadataError}</p>}
    {status && <div role="status" style={{...spacing,background:status.startsWith('Error')?theme.errorSurface:theme.successSurface,color:status.startsWith('Error')?theme.errorText:theme.successText,borderColor:status.startsWith('Error')?theme.errorBorder:theme.successBorder,padding:12}}>{status}</div>}
    {!config ? <div style={spacing}>Cargando configuración y verificando permisos…</div> : <>
      {screen==='connections' && <>
        <Subhead styles={styles} title="Conexión con Meta" description="Introduce las credenciales de tu workspace. Nunca aparecen en el historial ni se guardan en KV." />
        <section style={spacing}>
          <h4 style={{marginTop:0,color:theme.text}}>System User Token (recomendado)</h4>
          <p style={small}>Estado: {data?.credentials.systemConfigured?'Configurado':'Sin configurar'}. Se resuelven Page Access Tokens de /me/accounts para cada ejecución.</p>
          <label style={labelStyle}>System User Token</label>
          <input type="password" value={systemToken} onChange={e=>setSystemToken(e.target.value)} placeholder="EA…" autoComplete="off" style={inputStyle} />
          <Button styles={styles} primary disabled={busy||!systemToken} onClick={validationThenSaveSystem}>Validar con Meta y guardar cifrado</Button>
          <Button styles={styles} disabled={busy||!data?.credentials.systemConfigured} onClick={()=>clearToken('META_SYSTEM_USER_TOKEN')}>Eliminar token</Button>
          <p style={small}>Puedes cambiar el token pegando uno nuevo. No lo incluyas en commits o logs.</p>
        </section>
        <section style={spacing}>
          <h4 style={{marginTop:0,color:theme.text}}>Page Access Tokens (opcional)</h4>
          <p style={small}>Estado: {data?.credentials.pageTokensConfigured?'JSON configurado':'Sin configurar'}. Para páginas sin acceso mediante System User Token. Al guardar se reemplaza el JSON anterior completo.</p>
          <label style={labelStyle}>JSON confidencial: ID de página → token</label>
          <textarea rows={4} value={pageTokenJson} onChange={e=>setPageTokenJson(e.target.value)} placeholder={'{"123456789012345":"EA…"}'} spellCheck={false} style={{...inputStyle,fontFamily:'monospace'}} />
          <Button styles={styles} disabled={busy||!pageTokenJson.trim()} onClick={validationThenSavePages}>Validar todas y reemplazar tokens</Button>
          <Button styles={styles} disabled={busy||!data?.credentials.pageTokensConfigured} onClick={()=>clearToken('META_PAGE_TOKENS_JSON')}>Eliminar Page Tokens</Button>
        </section>
        <p style={small}>No se crean suscripciones ni se consulta /subscribed_apps. El webhook existente de Meta permanece intacto.</p>
      </>}
      {screen==='pages' && <>
        <Subhead styles={styles} title="Páginas de Meta" description="Descubre todas las páginas accesibles con tu token y selecciona las que importarán leads." />
        <section style={spacing}>
          <Button styles={styles} primary disabled={busy} onClick={()=>void run(()=>api.post('/s/meta-sync/discover-pages',{}),'Páginas actualizadas.')}>Descubrir mis páginas</Button>
          <Button styles={styles} disabled={busy} onClick={save}>Guardar páginas activas</Button>
        </section>
        {pages.length===0?<p>No hay páginas registradas. Descúbrelas usando las credenciales de Conexiones.</p>:
          pages.map(page=><section key={page.id} style={{...spacing,display:'flex',alignItems:'center',gap:12,justifyContent:'space-between',flexWrap:'wrap'}}>
            <label style={{display:'flex',alignItems:'center',gap:12}}>
              <input style={checkStyle} type="checkbox" checked={page.enabled} onChange={e=>patchPage(page.id,e.target.checked)} />
              <span><strong>{page.name}</strong><span style={{display:'block',...small}}>Page ID: {page.id}</span></span>
            </label>
            <Button styles={styles} disabled={busy} onClick={()=>void run(()=>api.post('/s/meta-sync/discover-forms',{pageId:page.id}),`Formularios de ${page.name} actualizados.`)}>Buscar formularios</Button>
          </section>)}
      </>}
      {screen==='forms' && <>
        <Subhead styles={styles} title="Formularios de captación" description="Cada formulario se activa por separado. Los formularios de una misma página pueden tener asignaciones diferentes." />
        <Button styles={styles} disabled={busy} primary onClick={save}>Guardar formularios activos</Button>
        {forms.length===0 ? <p>No hay formularios. Ve a Páginas y pulsa Buscar formularios.</p> : forms.map(form=>
          <section key={form.id} style={spacing}>
            <label style={{display:'flex',gap:10,alignItems:'center'}}>
              <input style={checkStyle} type="checkbox" checked={form.enabled} disabled={!pages.some(p=>p.id===form.pageId&&p.enabled)} onChange={e=>patchForm(form.id,{enabled:e.target.checked})} />
              <strong>{form.name}</strong>
            </label>
            <p style={small}>Página: {pages.find(p=>p.id===form.pageId)?.name ?? form.pageId} · ID: {form.id} · {form.status??'sin estado'} · Preguntas: {form.questions.length}</p>
            <label style={{display:'flex',gap:8,alignItems:'center',fontSize:13,color:theme.text}}><input style={checkStyle} type="checkbox" checked={form.updateExisting===true} onChange={e=>patchForm(form.id,{updateExisting:e.target.checked})} />Actualizar campos de Personas existentes (desactivado por defecto)</label>
          </section>)}
      </>}
      {screen==='mapping' && <>
        <Subhead styles={styles} title="Mapeo de campos por formulario" description="Selecciona un campo de Persona para cada pregunta; los campos personalizados aparecen si la Metadata API permite su lectura." />
        {data?.metadataError && <p style={{color:theme.errorText}}>{data.metadataError}</p>}
        <div style={spacing}><label style={labelStyle}>Formulario</label><select style={inputStyle} value={mappingFormId} onChange={e=>setMappingFormId(e.target.value)}>
          {forms.map(f=><option key={f.id} value={f.id}>{f.name} · {pages.find(p=>p.id===f.pageId)?.name}</option>)}
        </select></div>
        {selectedForm && <section style={spacing}>
          {selectedForm.questions.length===0 && <p>Meta no ha devuelto las preguntas de este formulario.</p>}
          {selectedForm.questions.map(question=>{
            const rule=selectedForm.mappings.find(m=>m.questionKey===question.key);
            const field=selectedFields.find(f=>f.name===rule?.target);
            return <div key={question.key} style={{borderBottom:'1px solid '+theme.divider,padding:'12px 0'}}>
              <label style={{display:'block',...labelStyle}}>{question.label||question.key}</label>
              <p style={{...small,margin:'0 0 6px'}}>{question.key} · {question.type ?? 'texto'}</p>
              <select style={inputStyle} value={rule?.target??''} onChange={e=>patchMap(selectedForm,question.key,e.target.value)}>
                <option value="">No importar esta pregunta</option>
                {selectedFields.filter(f=>!selectedForm.mappings.some(r=>r.questionKey!==question.key&&r.target===f.name)).map(f=>
                  <option key={f.name} value={f.name}>{f.label} ({f.type}){f.isCustom?' · personalizado':''}</option>)}
              </select>
              {field?.options?.length ? <p style={small}>Opciones válidas: {field.options.map(o=>`${o.label} → ${o.value}`).join(' · ')}</p>:null}
              {rule && (field?.type==='SELECT' || field?.type==='MULTI_SELECT') &&
                <div style={{marginTop:8}}><label style={labelStyle}>Sustituciones (JSON de respuesta de Meta → valor de Twenty)</label>
                <textarea rows={3} style={{...inputStyle,fontFamily:'monospace'}} defaultValue={JSON.stringify(rule.replacements??{},null,2)}
                  key={`${selectedForm.id}:${question.key}:${rule.target}`}
                  onBlur={e=>{try {const value=JSON.parse(e.target.value) as Record<string,string>;patchForm(selectedForm.id,{mappings:selectedForm.mappings.map(r=>r.questionKey===question.key?{...r,replacements:value}:r)});setStatus('Sustituciones editadas; pulsa Guardar mapeo.');}catch{setStatus('Error: JSON de sustituciones inválido');}}} />
                </div>}
            </div>;
          })}
          <Button styles={styles} primary disabled={busy||!selectedFields.length} onClick={save}>Guardar mapeo de este workspace</Button>
        </section>}
      </>}
      {screen==='sync' && <>
        <Subhead styles={styles} title="Sincronización e historial" description="El cron revisa cada minuto, pero ejecuta un formulario por vez. Los límites de Meta pausan las solicitudes de este workspace." />
        <section style={spacing}>
          <label style={{display:'block',...labelStyle}}>Intervalo automático</label>
          <select style={{...inputStyle,maxWidth:260}} value={config.intervalMinutes} onChange={e=>setConfig(c=>c?{...c,intervalMinutes:Number(e.target.value) as WorkspaceConfig['intervalMinutes']}:c)}>
            {[1,2,5,10,15,30,60].map(n=><option value={n} key={n}>Cada {n} minuto{n===1?'':'s'}</option>)}
          </select>
          <div><Button styles={styles} onClick={save} disabled={busy}>Guardar frecuencia</Button></div>
        </section>
        <section style={spacing}>
          <label style={{display:'block',...labelStyle}}>Formulario para sincronizar</label>
          <select style={inputStyle} value={syncFormId} onChange={e=>setSyncFormId(e.target.value)}>
            <option value="">Selecciona un formulario (uno por ejecución)</option>
            {forms.filter(f=>f.enabled).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <label style={{display:'flex',gap:8,marginTop:9,fontSize:13}}><input style={checkStyle} type="checkbox" checked={retryReview} onChange={e=>setRetryReview(e.target.checked)}/>Reprocesar también entradas NEEDS_REVIEW (tras corregir el mapeo)</label>
          <Button styles={styles} primary disabled={busy||!syncFormId} onClick={()=>void run(()=>api.post('/s/meta-sync/manual',{...(syncFormId?{formId:syncFormId}:{}),retryReview}),'Trabajo de sincronización encolado. Consulta el historial después de actualizar.')}>Sincronizar ahora</Button>
          <Button styles={styles} disabled={busy||!syncFormId} onClick={()=>void run(()=>api.post('/s/meta-sync/manual',{...(syncFormId?{formId:syncFormId}:{}),historical:true,retryReview}),'Importación histórica encolada (hasta 90 días).')}>Importar histórico (90 días)</Button>
          <Button styles={styles} disabled={busy} onClick={()=>void run(async()=>{},'Estado e historial actualizados.')}>Actualizar estado</Button>
        </section>
        <section style={spacing}><h4 style={{marginTop:0,color:theme.text}}>Estado por formulario</h4>
          {data?.states.length?data.states.map(st=><div key={st.formId} style={{borderBottom:'1px solid '+theme.divider,padding:'10px 0'}}>
            <strong>{forms.find(f=>f.id===st.formId)?.name??st.formId}</strong> · {st.activeRunId?'En curso':'Sin trabajo activo'}
            <div style={small}>Último éxito: {st.lastSuccessAt?new Date(st.lastSuccessAt).toLocaleString():'Nunca'} · Último intento: {st.lastAttemptAt?new Date(st.lastAttemptAt).toLocaleString():'Nunca'}</div>
            {st.lastError && <div style={{color:theme.errorText,fontSize:13}}>Error: {st.lastError}</div>}
          </div>):<p style={small}>No hay formularios configurados.</p>}
        </section>
        <section style={spacing}><h4 style={{marginTop:0,color:theme.text}}>Últimas ejecuciones</h4>
          <div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',width:'100%',fontSize:13}}><thead><tr>{['Finalizado','Formulario','Estado','Nuevos','Vinculados','Duplicados','Revisión','Fallidos'].map(x=><th key={x} style={{textAlign:'left',padding:7,borderBottom:'1px solid '+theme.border,color:theme.textMuted}}>{x}</th>)}</tr></thead>
          <tbody>{(data?.history??[]).map(evt=><tr key={evt.runId}>{[new Date(evt.finishedAt).toLocaleString(),evt.formName,evt.status,evt.stats.imported,evt.stats.linked,evt.stats.duplicate,evt.stats.review,evt.stats.failed].map((x,i)=><td key={i} style={{padding:7,borderBottom:'1px solid '+theme.divider,color:theme.text}}>{x}</td>)}</tr>)}</tbody></table></div>
          {!data?.history.length&&<p style={small}>Todavía no se ha completado ninguna sincronización.</p>}
          {data?.history.filter(e=>e.reason).slice(0,5).map(e=><p key={e.runId} style={{fontSize:12,color:theme.errorText}}>{e.formName}: {e.reason}</p>)}
        </section>
      </>}
      <p style={{...small,marginTop:18}}>Los tokens se almacenan en variables cifradas de Twenty. Las respuestas a formularios contienen datos personales; controla los permisos y la retención antes de producción.</p>
    </>}
  </div>;
}
