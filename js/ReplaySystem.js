const ReplayState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PLAYING: 'playing',
  PAUSED: 'paused'
};

class ReplaySystem {
  constructor(game) {
    this.game = game;
    this.state = ReplayState.IDLE;
    this.currentRecording = null;
    this.currentFrameIndex = 0;
    this.playbackSpeed = 1;
    this.maxRecordTime = 15 * 60 * 1000;
    this.frameInterval = 16;
    this.hudElement = null;
    this._initHUD();
  }

  _initHUD() {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'replay-hud';
    this.hudElement.id = 'replayHUD';
    
    this.hudElement.innerHTML = `
      <div class="replay-status">
        <span class="replay-icon" id="replayIcon">⏺️</span>
        <span class="replay-text" id="replayText">录制中</span>
        <span class="replay-time" id="replayTime">00:00.00</span>
      </div>
      <div class="replay-controls" id="replayControls" style="display: none;">
        <button class="replay-btn" id="replayPlayBtn" title="播放/暂停">⏸️</button>
        <button class="replay-btn" id="replayRestartBtn" title="重新开始">⏮️</button>
        <button class="replay-btn" id="replayStopBtn" title="停止">⏹️</button>
        <div class="replay-speed">
          <label>速度:</label>
          <select id="replaySpeedSelect">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1" selected>1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
          </select>
        </div>
      </div>
    `;

    document.body.appendChild(this.hudElement);
    this._bindHUDEvents();
  }

  _bindHUDEvents() {
    document.getElementById('replayPlayBtn').addEventListener('click', () => {
      if (this.state === ReplayState.PLAYING) {
        this.pauseReplay();
      } else if (this.state === ReplayState.PAUSED) {
        this.resumeReplay();
      }
    });

    document.getElementById('replayRestartBtn').addEventListener('click', () => {
      this.restartReplay();
    });

    document.getElementById('replayStopBtn').addEventListener('click', () => {
      this.stopReplay();
    });

    document.getElementById('replaySpeedSelect').addEventListener('change', (e) => {
      this.setPlaybackSpeed(parseFloat(e.target.value));
    });
  }

  startRecording() {
    if (this.state !== ReplayState.IDLE) return;
    
    this.state = ReplayState.RECORDING;
    this.currentRecording = {
      meta: {
        startTime: Date.now(),
        totalTime: 0,
        frameCount: 0,
        trackConfig: this.game._editorConfig || null,
        difficulty: this.game.difficulty,
        laps: this.game.laps,
        aiCount: this.game.aiCount
      },
      frames: []
    };
    
    this._showHUD();
    this._updateHUD();
  }

  stopRecording() {
    if (this.state !== ReplayState.RECORDING) return;
    
    this.state = ReplayState.IDLE;
    this.currentRecording.meta.totalTime = Date.now() - this.currentRecording.meta.startTime;
    this.currentRecording.meta.frameCount = this.currentRecording.frames.length;
    
    this._saveToStorage();
    this._hideHUD();
  }

  _saveToStorage() {
    if (!this.currentRecording || this.currentRecording.frames.length === 0) return;
    
    try {
      const key = `replay_${Date.now()}`;
      const metaKey = `${key}_meta`;
      const framesKey = `${key}_frames`;
      
      localStorage.setItem(metaKey, JSON.stringify(this.currentRecording.meta));
      
      const framesPerChunk = 300;
      const totalChunks = Math.ceil(this.currentRecording.frames.length / framesPerChunk);
      
      for (let i = 0; i < totalChunks; i++) {
        const chunk = this.currentRecording.frames.slice(
          i * framesPerChunk,
          (i + 1) * framesPerChunk
        );
        localStorage.setItem(`${framesKey}_${i}`, JSON.stringify(chunk));
      }
      
      const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
      index.push({
        key: key,
        totalChunks: totalChunks,
        savedAt: new Date().toISOString(),
        duration: this.currentRecording.meta.totalTime,
        trackName: this.currentRecording.meta.trackConfig?.name || '自定义赛道'
      });
      
      if (index.length > 10) {
        const old = index.shift();
        this._deleteRecording(old.key);
      }
      
      localStorage.setItem('replayIndex', JSON.stringify(index));
      
    } catch (e) {
      console.error('保存回放失败:', e);
      if (e.name === 'QuotaExceededError') {
        alert('存储空间不足，无法保存回放！');
      }
    }
  }

