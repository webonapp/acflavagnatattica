'use strict';

const byId = (id) => document.getElementById(id);
const pitches = {'Possesso': byId('pitch'), 'Non possesso': byId('pitch-out')};
const pitchWidth = pitches.Possesso.width;
const pitchHeight = pitches.Possesso.height;
const flatLength = 690;
const flatWidth = flatLength * 68 / 105;
const ballImage = byId('ball-icon');
const canvasFont = '"Commuters Sans", system-ui, sans-serif';
const siteBootstrap = window.__SITE_BOOTSTRAP__ || null;
const siteAccount = siteBootstrap?.account || null;
const storageKey = siteAccount ? 'lavagna-tattica-v1:' + encodeURIComponent(siteAccount.username) : 'lavagna-tattica-v1';
const legacyStorageKey = 'lavagna-tattica-v1';
const roleLabels = {
  DCS: 'DC SX', DCD: 'DC DX',
  MCS: 'Mezza SX', MCD: 'Mezza DX',
  PLAY: 'PLAY',
  QS: 'Quinto SX', QD: 'Quinto DX',
  AS: 'Ala SX', AD: 'Ala DX',
  TRQS: 'TRQ SX', TRQD: 'TRQ DX'
};
const formations = {
  '3-4-1-2': ['DCS DC DCD', 'QS MED MED QD', 'TRQ', 'ATT ATT'],
  '3-4-2-1': ['DCS DC DCD', 'QS MED MED QD', 'TRQS TRQD', 'ATT'],
  '3-4-3': ['DCS DC DCD', 'QS MCS MCD QD', 'AS ATT AD'],
  '3-5-1-1': ['DCS DC DCD', 'QS MCS MED MCD QD', 'TRQ', 'ATT'],
  '3-5-2': ['DCS DC DCD', 'QS MCS MED MCD QD', 'ATT ATT'],
  '4-1-4-1': ['TS DCS DCD TD', 'MED', 'ES MCS MCD ED', 'ATT'],
  '4-2-2-2': ['TS DCS DCD TD', 'MED MED', 'TRQS TRQD', 'ATT ATT'],
  '4-2-3-1': ['TS DCS DCD TD', 'MED MED', 'AS TRQ AD', 'ATT'],
  '4-2-4': ['TS DCS DCD TD', 'MED MED', 'AS ATT ATT AD'],
  '4-3-1-2': ['TS DCS DCD TD', 'MCS MED MCD', 'TRQ', 'ATT ATT'],
  '4-3-3': ['TS DCS DCD TD', 'MCS MED MCD', 'AS ATT AD'],
  '4-4-1-1': ['TS DCS DCD TD', 'ES MCS MCD ED', 'TRQ', 'ATT'],
  '4-4-2': ['TS DCS DCD TD', 'ES MCS MCD ED', 'ATT ATT'],
  '4-5-1': ['TS DCS DCD TD', 'ES MCS MED MCD ED', 'ATT']
};

const legacyFormations = {
  '3-1-4-2': ['DCS DC DCD', 'MED', 'QS MCS MCD QD', 'ATT ATT'],
  '3-2-4-1': ['DCS DC DCD', 'MED MED', 'QS TRQS TRQD QD', 'ATT'],
  '4-1-2-3': ['TS DCS DCD TD', 'MED', 'MCS MCD', 'AS ATT AD'],
  '5-2-3': ['QS DCS DC DCD QD', 'MED MED', 'AS ATT AD'],
  '5-3-2': ['QS DCS DC DCD QD', 'MCS MED MCD', 'ATT ATT'],
  '5-4-1': ['QS DCS DC DCD QD', 'ES MCS MCD ED', 'ATT']
};

const icons = {
  pitch: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/><circle cx="12" cy="12" r="3"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8m-9 4h4"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/>',
  save: '<path d="M5 3h12l4 4v13H3V3zm2 0v6h9V3M7 20v-7h10v7"/>',
  move: '<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3"/>',
  arrow: '<path d="M5 19 19 5m-9 0h9v9"/>',
  curve: '<path d="M4 19c0-8 5-13 15-13m-6-4 6 4-5 5"/>',
  text: '<path d="M4 7V4h16v3M12 4v16m-4 0h8"/>',
  eraser: '<path d="m4 13 9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-8 9H9l-5-5a2 2 0 0 1 0-2Zm5-5 8 8m-5 4h9"/>',
  undo: '<path d="M8 5 3 10l5 5M3 10h12a5 5 0 0 1 0 10"/>',
  layers: '<path d="m3 9 9-5 9 5-9 5-9-5Zm1 5 8 5 8-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  expand: '<path d="M8 3H3v5m0-5 7 7M16 3h5v5m0-5-7 7M3 16v5h5m-5 0 7-7m11 2v5h-5m5 0-7-7"/>'
};

for (const element of document.querySelectorAll('[data-icon]')) {
  element.insertAdjacentHTML('afterbegin', '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + icons[element.dataset.icon] + '</svg>');
}

function lineup(formation, away, previousAwayDepth = false, previousAwayMidfieldShift = false) {
  const rows = formations[formation] ?? legacyFormations[formation];
  const players = [{x: .5, y: .94, role: 'POR', away, lineIndex: -1}];
  const depth = rows.length === 3 ? [.78, .60, .36] : [.79, .64, .49, .34];
  for (const [rowIndex, row] of rows.entries()) {
    const roles = formationRowRoles(row);
    const spacing = Math.min(.24, .71 / Math.max(roles.length - 1, 1));
    for (const [index, role] of roles.entries()) {
      const midfieldShift = previousAwayMidfieldShift && away && rowIndex === 1 ? .035 : 0;
      players.push({x: .5 + (index - (roles.length - 1) / 2) * spacing + midfieldShift,
        y: depth[rowIndex], role, away, lineIndex: rowIndex});
    }
  }
  return away
    ? players.map((player) => ({
      ...player,
      x: 1 - player.x,
      y: Math.max(.025, 1 - player.y - (previousAwayDepth ? .09 : 0))
    }))
    : players;
}

function formationRowRoles(row) {
  const roles = row.split(' ');
  if (roles.includes('MCS') && roles.includes('MCD')) {
    const centralMidfielder = roles.indexOf('MED');
    if (centralMidfielder !== -1) roles[centralMidfielder] = 'PLAY';
  }
  return roles;
}

function layoutPoint(point, perspective) {
  if (!perspective) return {x: 550 + (point.x - .5) * flatWidth, y: 42 + point.y * flatLength};
  const distance = 1 + .62 * (1 - point.y);
  return {x: 550 + (point.x - .5) * 792 / distance, y: 47 + 675 * point.y / distance};
}

function visualBounds(player, perspective) {
  const point = layoutPoint(player, perspective);
  const unit = perspective ? .74 + .44 * player.y : .79;
  const labels = [player.name, player.roleText ?? roleLabels[player.role] ?? player.role].filter(Boolean);
  const labelWidth = Math.min(108, Math.max(0, ...labels.map((label) => label.length * 7.6)));
  return {
    left: point.x - Math.max(26, labelWidth / 2) * unit,
    right: point.x + Math.max(26, labelWidth / 2) * unit,
    top: point.y - 18 * unit,
    bottom: point.y + Math.max(25, labels.length ? 44 + (labels.length - 1) * 15 : 25) * unit
  };
}

function boundsOverlap(first, second) {
  return first.left < second.right && first.right > second.left
    && first.top < second.bottom && first.bottom > second.top;
}

function spaceFormationLines(players, perspective = true) {
  const lines = new Map();
  for (const player of players) {
    if (!Number.isInteger(player.lineIndex) || player.lineIndex < 0 || player.customPosition) continue;
    const key = `${player.away ? 'away' : 'home'}-${player.lineIndex}`;
    if (!lines.has(key)) lines.set(key, {away: player.away, players: []});
    lines.get(key).players.push(player);
  }
  const rows = [...lines.values()];
  const movable = (row) => row.players.length > 0 && row.players.every((player) => !player.customPosition);
  const centerY = (row) => row.players.reduce((sum, player) => sum + layoutPoint(player, perspective).y, 0) / row.players.length;
  for (let pass = 0; pass < 36; pass++) {
    let changed = false;
    for (let firstIndex = 0; firstIndex < rows.length; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < rows.length; secondIndex++) {
        const first = rows[firstIndex], second = rows[secondIndex];
        const collision = first.players.some((a) => {
          const boundsA = visualBounds(a, perspective);
          return second.players.some((b) => boundsOverlap(boundsA, visualBounds(b, perspective)));
        });
        if (!collision) continue;
        const firstCanMove = movable(first), secondCanMove = movable(second);
        if (!firstCanMove && !secondCanMove) continue;
        const firstAbove = centerY(first) <= centerY(second);
        const step = .012;
        if (firstCanMove) for (const player of first.players) {
          player.y = Math.max(.035, Math.min(.965, player.y + (firstAbove ? -step : step)));
        }
        if (secondCanMove) for (const player of second.players) {
          player.y = Math.max(.035, Math.min(.965, player.y + (firstAbove ? step : -step)));
        }
        changed = true;
      }
    }
    if (!changed) break;
  }
}

function freshBoard(phase = 'Possesso') {
  const players = [...lineup('3-5-2', false), ...lineup('4-3-3', true)];
  spaceFormationLines(players);
  return {
    id: null, title: '', notes: '', phase, home: '3-5-2', away: '4-3-3',
    showAway: true, roles: true, rolesHome: true, rolesAway: true, perspective: true, arrows: [], ball: null, texts: [], rolesVersion: 8,
    players
  };
}

