// ===== Disclaimer toggle =====
function toggleDisclaimer() {
  const detail = document.getElementById('disclaimer-detail');
  const btn = document.getElementById('disclaimer-btn');
  const isOpen = detail.classList.toggle('open');
  btn.textContent = isOpen ? '閉じる' : '詳しく見る';
}

// ===== State =====
let activeTypes = new Set();
let activeDevices = new Set();
let searchQ = "";

// ===== Init =====
function init() {
  buildFilterChips();
  buildInsights();
  applyFilters();
}

function buildFilterChips() {
  const types = [...new Set(MEASURES.map(m => m.type))];
  const devices = [...new Set(MEASURES.flatMap(m => m.devices))];

  // 施策タイプは左サイドバー（単一選択・先頭に「すべて見る」）
  const counts = {};
  MEASURES.forEach(m => { counts[m.type] = (counts[m.type] || 0) + 1; });
  const sb = document.getElementById('sidebar-types');
  sb.innerHTML =
    `<button class="sidebar-item on" data-stype="__all__" onclick="selectType('__all__')"><span>すべて見る</span><span class="sidebar-count">${MEASURES.length}</span></button>` +
    types.map(t =>
      `<button class="sidebar-item" data-stype="${t}" onclick="selectType('${t}')"><span>${t}</span><span class="sidebar-count">${counts[t]}</span></button>`
    ).join('');

  const dc = document.getElementById('device-chips');
  devices.forEach(d => {
    dc.innerHTML += `<button class="chip" data-device="${d}" onclick="toggleDevice('${d}')">${d}</button> `;
  });
}

function selectType(t) {
  activeTypes.clear();
  if (t !== '__all__') activeTypes.add(t);
  document.querySelectorAll('[data-stype]').forEach(el => {
    el.classList.toggle('on', el.dataset.stype === t);
  });
  applyFilters();
}

function toggleDevice(d) {
  if (activeDevices.has(d)) activeDevices.delete(d); else activeDevices.add(d);
  document.querySelectorAll('[data-device]').forEach(el => {
    el.classList.toggle('on', activeDevices.has(el.dataset.device));
  });
  applyFilters();
}

