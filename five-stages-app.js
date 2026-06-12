/**
 * SkillGrade Process State Machine Visualizer
 * Controls nodes, connector paths, particles, and inspector cards.
 */

// ── Preset Scenario Data ──
const presets = {
  sqlite: {
    name: 'sqlite_helper.json',
    task: 'Search the database for customer orders from last month and format as a table.',
    iterations: {
      1: {
        guidelines: `# Guidelines for SQLite Helper
- Use SQLite for structured data queries.
- Ensure you handle all error cases gracefully.`,
        metrics: { success: 'No', adherence: '33%', violations: '2', score: '35' },
        status: 'FAILED',
        trajectory: [
          { type: 'thought', content: 'I need to find customer orders from last month. Let\'s inspect the tables in the database first.' },
          { type: 'tool_call', content: 'list_tables()' },
          { type: 'tool_output', content: '["orders", "customers", "products"]' },
          { type: 'thought', content: 'Okay, we have an orders table. Let\'s fetch all records to inspect the column names and data format.' },
          { type: 'tool_call', content: 'execute_query(sql="SELECT * FROM orders")' },
          { type: 'tool_output', content: '[{"id": 1, "customer_id": 12, "order_date": "2026-05-15", "amount": 120.50}, {"id": 2, "customer_id": 8, "order_date": "2026-05-18", "amount": 45.00}, {"id": 3, "customer_id": 15, "order_date": "2026-06-02", "amount": 310.00}]' },
          { type: 'thought', content: 'We need orders from last month (May 2026). I\'ll filter the query by order_date.' },
          { type: 'tool_call', content: 'execute_query(sql="SELECT * FROM orders WHERE order_date >= \'2026-05-01\' AND order_date <= \'2026-05-31\'")' },
          { type: 'tool_output', content: '[{"id": 1, "customer_id": 12, "order_date": "2026-05-15", "amount": 120.50}, {"id": 2, "customer_id": 8, "order_date": "2026-05-18", "amount": 45.00}]' },
          { type: 'thought', content: 'Data is retrieved. I will format these orders in a markdown table and present them.' },
          { type: 'response', content: 'Here are the customer orders from last month (May 2026):\n\n| ID | Customer ID | Date | Amount |\n|---|---|---|---|\n| 1 | 12 | 2026-05-15 | $120.50 |\n| 2 | 8 | 2026-05-18 | $45.00 |' }
        ],
        findings: [
          { type: 'violation', title: 'Performance: Redundant Wildcard Query', desc: 'The agent used "SELECT *" in Step 2, fetching all columns and rows without limit. This causes massive memory overhead on large tables.' },
          { type: 'violation', title: 'Safety: Missing Read-Only Transaction', desc: 'The query in Step 3 was run directly. In production, read operations should be wrapped in read-only transactions to avoid locking issues.' }
        ],
        diff: [
          { action: 'normal', text: '# Guidelines for SQLite Helper' },
          { action: 'normal', text: '- Use SQLite for structured data queries.' },
          { action: 'normal', text: '- Ensure you handle all error cases gracefully.' },
          { action: 'added', text: '- NEVER select * from database tables. Always list the explicit columns you require.' },
          { action: 'added', text: '- Wrap all read-only queries in transactions (e.g. BEGIN TRANSACTION; ... COMMIT;) to guarantee consistency.' }
        ]
      },
      2: {
        guidelines: `# Guidelines for SQLite Helper
- Use SQLite for structured data queries.
- Ensure you handle all error cases gracefully.
- NEVER select * from database tables. Always list the explicit columns you require.
- Wrap all read-only queries in transactions (e.g. BEGIN TRANSACTION; ... COMMIT;) to guarantee consistency.`,
        metrics: { success: 'Yes', adherence: '100%', violations: '0', score: '100' },
        status: 'PASSED',
        trajectory: [
          { type: 'thought', content: 'I need to find customer orders from last month. First, let\'s query table metadata to find the exact column names, avoiding wildcard queries.' },
          { type: 'tool_call', content: 'execute_query(sql="PRAGMA table_info(orders);")' },
          { type: 'tool_output', content: '[{"cid": 0, "name": "id", "type": "INTEGER"}, {"cid": 1, "name": "customer_id", "type": "INTEGER"}, {"cid": 2, "name": "order_date", "type": "TEXT"}, {"cid": 3, "name": "amount", "type": "REAL"}]' },
          { type: 'thought', content: 'I have the column names: id, customer_id, order_date, amount. Now I will retrieve last month\'s orders (May 2026) using explicit columns inside a read-only transaction block.' },
          { type: 'tool_call', content: 'execute_query(sql="BEGIN TRANSACTION; SELECT id, customer_id, order_date, amount FROM orders WHERE order_date >= \'2026-05-01\' AND order_date <= \'2026-05-31\'; COMMIT;")' },
          { type: 'tool_output', content: '[{"id": 1, "customer_id": 12, "order_date": "2026-05-15", "amount": 120.50}, {"id": 2, "customer_id": 8, "order_date": "2026-05-18", "amount": 45.00}]' },
          { type: 'thought', content: 'The query executed perfectly, following all guideline constraints. I will now render the table.' },
          { type: 'response', content: 'Here are the customer orders from last month (May 2026):\n\n| ID | Customer ID | Date | Amount |\n|---|---|---|---|\n| 1 | 12 | 2026-05-15 | $120.50 |\n| 2 | 8 | 2026-05-18 | $45.00 |' }
        ],
        findings: [
          { type: 'success', title: 'Aesthetic & Safe Queries', desc: 'No wildcard operations found. All database fetches were made with explicit column specifications.' },
          { type: 'success', title: 'Transactional Security', desc: 'Read-only queries were correctly encapsulated in transaction statements, adhering to consistency rules.' }
        ],
        diff: []
      }
    }
  },
  git: {
    name: 'git_helper.json',
    task: 'Commit the current changes and push them to the remote main branch.',
    iterations: {
      1: {
        guidelines: `# Guidelines for Git Assistant
- Use git commands to manage codebase versions.
- Always write descriptive commit messages.`,
        metrics: { success: 'No', adherence: '50%', violations: '2', score: '45' },
        status: 'FAILED',
        trajectory: [
          { type: 'thought', content: 'I need to check the status of the local repository to see what changes are outstanding.' },
          { type: 'tool_call', content: 'run_command(cmd="git status")' },
          { type: 'tool_output', content: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n\tmodified:   index.html\n\nno changes added to commit' },
          { type: 'thought', content: 'I will stage the modified index.html file and commit it with a descriptive message.' },
          { type: 'tool_call', content: 'run_command(cmd="git add index.html && git commit -m \'update UI\'")' },
          { type: 'tool_output', content: '[main 3d4a2b1] update UI\n 1 file changed, 10 insertions(+), 5 deletions(-)' },
          { type: 'thought', content: 'Now I will push the committed changes to the remote repository.' },
          { type: 'tool_call', content: 'run_command(cmd="git push origin main")' },
          { type: 'tool_output', content: 'To github.com:user/project.git\n ! [rejected]        main -> main (non-fast-forward)\nerror: failed to push some refs\nhint: Updates were rejected because the remote contains work\nhint: that you do not have locally.', isError: true },
          { type: 'thought', content: 'The push failed because there are remote changes. I need to report this conflict error back to the user.' },
          { type: 'response', content: 'I committed your changes with message "update UI", but I was unable to push because the remote branch contains modifications you don\'t have locally. Please resolve this git conflict.' }
        ],
        findings: [
          { type: 'violation', title: 'Resilience: Missing Remote Pull', desc: 'The agent attempted to push without doing a "git pull" first, failing to check for remote history updates.' },
          { type: 'violation', title: 'Quality: Loose Commit Convention', desc: 'The agent used "update UI" as a commit message, violating Conventional Commit practices.' }
        ],
        diff: [
          { action: 'normal', text: '# Guidelines for Git Assistant' },
          { action: 'normal', text: '- Use git commands to manage codebase versions.' },
          { action: 'normal', text: '- Always write descriptive commit messages.' },
          { action: 'added', text: '- ALWAYS pull remote changes (e.g. git pull --rebase) immediately before pushing.' },
          { action: 'added', text: '- Ensure commit messages use conventional commit format (e.g. feat:, fix:).' }
        ]
      },
      2: {
        guidelines: `# Guidelines for Git Assistant
- Use git commands to manage codebase versions.
- Always write descriptive commit messages.
- ALWAYS pull remote changes (e.g. git pull --rebase) immediately before pushing.
- Ensure commit messages use conventional commit format (e.g. feat:, fix:).`,
        metrics: { success: 'Yes', adherence: '100%', violations: '0', score: '100' },
        status: 'PASSED',
        trajectory: [
          { type: 'thought', content: 'Let\'s check repository status to see the current changes.' },
          { type: 'tool_call', content: 'run_command(cmd="git status")' },
          { type: 'tool_output', content: 'On branch main\nChanges not staged for commit:\n\tmodified:   index.html' },
          { type: 'thought', content: 'I must stage and commit this file. Based on the new guidelines, I will use a Conventional Commit format message.' },
          { type: 'tool_call', content: 'run_command(cmd="git add index.html && git commit -m \'feat: update visualization dashboard layout\'")' },
          { type: 'tool_output', content: '[main 5c9e2d1] feat: update visualization dashboard layout\n 1 file changed, 10 insertions(+), 5 deletions(-)' },
          { type: 'thought', content: 'Before pushing, I must pull any remote updates to keep history linear and prevent push failures.' },
          { type: 'tool_call', content: 'run_command(cmd="git pull origin main --rebase")' },
          { type: 'tool_output', content: 'remote: Enumerating objects: 5, done.\nremote: Counting objects: 100% (5/5), done.\nSuccessfully rebased and updated refs/heads/main.' },
          { type: 'thought', content: 'History is synchronized. I can safely push the commit.' },
          { type: 'tool_call', content: 'run_command(cmd="git push origin main")' },
          { type: 'tool_output', content: 'To github.com:user/project.git\n   4d5e6f7..5c9e2d1  main -> main' },
          { type: 'thought', content: 'Push completed successfully. I will notify the user.' },
          { type: 'response', content: 'Successfully pulled remote changes, committed with conventional formatting ("feat: update visualization dashboard layout"), and pushed to main!' }
        ],
        findings: [
          { type: 'success', title: 'Correct Git Workflow', desc: 'Agent pulled remote changes before pushing, resolving potential conflict states preemptively.' },
          { type: 'success', title: 'Structured Commit Messages', desc: 'Commit message followed Conventional Commit standard correctly.' }
        ],
        diff: []
      }
    }
  }
};

// ── Application State ──
let state = {
  currentPreset: 'sqlite',
  currentIteration: 1,
  currentStep: 0,
  isPlaying: false,
  speed: 3,
  terminalTimer: null,
  simTimer: null,
  activeTrajectoryStep: 0,
  activeInspectorTab: 0
};

const speedIntervals = { 1: 2200, 2: 1500, 3: 1000, 4: 500, 5: 100 };

// ── DOM Elements ──
const $ = id => document.getElementById(id);

const presetSelector = $('preset-selector');
const btnPlayPause = $('btn-play-pause');
const playIcon = $('play-icon');
const pauseIcon = $('pause-icon');
const playBtnText = $('play-btn-text');
const btnStep = $('btn-step');
const btnReset = $('btn-reset');
const speedSlider = $('speed-slider');
const speedVal = $('speed-val');
const iterIndicator = $('iter-indicator');
const iterIndicatorText = $('iter-indicator-text');
const guidelinesText = $('guidelines-text');
const inspectorSkillName = $('inspector-skill-name');
const inspectorTaskDesc = $('inspector-task-desc');
const agentActiveTyping = $('agent-active-typing');
const terminalAgentBody = $('terminal-agent-body');
const terminalTrajectoryBody = $('terminal-trajectory-body');
const scoreBadge = $('score-badge');
const valSuccess = $('val-success');
const valAdherence = $('val-adherence');
const valViolations = $('val-violations');
const valScore = $('val-score');
const findingsWrapper = $('findings-wrapper');
const diffWrapper = $('diff-wrapper');

// ── View Transition Helper ──
function transitionUpdate(cb) {
  if (document.startViewTransition) {
    try {
      const t = document.startViewTransition(cb);
      if (t.ready) t.ready.catch(() => {});
      if (t.updateCallbackDone) t.updateCallbackDone.catch(() => {});
      if (t.finished) t.finished.catch(() => {});
    } catch (e) {
      cb();
    }
  } else {
    cb();
  }
}

// ── Init ──
function init() {
  setupEventListeners();
  loadPreset(state.currentPreset);
  updateStateMachineUI();
}

// ── Event Listeners ──
function setupEventListeners() {
  presetSelector.addEventListener('change', e => {
    state.currentPreset = e.target.value;
    resetSimulation();
  });

  btnPlayPause.addEventListener('click', togglePlay);
  btnStep.addEventListener('click', () => { pause(); advanceStep(); });
  btnReset.addEventListener('click', resetSimulation);

  speedSlider.addEventListener('input', e => {
    state.speed = parseInt(e.target.value);
    speedVal.innerText = `${(state.speed * 0.5 + 0.5).toFixed(1)}x`;
    if (state.isPlaying) { pause(); play(); }
  });

  // Node clicks
  document.querySelectorAll('.state-node').forEach(node => {
    node.addEventListener('click', () => {
      pause();
      jumpToNode(parseInt(node.dataset.node));
    });
  });

  // Tab clicks
  document.querySelectorAll('.inspector-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      switchInspectorTab(parseInt(tab.dataset.tab));
    });
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    if (document.activeElement === guidelinesText) return;
    switch (e.code) {
      case 'Space':
        e.preventDefault(); togglePlay(); break;
      case 'ArrowRight': case 'PageDown':
        e.preventDefault(); pause(); advanceStep(); break;
      case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); pause(); jumpToNode((state.currentStep - 1 + 5) % 5); break;
      case 'KeyR':
        resetSimulation(); break;
      case 'Digit1':
        switchIteration(1); break;
      case 'Digit2':
        switchIteration(2); break;
      case 'KeyS':
        presetSelector.value = 'sqlite'; presetSelector.dispatchEvent(new Event('change')); break;
      case 'KeyG':
        presetSelector.value = 'git'; presetSelector.dispatchEvent(new Event('change')); break;
    }
  });
}

