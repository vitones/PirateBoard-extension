// Verificacoes da extensao sem dependencias: manifest, arquivos referenciados e
// as promessas do README (sem codigo remoto, sem cookie, sem rede no content script).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const erros = [];
const falha = (m) => erros.push(m);
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

if (manifest.manifest_version !== 3) falha('manifest_version deve ser 3');
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) falha('version deve ser x.y.z');
if (JSON.stringify(manifest.permissions) !== '["storage"]') falha('permissions deve ser so ["storage"]');
for (const h of manifest.host_permissions ?? []) {
  if (!/^https:\/\/pirateboard\.veetones\.workers\.dev\/\*$/.test(h)) falha('host_permissions inesperado: ' + h);
}
for (const cs of manifest.content_scripts ?? []) {
  for (const m of cs.matches) if (!/^https:\/\/www\.seaofthieves\.com\/\*\/profile\/\*$/.test(m)) falha('content script em pagina inesperada: ' + m);
  for (const f of cs.js) if (!existsSync(f)) falha('arquivo ausente: ' + f);
}
const referenciados = [manifest.action?.default_popup, ...Object.values(manifest.action?.default_icon ?? {}), ...Object.values(manifest.icons ?? {})];
for (const f of referenciados.filter(Boolean)) if (!existsSync(f)) falha('arquivo ausente: ' + f);

const js = readdirSync('.').filter((f) => f.endsWith('.js'));
for (const f of js) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { falha('erro de sintaxe em ' + f + ': ' + e.stderr); }
  const src = readFileSync(f, 'utf8');
  if (/\beval\s*\(|new Function\s*\(/.test(src)) falha(f + ': eval/new Function nao permitido');
  if (/document\.cookie/.test(src)) falha(f + ': nao pode ler cookie');
}
const content = readFileSync('content.js', 'utf8');
if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(content)) falha('content.js nao pode fazer requisicao de rede');
for (const f of readdirSync('.').filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  if (/<script[^>]+src=["']https?:/i.test(html)) falha(f + ': script remoto nao permitido');
}

// Teste rapido do parser (funcoes puras).
const p = createRequire(import.meta.url)('../parse.js');
const confere = (ok, m) => { if (!ok) falha('parse.js: ' + m); };
const snap = p.buildSnapshot({ header: { gamertag: 'A', level: 5, gold: 1 }, captaincy: { pirateGoals: 1, shipGoals: 1 }, reputation: [{ company: 'order_of_souls', level: 1 }] });
confere(snap && snap.gold === 1 && (snap.ancientCoins === 5 || snap.level === 5), 'buildSnapshot');
confere(typeof p.parseHeader === 'function' && typeof p.parseCaptaincy === 'function' && typeof p.parseReputation === 'function', 'funcoes de leitura');

if (erros.length) { console.error(erros.map((e) => '- ' + e).join('\n')); process.exit(1); }
console.log('Extensao ' + manifest.version + ': ok');