let rolesNeedPersist = false;

function refreshRoles(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item) || !Array.isArray(item.players)) return null;
  item.players = item.players.filter((player) => player && typeof player === 'object'
    && Number.isFinite(player.x) && Number.isFinite(player.y));
  item.home = formations[item.home] || legacyFormations[item.home] ? item.home : '3-5-2';
  item.away = formations[item.away] || legacyFormations[item.away] ? item.away : '4-3-3';
  item.phase = item.phase === 'Non possesso' ? 'Non possesso' : 'Possesso';
  item.arrows = Array.isArray(item.arrows) ? item.arrows.filter((mark) => mark?.from && mark?.to
    && [mark.from.x, mark.from.y, mark.to.x, mark.to.y].every(Number.isFinite)) : [];
  item.texts ??= [];
  if (!Array.isArray(item.texts)) item.texts = [];
  item.texts = item.texts.filter((annotation) => annotation && typeof annotation.text === 'string'
    && Number.isFinite(annotation.x) && Number.isFinite(annotation.y));
  if (!item.ball || !Number.isFinite(item.ball.x) || !Number.isFinite(item.ball.y)) item.ball = null;
  item.showAway = item.showAway !== false;
  item.roles = item.roles !== false;
  item.rolesHome = item.rolesHome ?? item.roles;
  item.rolesAway = item.rolesAway ?? item.roles;
  item.roles = item.rolesHome || item.rolesAway;
  item.perspective = item.perspective !== false;
  if (Number(item.rolesVersion ?? 0) >= 8) return item;
  if (Number(item.rolesVersion ?? 0) >= 7) {
    const lineups = {home: lineup(item.home, false), away: lineup(item.away, true)};
    for (const player of item.players) {
      if (player.role !== 'MED' || player.customPosition || !Number.isInteger(player.lineIndex)) continue;
      const candidates = lineups[player.away ? 'away' : 'home'].filter((candidate) => candidate.lineIndex === player.lineIndex && candidate.role === 'PLAY');
      const replacement = candidates.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      if (replacement && Math.abs(replacement.x - player.x) < .08) player.role = 'PLAY';
    }
    item.rolesVersion = 8;
    rolesNeedPersist = true;
    return item;
  }
  const home = lineup(item.home, false);
  const away = lineup(item.away, true);
  const previousAway = lineup(item.away, true, true);
  const previousAwayWithMidfieldShift = lineup(item.away, true, true, true);
  const expected = {
    home: home,
    away: [...away, ...previousAway, ...previousAwayWithMidfieldShift]
  };
  for (const player of item.players) {
    const candidates = expected[player.away ? 'away' : 'home'];
    const preset = candidates.find((candidate) => Math.abs(player.x - candidate.x) < .003 && Math.abs(player.y - candidate.y) < .003);
    if (preset) {
      const current = (player.away ? away : home).find((candidate) => candidate.role === preset.role
        && candidate.lineIndex === preset.lineIndex && Math.abs(candidate.x - preset.x) < .003);
      if (current) {
        player.x = current.x;
        player.y = current.y;
        player.lineIndex = current.lineIndex;
        if (player.role === 'MED' && current.role === 'PLAY') player.role = 'PLAY';
        delete player.customPosition;
      }
    } else {
      player.customPosition = true;
      delete player.lineIndex;
    }
  }
  spaceFormationLines(item.players, item.perspective !== false);
  item.rolesVersion = 8;
  rolesNeedPersist = true;
  return item;
}

let storageAvailable = true;
let stored = siteBootstrap ? siteBootstrap.data : null;
let importLegacyArchive = false;
if (!stored) {
  try {
    const local = JSON.parse(localStorage.getItem(siteAccount ? legacyStorageKey : storageKey) || '{}') || {};
    if (siteAccount && (local.saved?.length || local.folders?.length)
      && window.confirm('Questo browser contiene schemi salvati prima del login. Vuoi importarli nel tuo archivio personale?')) {
      stored = local;
      importLegacyArchive = true;
    } else if (!siteAccount) stored = local;
  } catch {
    storageAvailable = false;
  }
}
stored ||= {};
const phases = Object.keys(pitches);
const boards = Object.fromEntries(phases.map((phase) => {
  const previous = stored.boards?.[phase] ?? (stored.board?.phase === phase ? stored.board : null);
  return [phase, refreshRoles(previous) ?? freshBoard(phase)];
}));
const histories = Object.fromEntries(phases.map((phase) => [phase, []]));
let activePhase = stored.activePhase ?? stored.board?.phase ?? 'Possesso';
if (!phases.includes(activePhase)) activePhase = 'Possesso';
let board = boards[activePhase];
let canvas = pitches[activePhase];
let folders = Array.isArray(stored.folders) ? stored.folders.filter((folder) => folder && typeof folder.id === 'string'
  && typeof folder.name === 'string').map((folder) => ({...folder, parentId: folder.parentId || null})) : [];
const validFolderIds = new Set(folders.map((folder) => folder.id));
for (const folder of folders) if (!validFolderIds.has(folder.parentId)) folder.parentId = null;
let saved = Array.isArray(stored.saved) ? stored.saved.map(refreshRoles).filter(Boolean).map((item) => {
  item.folderIds = Array.isArray(item.folderIds) ? item.folderIds.filter((id) => validFolderIds.has(id))
    : item.folderId && validFolderIds.has(item.folderId) ? [item.folderId] : [];
  delete item.folderId;
  return item;
}) : [];
let tool = 'move';
let history = histories[activePhase];
let gesture = null;
const selection = new Set();
let curveSettings = {height: 50, aerial: false};
let resizingCurve = false;
let noticeTimeout;
let rolesChoicePhase = null;
let fullscreenPhase = null;
let archiveOwner = siteAccount?.username || null;
let remoteSaveTimer = null;
let remoteSavePromise = Promise.resolve(true);

const singleSelection = () => selection.size === 1 ? selection.values().next().value : null;

function selectOnly(object) {
  selection.clear();
  if (object) selection.add(object);
}

function remember(snapshot = board) {
  history.push(structuredClone(snapshot));
  if (history.length > 60) history.shift();
}

function persist() {
  boards[activePhase] = board;
  try {
    const cacheKey = siteAccount ? 'lavagna-tattica-v1:' + encodeURIComponent(archiveOwner) : storageKey;
    localStorage.setItem(cacheKey, JSON.stringify({boards, activePhase, saved, folders}));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  if (!siteAccount) return storageAvailable;
  const snapshot = JSON.stringify({boards, activePhase, saved, folders});
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(() => { queueRemoteSave(snapshot); }, 300);
  return true;
}

function queueRemoteSave(snapshot) {
  remoteSavePromise = remoteSavePromise.catch(() => false).then(async () => {
    try {
      const query = siteAccount.role === 'admin' && archiveOwner !== siteAccount.username
        ? '?user=' + encodeURIComponent(archiveOwner) : '';
      const response = await fetch('/api/data' + query, {
        method: 'PUT', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: snapshot
      });
      if (response.status === 401) { window.location.assign('/'); return false; }
      if (!response.ok) notice('Salvataggio online non riuscito. Controlla la connessione e riprova.');
      return response.ok;
    } catch {
      notice('Salvataggio online non riuscito. Controlla la connessione e riprova.');
      return false;
    }
  });
  return remoteSavePromise;
}

async function flushRemoteSave() {
  if (!siteAccount) return true;
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = null;
  const snapshot = JSON.stringify({boards, activePhase, saved, folders});
  return queueRemoteSave(snapshot);
}

if (rolesNeedPersist) persist();

function notice(message) {
  const status = byId('status');
  status.textContent = message;
  status.hidden = false;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { status.hidden = true; }, 3300);
}

function update() {
  renderControls();
  draw();
  if (!persist()) notice('Il browser non ha potuto salvare le modifiche.');
}

function project({x, y}, perspective = board.perspective) {
  if (!perspective) return {x: pitchWidth / 2 + (x - .5) * flatWidth, y: 42 + y * flatLength};
  const distance = 1 + .62 * (1 - y);
  return {x: 550 + (x - .5) * 792 / distance, y: 47 + 675 * y / distance};
}

function unproject({x, y}, margin = .015) {
  const clamp = (value) => Math.max(margin, Math.min(1 - margin, value));
  if (!board.perspective) return {x: clamp(.5 + (x - pitchWidth / 2) / flatWidth), y: clamp((y - 42) / flatLength)};
  const z = (y - 47) / 675;
  const depth = clamp(1.62 * z / (1 + .62 * z));
  return {x: clamp(.5 + (x - 550) * (1 + .62 * (1 - depth)) / 792), y: depth};
}

function path(ctx, locate, points, close = false) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const p = locate({x, y});
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  if (close) ctx.closePath();
}

function rectangle(ctx, locate, left, top, right, bottom) {
  path(ctx, locate, [[left, top], [right, top], [right, bottom], [left, bottom]], true);
}

function pitchArc(ctx, locate, x, y, rx, ry, start, end) {
  const segments = Math.max(16, Math.ceil(Math.abs(end - start) / (Math.PI / 64)));
  const points = Array.from({length: segments + 1}, (_, index) => {
    const angle = start + (end - start) * index / segments;
    return [x + Math.cos(angle) * rx, y + Math.sin(angle) * ry];
  });
  path(ctx, locate, points);
  ctx.stroke();
}