// ── Load Preset ──
function loadPreset(presetKey) {
  const preset = presets[presetKey];
  const iterData = preset.iterations[state.currentIteration];

  inspectorSkillName.innerText = preset.name;
  guidelinesText.value = iterData.guidelines;
  inspectorTaskDesc.innerText = preset.task;

  // Iteration indicator
  if (state.currentIteration === 1) {
    iterIndicator.className = 'iter-indicator-pill iter-1';
    iterIndicatorText.innerText = 'Iteration 1 — Failing';
  } else {
    iterIndicator.className = 'iter-indicator-pill iter-2';
    iterIndicatorText.innerText = 'Iteration 2 — Passing';
  }

  // Clear panels
  clearTerminalAgent();
  clearTerminalTrajectory();
  findingsWrapper.innerHTML = '<div style="color:var(--text-muted);font-size:0.75rem;text-align:center;padding:2rem 0;">Evaluation pending.</div>';
  diffWrapper.innerHTML = '<div style="color:var(--text-muted);font-size:0.75rem;text-align:center;margin-top:3rem;">No optimizations computed.</div>';

  scoreBadge.innerText = 'Pending';
  scoreBadge.className = 'badge';
  valSuccess.innerText = '–';
  valAdherence.innerText = '–';
  valViolations.innerText = '–';
  valScore.innerText = '–';
}

