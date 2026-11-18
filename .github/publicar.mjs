// Publicación en GitHub Pages: copia el sitio a _site con el código minificado (sin source maps)
// y agrega la política de seguridad de contenido (CSP) a cada página HTML.
// Uso: node .github/publicar.mjs   (requiere esbuild: npm i --no-save esbuild@0.24.2)
import fs from "node:fs";
import path from "node:path";
import { transformSync } from "esbuild";

const CSP = fs.readFileSync(".github/csp.txt", "utf8").trim().replace(/\s*\n\s*/g, " ");
const SALIDA = "_site", FUERA = new Set([".git", ".github", "node_modules", SALIDA]);
fs.rmSync(SALIDA, { recursive: true, force: true });

const js = code => transformSync(code, { loader: "js", minify: true, target: "es2022", legalComments: "inline", sourcemap: false }).code;
const css = code => transformSync(code, { loader: "css", minify: true }).code;
const intento = (fn, original, que) => { try { return fn(original); } catch (e) { console.warn(`Sin minificar (${que}):`, e.message.slice(0, 140)); return original; } };
const html = (texto, archivo) => {
  let h = texto
    .replace(/<script>([\s\S]*?)<\/script>/g, (_, c) => "<script>" + intento(js, c, archivo).replace(/<\/script/gi, "<\\/script") + "</script>")
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => "<style>" + intento(css, c, archivo) + "</style>");
  if (!/http-equiv=["']Content-Security-Policy/i.test(h)) {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP.replace(/"/g, "&quot;")}">`;
    h = /<meta charset[^>]*>/i.test(h) ? h.replace(/(<meta charset[^>]*>)/i, `$1${meta}`) : h.replace(/<head[^>]*>/i, m => m + meta);
  }
  return h;
};

let n = 0, antes = 0, despues = 0;
const recorrer = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (FUERA.has(e.name)) continue;
    const origen = path.join(dir, e.name), destino = path.join(SALIDA, origen);
    if (e.isDirectory()) { recorrer(origen); continue; }
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    const ext = path.extname(e.name).toLowerCase();
    if ([".html", ".js", ".css"].includes(ext) && !e.name.endsWith(".min.js")) {
      const t = fs.readFileSync(origen, "utf8");
      const r = ext === ".html" ? html(t, origen) : ext === ".js" ? intento(js, t, origen) : intento(css, t, origen);
      fs.writeFileSync(destino, r); n++; antes += Buffer.byteLength(t); despues += Buffer.byteLength(r);
    } else fs.copyFileSync(origen, destino);
  }
};
recorrer(".");
const sm = fs.readdirSync(SALIDA, { recursive: true }).filter(f => String(f).endsWith(".map"));
if (sm.length) { console.error("Hay source maps en la publicación:", sm); process.exit(1); }
console.log(`${n} archivos minificados: ${Math.round(antes / 1024)} KB -> ${Math.round(despues / 1024)} KB`);
