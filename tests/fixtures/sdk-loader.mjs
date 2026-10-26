// Test-only resolution: no SDK monkey-patching in production code.
const stub = new URL('./sdk-stub.mjs', import.meta.url).href;
const replacements = new Set(['twenty-sdk/logic-function', 'twenty-client-sdk/rest', 'twenty-client-sdk/metadata']);
export function resolve(specifier, context, nextResolve) {
  if (replacements.has(specifier)) return { url: stub, shortCircuit: true };
  return nextResolve(specifier, context);
}