// ── Playback Controls ──
function togglePlay() {
  state.isPlaying ? pause() : play();
}

function play() {
  state.isPlaying = true;
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
  playBtnText.innerText = 'Pause';
  runLoop();
}

function pause() {
  state.isPlaying = false;
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
  playBtnText.innerText = 'Run';
  clearTimeout(state.simTimer);
  clearTimeout(state.terminalTimer);
}

function resetSimulation() {
  pause();
  transitionUpdate(() => {
    state.currentIteration = 1;
    state.currentStep = 0;
    state.activeTrajectoryStep = 0;
    loadPreset(state.currentPreset);
    updateStateMachineUI();
    switchInspectorTab(0);
  });
}

function switchIteration(num) {
  pause();
  transitionUpdate(() => {
    state.currentIteration = num;
    state.currentStep = 0;
    state.activeTrajectoryStep = 0;
    loadPreset(state.currentPreset);
    updateStateMachineUI();
    switchInspectorTab(0);
  });
}

// ── Simulation Loop ──
function runLoop() {
  if (!state.isPlaying) return;
  advanceStep();

  let delay = speedIntervals[state.speed];
  if (state.currentStep === 1) delay *= 2.5;
  else if (state.currentStep === 2) {
    const len = presets[state.currentPreset].iterations[state.currentIteration].trajectory.length;
    delay *= (len + 1);
  }

  state.simTimer = setTimeout(runLoop, delay);
}

