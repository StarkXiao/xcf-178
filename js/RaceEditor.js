const EditorState = {
  IDLE: 'idle',
  ADDING_NODE: 'addingNode',
  MOVING_NODE: 'movingNode',
  DELETING_NODE: 'deletingNode'
};

class RaceEditor {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.state = EditorState.IDLE;
    this.nodes = [];
    this.checkpoints = [];
    this.selectedNode = -1;
    this.dragOffset = { x: 0, y: 0 };
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };
    this.config = this._createDefaultConfig();
    this.uiPanel = null;
    this._initUI();
    this._setupEventListeners();
    this._createDefaultTrack();
  }

  _createDefaultConfig() {
    return {
      name: '未命名赛道',
      laps: 3,
      aiCount: 3,
      aiDifficulty: 'normal',
      trackWidth: 180,
      checkpointSpacing: 5,
      routes: [{
        id: 'main',
        name: '主赛道',
        points: [],
        color: '#00f5ff',
        isShortcut: false,
        lengthBonus: 1.0,
        checkpoints: []
      }]
    };
  }

  _createDefaultTrack() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const r = 200;
    const segments = 12;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      this.nodes.push({ x, y });
    }
    
    this._generateCheckpoints();
    this._updateConfigFromNodes();
  }

  _initUI() {
    this.uiPanel = document.createElement('div');
    this.uiPanel.className = 'editor-panel';
    this.uiPanel.id = 'raceEditorPanel';
    
    this.uiPanel.innerHTML = `
      <div class="editor-header">
        <h2>🏁 赛事编辑器</h2>
        <button class="editor-close-btn" id="editorCloseBtn">✕</button>
      </div>

      <div class="editor-section">
        <div class="section-title">赛道配置</div>
        <div class="editor-field">
          <label>赛道名称</label>
          <input type="text" id="trackNameInput" value="未命名赛道">
        </div>
        <div class="editor-field">
          <label>赛道宽度: <span id="trackWidthValue">180</span>px</label>
          <input type="range" id="trackWidthSlider" min="100" max="300" value="180">
        </div>
        <div class="editor-field">
          <label>检查点间隔: <span id="checkpointSpacingValue">5</span>个节点</label>
          <input type="range" id="checkpointSpacingSlider" min="2" max="10" value="5">
        </div>
      </div>

      <div class="editor-section">
        <div class="section-title">赛事设置</div>
        <div class="editor-field">
          <label>比赛圈数: <span id="lapsValue">3</span></label>
          <input type="range" id="lapsSlider" min="1" max="10" value="3">
        </div>
        <div class="editor-field">
          <label>AI数量: <span id="aiCountValue">3</span></label>
          <input type="range" id="aiCountSlider" min="0" max="8" value="3">
        </div>
        <div class="editor-field">
          <label>AI难度</label>
          <select id="aiDifficultySelect">
            <option value="easy">简单</option>
            <option value="normal" selected>普通</option>
            <option value="hard">困难</option>
            <option value="hell">地狱</option>
          </select>
        </div>
      </div>

      <div class="editor-section">
        <div class="section-title">编辑工具</div>
        <div class="editor-tools">
          <button class="tool-btn active" data-tool="select">
            <span class="tool-icon">👆</span>
            <span>选择/移动</span>
          </button>
          <button class="tool-btn" data-tool="add">
            <span class="tool-icon">➕</span>
            <span>添加节点</span>
          </button>
          <button class="tool-btn" data-tool="delete">
            <span class="tool-icon">🗑️</span>
            <span>删除节点</span>
          </button>
        </div>
        <div class="editor-hint" id="editorHint">点击节点可拖动，右键拖动可平移视图，滚轮缩放</div>
        <div class="checkpoint-count" id="checkpointCount">
          节点: <span id="nodeCount">0</span> | 检查点: <span id="cpCount">0</span>
        </div>
      </div>

      <div class="editor-section">
        <div class="section-title">保存与加载</div>
        <div class="editor-tools">
          <button class="tool-btn primary" id="saveConfigBtn">
            <span class="tool-icon">💾</span>
            <span>保存</span>
          </button>
          <button class="tool-btn primary" id="exportConfigBtn">
            <span class="tool-icon">📤</span>
            <span>导出</span>
          </button>
          <button class="tool-btn primary" id="importConfigBtn">
            <span class="tool-icon">📥</span>
            <span>导入</span>
          </button>
        </div>
        <div class="saved-configs" id="savedConfigs">
          <div class="no-configs">暂无保存的配置</div>
        </div>
      </div>

      <div class="editor-section">
        <div class="section-title">测试与回放</div>
        <div class="editor-tools">
          <button class="tool-btn success" id="testRaceBtn">
            <span class="tool-icon">🏎️</span>
            <span>开始测试</span>
          </button>
          <button class="tool-btn success" id="playReplayBtn">
            <span class="tool-icon">▶️</span>
            <span>查看回放</span>
          </button>
        </div>
      </div>

      <div class="editor-info">
        <div>缩放: <span id="zoomLevel">100%</span></div>
        <div>位置: <span id="camPos">0, 0</span></div>
      </div>
    `;

    document.body.appendChild(this.uiPanel);
    this._bindUIEvents();
  }

  _bindUIEvents() {
    document.getElementById('editorCloseBtn').addEventListener('click', () => this.hide());
    
    document.getElementById('trackNameInput').addEventListener('change', (e) => {
      this.config.name = e.target.value;
    });

    document.getElementById('trackWidthSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('trackWidthValue').textContent = val;
      this.config.trackWidth = val;
    });

    document.getElementById('checkpointSpacingSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('checkpointSpacingValue').textContent = val;
      this.config.checkpointSpacing = val;
      this._generateCheckpoints();
    });

    document.getElementById('lapsSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('lapsValue').textContent = val;
      this.config.laps = val;
    });

    document.getElementById('aiCountSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('aiCountValue').textContent = val;
      this.config.aiCount = val;
    });

    document.getElementById('aiDifficultySelect').addEventListener('change', (e) => {
      this.config.aiDifficulty = e.target.value;
    });

    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tool = btn.dataset.tool;
        if (tool === 'add') this.state = EditorState.ADDING_NODE;
        else if (tool === 'delete') this.state = EditorState.DELETING_NODE;
        else {
          this.state = EditorState.IDLE;
          this.selectedNode = -1;
        }
        this._updateHint();
      });
    });

    document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveToStorage());
    document.getElementById('exportConfigBtn').addEventListener('click', () => this._exportConfig());
    document.getElementById('importConfigBtn').addEventListener('click', () => this._importConfig());
    document.getElementById('testRaceBtn').addEventListener('click', () => this._startTestRace());
    document.getElementById('playReplayBtn').addEventListener('click', () => this._playReplay());

    this._refreshSavedConfigs();
  }

  _updateHint() {
    const hint = document.getElementById('editorHint');
    const hints = {
      [EditorState.IDLE]: '点击节点可拖动，右键拖动可平移视图，滚轮缩放',
      [EditorState.ADDING_NODE]: '点击画布添加新节点，节点会自动连接到最后一个点',
      [EditorState.DELETING_NODE]: '点击节点可删除，按ESC取消',
      [EditorState.MOVING_NODE]: '拖动节点调整位置'
    };
    hint.textContent = hints[this.state] || '';
  }

  _setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this._onMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.state = EditorState.IDLE;
        this.selectedNode = -1;
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        document.querySelector('.tool-btn[data-tool="select"]').classList.add('active');
        this._updateHint();
      }
    });
  }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.camera.zoom - this.camera.x;
    const y = (e.clientY - rect.top) / this.camera.zoom - this.camera.y;
    return { x, y };
  }

  _onMouseDown(e) {
    if (!this.isVisible()) return;
    
    const pos = this._getMousePos(e);
    this.mousePos = pos;

    if (e.button === 2) {
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
      return;
    }

    const hitNode = this._findNodeAt(pos.x, pos.y);
    
    if (this.state === EditorState.ADDING_NODE) {
      this._addNode(pos.x, pos.y);
    } else if (this.state === EditorState.DELETING_NODE && hitNode >= 0) {
      this._deleteNode(hitNode);
    } else if (hitNode >= 0) {
      this.state = EditorState.MOVING_NODE;
      this.selectedNode = hitNode;
      this.dragOffset = {
        x: pos.x - this.nodes[hitNode].x,
        y: pos.y - this.nodes[hitNode].y
      };
    }
  }

  _onMouseMove(e) {
    if (!this.isVisible()) return;
    
    const pos = this._getMousePos(e);
    this.mousePos = pos;

    if (this.isPanning) {
      const dx = (e.clientX - this.panStart.x) / this.camera.zoom;
      const dy = (e.clientY - this.panStart.y) / this.camera.zoom;
      this.camera.x += dx;
      this.camera.y += dy;
      this.panStart = { x: e.clientX, y: e.clientY };
      this._updateCamInfo();
      return;
    }

    if (this.state === EditorState.MOVING_NODE && this.selectedNode >= 0) {
      this.nodes[this.selectedNode].x = pos.x - this.dragOffset.x;
      this.nodes[this.selectedNode].y = pos.y - this.dragOffset.y;
      this._generateCheckpoints();
      this._updateConfigFromNodes();
    }
  }

  _onMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
    }
    if (this.state === EditorState.MOVING_NODE) {
      this.state = EditorState.IDLE;
      this.selectedNode = -1;
    }
  }

  _onWheel(e) {
    if (!this.isVisible()) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, this.camera.zoom * delta));
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    this.camera.x = mouseX / newZoom - mouseX / this.camera.zoom + this.camera.x;
    this.camera.y = mouseY / newZoom - mouseY / this.camera.zoom + this.camera.y;
    this.camera.zoom = newZoom;
    
    this._updateCamInfo();
  }

  _findNodeAt(x, y, radius = 15) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < radius * radius) {
        return i;
      }
    }
    return -1;
  }

  _addNode(x, y) {
    this.nodes.push({ x, y });
    this._generateCheckpoints();
    this._updateConfigFromNodes();
    this._updateNodeCount();
  }

  _deleteNode(index) {
    if (this.nodes.length <= 3) {
      alert('赛道至少需要3个节点！');
      return;
    }
    this.nodes.splice(index, 1);
    this._generateCheckpoints();
    this._updateConfigFromNodes();
    this._updateNodeCount();
  }

  _generateCheckpoints() {
    if (this.nodes.length < 3) {
      this.checkpoints = [];
      return;
    }

    this.checkpoints = [];
    const spacing = this.config.checkpointSpacing;
    
    for (let i = 0; i < this.nodes.length; i += spacing) {
      const node = this.nodes[i];
      const nextNode = this.nodes[(i + 1) % this.nodes.length];
      const angle = Math.atan2(nextNode.y - node.y, nextNode.x - node.x);
      
      this.checkpoints.push({
        x: node.x,
        y: node.y,
        angle: angle,
        nodeIndex: i,
        passed: false
      });
    }

    this._updateNodeCount();
  }

  _updateConfigFromNodes() {
    this.config.routes[0].points = this.nodes.map(n => ({ x: n.x, y: n.y }));
    this.config.routes[0].checkpoints = this.checkpoints.map(cp => ({
      x: cp.x,
      y: cp.y,
      angle: cp.angle,
      radius: this.config.trackWidth / 2 + 20
    }));
  }

  _buildTempTrack() {
    if (!this.game.track) return;
    
    const configCopy = JSON.parse(JSON.stringify(this.config));
    this.game.track.loadFromConfig(configCopy);
  }

  _updateNodeCount() {
    document.getElementById('nodeCount').textContent = this.nodes.length;
    document.getElementById('cpCount').textContent = this.checkpoints.length;
  }

  _updateCamInfo() {
    document.getElementById('zoomLevel').textContent = Math.round(this.camera.zoom * 100) + '%';
    document.getElementById('camPos').textContent = 
      `${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`;
  }

  show() {
    this.uiPanel.classList.add('visible');
    this.camera = { x: 0, y: 0, zoom: 1 };
    this._updateCamInfo();
    this._updateNodeCount();
  }

  hide() {
    this.uiPanel.classList.remove('visible');
    if (this.game && this.game.quitToMenu) {
      this.game.quitToMenu();
    }
  }

  isVisible() {
    return this.uiPanel.classList.contains('visible');
  }

  saveToStorage() {
    try {
      const configs = JSON.parse(localStorage.getItem('raceEditorConfigs') || '{}');
      const id = Date.now().toString();
      configs[id] = {
        ...this.config,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('raceEditorConfigs', JSON.stringify(configs));
      this._refreshSavedConfigs();
      alert('配置已保存！');
    } catch (e) {
      console.error('保存失败:', e);
      alert('保存失败：' + e.message);
    }
  }

  loadFromStorage(id) {
    try {
      const configs = JSON.parse(localStorage.getItem('raceEditorConfigs') || '{}');
      const config = configs[id];
      if (!config) {
        alert('配置不存在！');
        return;
      }
      
      this.config = config;
      this.nodes = config.routes[0].points.map(p => ({ x: p.x, y: p.y }));
      this._generateCheckpoints();
      
      document.getElementById('trackNameInput').value = config.name;
      document.getElementById('trackWidthSlider').value = config.trackWidth;
      document.getElementById('trackWidthValue').textContent = config.trackWidth;
      document.getElementById('checkpointSpacingSlider').value = config.checkpointSpacing;
      document.getElementById('checkpointSpacingValue').textContent = config.checkpointSpacing;
      document.getElementById('lapsSlider').value = config.laps;
      document.getElementById('lapsValue').textContent = config.laps;
      document.getElementById('aiCountSlider').value = config.aiCount;
      document.getElementById('aiCountValue').textContent = config.aiCount;
      document.getElementById('aiDifficultySelect').value = config.aiDifficulty;
      
      alert('配置已加载！');
    } catch (e) {
      console.error('加载失败:', e);
      alert('加载失败：' + e.message);
    }
  }

  _exportConfig() {
    try {
      const dataStr = JSON.stringify(this.config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.config.name || 'track'}_config.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('导出失败:', e);
      alert('导出失败：' + e.message);
    }
  }

  _importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const config = JSON.parse(ev.target.result);
          if (!config.routes || !config.routes[0]) {
            throw new Error('无效的配置文件');
          }
          
          this.config = { ...this._createDefaultConfig(), ...config };
          this.nodes = this.config.routes[0].points.map(p => ({ x: p.x, y: p.y }));
          this._generateCheckpoints();
          this._updateConfigFromNodes();
          
          document.getElementById('trackNameInput').value = this.config.name;
          document.getElementById('trackWidthSlider').value = this.config.trackWidth;
          document.getElementById('trackWidthValue').textContent = this.config.trackWidth;
          document.getElementById('lapsSlider').value = this.config.laps;
          document.getElementById('lapsValue').textContent = this.config.laps;
          document.getElementById('aiCountSlider').value = this.config.aiCount;
          document.getElementById('aiCountValue').textContent = this.config.aiCount;
          
          alert('导入成功！');
        } catch (err) {
          console.error('导入失败:', err);
          alert('导入失败：' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _refreshSavedConfigs() {
    const container = document.getElementById('savedConfigs');
    try {
      const configs = JSON.parse(localStorage.getItem('raceEditorConfigs') || '{}');
      const keys = Object.keys(configs);
      
      if (keys.length === 0) {
        container.innerHTML = '<div class="no-configs">暂无保存的配置</div>';
        return;
      }
      
      container.innerHTML = keys.map(id => {
        const cfg = configs[id];
        const date = new Date(cfg.savedAt).toLocaleString();
        return `
          <div class="config-item">
            <span>${cfg.name} (${cfg.routes[0].points.length}节点)</span>
            <div class="config-actions">
              <button class="config-btn load" data-id="${id}">加载</button>
              <button class="config-btn delete" data-id="${id}">删除</button>
            </div>
          </div>
        `;
      }).join('');
      
      container.querySelectorAll('.config-btn.load').forEach(btn => {
        btn.addEventListener('click', () => this.loadFromStorage(btn.dataset.id));
      });
      
      container.querySelectorAll('.config-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('确定删除此配置？')) {
            delete configs[btn.dataset.id];
            localStorage.setItem('raceEditorConfigs', JSON.stringify(configs));
            this._refreshSavedConfigs();
          }
        });
      });
    } catch (e) {
      container.innerHTML = '<div class="no-configs">加载配置列表失败</div>';
    }
  }

  _startTestRace() {
    if (this.nodes.length < 3) {
      alert('赛道至少需要3个节点！');
      return;
    }
    
    this._updateConfigFromNodes();
    this._buildTempTrack();
    
    if (this.game && this.game.loadEditorTrack) {
      this.game.laps = this.config.laps;
      this.game.difficulty = this.config.aiDifficulty;
      this.game.aiCount = this.config.aiCount;
      this.game.loadEditorTrack(this.config);
      this.hide();
    }
  }

  _playReplay() {
    if (this.game && this.game.replaySystem) {
      const recordings = this.game.replaySystem.getSavedRecordings();
      if (recordings.length === 0) {
        alert('暂无回放记录！先完成一场测试比赛吧。');
        return;
      }
      
      const latest = recordings[recordings.length - 1];
      this.game.replaySystem.loadRecording(latest.key);
      this.game.replaySystem.playRecording();
      this.hide();
    }
  }

  render() {
    if (!this.isVisible()) return;
    
    const ctx = this.ctx;
    ctx.save();
    
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(this.camera.x, this.camera.y);
    
    this._drawGrid();
    this._drawTrackPreview();
    this._drawCheckpoints();
    this._drawNodes();
    this._drawMousePreview();
    
    ctx.restore();
  }

  _drawGrid() {
    const ctx = this.ctx;
    const gridSize = 50;
    const startX = Math.floor(-this.camera.x / gridSize) * gridSize;
    const startY = Math.floor(-this.camera.y / gridSize) * gridSize;
    const endX = startX + this.canvas.width / this.camera.zoom + gridSize * 2;
    const endY = startY + this.canvas.height / this.camera.zoom + gridSize * 2;
    
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }

  _drawTrackPreview() {
    if (this.nodes.length < 2) return;
    
    const ctx = this.ctx;
    const width = this.config.trackWidth;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.strokeStyle = 'rgba(30, 30, 50, 0.8)';
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.nodes.length; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    if (this.nodes.length >= 3) {
      ctx.closePath();
    }
    ctx.stroke();
    
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = width + 4;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.nodes.length; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    if (this.nodes.length >= 3) {
      ctx.closePath();
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawCheckpoints() {
    const ctx = this.ctx;
    
    this.checkpoints.forEach((cp, i) => {
      const perpX = Math.cos(cp.angle + Math.PI / 2);
      const perpY = Math.sin(cp.angle + Math.PI / 2);
      const halfWidth = this.config.trackWidth / 2 + 30;
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cp.x - perpX * halfWidth, cp.y - perpY * halfWidth);
      ctx.lineTo(cp.x + perpX * halfWidth, cp.y + perpY * halfWidth);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), cp.x, cp.y + 4);
    });
  }

  _drawNodes() {
    const ctx = this.ctx;
    
    this.nodes.forEach((node, i) => {
      const isSelected = i === this.selectedNode;
      const isFirst = i === 0;
      
      ctx.fillStyle = isSelected ? '#ff6600' : (isFirst ? '#00ff66' : '#00f5ff');
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      
      if (isSelected) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6600';
      }
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 12 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), node.x, node.y + 3);
    });
  }

  _drawMousePreview() {
    if (this.state !== EditorState.ADDING_NODE) return;
    
    const ctx = this.ctx;
    const pos = this.mousePos;
    
    ctx.fillStyle = 'rgba(255, 102, 0, 0.5)';
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    
    if (this.nodes.length > 0) {
      const last = this.nodes[this.nodes.length - 1];
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
