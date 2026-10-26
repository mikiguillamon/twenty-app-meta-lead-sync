import test from 'node:test';
import assert from 'node:assert/strict';
import { getUiPalette } from '../src/front-components/ui-theme.ts';
const luminance = (hex) => {
  const channel = hex.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x, 16) / 255).map((x) => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return .2126 * channel[0] + .7152 * channel[1] + .0722 * channel[2];
};
const contrast = (a,b) => {
 const [high,low]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
 return (high+.05)/(low+.05);
};
for (const mode of ['light','dark']) {
 test(mode+' semantic colours meet WCAG AA text contrast', () => {
  const palette=getUiPalette(mode);
  assert.equal(palette.colorScheme,mode);
  for(const [fg,bg] of [['text','surface'],['textMuted','surface'],['text','control'],['neutralText','neutralButton'],['primaryText','primaryButton'],['successText','successSurface'],['errorText','errorSurface']]) {
    assert.ok(contrast(palette[fg],palette[bg]) >= 4.5,mode+' contrast '+fg+' on '+bg);
  }
 });
}