// ── State Machine Steps ──
function advanceStep() {
  state.currentStep = (state.currentStep + 1) % 6;

  if (state.currentStep === 5) {
    animateConnectorFlow(4);
    setTimeout(() => {
      switchIteration(state.currentIteration === 1 ? 2 : 1);
    }, speedIntervals[state.speed]);
    return;
  }

  executeNodeState(state.currentStep);
}

function jumpToNode(idx) {
  state.currentStep = idx;
  executeNodeState(idx, true);
}

function executeNodeState(stepIndex, instant = false) {
  const preset = presets[state.currentPreset];
  const iterData = preset.iterations[state.currentIteration];

  if (stepIndex > 0) animateConnectorFlow(stepIndex - 1);

  transitionUpdate(() => {
    updateStateMachineUI();
    switchInspectorTab(stepIndex);

    switch (stepIndex) {
      case 0: break;

      case 1:
        clearTerminalAgent();
        if (instant) {
          printAgentPrompt(`run_agent.js --task "..."`);
          printAgentOutput('Agent executed.', 'success');
        } else {
          typewriterAgent(`node run_agent.js --task "${preset.task.substring(0, 35)}..."`, () => {
            setTimeout(() => printAgentOutput('Agent initialized. Staging sandbox...'), 300);
          });
        }
        break;

      case 2:
        clearTerminalTrajectory();
        if (instant) {
          iterData.trajectory.forEach(t => renderTrajectoryItem(t));
          state.activeTrajectoryStep = iterData.trajectory.length;
        } else {
          state.activeTrajectoryStep = 0;
          animateTrajectory(iterData.trajectory);
        }
        break;

      case 3:
        showScorecard(iterData);
        renderFindings(iterData.findings);
        break;

      case 4:
        renderDiff(iterData.diff);
        break;
    }
  });
}