  _deleteRecording(key) {
    try {
      const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
      const item = index.find(i => i.key === key);
      
      if (item) {
        localStorage.removeItem(`${key}_meta`);
        for (let i = 0; i < item.totalChunks; i++) {
          localStorage.removeItem(`${key}_frames_${i}`);
        }
      }
    } catch (e) {
      console.error('删除回放失败:', e);
    }
  }

  hasRecording() {
    const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
    return index.length > 0;
  }

  getSavedRecordings() {
    try {
      const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
      return index.map(item => ({
        ...item,
        durationFormatted: this._formatTime(item.duration)
      }));
    } catch (e) {
      return [];
    }
  }

  loadRecording(key) {
    try {
      const metaKey = `${key}_meta`;
      const metaData = localStorage.getItem(metaKey);
      
      if (!metaData) {
        throw new Error('回放数据不存在');
      }
      
      const meta = JSON.parse(metaData);
      const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
      const item = index.find(i => i.key === key);
      
      if (!item) {
        throw new Error('回放索引不存在');
      }
      
      let frames = [];
      for (let i = 0; i < item.totalChunks; i++) {
        const chunkData = localStorage.getItem(`${key}_frames_${i}`);
        if (chunkData) {
          frames = frames.concat(JSON.parse(chunkData));
        }
      }
      
      this.currentRecording = {
        meta: meta,
        frames: frames
      };
      
      this.currentFrameIndex = 0;
      return true;
    } catch (e) {
      console.error('加载回放失败:', e);
      alert('加载回放失败：' + e.message);
      return false;
    }
  }

  deleteRecording(key) {
    if (confirm('确定删除此回放？')) {
      this._deleteRecording(key);
      const index = JSON.parse(localStorage.getItem('replayIndex') || '[]');
      const newIndex = index.filter(i => i.key !== key);
      localStorage.setItem('replayIndex', JSON.stringify(newIndex));
    }
  }

  playRecording() {
    if (!this.currentRecording || this.currentRecording.frames.length === 0) return;
    
    this.state = ReplayState.PLAYING;
    this.currentFrameIndex = 0;
    
    if (this.game && this.game.loadEditorTrack && this.currentRecording.meta.trackConfig) {
      this.game._isEditorMode = true;
      this.game.totalLaps = this.currentRecording.meta.laps;
      this.game.difficulty = this.currentRecording.meta.difficulty;
      this.game.aiCount = this.currentRecording.meta.aiCount;
      this.game.loadEditorTrack(this.currentRecording.meta.trackConfig);
    }
    
    if (this.game) {
      this.game.state = 'racing';
      this.game.raceTime = 0;
    }
    
    this._showHUD();
    document.getElementById('replayControls').style.display = 'flex';
    this._updateHUD();
  }

  pauseReplay() {
    if (this.state !== ReplayState.PLAYING) return;
    this.state = ReplayState.PAUSED;
    document.getElementById('replayPlayBtn').textContent = '▶️';
    this._updateHUD();
  }

  resumeReplay() {
    if (this.state !== ReplayState.PAUSED) return;
    this.state = ReplayState.PLAYING;
    document.getElementById('replayPlayBtn').textContent = '⏸️';
    this._updateHUD();
  }

  restartReplay() {
    if (!this.currentRecording) return;
    this.currentFrameIndex = 0;
    this.state = ReplayState.PLAYING;
    document.getElementById('replayPlayBtn').textContent = '⏸️';
    this._updateHUD();
  }