function goal(ctx, locate, y, near, perspective) {
  const left = locate({x: .445, y});
  const right = locate({x: .555, y});
  if (!perspective) {
    const depth = near ? 15 : -15;
    ctx.save();
    ctx.fillStyle = '#ffffff26';
    ctx.strokeStyle = '#edf7eeb5';
    ctx.lineWidth = 1.2;
    ctx.fillRect(left.x, left.y, right.x - left.x, depth);
    ctx.strokeRect(left.x, left.y, right.x - left.x, depth);
    ctx.beginPath();
    for (let x = left.x + 6; x < right.x; x += 6) {
      ctx.moveTo(x, left.y);
      ctx.lineTo(x, left.y + depth);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }
  const height = near ? 28 : 22;
  const direction = near ? 1 : -1;
  const depth = near ? 20 : 13;
  ctx.save();
  ctx.translate(left.x, left.y);
  const w = right.x - left.x;
  ctx.strokeStyle = '#edf7eeb5';
  ctx.fillStyle = '#ffffff26';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, -height); ctx.lineTo(6, -height + direction * depth);
  ctx.lineTo(w - 6, -height + direction * depth); ctx.lineTo(w, -height);
  ctx.lineTo(w, 0); ctx.lineTo(w - 6, direction * depth);
  ctx.lineTo(6, direction * depth); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let x = 7; x < w; x += 7) {
    ctx.beginPath();
    ctx.moveTo(x, -height + direction * depth);
    ctx.lineTo(x, direction * depth);
    ctx.stroke();
  }
  ctx.strokeStyle = '#f5faf4';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -height); ctx.lineTo(w, -height); ctx.lineTo(w, 0); ctx.stroke();
  ctx.restore();
}

function drawPitch(ctx, locate, pixelRatio, perspective) {
  ctx.save();
  rectangle(ctx, locate, -.035, -.037, 1.035, 1.033);
  ctx.shadowColor = '#192a2366';
  ctx.shadowBlur = 21 * pixelRatio;
  ctx.shadowOffsetY = 10 * pixelRatio;
  ctx.fillStyle = '#345f46';
  ctx.fill();
  ctx.restore();
  rectangle(ctx, locate, -.035, -.037, 1.035, 1.033);
  const surround = ctx.createLinearGradient(0, 30, 0, 750);
  surround.addColorStop(0, '#83a881');
  surround.addColorStop(1, '#578c65');
  ctx.fillStyle = surround;
  ctx.fill();
  for (let stripe = 0; stripe < 12; stripe++) {
    rectangle(ctx, locate, 0, stripe / 12, 1, (stripe + 1) / 12);
    ctx.fillStyle = stripe % 2 ? '#4b8a63' : '#40815a';
    ctx.fill();
  }
  ctx.strokeStyle = '#eff8ecdb';
  ctx.lineWidth = 2;
  rectangle(ctx, locate, 0, 0, 1, 1); ctx.stroke();
  path(ctx, locate, [[0, .5], [1, .5]]); ctx.stroke();
  pitchArc(ctx, locate, .5, .5, .135, .085, 0, 2 * Math.PI);
  for (const side of [0, 1]) {
    const end = (depth) => side ? 1 - depth : depth;
    rectangle(ctx, locate, .199, side, .801, end(.157)); ctx.stroke();
    rectangle(ctx, locate, .365, side, .635, end(.053)); ctx.stroke();
    pitchArc(ctx, locate, .5, end(.109), .135, .083, side ? Math.PI * 1.2 : Math.PI * .2, side ? Math.PI * 1.8 : Math.PI * .8);
    for (const x of [0, 1]) {
      const start = side ? x ? Math.PI : 1.5 * Math.PI : x ? .5 * Math.PI : 0;
      pitchArc(ctx, locate, x, side, .021, .013, start, start + Math.PI / 2);
    }
  }
  ctx.fillStyle = '#eff8ec';
  for (const y of [.109, .5, .891]) {
    const p = locate({x: .5, y});
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
  }
  goal(ctx, locate, 0, false, perspective);
  goal(ctx, locate, 1, true, perspective);
}

function jersey(ctx, player, {x, y}, active, perspective, roles, pixelRatio, labelWidth) {
  const unit = perspective ? .74 + .44 * player.y : .79;
  const outline = player.away ? '#40394a' : '#381945';
  const color = player.role === 'POR' ? player.away ? '#d8a959' : '#283b56'
    : player.away ? '#fffdfa' : '#8535ba';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(unit, unit);
  ctx.lineJoin = 'round';
  if (active) {
    ctx.fillStyle = '#ead3ff77';
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, 2 * Math.PI); ctx.fill();
  }
  ctx.beginPath();
  const hem = 25;
  const silhouette = [[-9,-18],[-18,-14],[-26,-6],[-20,3],[-13,-1],[-13,hem],[13,hem],[13,-1],[20,3],[26,-6],[18,-14],[9,-18]];
  silhouette.forEach(([a, b], index) => {
    if (index === 0) ctx.moveTo(a, b);
    else ctx.lineTo(a, b);
  });
  ctx.quadraticCurveTo(0, -8, -9, -18);
  ctx.closePath();
  ctx.shadowColor = '#15292280';
  ctx.shadowBlur = 5 * pixelRatio;
  ctx.shadowOffsetY = 3 * pixelRatio;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = active ? '#f5dfff' : outline;
  ctx.lineWidth = active ? 2.5 : 1.45;
  ctx.stroke();
  ctx.strokeStyle = player.away ? '#a38cae' : '#d9adf7';
  ctx.lineWidth = 1.25;
  ctx.beginPath(); ctx.moveTo(-10, -15); ctx.quadraticCurveTo(0, -6, 10, -15); ctx.stroke();
  const labels = [player.name, roles && displayRole(player)].filter(Boolean);
  if (labels.length) {
    ctx.fillStyle = '#fffdf8';
    ctx.strokeStyle = '#192b22';
    ctx.lineWidth = 2.5;
    ctx.font = '700 13px ' + canvasFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    labels.forEach((label, index) => {
      const baseline = hem + 4 + index * 15;
      ctx.strokeText(label, 0, baseline, labelWidth / unit);
      ctx.fillText(label, 0, baseline, labelWidth / unit);
    });
  }
  ctx.restore();
}

function controlPoint(a, b, curve, locate) {
  if (curve.control) return locate(curve.control);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  const direction = curve.reverse ? -1 : 1;
  const height = curve.height / 100;
  if (curve.aerial) {
    const lift = Math.min(length * 1.6, 330) * height;
    return {x: x + direction * lift * .5 * Math.abs(dy) / Math.max(length, 1), y: Math.max(16, y - lift)};
  }
  const bend = Math.min(.88, 280 / Math.max(length, 1)) * height * direction;
  return {x: x - dy * bend, y: y + dx * bend};
}

function arrow(ctx, locate, {from, to, curve}, pixelRatio, selected = false) {
  const a = locate(from);
  const b = locate(to);
  const c = curve ? controlPoint(a, b, curve, locate) : a;
  const angle = Math.atan2(b.y - c.y, b.x - c.x);
  ctx.save();
  ctx.strokeStyle = selected ? '#fff1b5' : '#ffdc82';
  ctx.lineWidth = selected ? 5 : 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#18221991';
  ctx.shadowBlur = 4 * pixelRatio;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  if (curve?.aerial) ctx.setLineDash([11, 8]);
  if (curve) ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
  else ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - 15 * Math.cos(angle - .53), b.y - 15 * Math.sin(angle - .53));
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - 15 * Math.cos(angle + .53), b.y - 15 * Math.sin(angle + .53));
  ctx.stroke();
  ctx.restore();
}

function annotationBounds(ctx, annotation, {x, y}) {
  const lines = annotation.text.split('\n');
  ctx.font = '700 16px ' + canvasFont;
  const width = 16 + Math.min(270, Math.max(...lines.map((line) => ctx.measureText(line).width)));
  const height = lines.length * 20 + 8;
  return {x: x - width / 2, y: y - height / 2, width, height, lines};
}