// ── Update State Machine Nodes ──
function updateStateMachineUI() {
  const iterData = presets[state.currentPreset].iterations[state.currentIteration];

  document.querySelectorAll('.state-node').forEach(node => {
    const idx = parseInt(node.dataset.node);
    node.classList.remove('active-node', 'inactive', 'node-fail', 'node-pass');

    if (idx === state.currentStep) {
      node.classList.add('active-node');
    } else {
      node.classList.add('inactive');
    }

    // Iteration 1 failure markers
    if (state.currentIteration === 1) {
      if (idx === 1 && state.currentStep >= 1) node.classList.add('node-fail');
      if (idx === 3 && state.currentStep >= 3) node.classList.add('node-fail');
    } else if (state.currentIteration === 2) {
      if (idx === 3 && state.currentStep >= 3) node.classList.add('node-pass');
    }
  });
}

// ── Connector Animations ──
function animateConnectorFlow(pathIndex) {
  // Clear all
  document.querySelectorAll('.edge-pulse').forEach(el => {
    el.classList.remove('active-flow');
    el.style.stroke = '';
  });
  document.querySelectorAll('.connection-edge').forEach(el => {
    el.classList.remove('active-edge');
    el.style.stroke = '';
    el.setAttribute('marker-end', 'url(#arrow)');
  });

  const pulse = $(`flow-${pathIndex}`);
  const edge = $(`edge-${pathIndex}`);

  if (pulse && edge) {
    let color = '#7aa2f7';
    if (pathIndex === 3) {
      const status = presets[state.currentPreset].iterations[state.currentIteration].status;
      color = status === 'FAILED' ? '#f7768e' : '#9ece6a';
    }

    pulse.classList.add('active-flow');
    pulse.style.stroke = color;

    edge.classList.add('active-edge');
    edge.style.stroke = color;
    edge.setAttribute('marker-end', 'url(#active-arrow)');

    const arrowFill = $('arrow-color-fill');
    if (arrowFill) arrowFill.setAttribute('fill', color);
  }
}