  stopReplay() {
    this.state = ReplayState.IDLE;
    this.currentFrameIndex = 0;
    this._hideHUD();
    document.getElementById('replayControls').style.display = 'none';
    
    if (this.game) {
      if (this.game._isEditorMode && this.game.raceEditor) {
        this.game.state = 'raceEditor';
        this.game.raceEditor.show();
      } else if (this.game.quitToMenu) {
        this.game.quitToMenu();
      }
    }
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.25, Math.min(4, speed));
    document.getElementById('replaySpeedSelect').value = speed.toString();
  }

  update(dt) {
    if (this.state === ReplayState.RECORDING) {
      const elapsed = Date.now() - this.currentRecording.meta.startTime;
      if (elapsed >= this.maxRecordTime) {
        this.stopRecording();
        return;
      }
      
      this._recordFrame();
      this._updateHUD();
      
    } else if (this.state === ReplayState.PLAYING) {
      const framesToAdvance = Math.round((dt * this.playbackSpeed * 1000) / this.frameInterval);
      
      for (let i = 0; i < framesToAdvance; i++) {
        if (this.currentFrameIndex < this.currentRecording.frames.length - 1) {
          this.currentFrameIndex++;
          this._applyReplayFrame();
        } else {
          this.pauseReplay();
          break;
        }
      }
      
      this._updateHUD();
    }
  }

  _recordFrame() {
    if (!this.game || !this.game.getAllBikes) return;
    
    const bikes = this.game.getAllBikes();
    const frame = {
      t: Date.now() - this.currentRecording.meta.startTime,
      bikes: bikes.map(bike => ({
        x: bike.x,
        y: bike.y,
        angle: bike.angle,
        speed: bike.speed,
        lap: bike.lap || 0,
        checkpointIndex: bike.checkpointIndex || 0,
        isPlayer: bike.isPlayer || false,
        position: bike.position || 0
      }))
    };
    
    if (this.game.camera) {
      frame.camera = {
        x: this.game.camera.x,
        y: this.game.camera.y,
        shake: this.game.camera.shake || 0
      };
    }
    
    this.currentRecording.frames.push(frame);
  }

  _applyReplayFrame() {
    if (!this.currentRecording || !this.game || !this.game.getAllBikes) return;
    
    const frame = this.currentRecording.frames[this.currentFrameIndex];
    if (!frame || !frame.bikes) return;
    
    const bikes = this.game.getAllBikes();
    if (bikes && frame.bikes) {
      frame.bikes.forEach((bikeState, i) => {
        if (bikes[i]) {
          const bike = bikes[i];
          bike.x = bikeState.x;
          bike.y = bikeState.y;
          bike.angle = bikeState.angle;
          bike.speed = bikeState.speed;
          bike.lap = bikeState.lap;
          bike.checkpointIndex = bikeState.checkpointIndex;
          bike.position = bikeState.position;
        }
      });
    }
    
    if (this.game.camera && frame.camera) {
      this.game.camera.x = frame.camera.x;
      this.game.camera.y = frame.camera.y;
      this.game.camera.shake = frame.camera.shake || 0;
    }
  }

  _showHUD() {
    this.hudElement.style.display = 'flex';
  }

  _hideHUD() {
    this.hudElement.style.display = 'none';
  }

  _updateHUD() {
    const icon = document.getElementById('replayIcon');
    const text = document.getElementById('replayText');
    const time = document.getElementById('replayTime');
    
    if (this.state === ReplayState.RECORDING) {
      icon.textContent = '⏺️';
      icon.style.animation = 'blink 1s infinite';
      text.textContent = '录制中';
      text.style.color = '#ff0066';
      
      if (this.currentRecording) {
        const elapsed = Date.now() - this.currentRecording.meta.startTime;
        time.textContent = this._formatTime(elapsed);
      }
      
    } else if (this.state === ReplayState.PLAYING) {
      icon.textContent = '▶️';
      icon.style.animation = 'none';
      text.textContent = '回放中';
      text.style.color = '#00f5ff';
      
      if (this.currentRecording && this.currentRecording.frames[this.currentFrameIndex]) {
        const frameTime = this.currentRecording.frames[this.currentFrameIndex].t;
        time.textContent = this._formatTime(frameTime);
      }
      
    } else if (this.state === ReplayState.PAUSED) {
      icon.textContent = '⏸️';
      icon.style.animation = 'none';
      text.textContent = '已暂停';
      text.style.color = '#ffff00';
    }
  }

  _formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }

  render(ctx, renderer) {
    if (this.state === ReplayState.IDLE) return;
    this._updateHUD();
  }

  isPlaying() {
    return this.state === ReplayState.PLAYING || this.state === ReplayState.PAUSED;
  }

  isRecording() {
    return this.state === ReplayState.RECORDING;
  }

  getCurrentFrame() {
    if (!this.currentRecording) return null;
    return this.currentRecording.frames[this.currentFrameIndex];
  }

  getProgress() {
    if (!this.currentRecording || this.currentRecording.frames.length === 0) return 0;
    return this.currentFrameIndex / (this.currentRecording.frames.length - 1);
  }

  getState() {
    return this.state;
  }

  getMainReplayBike() {
    if (!this.game || !this.game.getAllBikes) return null;
    const bikes = this.game.getAllBikes();
    return bikes.find(b => b.isPlayer) || bikes[0];
  }
}
