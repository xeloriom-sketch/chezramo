import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Chez Ramo — Générateur de Diaporama',
  robots: 'noindex',
}

export default function DiaporamaPage() {
  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0d0d0d;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;min-height:100vh;padding:2rem 1.5rem}
        h1{font-size:1.8rem;font-weight:900;letter-spacing:2px;margin-bottom:.3rem}
        h1 span{color:#e01010}
        .sub{color:#666;font-size:.9rem;margin-bottom:2rem}
        .steps{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.4rem 1.6rem;margin-bottom:2rem;display:flex;flex-direction:column;gap:.6rem}
        .step{display:flex;align-items:flex-start;gap:.8rem;font-size:.9rem;color:#bbb}
        .step-n{background:#e01010;color:#fff;font-weight:900;font-size:.75rem;min-width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.05rem}
        .actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-bottom:1.5rem}
        .btn{padding:.8rem 1.8rem;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;transition:all .18s;font-family:inherit}
        .btn-main{background:#e01010;color:#fff}
        .btn-main:hover{background:#b50d0d}
        .btn-main:disabled{background:#4a0505;cursor:not-allowed;opacity:.6}
        .btn-sec{background:rgba(255,255,255,.07);color:#ccc;border:1px solid rgba(255,255,255,.1)}
        .btn-sec:hover{background:rgba(255,255,255,.12)}
        .progress-wrap{background:#1a1a1a;border-radius:50px;height:10px;overflow:hidden;margin-bottom:.5rem;display:none}
        .progress-bar{background:#e01010;height:100%;width:0%;transition:width .3s;border-radius:50px}
        #status{font-size:.85rem;color:#888;margin-bottom:1.5rem;min-height:1.2rem}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
        .slide-card{background:#161616;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden}
        .slide-card canvas{width:100%;height:auto;display:block}
        .slide-card-footer{padding:.6rem .8rem;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.05)}
        .slide-card-footer span{font-size:.75rem;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dl-btn{background:#e01010;color:#fff;border:none;border-radius:6px;padding:.3rem .8rem;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;text-decoration:none;display:inline-block;line-height:1.6}
        .dl-btn:hover{background:#b50d0d}
        .note{background:rgba(224,16,16,.06);border:1px solid rgba(224,16,16,.2);border-radius:10px;padding:1rem 1.2rem;font-size:.83rem;color:#ccc;line-height:1.6;margin-bottom:2rem}
        .note strong{color:#e01010}
        code{background:rgba(255,255,255,.08);padding:.1em .4em;border-radius:4px;font-size:.9em}
      `}</style>

      <h1>CHEZ <span>RAMO</span> — Générateur de Diaporama</h1>
      <p className="sub">Crée les images PNG pour ta clé USB. Aucune connexion internet nécessaire.</p>

      <div className="note">
        <strong>Note :</strong> Les images doivent être accessibles depuis <code>/uploads/</code>.
        Fonctionne avec <strong>Chrome, Firefox et Safari</strong>.
      </div>

      <div className="steps">
        <div className="step"><div className="step-n">1</div><span>Clique sur <strong>&quot;Générer les diapos&quot;</strong> — ça prend quelques secondes</span></div>
        <div className="step"><div className="step-n">2</div><span>Clique sur <strong>&quot;Tout télécharger&quot;</strong> pour télécharger toutes les images d&apos;un coup</span></div>
        <div className="step"><div className="step-n">3</div><span>Copie les images <strong>01.png, 02.png…</strong> dans un dossier sur ta <strong>clé USB</strong></span></div>
        <div className="step"><div className="step-n">4</div><span>Sur la TV : Source → USB → Diaporama / Photos → les images défilent automatiquement</span></div>
      </div>

      <div className="actions">
        <button className="btn btn-main" id="btn-gen">▶ Générer les diapos</button>
        <button className="btn btn-sec" id="btn-dl" style={{ display:'none' }}>⬇ Tout télécharger</button>
      </div>
      <div className="progress-wrap" id="prog-wrap"><div className="progress-bar" id="prog-bar"></div></div>
      <div id="status"></div>
      <div className="grid" id="grid"></div>

      <Script src="/diaporama/diaporama.js" strategy="afterInteractive" />
    </>
  )
}