function drawAnnotation(ctx, annotation, position, selected) {
  ctx.save();
  const {x, y, width, height, lines} = annotationBounds(ctx, annotation, position);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  if (annotation.background !== false) {
    ctx.fillStyle = '#192b22e8';
    ctx.fill();
  }
  if (selected && annotation.background !== false) {
    ctx.strokeStyle = '#fff1b5';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = annotation.color || '#fffdf8';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  lines.forEach((line, index) => ctx.fillText(line, position.x, y + 5 + index * 20, width - 16));
  ctx.restore();
}

function roleVisible(item, player) {
  if (player.showRole === true) return true;
  if (player.showRole === false) return false;
  return player.away ? item.rolesAway !== false : item.rolesHome !== false;
}

function drawBoard(ctx, item, {selected = null, draft = null, handles = null, marquee = null, pixelRatio = 1} = {}) {
  const locate = (point) => project(point, item.perspective);
  drawPitch(ctx, locate, pixelRatio, item.perspective);
  item.arrows.forEach((mark) => arrow(ctx, locate, mark, pixelRatio, selected?.has(mark)));
  if (draft) arrow(ctx, locate, draft, pixelRatio);
  const players = item.players.filter((player) => item.showAway || !player.away).sort((a, b) => a.y - b.y);
  const positions = players.map((player) => locate(player));
  for (const [index, player] of players.entries()) {
    const position = positions[index];
    const labelWidth = positions.reduce((width, other) => {
      if (other === position || Math.abs(other.y - position.y) >= 13) return width;
      return Math.max(33, Math.min(width, Math.abs(other.x - position.x) - 6));
    }, 108);
    jersey(ctx, player, position, selected?.has(player), item.perspective, roleVisible(item, player), pixelRatio, labelWidth);
  }
  if (item.ball && ballImage.naturalWidth) {
    const {x, y} = locate(item.ball);
    ctx.save();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(ballImage, x - 10, y - 10, 20, 20);
    if (selected?.has(item.ball)) {
      ctx.beginPath(); ctx.arc(x, y, 14, 0, 2 * Math.PI);
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff1b5'; ctx.stroke();
    }
    ctx.restore();
  }
  for (const annotation of item.texts) drawAnnotation(ctx, annotation, locate(annotation), selected?.has(annotation));
  if (handles) {
    ctx.save();
    ctx.fillStyle = '#fff5cc';
    ctx.strokeStyle = '#664713';
    ctx.lineWidth = 2;
    const endPoints = [handles.from, handles.to];
    if (handles.curve) {
      const a = locate(handles.from);
      const b = locate(handles.to);
      const control = handles.curve.control
        ? handles.curve.control
        : unproject(controlPoint(a, b, handles.curve, locate), 0);
      endPoints.push(control);
    }
    for (const point of endPoints) {
      const {x, y} = locate(point);
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  if (marquee) {
    ctx.save();
    ctx.fillStyle = '#f5e1ff36';
    ctx.strokeStyle = '#f5e1ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    const {x, y, width, height} = selectionBounds(marquee.start, marquee.end);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }
}

function draw() {
  for (const [phase, pitch] of Object.entries(pitches)) {
    const ctx = pitch.getContext('2d');
    ctx.clearRect(0, 0, pitchWidth, pitchHeight);
    const active = phase === activePhase;
    const item = active ? board : boards[phase];
    const marked = active && tool === 'move'
      ? gesture?.type === 'curve-control' ? gesture.arrow : singleSelection()
      : null;
    drawBoard(ctx, item, {
      selected: active ? selection : null,
      draft: active && gesture?.type === 'arrow' ? gesture : null,
      handles: marked?.from ? marked : null,
      marquee: active && gesture?.type === 'box' ? gesture : null
    });
  }
}

function renderControls() {
  for (const [phase, suffix] of [['Possesso', ''], ['Non possesso', '-out']]) {
    for (const side of ['home', 'away']) syncFormationSelect(byId(side + suffix), boards[phase][side]);
  }
  for (const [phase, suffix] of [['Possesso', '-home'], ['Non possesso', '-away']]) {
    for (const key of ['title', 'notes']) byId(key + suffix).value = boards[phase][key] || '';
  }
  const selectedPlayers = [...selection].filter((player) => board.players.includes(player));
  const selectedRoleSwitch = byId('selected-player-roles');
  selectedRoleSwitch.disabled = selectedPlayers.length === 0;
  selectedRoleSwitch.checked = selectedPlayers.length > 0 && selectedPlayers.every((player) => roleVisible(board, player));
  selectedRoleSwitch.indeterminate = selectedPlayers.some((player) => roleVisible(board, player))
    && selectedPlayers.some((player) => !roleVisible(board, player));
  byId('show-away').checked = boards.Possesso.showAway;
  byId('show-away-out').checked = boards['Non possesso'].showAway;
  for (const [id, phase] of [['roles-home', 'Possesso'], ['roles-away', 'Non possesso']]) {
    const target = boards[phase];
    const showHome = target.rolesHome !== false;
    const showAway = target.rolesAway !== false;
    const control = byId(id);
    control.checked = showHome && showAway;
    control.indeterminate = showHome !== showAway;
  }
  byId('undo').disabled = history.length === 0;
  for (const [id, phase] of [['view-home', 'Possesso'], ['view-away', 'Non possesso']]) {
    const button = byId(id);
    const perspective = boards[phase].perspective;
    button.lastChild.textContent = perspective ? 'Prospettiva' : 'Dall’alto';
    button.setAttribute('aria-label', perspective ? 'Passa alla vista dall’alto' : 'Passa alla prospettiva');
  }
  for (const [id, phase] of [['fullscreen-home', 'Possesso'], ['fullscreen-away', 'Non possesso']]) {
    const button = byId(id);
    const active = fullscreenPhase === phase;
    button.lastChild.textContent = active ? 'Esci da schermo intero' : 'Schermo intero';
    button.setAttribute('aria-label', active ? 'Esci dallo schermo intero del campo' : 'Apri il campo a schermo intero');
  }
  for (const button of document.querySelectorAll('[data-tool]')) {
    const pressed = button.dataset.tool === tool;
    button.setAttribute('aria-pressed', String(pressed));
  }
  for (const [phase, pitch] of Object.entries(pitches)) {
    pitch.dataset.mode = tool;
    pitch.closest('.pitch-panel').toggleAttribute('data-active', phase === activePhase);
  }
  const curve = singleSelection()?.curve;
  const settings = curve || curveSettings;
  byId('curve-options').hidden = tool !== 'curve' && !curve;
  byId('curve-height').value = settings.height;
  byId('height-value').value = settings.height + '%';
  byId('curve-aerial').checked = settings.aerial;
}

function setFullscreenPhase(phase) {
  fullscreenPhase = phase;
  document.body.classList.toggle('field-fullscreen', Boolean(phase));
  for (const pitch of Object.values(pitches)) {
    pitch.closest('.pitch-panel').toggleAttribute('data-fullscreen-active', Boolean(phase && pitches[phase] === pitch));
  }
  renderControls();
  draw();
}

async function toggleFieldFullscreen(phase) {
  if (fullscreenPhase === phase) {
    setFullscreenPhase(null);
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    return;
  }
  if (phase !== activePhase) {
    activatePhase(phase);
  }
  setFullscreenPhase(phase);
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    try { await document.documentElement.requestFullscreen(); } catch { /* The page layout remains fullscreen as a fallback. */ }
  }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && fullscreenPhase) setFullscreenPhase(null);
});

for (const [id, phase] of [['fullscreen-home', 'Possesso'], ['fullscreen-away', 'Non possesso']]) {
  byId(id).addEventListener('click', () => toggleFieldFullscreen(phase));
}

function syncFormationSelect(select, formation) {
  const legacyOption = [...select.options].find((option) => option.disabled);
  if (legacyOption?.value !== formation) legacyOption?.remove();
  if (!Object.hasOwn(formations, formation) && ![...select.options].some((option) => option.value === formation)) {
    const option = new Option(formation + ' (archiviato)', formation);
    option.disabled = true;
    select.add(option);
  }
  if (select !== document.activeElement) select.value = formation;
}

function activatePhase(phase) {
  if (phase === activePhase || gesture) return;
  boards[activePhase] = board;
  activePhase = phase;
  board = boards[phase];
  canvas = pitches[phase];
  history = histories[phase];
  selection.clear();
  update();
}

for (const [phase, suffix, button, resetButton] of [['Possesso', '', 'insert-home', 'reset-home'], ['Non possesso', '-out', 'insert-away', 'reset-away']]) {
  for (const side of ['home', 'away']) {
    const select = byId(side + suffix);
    for (const formation of Object.keys(formations)) select.add(new Option(formation, formation));
  }
  byId(button).addEventListener('click', () => {
    const previous = activePhase;
    activePhase = phase;
    board = boards[phase];
    history = histories[phase];
    const home = byId('home' + suffix).value;
    const away = byId('away' + suffix).value;
    remember();
    board.home = home;
    board.away = away;
    board.players = [...lineup(home, false), ...lineup(away, true)];
    spaceFormationLines(board.players, board.perspective);
    selection.clear();
    update();
    if (previous !== phase) {
      activePhase = previous;
      board = boards[previous];
      history = histories[previous];
      canvas = pitches[previous];
      update();
    }
  });
  byId(resetButton).addEventListener('click', () => {
    activatePhase(phase);
    remember();
    board = freshBoard(phase);
    selection.clear();
    tool = 'move';
    update();
  });
}
function chooseTool(mode) {
  tool = mode;
  selection.clear();
  renderControls();
  draw();
}
for (const button of document.querySelectorAll('[data-tool]')) {
  button.addEventListener('click', () => chooseTool(button.dataset.tool));
}
const rolesScopeDialog = byId('roles-scope-dialog');
const rolesScopeTitle = byId('roles-scope-title');
const rolesScopeDescription = byId('roles-scope-description');

function applyRoleScope(scope) {
  if (!rolesChoicePhase) return;
  const target = boards[rolesChoicePhase];
  remember(target);
  if (scope === 'all' || scope === 'home') target.rolesHome = false;
  if (scope === 'all' || scope === 'away') target.rolesAway = false;
  target.roles = target.rolesHome || target.rolesAway;
  if (activePhase === rolesChoicePhase) board = target;
  rolesScopeDialog.close();
  update();
}

byId('hide-roles-all').addEventListener('click', () => applyRoleScope('all'));
byId('hide-roles-home').addEventListener('click', () => applyRoleScope('home'));
byId('hide-roles-away').addEventListener('click', () => applyRoleScope('away'));
byId('cancel-roles-scope').addEventListener('click', () => rolesScopeDialog.close());
rolesScopeDialog.addEventListener('close', () => {
  rolesChoicePhase = null;
  renderControls();
});

for (const [id, phase] of [['roles-home', 'Possesso'], ['roles-away', 'Non possesso']]) {
  byId(id).addEventListener('change', () => {
    const target = boards[phase];
    const control = byId(id);
    if (control.checked) {
      remember(target);
      target.rolesHome = true;
      target.rolesAway = true;
      target.roles = true;
      if (phase === activePhase) board = target;
      update();
      return;
    }
    rolesChoicePhase = phase;
    const fieldName = phase === 'Possesso' ? 'Campo 1' : 'Campo 2';
    rolesScopeTitle.textContent = 'Nascondere i ruoli · ' + fieldName;
    rolesScopeDescription.textContent = 'Scegli a chi nascondere i ruoli in questo campo.';
    renderControls();
    rolesScopeDialog.showModal();
  });
}
for (const [id, phase] of [['view-home', 'Possesso'], ['view-away', 'Non possesso']]) {
  byId(id).addEventListener('click', () => {
    const target = boards[phase];
    remember(target);
    target.perspective = !target.perspective;
    if (activePhase === phase) board = target;
    update();
  });
}
for (const [id, phase] of [['show-away', 'Possesso'], ['show-away-out', 'Non possesso']]) {
  byId(id).addEventListener('change', () => {
    remember(boards[phase]);
    boards[phase].showAway = byId(id).checked;
    if (phase === activePhase) {
      board = boards[phase];
      for (const object of selection) if (object.away) selection.delete(object);
    }
    update();
  });
}
for (const [phase, suffix] of [['Possesso', '-home'], ['Non possesso', '-away']]) {
  for (const key of ['title', 'notes']) {
    byId(key + suffix).addEventListener('input', (event) => {
      boards[phase][key] = event.target.value;
      if (phase === activePhase) board = boards[phase];
      if (!persist()) notice('Il browser non ha potuto salvare le modifiche.');
    });
  }
}

function undo() {
  if (history.length === 0 || gesture) return;
  board = history.pop();
  selection.clear();
  update();
}
byId('undo').addEventListener('click', undo);

function pointer(event) {
  const bounds = canvas.getBoundingClientRect();
  return {x: (event.clientX - bounds.left) * pitchWidth / bounds.width,
    y: (event.clientY - bounds.top) * pitchHeight / bounds.height};
}

function distance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function visiblePlayers() {
  return board.players.filter((player) => board.showAway || !player.away);
}

function playerAt(location) {
  const nearest = visiblePlayers()
    .map((player) => ({player, gap: distance(location, project(player))}))
    .sort((a, b) => a.gap - b.gap)[0];
  return nearest?.gap <= 32 ? nearest.player : null;
}

function annotationAt(location) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  const annotation = board.texts.findLast((item) => {
    const {x, y, width, height} = annotationBounds(ctx, item, project(item));
    return location.x >= x && location.x <= x + width && location.y >= y && location.y <= y + height;
  });
  ctx.restore();
  return annotation;
}

