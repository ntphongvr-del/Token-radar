/* Token Radar — board logic. Reads window.RADAR from data.js (written by
   main.ts from board.json). No network, no fetch: everything renders from
   that one object. Farm plans are generated here, per category, from the
   row itself; when a row already carries farm_steps, those are shown. */
(function () {
  'use strict';

  var root = document.getElementById('rows');
  var detailEl = document.getElementById('detail');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var data = window.RADAR;

  if (!data || !Array.isArray(data.rows) || data.rows.length === 0) {
    detailEl.innerHTML = '<p class="detail-hint">No board data loaded. The page needs data.js next to this dashboard folder.</p>';
    countEl.textContent = '';
    return;
  }

  var WATCH = new Set(Array.isArray(data.watchlist) ? data.watchlist : []);
  var MODEL = data.model || {};
  var BASE = typeof MODEL.base_multiple === 'number' ? MODEL.base_multiple : 0.25;

  var state = { view: 'board', q: '', cat: '', chain: '', sort: 'rank', dir: 1, watchOnly: false, selected: null };

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    if (n == null || !isFinite(n)) return '—';
    var abs = Math.abs(n);
    if (abs >= 1e9) return '$' + trimNum(n / 1e9) + 'B';
    if (abs >= 1e6) return '$' + trimNum(n / 1e6) + 'M';
    if (abs >= 1e3) return '$' + trimNum(n / 1e3) + 'K';
    return '$' + Math.round(n);
  }

  function trimNum(n) {
    var s = n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2);
    return s.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
  }

  function pct(v) {
    if (v == null || !isFinite(v)) return '—';
    return (v > 0 ? '+' : '') + v.toFixed(1) + '%';
  }

  function pctClass(v) {
    if (v == null) return 'flat';
    return v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
  }

  function ageLabel(days) {
    if (days == null || !isFinite(days)) return '—';
    if (days >= 365) return (days / 365).toFixed(1).replace(/\.0$/, '') + 'y';
    return days + 'd';
  }

  function chainOf(row) {
    return (row.chains && row.chains[0]) || 'its main chain';
  }

  /* ---------- farm plans, generated from the row ---------- */

  /* Cost and time are part of every step: a plan that hides them is a slogan. */
  function holdDays(row) {
    var age = row.age_days;
    if (age == null) return 60;
    return age < 180 ? 90 : 60;
  }

  /* The category-specific middle of the plan. Each entry: [text, cost, time]. */
  function coreSteps(row) {
    var name = row.name, chain = chainOf(row), cat = row.category || '';
    var HOLD = holdDays(row);
    switch (cat) {
      case 'Dexs':
        return [
          ['Swap $25 through a ' + name + ' pool on ' + chain + ', in one trade, so the wallet has a swap on record.', 'about $1 of gas', '5 minutes'],
          ['Add $100 of liquidity to a ' + name + ' pool on ' + chain + ' and keep the LP tokens in the same wallet.', '$100 stays in the pool', '10 minutes'],
          ['Remove a small slice of the LP position after a week, then add it back, so the wallet shows repeated pool use.', 'about $1 of gas', '10 minutes a week']
        ];
      case 'Lending':
        return [
          ['Supply $100 of a stablecoin to ' + name + ' on ' + chain + ' as collateral.', '$100 stays supplied', '10 minutes'],
          ['Borrow $20 against that supply on ' + name + ' and hold the loan open for at least a week.', 'borrow interest under $1 a week', '10 minutes'],
          ['Repay half the loan, then borrow $20 again, so the wallet shows supply and borrow activity in the same month.', 'about $1 of gas', '10 minutes a week']
        ];
      case 'Derivatives':
      case 'Perps':
      case 'Options':
        return [
          ['Open a $25 long or short on ' + name + ' on ' + chain + ' with low leverage, and close it the same day.', 'about $1 of gas plus the spread', '15 minutes'],
          ['Place one limit order on ' + name + ' and let it fill or cancel it after a day, so the wallet has order activity.', 'no fee until it fills', '10 minutes'],
          ['Repeat one small trade a week for a month instead of one large trade, so the activity spans several snapshots.', 'about $1 of gas a week', '15 minutes a week']
        ];
      case 'Bridge':
      case 'Canonical Bridge':
        return [
          ['Bridge $50 from ' + chain + ' to another chain ' + name + ' supports, in a single transfer.', 'bridge fee about $2', '15 minutes'],
          ['Bridge $25 back a week later, so the wallet has transfers in both directions.', 'bridge fee about $2', '15 minutes'],
          ['Use a second supported route once, so the wallet is not tied to a single pair of chains.', 'bridge fee about $2', '15 minutes']
        ];
      case 'Liquid Staking':
      case 'Liquid Restaking':
      case 'Restaking':
        return [
          ['Stake $50 of the base asset through ' + name + ' on ' + chain + ' and hold the receipt token in the same wallet.', '$50 stays staked', '10 minutes'],
          ['Use the receipt token once in a supported pool or vault, so the stake is visibly productive.', 'about $1 of gas', '15 minutes'],
          ['Add $25 more to the stake after two weeks, so the position grows instead of sitting once.', '$25 stays staked', '10 minutes']
        ];
      case 'Yield':
      case 'Yield Aggregator':
        return [
          ['Deposit $100 into a ' + name + ' vault on ' + chain + ' and leave it to compound.', '$100 stays in the vault', '10 minutes'],
          ['Claim or restake the vault yield once after two weeks, so the wallet shows a harvest.', 'about $1 of gas', '10 minutes'],
          ['Move $25 into a second ' + name + ' vault, so the wallet touches more than one of its products.', '$25 stays in the vault', '10 minutes']
        ];
      case 'RWA':
        return [
          ['Buy or mint $50 of ' + name + '’s tokenized asset on ' + chain + ' and hold it in the farming wallet.', '$50 stays held', '15 minutes'],
          ['Hold the asset through one full distribution or payout cycle, so the wallet is on record at payout time.', 'no extra fee', 'one payout cycle'],
          ['Sell or redeem a $10 slice after the cycle, then buy back in, so the wallet shows a complete round trip.', 'about $1 of gas', '15 minutes']
        ];
      case 'CDP':
        return [
          ['Lock $100 of collateral in a ' + name + ' vault on ' + chain + ' and mint $30 of its stablecoin.', '$100 stays locked', '10 minutes'],
          ['Repay $10 of the minted stablecoin after a week, then mint $10 again, so the vault is active across snapshots.', 'about $1 of gas', '10 minutes'],
          ['Keep the collateral ratio well above the liquidation line while the position is open.', 'no fee while healthy', holdDays(row) + ' days']
        ];
      default:
        return [
          ['Open ' + name + '’s main product on ' + chain + ' — its vault, pool or dashboard — and connect the farming wallet.', 'no fee to connect', '5 minutes'],
          ['Put $100 into that product and leave it working for at least two weeks.', '$100 stays in the product', '10 minutes'],
          ['Use a second feature of ' + name + ' once, such as a swap, a vote or a second pool, so the wallet is not single-action.', 'about $1 of gas', '15 minutes']
        ];
    }
  }

  /* A row's full plan: open, category core, weekly rhythm, hold, claim, log. */
  function farmPlan(row) {
    if (Array.isArray(row.farm_steps) && row.farm_steps.length >= 3) {
      return row.farm_steps.map(function (s) {
        return { text: String(s), cost: '', time: '' };
      });
    }
    var HOLD = holdDays(row);
    var steps = [
      { text: 'Open ' + row.name + ' on ' + chainOf(row) + ' and connect a fresh wallet you use only for farming this protocol.', cost: 'no fee to connect', time: '5 minutes' }
    ];
    coreSteps(row).forEach(function (s) {
      steps.push({ text: s[0], cost: s[1], time: s[2] });
    });
    steps.push(
      { text: 'Do one qualifying action a week — a deposit, a swap, a borrow or a vote — so the wallet stays active across snapshots.', cost: 'about $2 of gas a week', time: '10 minutes a week' },
      { text: 'Hold the position for at least ' + HOLD + ' days so the activity is counted in more than one snapshot.', cost: 'the money stays in the position', time: HOLD + ' days' },
      { text: 'Before you withdraw, open the protocol’s own points or rewards page from its own site and claim only from the link it publishes.', cost: 'no fee to check; never pay to claim', time: '10 minutes' },
      { text: 'Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.', cost: 'nothing but the log', time: '5 minutes' }
    );
    return steps;
  }

  /* ---------- header, stats, filters ---------- */

  var statsEl = document.getElementById('stats');
  statsEl.innerHTML =
    '<div><dt>Board rows</dt><dd>' + (data.board_size || data.rows.length) + '</dd></div>' +
    '<div><dt>Watchlist</dt><dd>' + (data.watchlist_size || WATCH.size) + '</dd></div>' +
    '<div><dt>Watchlist floor</dt><dd>' + money(data.floor_usd) + '</dd></div>' +
    '<div><dt>Data as of</dt><dd>' + esc(data.as_of || '—') + '</dd></div>';
  document.getElementById('asOf').textContent = data.as_of || '—';

  var growthNote = MODEL.growth_floor != null
    ? 'Growth is clamped between ' + MODEL.growth_floor + '% and ' + MODEL.growth_cap + '% over 7 days; maturity rises with age up to ' + (MODEL.maturity_days || 1095) + ' days.'
    : '';
  document.getElementById('method').textContent =
    'Model (' + (data.model_version || 'radar') + '): implied value = TVL × ' + BASE + ' base multiple × growth multiplier × maturity multiplier. ' + growthNote;

  document.getElementById('boardNote').textContent =
    'The watchlist is the floor, never the ceiling: ' + (data.early_size || 0) + ' of these rows sit below it — the early finds the radar exists to spot. Rows say the protocol “records no token”, never that it has none.';

  var catSel = document.getElementById('cat');
  var chainSel = document.getElementById('chain');
  var watchWrap = document.getElementById('watchOnlyWrap');
  var watchBox = document.getElementById('watchOnly');

  var cats = {}, chains = {};
  data.rows.forEach(function (r) {
    if (r.category) cats[r.category] = true;
    (r.chains || []).forEach(function (c) { chains[c] = true; });
  });
  Object.keys(cats).sort().forEach(function (c) {
    catSel.add(new Option(c, c));
  });
  Object.keys(chains).sort().forEach(function (c) {
    chainSel.add(new Option(c, c));
  });

  if (WATCH.size === 0) {
    watchBox.disabled = true;
    watchWrap.classList.add('is-disabled');
    watchWrap.title = 'The data file carries no watchlist, so this filter is off';
  }

  /* ---------- sorting ---------- */

  var COMPARATORS = {
    rank: function (a, b) { return a.rank - b.rank; },
    value: function (a, b) { return (b.implied_value_usd || 0) - (a.implied_value_usd || 0); },
    tvl: function (a, b) { return b.tvl_usd - a.tvl_usd; },
    change: function (a, b) { return (b.change_7d == null ? -Infinity : b.change_7d) - (a.change_7d == null ? -Infinity : a.change_7d); },
    age: function (a, b) { return (b.age_days == null ? -1 : b.age_days) - (a.age_days == null ? -1 : a.age_days); },
    name: function (a, b) { return String(a.name).localeCompare(String(b.name)); },
    mcap: function (a, b) { return (b.mcap_usd || 0) - (a.mcap_usd || 0); }
  };

  function sortedRows(rows) {
    var key = state.sort;
    var cmp = COMPARATORS[key] || COMPARATORS.rank;
    return rows.slice().sort(function (a, b) {
      var d = cmp(a, b);
      return state.dir === 1 ? d : -d;
    });
  }

  /* ---------- filtering ---------- */

  function currentRows() {
    var pool = state.view === 'live' ? (data.live || []) : data.rows;
    var q = state.q.trim().toLowerCase();
    return pool.filter(function (r) {
      if (q && String(r.name).toLowerCase().indexOf(q) === -1 && String(r.slug).toLowerCase().indexOf(q) === -1) return false;
      if (state.cat && r.category !== state.cat) return false;
      if (state.chain && (r.chains || []).indexOf(state.chain) === -1) return false;
      if (state.watchOnly && !WATCH.has(r.slug)) return false;
      return true;
    });
  }

  /* ---------- rendering ---------- */

  function rowHtml(r, i) {
    var live = state.view === 'live';
    var valueCell = live ? money(r.mcap_usd) : money(r.implied_value_usd);
    var rankCell = live ? (i + 1) : r.rank;
    var sub = esc(r.category || 'No category') + ' · ' + esc((r.chains || []).slice(0, 3).join(', ')) + ((r.chains || []).length > 3 ? ' +' + ((r.chains || []).length - 3) : '');
    var watchTag = WATCH.has(r.slug) ? '<span class="pill">Watchlist</span>' : '';
    return '<tr data-slug="' + esc(r.slug) + '" tabindex="0" class="' + (state.selected === r.slug ? 'is-selected' : '') + '">' +
      '<td class="rank">' + rankCell + '</td>' +
      '<td><div class="p-name">' + esc(r.name) + watchTag + '</div><div class="p-sub">' + sub + '</div></td>' +
      '<td class="num">' + money(r.tvl_usd) + '</td>' +
      '<td class="num ' + pctClass(r.change_7d) + '">' + pct(r.change_7d) + '</td>' +
      '<td class="num"><b>' + valueCell + '</b></td>' +
      '<td class="num">' + ageLabel(r.age_days) + '</td></tr>';
  }

  function render() {
    var rows = sortedRows(currentRows());
    root.innerHTML = rows.map(rowHtml).join('');
    emptyEl.hidden = rows.length > 0;
    var total = state.view === 'live' ? (data.live || []).length : data.rows.length;
    countEl.textContent = 'Showing ' + rows.length + ' of ' + total;
    document.querySelectorAll('#board thead button').forEach(function (b) {
      var key = b.getAttribute('data-sort');
      b.removeAttribute('aria-sort');
      if (key === state.sort) b.setAttribute('aria-sort', state.dir === 1 ? 'ascending' : 'descending');
    });
  }

  function detailHtml(r) {
    var live = state.view === 'live';
    var badge = live
      ? '<span class="badge live">Token live</span>'
      : '<span class="badge pre">Records no token</span>';
    var kicker = live ? 'Live token · by market cap' : 'Rank ' + r.rank + ' of ' + data.rows.length + ' · pre-token';
    var valueLabel = live ? 'Market cap' : 'Implied value';
    var value = live ? money(r.mcap_usd) : money(r.implied_value_usd);
    var valueSub = live
      ? 'TVL ' + money(r.tvl_usd) + ' · mcap/TVL ' + (r.tvl_usd ? (r.mcap_usd / r.tvl_usd).toFixed(2) + '×' : '—')
      : 'TVL ' + money(r.tvl_usd) + ' × ' + BASE + ' base';
    var growth = r.growth_multiplier, maturity = r.maturity_multiplier;
    var math = '';
    if (!live && growth != null && maturity != null) {
      math = '<h3>How the value is built</h3><p class="model-math">' +
        money(r.tvl_usd) + ' TVL × <b>' + BASE + '</b> base × <b>' + growth.toFixed(4) + '</b> growth × <b>' + maturity.toFixed(4) + '</b> maturity = <b>' + money(r.implied_value_usd) + '</b></p>' +
        '<p class="tagline">Growth follows the 7-day TVL change (' + pct(r.change_7d) + '); maturity follows age (' + ageLabel(r.age_days) + ' since ' + esc(r.listed_at || 'first tracked') + ').</p>';
    } else if (!live) {
      math = '<h3>How the value is built</h3><p class="tagline">Implied value = TVL × ' + BASE + ' base multiple × growth multiplier × maturity multiplier. The data file carries no multipliers for this row.</p>';
    }

    var stepsHtml;
    if (live) {
      stepsHtml = '<h3>Farm plan</h3><p class="tagline">This protocol’s token already trades, so there is no pre-token farm plan here. It is listed as a reference: the board’s pre-token rows are the ones to farm.</p>';
    } else {
      var steps = farmPlan(r);
      stepsHtml = '<h3>Farm plan · ' + steps.length + ' steps</h3><ol class="steps">' +
        steps.map(function (s) {
          var meta = [s.cost, s.time].filter(Boolean).join(' · ');
          return '<li><div><p>' + esc(s.text) + '</p>' + (meta ? '<p class="meta">' + esc(meta) + '</p>' : '') + '</div></li>';
        }).join('') + '</ol>' +
        '<button type="button" class="copy-btn" id="copyPlan">Copy farm plan</button>';
    }

    return '<p class="kicker">' + esc(kicker) + '</p>' +
      '<h2>' + esc(r.name) + '</h2>' +
      '<p class="tagline">' + badge + ' ' + esc(r.category || 'No category') + '</p>' +
      '<div class="chips">' + (r.chains || []).map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<dl class="kv">' +
      '<div><dt>' + valueLabel + '</dt><dd>' + value + '<small>' + esc(valueSub) + '</small></dd></div>' +
      '<div><dt>TVL</dt><dd>' + money(r.tvl_usd) + '<small>7-day ' + pct(r.change_7d) + '</small></dd></div>' +
      '<div><dt>Listed</dt><dd>' + esc(r.listed_at || '—') + '<small>' + ageLabel(r.age_days) + ' old</small></dd></div>' +
      '<div><dt>Chains</dt><dd>' + (r.chains || []).length + '<small>' + esc(chainOf(r)) + ' first</small></dd></div>' +
      '</dl>' + math + stepsHtml;
  }

  function select(slug) {
    state.selected = slug;
    var pool = state.view === 'live' ? (data.live || []) : data.rows;
    var row = null;
    for (var i = 0; i < pool.length; i++) if (pool[i].slug === slug) { row = pool[i]; break; }
    if (!row) return;
    detailEl.innerHTML = detailHtml(row);
    var copyBtn = document.getElementById('copyPlan');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var steps = farmPlan(row);
        var text = row.name + ' — farm plan (Token Radar, data as of ' + (data.as_of || '') + ')\n' +
          steps.map(function (s, i) {
            var meta = [s.cost, s.time].filter(Boolean).join(' · ');
            return (i + 1) + '. ' + s.text + (meta ? ' [' + meta + ']' : '');
          }).join('\n');
        var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy farm plan'; }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { copyBtn.textContent = 'Copy failed — select the text'; });
        } else {
          copyBtn.textContent = 'Copy failed — select the text';
        }
      });
    }
    document.querySelectorAll('#rows tr').forEach(function (tr) {
      tr.classList.toggle('is-selected', tr.getAttribute('data-slug') === slug);
    });
    if (window.matchMedia('(max-width: 900px)').matches) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- events ---------- */

  root.addEventListener('click', function (e) {
    var tr = e.target.closest('tr');
    if (tr) select(tr.getAttribute('data-slug'));
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var tr = e.target.closest('tr');
    if (tr) { e.preventDefault(); select(tr.getAttribute('data-slug')); }
  });

  document.querySelectorAll('#board thead button').forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-sort');
      if (state.sort === key) { state.dir = -state.dir; }
      else { state.sort = key; state.dir = 1; }
      var sortSel = document.getElementById('sort');
      if (COMPARATORS[key]) sortSel.value = key === 'value' ? 'rank' : key;
      render();
    });
  });

  document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value; render(); });
  catSel.addEventListener('change', function (e) { state.cat = e.target.value; render(); });
  chainSel.addEventListener('change', function (e) { state.chain = e.target.value; render(); });
  document.getElementById('sort').addEventListener('change', function (e) {
    state.sort = e.target.value;
    state.dir = 1;
    render();
  });
  watchBox.addEventListener('change', function (e) { state.watchOnly = e.target.checked; render(); });

  document.querySelectorAll('.view-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.view = b.getAttribute('data-view');
      state.selected = null;
      detailEl.innerHTML = '<p class="detail-hint">Select a row to see the protocol’s detail and farm plan.</p>';
      document.querySelectorAll('.view-btn').forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var head = document.querySelector('#board thead tr').children;
      head[4].firstChild.textContent = state.view === 'live' ? 'Market cap' : 'Implied value';
      head[0].firstChild.textContent = state.view === 'live' ? '#' : 'Rank';
      if (state.view === 'live' && state.sort === 'rank') { state.sort = 'mcap'; }
      if (state.view === 'board' && state.sort === 'mcap') { state.sort = 'rank'; }
      render();
    });
  });

  /* ---------- first paint ---------- */
  render();
  if (data.rows.length > 0) select(data.rows[0].slug);
})();