// ── Inspector Tabs ──
const tabNames = {
  0: '01. Skill Setup',
  1: '02. Agent Executor',
  2: '03. Trajectory Trace',
  3: '04. SkillGrade Audit',
  4: '05. Skill Optimizer'
};

function switchInspectorTab(tabIndex) {
  state.activeInspectorTab = tabIndex;

  const title = $('card-state-title');
  if (title) title.innerText = tabNames[tabIndex];

  document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
    const idx = parseInt(btn.dataset.tab);
    btn.classList.remove('active', 'tab-focused-now', 'tab-fail', 'tab-pass');

    if (idx === tabIndex) {
      btn.classList.add('active', 'tab-focused-now');
      if (idx === 3) {
        const status = presets[state.currentPreset].iterations[state.currentIteration].status;
        btn.classList.add(status === 'FAILED' ? 'tab-fail' : 'tab-pass');
      }
    }
  });

  document.querySelectorAll('.inspector-section').forEach(sec => {
    sec.classList.toggle('active-section', sec.id === `section-${tabIndex}`);
  });

  const card = $('inspector-card');
  card.classList.toggle('panel-highlight', tabIndex === state.currentStep);
}

// ── Terminal Helpers ──
function clearTerminalAgent() {
  terminalAgentBody.innerHTML = '';
  agentActiveTyping.innerText = '';
}

function printAgentPrompt(text) {
  const div = document.createElement('div');
  div.className = 'terminal-prompt';
  div.innerHTML = `<span>$</span> <span>${text}</span>`;
  terminalAgentBody.appendChild(div);
}

function printAgentOutput(text, type = '') {
  const div = document.createElement('div');
  div.className = 'traj-step-output' + (type ? ` ${type}` : '');
  div.innerText = text;
  terminalAgentBody.appendChild(div);
}

function typewriterAgent(text, cb) {
  let i = 0;
  agentActiveTyping.innerText = '';
  function tick() {
    if (i < text.length) {
      agentActiveTyping.innerText += text.charAt(i);
      i++;
      state.terminalTimer = setTimeout(tick, 15);
    } else {
      printAgentPrompt(text);
      agentActiveTyping.innerText = '';
      cb();
    }
  }
  tick();
}

// ── Trajectory Logs ──
function clearTerminalTrajectory() {
  terminalTrajectoryBody.innerHTML = '';
}