function segmentDistance(point, first, second) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const squaredLength = dx * dx + dy * dy;
  if (!squaredLength) return distance(point, first);
  const t = Math.max(0, Math.min(1, ((point.x - first.x) * dx + (point.y - first.y) * dy) / squaredLength));
  return distance(point, {x: first.x + t * dx, y: first.y + t * dy});
}

function arrowDistance(location, {from, to, curve}) {
  const a = project(from);
  const b = project(to);
  if (!curve) return segmentDistance(location, a, b);
  const c = controlPoint(a, b, curve, (point) => project(point));
  let previous = a;
  let nearest = Infinity;
  for (let segment = 1; segment <= 24; segment++) {
    const t = segment / 24;
    const u = 1 - t;
    const point = {
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y
    };
    nearest = Math.min(nearest, segmentDistance(location, previous, point));
    previous = point;
  }
  return nearest;
}

function arrowAt(location, curvedOnly = false) {
  return board.arrows.findLast((mark) => (!curvedOnly || mark.curve) && arrowDistance(location, mark) < 16);
}

function ballAt(location) {
  return board.ball && distance(location, project(board.ball)) <= 15 ? board.ball : null;
}

function objectAt(location, includePlayers = true) {
  return annotationAt(location) || ballAt(location)
    || (includePlayers ? playerAt(location) : null) || arrowAt(location);
}

function objectPoints(object) {
  return object.from ? [object.from, object.to] : [object];
}

function deleteObjects(objects) {
  board.players = board.players.filter((player) => !objects.has(player));
  board.arrows = board.arrows.filter((mark) => !objects.has(mark));
  board.texts = board.texts.filter((annotation) => !objects.has(annotation));
  if (objects.has(board.ball)) board.ball = null;
  selection.clear();
}

function selectionBounds(first, second) {
  return {
    x: Math.min(first.x, second.x), y: Math.min(first.y, second.y),
    width: Math.abs(first.x - second.x), height: Math.abs(first.y - second.y)
  };
}

function selectInBox(box) {
  const {x, y, width, height} = selectionBounds(box.start, box.end);
  const inside = (position) => {
    const point = project(position);
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  };
  const objects = [...visiblePlayers(), ...board.arrows, ...board.texts];
  if (board.ball) objects.push(board.ball);
  selection.clear();
  for (const object of box.initial) selection.add(object);
  for (const object of objects) {
    if (objectPoints(object).every(inside)) selection.add(object);
  }
}

function capturePoints(points) {
  return points.map((ref) => ({ref, x: ref.x, y: ref.y}));
}

function movePoints(points, dx, dy) {
  let minX = -Infinity, minY = -Infinity, maxX = Infinity, maxY = Infinity;
  for (const point of points) {
    minX = Math.max(minX, .015 - point.x);
    maxX = Math.min(maxX, .985 - point.x);
    minY = Math.max(minY, .015 - point.y);
    maxY = Math.min(maxY, .985 - point.y);
  }
  const offsetX = Math.max(minX, Math.min(maxX, dx));
  const offsetY = Math.max(minY, Math.min(maxY, dy));
  for (const {ref, x, y} of points) {
    ref.x = x + offsetX;
    ref.y = y + offsetY;
    if (Number.isInteger(ref.lineIndex) && ref.lineIndex >= 0) ref.customPosition = true;
  }
}

function moveOrSelect(event, location) {
  const current = singleSelection();
  let handle = null;
  if (current?.from) {
    handle = [current.from, current.to].find((end) => distance(location, project(end)) <= 16);
    if (!handle && current.curve) {
      const control = current.curve.control
        ? project(current.curve.control)
        : controlPoint(project(current.from), project(current.to), current.curve, (point) => project(point));
      if (distance(location, control) <= 16) handle = 'curve-control';
    }
  }
  const object = handle ? current : objectAt(location);
  if (!object) {
    gesture = {
      type: 'box', pointerId: event.pointerId, start: location, end: location,
      initial: event.shiftKey ? [...selection] : [], previousSelection: [...selection]
    };
    if (!event.shiftKey) selection.clear();
    return;
  }
  if (!handle && event.shiftKey) {
    if (selection.has(object)) selection.delete(object);
    else selection.add(object);
    return;
  }
  if (!selection.has(object)) selectOnly(object);
  if (handle === 'curve-control') {
    gesture = {type: 'curve-control', pointerId: event.pointerId, arrow: current, start: location,
      original: structuredClone(board), moved: false};
    canvas.classList.add('dragging');
    return;
  }
  const points = handle ? [handle] : [...selection].flatMap(objectPoints);
  gesture = {
    type: 'move', pointerId: event.pointerId, start: location, origin: unproject(location, 0),
    original: structuredClone(board), points: capturePoints(points), moved: false
  };
  canvas.classList.add('dragging');
}

function startGesture(event, phase) {
  if (gesture || event.button !== 0) return;
  activatePhase(phase);
  const location = pointer(event);
  const position = unproject(location);
  if (tool !== 'move' && tool !== 'eraser' && distance(location, project(position)) > 15) return;
  canvas.focus({preventScroll: true});
  if (tool === 'ball') {
    remember();
    board.ball = position;
    selectOnly(board.ball);
    tool = 'move';
    update();
    return;
  }
  if (tool === 'text') {
    openTextEditor(position);
    return;
  }
  if (tool === 'eraser') {
    const object = objectAt(location, false);
    if (!object) return;
    remember();
    deleteObjects(new Set([object]));
    update();
    return;
  }
  if (tool === 'move') {
    moveOrSelect(event, location);
  } else {
    gesture = {type: 'arrow', pointerId: event.pointerId, from: position, to: position};
    if (tool === 'curve') gesture.curve = {...curveSettings, reverse: event.shiftKey};
  }
  if (gesture) canvas.setPointerCapture(event.pointerId);
  renderControls();
  draw();
}

function moveGesture(event) {
  if (gesture?.pointerId !== event.pointerId) return;
  const p = pointer(event);
  if (gesture.type === 'arrow') {
    gesture.to = unproject(p);
    if (gesture.curve) gesture.curve.reverse = event.shiftKey;
  } else if (gesture.type === 'box') {
    gesture.end = p;
    selectInBox(gesture);
  } else if (gesture.type === 'curve-control') {
    if (!gesture.moved && distance(p, gesture.start) < 2) return;
    gesture.moved = true;
    gesture.arrow.curve.control = unproject(p, .015);
  } else {
    if (!gesture.moved && distance(p, gesture.start) < 2) return;
    gesture.moved = true;
    const point = unproject(p, 0);
    movePoints(gesture.points, point.x - gesture.origin.x, point.y - gesture.origin.y);
  }
  draw();
}