function applyFilters() {
  searchQ = document.getElementById('search-input').value.toLowerCase().trim();

  const filtered = MEASURES.filter(m => {
    if (activeTypes.size && !activeTypes.has(m.type)) return false;
    if (activeDevices.size && !m.devices.some(d => activeDevices.has(d))) return false;
    if (searchQ) {
      const hay = [m.title, m.hypothesis, m.rootCause, ...m.factuals].join(' ').toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  renderCards(filtered);
  document.getElementById('filter-count').textContent = `${filtered.length} / ${MEASURES.length} 件`;
}

// ===== Render cards =====
function renderCards(items) {
  const groups = { win: [], draw: [], loss: [] };
  items.forEach(m => groups[m.result].push(m));

  ['win', 'draw', 'loss'].forEach(r => {
    const container = document.getElementById('cards-' + r);
    const count = document.getElementById('count-' + r);
    const section = document.getElementById('section-' + r);
    count.textContent = groups[r].length + ' 件';
    section.classList.toggle('hidden', groups[r].length === 0);
    if (groups[r].length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = groups[r].map(m => cardHTML(m)).join('');
  });

  const anyResult = items.length > 0;
  document.getElementById('no-results').style.display = anyResult ? 'none' : 'block';
}

function badgeHTML(result) {
  const map = { win: ['✅', '勝ち'], draw: ['➖', '引き分け'], loss: ['❌', '負け'] };
  const [icon, label] = map[result];
  return `<span class="result-badge ${result}">${icon} ${label}</span>`;
}

function diIcon(type) {
  return type === 'good' ? '✅' : type === 'caution' ? '⚠️' : '❌';
}

// 指標キー → 日本語ラベル（カード・モーダル共通）
const METRIC_LABELS = {
  ctrChange: 'CTR変化', cvrChange: 'CVR変化', significance: '有意差', sampleSize: 'サンプル数',
  efImprove: 'EF完了率', cvrImprove: 'CVR', efRate: 'EF完了率',
  mcvrC: 'MCVR', cvrC: 'CVR (C案)', cvrB: 'CVR (B案)', cta2ctrC: 'CTA2 CTR',
  engageSP: 'エンゲージ時間 (SP)', bounceRateSP: '直帰率 (SP)', bounceRatePC: '直帰率 (PC)'
};

// 改善/悪化の色判定（「下がる=良い」指標にも対応: 元の値の注記を優先）
function metricClass(fullValue, shortValue) {
  if (/悪化(?![せしな])/.test(fullValue)) return 'down';
  if (/改善(?![せしな])/.test(fullValue)) return 'up';
  if (shortValue.startsWith('+')) return 'up';
  if (shortValue.startsWith('-')) return 'down';
  return '';
}

function cardHTML(m) {
  // 指標は数値部分だけを抜き出して簡潔に表示（詳細はモーダルで）
  const metricEntries = Object.entries(m.metrics).slice(0, 3);
  const metaHTML = metricEntries.map(([k, v]) => {
    const short = String(v).split('（')[0].split('(')[0].trim();
    const cls = metricClass(String(v), short);
    return `<div class="meta-item"><div class="meta-lbl">${METRIC_LABELS[k] || k}</div><div class="meta-val ${cls}">${short}</div></div>`;
  }).join('');

  // 前後比較スクショ（あるものだけサムネイル表示）
  const thumbHTML = (typeof SCREENSHOTS !== 'undefined' && SCREENSHOTS[m.id]) ? `
    <div class="card-thumb">
      <img src="${SCREENSHOTS[m.id]}" alt="${m.id} 施策前後の比較" loading="lazy">
      <span class="thumb-label">📸 施策前後</span>
    </div>` : '';

  return `
    <div class="card-wrap">
      <div class="card" onclick="openModal('${m.id}')">
        ${thumbHTML}
        <div class="card-body">
          <div class="card-top">
            ${badgeHTML(m.result)}
            <span class="type-tag">${m.type}</span>
            <span class="card-id">${m.id}</span>
          </div>
          <div class="card-title">${m.title}</div>
          <div class="card-period">📅 ${m.period}</div>
          <div class="card-meta">${metaHTML}</div>
        </div>
      </div>
    </div>`;
}

// ===== Modal =====
function openModal(id) {
  const m = MEASURES.find(x => x.id === id);
  if (!m) return;

  document.getElementById('modal-badges').innerHTML =
    badgeHTML(m.result) +
    `<span class="type-tag">${m.type}</span>` +
    m.devices.map(d => `<span class="type-tag">${d}</span>`).join('');
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-id').textContent = m.id + ' · ' + m.period + ' · ' + m.adoptionLabel;

  const factualHTML = m.factuals.length ? `
    <div class="fact-blk">
      <div class="blk-label">📋 事実</div>
      <ul class="blk-list">${m.factuals.map(f => `<li>${f}</li>`).join('')}</ul>
    </div>` : '';

  const hypoInsightHTML = m.hypothesisInsights.length ? `
    <div class="hypo-blk">
      <div class="blk-label">🤔 AI推論（仮説）</div>
      <ul class="blk-list">${m.hypothesisInsights.map(h => `<li>${h}</li>`).join('')}</ul>
    </div>` : '';

  const metricsHTML = Object.entries(m.metrics).map(([k, v]) =>
    `<div class="metric-pill"><div class="metric-lbl">${METRIC_LABELS[k] || k}</div><div class="metric-val">${v}</div></div>`
  ).join('');

  const insightsHTML = [
    ...m.factuals.map(f => `<div class="insight-row"><div class="ins-dot neu">📋</div><div class="ins-text">${f}</div></div>`),
    ...m.hypothesisInsights.map(h => `<div class="insight-row"><div class="ins-dot neg">💭</div><div class="ins-text">【推論】${h}</div></div>`)
  ].join('');


  const screenshotHTML = (typeof SCREENSHOTS !== 'undefined' && SCREENSHOTS[m.id]) ? `
    <div class="modal-sec">
      <div class="modal-sec-title">📸 施策前後の比較</div>
      <a href="${SCREENSHOTS[m.id]}" target="_blank" title="クリックで原寸表示">
        <img src="${SCREENSHOTS[m.id]}" alt="${m.id} 施策前後の比較スクリーンショット" style="width:100%;height:auto;border:1px solid var(--border-low);border-radius:8px;display:block;cursor:zoom-in;">
      </a>
    </div>` : '';

  document.getElementById('modal-body').innerHTML = `
    ${screenshotHTML}
    <div class="modal-sec">
      <div class="modal-sec-title">仮説</div>
      <div class="${m.hypothesisIsAI ? 'hypo-blk' : 'fact-blk'}">
        <div class="blk-label">${m.hypothesisIsAI ? '🤔 AI推論' : '📋 事実（施策ドックより）'}</div>
        <div class="blk-content">${m.hypothesis}</div>
      </div>
    </div>
    <div class="modal-sec">
      <div class="modal-sec-title">計測数値</div>
      <div class="metrics-row">${metricsHTML}</div>
    </div>
    <div class="modal-sec">
      <div class="modal-sec-title">事実 vs AI推論の区別</div>
      ${factualHTML}
      ${hypoInsightHTML}
    </div>
    <div class="modal-sec">
      <div class="modal-sec-title">要因分析（根本原因）</div>
      <div class="fact-blk">
        <div class="blk-label">🎯 要因サマリ</div>
        <div class="blk-content">${m.rootCause}</div>
      </div>
    </div>
    <div class="modal-sec">
      <div class="modal-sec-title">🎨 デザイン観点の活かし（CTユーザー向け判断）</div>
      ${(m.designInsights || []).map(d => `
        <div class="di-modal-row ${d.type}">
          <span class="di-modal-icon">${diIcon(d.type)}</span>
          <span class="di-modal-text">${d.text}</span>
        </div>`).join('')}
    </div>
    `;

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== View switch =====
function switchView(v) {
  document.getElementById('view-list').classList.toggle('hidden', v !== 'list');
  document.getElementById('view-insights').classList.toggle('active', v === 'insights');
  document.getElementById('sidebar').style.display = v === 'list' ? '' : 'none';
  document.getElementById('btn-list').classList.toggle('active', v === 'list');
  document.getElementById('btn-insights').classList.toggle('active', v === 'insights');
}

// ===== Insights view =====
function buildInsights() {
  // Score bar
  const win = MEASURES.filter(m => m.result === 'win').length;
  const draw = MEASURES.filter(m => m.result === 'draw').length;
  const loss = MEASURES.filter(m => m.result === 'loss').length;
  const total = MEASURES.length;
  const bar = document.getElementById('score-bar');
  bar.innerHTML = `
    <div class="score-seg win"  style="width:${win/total*100}%">${win}勝</div>
    <div class="score-seg draw" style="width:${draw/total*100}%">${draw}分</div>
    <div class="score-seg loss" style="width:${loss/total*100}%">${loss}敗</div>`;

  // Patterns
  const pl = document.getElementById('pattern-list');
  pl.innerHTML = INSIGHTS.patterns.map(p => `
    <div class="pattern-row">
      <div class="pattern-ico">${p.icon}</div>
      <div class="pattern-body">
        <div class="pattern-txt">${p.text}</div>
        <div class="pattern-src">${p.sources.join(' · ')}</div>
      </div>
    </div>`).join('');

  // Hypothesis misses
  const hm = document.getElementById('hypo-miss-list');
  hm.innerHTML = INSIGHTS.hypothesisMisses.map(h => `
    <div class="pattern-row">
      <div class="pattern-ico">❌</div>
      <div class="pattern-body">
        <div class="pattern-txt">「${h.text}」</div>
        <div class="pattern-src">${h.source} — ${h.lesson}</div>
      </div>
    </div>`).join('');

  // All cards mini
  const ac = document.getElementById('all-cards-insights');
  ac.innerHTML = MEASURES.map(m => `
    <div class="ins-panel" style="cursor:pointer" onclick="openModal('${m.id}')">
      <div class="ins-panel-title">
        ${badgeHTML(m.result)}
        <span style="font-size:13px;font-weight:700;color:var(--text-high)">${m.id}</span>
      </div>
      <p style="font-size:13px;color:var(--text-medium);margin-bottom:var(--sp-12)">${m.title}</p>
      <div class="fact-blk" style="margin:0">
        <div class="blk-label">採用結果</div>
        <div class="blk-content">${m.adoptionLabel}</div>
      </div>
    </div>`).join('');
}

init();