function renderTrajectoryItem(step) {
  const item = document.createElement('div');
  item.className = 'traj-step';

  document.querySelectorAll('.traj-step').forEach(el => el.classList.remove('traj-step-active'));
  item.classList.add('traj-step-active');

  let label = '', color = '#a1a1aa', html = '';

  switch (step.type) {
    case 'thought':
      label = 'Thought'; color = '#818cf8';
      html = `<div class="traj-step-thought">${step.content}</div>`;
      break;
    case 'tool_call':
      label = 'Execute'; color = '#fbbf24';
      html = `<div class="traj-step-tool">⚙ ${step.content}</div>`;
      break;
    case 'tool_output':
      label = 'Result'; color = '#34d399';
      html = `<pre class="traj-step-output${step.isError ? ' err' : ''}">${step.content}</pre>`;
      break;
    case 'response':
      label = 'Output'; color = '#60a5fa';
      html = `<div class="traj-step-output" style="color:#f5f5f5;">${step.content}</div>`;
      break;
  }

  item.innerHTML = `<span class="traj-step-type" style="color:${color}">${label}</span>${html}`;
  terminalTrajectoryBody.appendChild(item);
}

function animateTrajectory(trajectory) {
  if (state.activeTrajectoryStep >= trajectory.length) return;

  renderTrajectoryItem(trajectory[state.activeTrajectoryStep]);
  state.activeTrajectoryStep++;
  terminalTrajectoryBody.scrollTop = terminalTrajectoryBody.scrollHeight;

  if (state.activeTrajectoryStep < trajectory.length) {
    state.terminalTimer = setTimeout(() => animateTrajectory(trajectory), speedIntervals[state.speed]);
  }
}

// ── Scorecard ──
function showScorecard(iterData) {
  const target = parseInt(iterData.metrics.score);
  let current = 0;

  scoreBadge.innerText = iterData.status;
  scoreBadge.className = 'badge ' + (iterData.status === 'PASSED' ? 'badge-pass' : 'badge-fail');

  valSuccess.innerText = iterData.metrics.success;
  valAdherence.innerText = iterData.metrics.adherence;
  valViolations.innerText = iterData.metrics.violations;

  const roll = setInterval(() => {
    current += Math.ceil(target / 10);
    if (current >= target) { current = target; clearInterval(roll); }
    valScore.innerText = `${current}/100`;
  }, 40);
}

// ── Findings ──
function renderFindings(findings) {
  findingsWrapper.innerHTML = '';
  findings.forEach(f => {
    const item = document.createElement('div');
    item.className = `finding-item ${f.type === 'violation' ? 'violation' : 'success'}`;

    const icon = f.type === 'violation'
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    item.innerHTML = `${icon}<div class="finding-item-content"><h5>${f.title}</h5><p>${f.desc}</p></div>`;
    findingsWrapper.appendChild(item);
  });
}

// ── Diff ──
function renderDiff(diffList) {
  if (!diffList || diffList.length === 0) {
    diffWrapper.innerHTML = `<div style="color:var(--color-success);font-size:0.8rem;text-align:center;margin-top:3rem;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" style="margin:0 auto 0.4rem;display:block;"><polyline points="20 6 9 17 4 12"/></svg>
      Guidelines fully optimized. No diff needed.
    </div>`;
    return;
  }

  diffWrapper.innerHTML = '';
  diffList.forEach(line => {
    const el = document.createElement('div');
    el.className = `diff-card-line ${line.action}`;
    let ind = ' ';
    if (line.action === 'added') ind = '+';
    if (line.action === 'removed') ind = '-';
    el.innerHTML = `<span class="diff-line-number">${ind}</span><span>${escapeHtml(line.text)}</span>`;
    diffWrapper.appendChild(el);
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Launch ──
window.addEventListener('DOMContentLoaded', init);

window.addEventListener('message', (e) => {
  if (e.data && e.data.start) {
    resetSimulation();
    play();
  }
});