function finishGesture(event, cancelled) {
  if (gesture?.pointerId !== event.pointerId) return;
  const completed = gesture;
  gesture = null;
  canvas.classList.remove('dragging');
  if (completed.type === 'move' && completed.moved) {
    if (cancelled) {
      board = completed.original;
      selection.clear();
    } else remember(completed.original);
  }
  if (completed.type === 'curve-control' && completed.moved) {
    if (cancelled) board = completed.original;
    else {
      remember(completed.original);
      selectOnly(completed.arrow);
    }
  }
  if (completed.type === 'box' && cancelled) {
    selection.clear();
    for (const object of completed.previousSelection) selection.add(object);
  }
  if (completed.type === 'arrow' && !cancelled) {
    if (distance(project(completed.from), project(completed.to)) >= 12) {
      remember();
      const mark = {from: completed.from, to: completed.to};
      if (completed.curve) mark.curve = completed.curve;
      board.arrows.push(mark);
      selectOnly(mark);
      tool = 'move';
    } else if (completed.curve) {
      selectOnly(arrowAt(project(completed.from), true));
    }
  }
  update();
}

function setCurveSetting(name, value) {
  const mark = singleSelection();
  curveSettings = {...curveSettings, ...(mark?.curve || {}), [name]: value};
  if (mark?.curve) {
    delete mark.curve.control;
    mark.curve[name] = value;
    update();
  } else renderControls();
}

const curveHeight = byId('curve-height');
curveHeight.addEventListener('input', () => {
  if (!resizingCurve && singleSelection()?.curve) remember();
  resizingCurve = true;
  setCurveSetting('height', Number(curveHeight.value));
});
for (const event of ['change', 'blur']) {
  curveHeight.addEventListener(event, () => { resizingCurve = false; });
}
byId('curve-aerial').addEventListener('change', (event) => {
  if (singleSelection()?.curve) remember();
  setCurveSetting('aerial', event.target.checked);
});

const displayRole = (player) => (player.roleText ?? roleLabels[player.role] ?? player.role).toLocaleUpperCase('it');
const editor = byId('player-editor');
const nameInput = byId('player-name');
const roleInput = byId('player-role');
const playerShowRoleInput = byId('player-show-role');
let playerRoleVisibilityEdited = false;
playerShowRoleInput.addEventListener('change', () => { playerRoleVisibilityEdited = true; });

function openPlayerEditor(player) {
  if (!player || editor.open) return;
  selectOnly(player);
  nameInput.value = player.name || '';
  roleInput.value = displayRole(player);
  playerShowRoleInput.checked = roleVisible(board, player);
  playerRoleVisibilityEdited = false;
  renderControls();
  draw();
  editor.showModal();
  nameInput.select();
}

byId('cancel-player-edit').addEventListener('click', () => editor.close());
editor.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const player = singleSelection();
  remember();
  player.name = nameInput.value.trim();
  player.roleText = roleInput.value.trim().toLocaleUpperCase('it');
  if (playerRoleVisibilityEdited) player.showRole = playerShowRoleInput.checked;
  editor.close();
  update();
});
byId('selected-player-roles').addEventListener('change', (event) => {
  const players = [...selection].filter((player) => board.players.includes(player));
  if (!players.length) return;
  remember();
  for (const player of players) player.showRole = event.target.checked;
  update();
});

const textEditor = byId('text-editor');
const textInput = byId('pitch-text');
const textBackgroundInput = byId('pitch-text-background');
const textColorInput = byId('pitch-text-color');
let pendingAnnotation;

function openTextEditor(annotation) {
  pendingAnnotation = annotation;
  const exists = board.texts.includes(annotation);
  if (exists) selectOnly(annotation);
  textInput.value = exists ? annotation.text : '';
  textBackgroundInput.checked = exists ? annotation.background !== false : true;
  textColorInput.value = exists ? annotation.color || '#fffdf8' : '#fffdf8';
  renderControls();
  draw();
  textEditor.showModal();
  textInput.select();
}

byId('cancel-text-edit').addEventListener('click', () => textEditor.close());
textEditor.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;
  remember();
  pendingAnnotation.text = text;
  pendingAnnotation.background = textBackgroundInput.checked;
  pendingAnnotation.color = textColorInput.value;
  if (!board.texts.includes(pendingAnnotation)) board.texts.push(pendingAnnotation);
  selectOnly(pendingAnnotation);
  tool = 'move';
  textEditor.close();
  update();
});

function addPlayer(away) {
  const spots = [0.13, 0.87, 0.25, 0.75, 0.5].flatMap((x) =>
    (away ? [0.14, 0.24, 0.33] : [0.86, 0.76, 0.67]).map((y) => ({x, y})));
  const position = spots.find((spot) => board.players.every((player) => distance(spot, player) >= 0.085)) || spots[0];
  remember();
  if (away) board.showAway = true;
  const player = {...position, role: '', name: '', away};
  board.players.push(player);
  selectOnly(player);
  tool = 'move';
  update();
  canvas.focus();
}

byId('add-home').addEventListener('click', () => addPlayer(false));
byId('add-away').addEventListener('click', () => addPlayer(true));

const movement = {ArrowLeft: [-.015, 0], ArrowRight: [.015, 0], ArrowUp: [0, -.02], ArrowDown: [0, .02]};
function handlePitchKey(event) {
  if (gesture) return;
  if (selection.size && (event.key === 'Delete' || event.key === 'Backspace')) {
    event.preventDefault();
    remember();
    deleteObjects(selection);
    update();
    return;
  }
  const current = singleSelection();
  if (current && event.key === 'F2') {
    event.preventDefault();
    if (board.players.includes(current)) openPlayerEditor(current);
    if (board.texts.includes(current)) openTextEditor(current);
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    const players = visiblePlayers();
    selectOnly(players.length ? players[(players.indexOf(current) + 1) % players.length] : null);
    renderControls();
    draw();
    return;
  }
  const delta = movement[event.key];
  if (!selection.size || !delta) return;
  event.preventDefault();
  remember();
  movePoints(capturePoints([...selection].flatMap(objectPoints)), ...delta);
  update();
}

for (const [phase, pitch] of Object.entries(pitches)) {
  pitch.addEventListener('focus', () => activatePhase(phase));
  pitch.addEventListener('pointerdown', (event) => startGesture(event, phase));
  pitch.addEventListener('pointermove', moveGesture);
  pitch.addEventListener('pointerup', (event) => finishGesture(event, false));
  pitch.addEventListener('pointercancel', (event) => finishGesture(event, true));
  pitch.addEventListener('lostpointercapture', (event) => finishGesture(event, true));
  pitch.addEventListener('dblclick', (event) => {
    if (phase !== activePhase || tool !== 'move') return;
    const location = pointer(event);
    const annotation = annotationAt(location);
    if (annotation) openTextEditor(annotation);
    else openPlayerEditor(playerAt(location));
  });
  pitch.addEventListener('keydown', handlePitchKey);
}

document.addEventListener('keydown', (event) => {
  if (editor.open || textEditor.open || event.target.matches('input,textarea,select') || byId('workspace').hidden) return;
  const key = event.key.toLowerCase();
  if (key === 'z' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    undo();
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const modes = {v: 'move', a: 'arrow', c: 'curve', b: 'ball', t: 'text', e: 'eraser'};
  if (Object.hasOwn(modes, key)) chooseTool(modes[key]);
});

function openSection(section) {
  for (const [name, id] of [['board', 'workspace'], ['archive', 'archive'], ['users', 'users']]) {
    const active = section === name;
    byId(id).hidden = !active;
    const tab = byId(name + '-tab');
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const id of ['save-possession', 'save-out', 'export-possession', 'export-out']) {
    byId(id).disabled = section !== 'board';
  }
  if (section === 'archive') renderArchive();
  if (section === 'users' && siteAccount?.role === 'admin') loadUsers();
}
byId('board-tab').addEventListener('click', () => openSection('board'));
byId('archive-tab').addEventListener('click', () => openSection('archive'));
byId('users-tab').addEventListener('click', () => openSection('users'));

function userStatus(message, isError = false) {
  const status = byId('users-status');
  status.textContent = message;
  status.dataset.error = String(isError);
}
function updateAdminUserOptions(users) {
  if (siteAccount?.role !== 'admin') return;
  siteAccount.users = users.map(({username, role}) => ({username, role}));
  const select = byId('admin-archive-user');
  if (!select) return;
  const selected = archiveOwner;
  select.replaceChildren(...users.map((user) => new Option(user.username + (user.role === 'admin' ? ' · admin' : '') + (user.active ? '' : ' · disattivato'), user.username)));
  select.value = selected;
}
async function loadUsers() {
  if (siteAccount?.role !== 'admin') return;
  userStatus('Caricamento account…');
  try {
    const response = await fetch('/api/users', {credentials: 'same-origin'});
    if (!response.ok) throw new Error('Impossibile caricare gli account.');
    const data = await response.json();
    const users = Array.isArray(data.users) ? data.users : [];
    updateAdminUserOptions(users);
    const list = byId('users-list');
    list.replaceChildren();
    for (const user of users) {
      const row = document.createElement('article');
      row.className = 'user-row';
      const name = document.createElement('strong'); name.textContent = user.username;
      const role = document.createElement('span'); role.className = 'user-role'; role.textContent = user.role === 'admin' ? 'Amministratore' : 'Utente';
      const state = document.createElement('span'); state.className = 'user-state'; state.textContent = user.active ? 'Attivo' : 'Disattivato';
      const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'button'; reset.textContent = 'Reimposta password';
      reset.addEventListener('click', () => {
        byId('user-password-name').textContent = 'Nuova password per ' + user.username;
        byId('reset-user-password').value = '';
        byId('user-password-dialog').dataset.username = user.username;
        byId('user-password-dialog').showModal();
      });
      const changeRole = document.createElement('button'); changeRole.type = 'button'; changeRole.className = 'button';
      const protectedAdmin = ['tordi', 'contran'].includes(user.username.toLowerCase());
      changeRole.textContent = user.role === 'admin' ? 'Rendi utente' : 'Rendi admin';
      changeRole.disabled = protectedAdmin && user.role === 'admin';
      if (changeRole.disabled) changeRole.title = 'Questo account deve restare amministratore.';
      changeRole.addEventListener('click', async () => {
        const nextRole = user.role === 'admin' ? 'user' : 'admin';
        const confirmation = nextRole === 'admin'
          ? 'Rendere ' + user.username + ' amministratore? Potrà gestire utenti e tutti gli archivi.'
          : 'Rimuovere i privilegi amministratore a ' + user.username + '?';
        if (!window.confirm(confirmation)) return;
        try {
          const result = await fetch('/api/users', {method: 'PUT', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: JSON.stringify({action: 'role', username: user.username, role: nextRole})});
          if (result.status === 409) throw new Error('Deve rimanere almeno un amministratore attivo.');
          if (!result.ok) throw new Error('Modifica del ruolo non riuscita.');
          userStatus(nextRole === 'admin' ? user.username + ' ora è amministratore.' : 'Privilegi amministratore rimossi da ' + user.username + '.');
          await loadUsers();
        } catch (error) { userStatus(error.message || 'Modifica del ruolo non riuscita.', true); }
      });
      const active = document.createElement('button'); active.type = 'button'; active.className = 'button';
      active.textContent = user.active ? 'Disattiva' : 'Riattiva';
      active.disabled = user.role === 'admin' || (protectedAdmin && user.active);
      if (protectedAdmin) active.title = 'Questo account deve restare attivo.';
      active.addEventListener('click', async () => {
        try {
          const result = await fetch('/api/users', {method: 'PUT', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: JSON.stringify({action: 'active', username: user.username, active: !user.active})});
          if (!result.ok) throw new Error('Modifica non riuscita.');
          userStatus(user.active ? 'Account disattivato. L’archivio è conservato.' : 'Account riattivato.');
          await loadUsers();
        } catch (error) { userStatus(error.message || 'Modifica non riuscita.', true); }
      });
      row.append(name, role, state, reset, changeRole, active);
      list.append(row);
    }
    userStatus(users.length ? 'Account caricati.' : 'Nessun account trovato.');
  } catch (error) { userStatus(error.message || 'Impossibile caricare gli account.', true); }
}
byId('user-create-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch('/api/users', {method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: byId('new-username').value, password: byId('new-user-password').value})});
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(response.status === 409 ? 'Questo nome utente è già utilizzato.' : result.error === 'invalid_user' ? 'Inserisci un nome utente valido e una password di almeno 8 caratteri.' : 'Creazione account non riuscita.');
    form.reset();
    userStatus('Account creato. Comunica al nuovo utente nome e password in modo sicuro.');
    await loadUsers();
  } catch (error) { userStatus(error.message || 'Creazione account non riuscita.', true); }
  finally { button.disabled = false; }
});
byId('user-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const dialog = byId('user-password-dialog');
  const username = dialog.dataset.username;
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch('/api/users', {method: 'PUT', credentials: 'same-origin', headers: {'content-type': 'application/json'}, body: JSON.stringify({action: 'password', username, password: byId('reset-user-password').value})});
    if (!response.ok) throw new Error(response.status === 400 ? 'La password deve contenere almeno 8 caratteri.' : 'Reimpostazione password non riuscita.');
    dialog.close();
    byId('reset-user-password').value = '';
    userStatus('Password reimpostata. Le sessioni precedenti dell’utente sono state chiuse.');
  } catch (error) { userStatus(error.message || 'Reimpostazione password non riuscita.', true); }
  finally { button.disabled = false; }
});
byId('cancel-user-password').addEventListener('click', () => byId('user-password-dialog').close());

function newBoard(phase = activePhase) {
  activatePhase(phase);
  remember();
  board = freshBoard(phase);
  selection.clear();
  chooseTool('move');
  update();
  openSection('board');
  byId(phase === 'Possesso' ? 'title-home' : 'title-away').focus();
}
byId('new-home').addEventListener('click', () => newBoard('Possesso'));
byId('new-away').addEventListener('click', () => newBoard('Non possesso'));
byId('archive-new').addEventListener('click', newBoard);

const displayTitle = (item) => item.title.trim() || item.phase + ' · ' + item.home;

function saveBoard(phase) {
  activatePhase(phase);
  const before = {board, saved};
  board = {...board, id: board.id || crypto.randomUUID()};
  const entry = {...structuredClone(board), updated: Date.now()};
  entry.folderIds = Array.isArray(entry.folderIds) ? entry.folderIds : [];
  saved = [entry, ...saved.filter((item) => item.id !== entry.id)];
  if (persist()) notice('Schema salvato nell’archivio.');
  else {
    ({board, saved} = before);
    notice('Il browser non ha potuto salvare lo schema.');
  }
}
byId('save-possession').addEventListener('click', () => saveBoard('Possesso'));
byId('save-out').addEventListener('click', () => saveBoard('Non possesso'));

function archiveButton(text, callback, primary = false) {
  const button = document.createElement('button');
  button.className = primary ? 'button primary' : 'button';
  button.textContent = text;
  button.addEventListener('click', callback);
  return button;
}

function openSaved(item, duplicate = false) {
  activatePhase(item.phase);
  remember();
  board = structuredClone(item);
  if (duplicate) {
    board.id = null;
    board.title = displayTitle(item) + ' (copia)';
  }
  selection.clear();
  chooseTool('move');
  update();
  openSection('board');
}

function renderArchive() {
  const list = byId('saved-list');
  const folderList = byId('archive-folders');
  list.replaceChildren();
  folderList.replaceChildren();
  const adminControls = byId('admin-archive-controls');
  if (siteAccount?.role === 'admin') {
    adminControls.hidden = false;
    const userSelect = byId('admin-archive-user');
    if (!userSelect.options.length) {
      for (const user of siteAccount.users || []) userSelect.add(new Option(user.username + (user.role === 'admin' ? ' · admin' : ''), user.username));
      userSelect.value = archiveOwner;
    }
  }
  const root = document.createElement('button');
  root.className = 'folder-open';
  root.textContent = 'Tutti gli schemi (' + saved.length + ')';
  root.setAttribute('aria-current', String(archiveFolderFilter === null));
  root.addEventListener('click', () => { archiveFolderFilter = null; renderArchive(); });
  folderList.append(root);
  const children = (parentId) => folders.filter((folder) => (folder.parentId || null) === parentId);
  const appendFolders = (parentId, depth) => {
    for (const folder of children(parentId)) {
      const row = document.createElement('div');
      row.className = 'folder-row';
      row.setAttribute('aria-current', String(archiveFolderFilter === folder.id));
      const open = document.createElement('button');
      open.className = 'folder-open';
      open.style.paddingLeft = (9 + depth * 15) + 'px';
      const childIds = new Set([folder.id]);
      const collectChildren = (parent) => children(parent).forEach((child) => { childIds.add(child.id); collectChildren(child.id); });
      collectChildren(folder.id);
      const count = saved.filter((item) => (item.folderIds || []).some((id) => childIds.has(id))).length;
      open.textContent = '▸ ' + folder.name + ' (' + count + ')';
      open.addEventListener('click', () => { archiveFolderFilter = folder.id; renderArchive(); });
      const rename = archiveButton('R', () => {
        const name = window.prompt('Nuovo nome della cartella', folder.name);
        if (!name?.trim()) return;
        folder.name = name.trim(); persist(); renderArchive();
      });
      rename.className = 'folder-action'; rename.setAttribute('aria-label', 'Rinomina ' + folder.name);
      const remove = archiveButton('×', () => {
        if (!window.confirm('Eliminare «' + folder.name + '»? Le sottocartelle saliranno di livello e gli schemi resteranno nell’archivio.')) return;
        const parent = folder.parentId || null;
        folders = folders.filter((entry) => entry.id !== folder.id).map((entry) => entry.parentId === folder.id ? {...entry, parentId: parent} : entry);
        saved = saved.map((item) => ({...item, folderIds: (item.folderIds || []).filter((id) => id !== folder.id)}));
        if (archiveFolderFilter === folder.id) archiveFolderFilter = parent;
        persist(); renderArchive();
      });
      remove.className = 'folder-action'; remove.setAttribute('aria-label', 'Elimina ' + folder.name);
      row.append(open, rename, remove); folderList.append(row); appendFolders(folder.id, depth + 1);
    }
  };
  appendFolders(null, 0);
  const breadcrumbs = byId('archive-breadcrumbs');
  breadcrumbs.replaceChildren();
  const homeCrumb = archiveButton(archiveFolderFilter === null ? 'Tutti gli schemi' : 'Archivio', () => { archiveFolderFilter = null; renderArchive(); });
  breadcrumbs.append(homeCrumb);
  if (archiveFolderFilter) {
    const current = folders.find((folder) => folder.id === archiveFolderFilter);
    const chain = [];
    let node = current;
    while (node) { chain.unshift(node); node = folders.find((folder) => folder.id === node.parentId); }
    for (const folder of chain) {
      const sep = document.createElement('span'); sep.textContent = '›'; breadcrumbs.append(sep);
      const crumb = archiveButton(folder.name, () => { archiveFolderFilter = folder.id; renderArchive(); });
      breadcrumbs.append(crumb);
    }
  }
  const query = byId('archive-search-name').value.trim().toLocaleLowerCase('it');
  const homeModule = byId('archive-search-home').value;
  const awayModule = byId('archive-search-away').value;
  const folderScope = new Set();
  if (archiveFolderFilter) {
    folderScope.add(archiveFolderFilter);
    const addChildren = (parent) => children(parent).forEach((child) => { folderScope.add(child.id); addChildren(child.id); });
    addChildren(archiveFolderFilter);
  }
  const visibleSaved = saved.filter((item) => {
    const titleMatch = !query || displayTitle(item).toLocaleLowerCase('it').includes(query);
    const homeMatch = !homeModule || item.home === homeModule;
    const awayMatch = !awayModule || item.away === awayModule;
    const folderMatch = !archiveFolderFilter || (item.folderIds || []).some((id) => folderScope.has(id));
    return titleMatch && homeMatch && awayMatch && folderMatch;
  });
  if (visibleSaved.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'panel empty';
    empty.textContent = saved.length ? 'Nessuno schema corrisponde ai filtri selezionati.' : 'Nessuno schema salvato. Dalla lavagna, seleziona «Salva schema» per aggiungere il primo.';
    list.append(empty);
    return;
  }
  for (const item of visibleSaved) {
    const card = document.createElement('article');
    card.className = 'panel';
    const heading = document.createElement('h2');
    heading.textContent = displayTitle(item);
    const detail = document.createElement('p');
    detail.textContent = [item.phase, item.home, item.showAway ? 'vs ' + item.away : ''].filter(Boolean).join(' · ');
    const tags = document.createElement('div');
    tags.className = 'saved-folders';
    for (const id of item.folderIds || []) {
      const folder = folders.find((entry) => entry.id === id);
      if (folder) { const tag = document.createElement('span'); tag.className = 'saved-folder-tag'; tag.textContent = folder.name; tags.append(tag); }
    }
    const actions = document.createElement('div');
    actions.className = 'saved-actions';
    const folderPicker = document.createElement('details');
    folderPicker.className = 'folder-picker';
    const summary = document.createElement('summary'); summary.textContent = 'Cartelle (' + (item.folderIds || []).length + ')'; folderPicker.append(summary);
    const options = document.createElement('div'); options.className = 'folder-picker-options';
    for (const folder of folders) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = (item.folderIds || []).includes(folder.id);
      const depth = (() => { let n = 0, parent = folder.parentId; while (parent) { n++; parent = folders.find((entry) => entry.id === parent)?.parentId; } return n; })();
      label.style.paddingLeft = (depth * 12) + 'px'; label.append(checkbox, document.createTextNode(folder.name));
      checkbox.addEventListener('change', () => {
        const ids = new Set(item.folderIds || []);
        checkbox.checked ? ids.add(folder.id) : ids.delete(folder.id);
        item.folderIds = [...ids]; persist(); renderArchive();
      });
      options.append(label);
    }
    folderPicker.append(options);
    actions.append(folderPicker,
      archiveButton('Apri', () => openSaved(item), true),
      archiveButton('Duplica', () => openSaved(item, true)),
      archiveButton('Elimina', () => {
        if (!window.confirm('Eliminare lo schema «' + displayTitle(item) + '»?')) return;
        const before = {board, saved};
        if (board.id === item.id) board = {...board, id: null};
        saved = saved.filter((entry) => entry.id !== item.id);
        if (!persist()) {
          ({board, saved} = before);
          notice('Il browser non ha potuto eliminare lo schema.');
        }
        renderArchive();
      })
    );
    card.append(heading, detail, tags, actions);
    list.append(card);
  }
}

let archiveFolderFilter = null;
for (const select of [byId('archive-search-home'), byId('archive-search-away')]) {
  for (const formation of Object.keys(formations)) select.add(new Option(formation, formation));
  select.addEventListener('change', renderArchive);
}
byId('archive-search-name').addEventListener('input', renderArchive);
byId('create-folder').addEventListener('click', () => {
  const name = window.prompt('Nome della cartella');
  if (!name?.trim()) return;
  folders.push({id: crypto.randomUUID(), name: name.trim(), parentId: null});
  persist();
  renderArchive();
});
byId('create-subfolder').addEventListener('click', () => {
  if (!archiveFolderFilter) { notice('Apri prima una cartella per creare una sottocartella.'); return; }
  const name = window.prompt('Nome della sottocartella');
  if (!name?.trim()) return;
  folders.push({id: crypto.randomUUID(), name: name.trim(), parentId: archiveFolderFilter});
  persist(); renderArchive();
});
if (siteAccount?.role === 'admin') {
  byId('admin-archive-user').addEventListener('change', async (event) => {
    const username = event.currentTarget.value;
    if (username === archiveOwner) return;
    if (!await flushRemoteSave()) { notice('Impossibile salvare prima di cambiare archivio.'); return; }
    try {
      const response = await fetch('/api/data?user=' + encodeURIComponent(username), {credentials: 'same-origin'});
      if (!response.ok) throw new Error('archive load failed');
      const next = await response.json();
      archiveOwner = username;
      boards.Possesso = refreshRoles(next?.boards?.Possesso) || freshBoard('Possesso');
      boards['Non possesso'] = refreshRoles(next?.boards?.['Non possesso']) || freshBoard('Non possesso');
      activePhase = next?.activePhase === 'Non possesso' ? 'Non possesso' : 'Possesso';
      board = boards[activePhase]; canvas = pitches[activePhase]; history = histories[activePhase];
      folders = Array.isArray(next?.folders) ? next.folders.filter((folder) => folder && typeof folder.id === 'string' && typeof folder.name === 'string').map((folder) => ({...folder, parentId: folder.parentId || null})) : [];
      const folderIds = new Set(folders.map((folder) => folder.id));
      saved = Array.isArray(next?.saved) ? next.saved.map(refreshRoles).filter(Boolean).map((item) => {
        item.folderIds = Array.isArray(item.folderIds) ? item.folderIds.filter((id) => folderIds.has(id))
          : item.folderId && folderIds.has(item.folderId) ? [item.folderId] : [];
        delete item.folderId;
        return item;
      }) : [];
      selection.clear(); archiveFolderFilter = null; update(); renderArchive();
    } catch { notice('Impossibile caricare questo archivio.'); }
  });
}
byId('logout').addEventListener('click', async () => {
  await flushRemoteSave();
  await fetch('/api/logout', {method: 'POST', credentials: 'same-origin'}).catch(() => {});
  window.location.assign('/');
});
if (siteAccount) {
  byId('account-name').textContent = siteAccount.username + (siteAccount.role === 'admin' ? ' · amministratore' : '');
  if (siteAccount.role === 'admin') byId('users-tab').hidden = false;
  if (importLegacyArchive) setTimeout(() => { persist(); notice('Archivio di questo browser importato nel tuo account.'); }, 500);
  window.addEventListener('pagehide', () => {
    if (!remoteSaveTimer) return;
    const query = siteAccount.role === 'admin' && archiveOwner !== siteAccount.username ? '?user=' + encodeURIComponent(archiveOwner) : '';
    navigator.sendBeacon('/api/data' + query, new Blob([JSON.stringify({boards, activePhase, saved, folders})], {type: 'application/json'}));
  });
}

function wrapNotes(context, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? line + ' ' + word : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    lines.push(line);
  }
  return lines;
}

async function exportBoard(phase) {
  activatePhase(phase);
  const item = structuredClone(board);
  const crest = document.querySelector('.pitch-crest');
  await Promise.allSettled([document.fonts.ready, ballImage.decode(), crest.decode()]);
  const copy = document.createElement('canvas');
  const output = copy.getContext('2d');
  const title = displayTitle(item);
  const textWidth = pitchWidth - 76;
  output.font = '20px ' + canvasFont;
  const notes = item.notes.trim() ? wrapNotes(output, item.notes.trim(), textWidth) : [];
  const height = 92 + pitchHeight + (notes.length ? 34 + notes.length * 29 : 0);
  const scale = Math.min(3, Math.sqrt(16_000_000 / (pitchWidth * height)), 8192 / height);
  copy.width = Math.floor(pitchWidth * scale);
  copy.height = Math.floor(height * scale);
  output.scale(scale, scale);
  output.fillStyle = '#f1ecf6';
  output.fillRect(0, 0, pitchWidth, height);
  output.fillStyle = '#2f1b43';
  output.font = '700 33px ' + canvasFont;
  output.fillText(title, 38, 43, textWidth);
  output.fillStyle = '#62477c';
  output.font = '18px ' + canvasFont;
  const subtitle = item.phase + ' · ' + item.home + (item.showAway ? ' vs ' + item.away : '');
  output.fillText(subtitle, 38, 72);
  output.save();
  output.translate(0, 92);
  drawBoard(output, item, {pixelRatio: scale});
  output.restore();
  output.imageSmoothingQuality = 'high';
  if (crest.naturalWidth) output.drawImage(crest, 38, 112, 64, 64);
  output.fillStyle = '#2f1b43';
  output.font = '20px ' + canvasFont;
  notes.forEach((line, index) => output.fillText(line, 38, 92 + pitchHeight + 22 + index * 29, textWidth));
  copy.toBlob((blob) => {
    if (!blob) {
      notice('Impossibile creare il PNG.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = (title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'schema') + '.png';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, 'image/png');
}
byId('export-possession').addEventListener('click', () => exportBoard('Possesso'));
byId('export-out').addEventListener('click', () => exportBoard('Non possesso'));

renderControls();
draw();
document.fonts.ready.then(() => draw());
ballImage.addEventListener('load', draw);
