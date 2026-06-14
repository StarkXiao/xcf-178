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

const GhostState = {
  IDLE: 'idle',
  RACING: 'racing',
  FINISHED: 'finished'
};

class GhostReplay {
  constructor(game) {
    this.game = game;
    this.state = GhostState.IDLE;
    
    this.bestLapGhost = null;
    this.currentLapTrajectory = [];
    this.lapTrajectories = [];
    
    this.ghostVisible = true;
    this.ghostTrailVisible = true;
    
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
    this.ghostLapDistance = 0;
    
    this.lastRecordTime = 0;
    this.recordInterval = 33;
    
    this.isReplayMode = false;
    this.replayLapIndex = 0;
    
    this._loadBestLapGhost();
  }

  _loadBestLapGhost() {
    try {
      const key = this._getBestLapStorageKey();
      const data = localStorage.getItem(key);
      if (data) {
        this.bestLapGhost = JSON.parse(data);
      }
    } catch (e) {
      console.error('加载最佳圈速幽灵失败:', e);
    }
  }

  _saveBestLapGhost() {
    if (!this.bestLapGhost) return;
    try {
      const key = this._getBestLapStorageKey();
      localStorage.setItem(key, JSON.stringify(this.bestLapGhost));
    } catch (e) {
      console.error('保存最佳圈速幽灵失败:', e);
    }
  }

  _getBestLapStorageKey() {
    const difficulty = this.game?.difficulty || 'normal';
    const trackKey = this.game?._editorConfig?.name || 'default';
    return `ghost_bestLap_${difficulty}_${trackKey}`;
  }

  startRaceRecording() {
    this.currentLapTrajectory = [];
    this.lapTrajectories = [];
    this.lastRecordTime = 0;
    this.state = GhostState.RACING;
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
  }

  recordFrame(dt, playerBike) {
    if (this.state !== GhostState.RACING || !playerBike) return;
    
    this.lastRecordTime += dt * 1000;
    if (this.lastRecordTime < this.recordInterval) return;
    this.lastRecordTime = 0;
    
    const frame = {
      t: playerBike.raceTime,
      x: playerBike.x,
      y: playerBike.y,
      angle: playerBike.angle,
      speed: playerBike.speed,
      nitro: playerBike.nitroActive || false,
      drift: playerBike.driftFactor || 0
    };
    
    this.currentLapTrajectory.push(frame);
  }

  onLapComplete(lapTime, lapIndex) {
    if (this.currentLapTrajectory.length === 0) return;
    
    const lapData = {
      lapIndex: lapIndex,
      lapTime: lapTime,
      frames: [...this.currentLapTrajectory]
    };
    
    this.lapTrajectories.push(lapData);
    
    if (!this.bestLapGhost || lapTime < this.bestLapGhost.lapTime) {
      this.bestLapGhost = {
        lapTime: lapTime,
        lapIndex: lapIndex,
        date: Date.now(),
        frames: [...this.currentLapTrajectory]
      };
      this._saveBestLapGhost();
      this.game.isNewBestLapGhost = true;
    }
    
    this.currentLapTrajectory = [];
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
  }

  updateGhost(dt, playerLap, playerRaceTime) {
    if (!this.bestLapGhost || !this.ghostVisible) return null;
    if (this.state !== GhostState.RACING) return null;
    
    if (playerLap < 1) return null;
    
    this.ghostLapTime += dt * 1000;
    
    const frames = this.bestLapGhost.frames;
    if (frames.length < 2) return null;
    
    while (this.currentGhostFrameIndex < frames.length - 1 && 
           frames[this.currentGhostFrameIndex + 1].t < this.ghostLapTime) {
      this.currentGhostFrameIndex++;
    }
    
    if (this.currentGhostFrameIndex >= frames.length - 1) {
      return frames[frames.length - 1];
    }
    
    const currFrame = frames[this.currentGhostFrameIndex];
    const nextFrame = frames[this.currentGhostFrameIndex + 1];
    const frameDuration = nextFrame.t - currFrame.t;
    const progress = frameDuration > 0 ? (this.ghostLapTime - currFrame.t) / frameDuration : 0;
    const t = Math.max(0, Math.min(1, progress));
    
    return {
      x: Utils.lerp(currFrame.x, nextFrame.x, t),
      y: Utils.lerp(currFrame.y, nextFrame.y, t),
      angle: Utils.lerpAngle(currFrame.angle, nextFrame.angle, t),
      speed: Utils.lerp(currFrame.speed, nextFrame.speed, t),
      nitro: nextFrame.nitro,
      drift: Utils.lerp(currFrame.drift, nextFrame.drift, t),
      lapTime: this.ghostLapTime
    };
  }

  resetGhostForNewLap() {
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
  }

  getGhostPosition() {
    if (!this.bestLapGhost || !this.ghostVisible) return null;
    
    const frames = this.bestLapGhost.frames;
    if (frames.length === 0) return null;
    
    const idx = Math.min(this.currentGhostFrameIndex, frames.length - 1);
    return frames[idx];
  }

  getBestLapTime() {
    return this.bestLapGhost ? this.bestLapGhost.lapTime : null;
  }

  getBestLapTrajectory() {
    return this.bestLapGhost ? this.bestLapGhost.frames : [];
  }

  getCurrentLapTrajectory() {
    return this.currentLapTrajectory;
  }

  getLapTrajectories() {
    return this.lapTrajectories;
  }

  getTimeDelta(playerRaceTime) {
    if (!this.bestLapGhost) return 0;
    const ghostTime = this.ghostLapTime;
    return playerRaceTime - ghostTime;
  }

  hasBestLapGhost() {
    return this.bestLapGhost !== null && this.bestLapGhost.frames.length > 0;
  }

  toggleGhost() {
    this.ghostVisible = !this.ghostVisible;
    return this.ghostVisible;
  }

  toggleGhostTrail() {
    this.ghostTrailVisible = !this.ghostTrailVisible;
    return this.ghostTrailVisible;
  }

  isGhostVisible() {
    return this.ghostVisible && this.hasBestLapGhost();
  }

  isGhostTrailVisible() {
    return this.ghostTrailVisible && this.hasBestLapGhost();
  }

  getComparisonData() {
    if (!this.bestLapGhost || this.lapTrajectories.length === 0) return null;
    
    const lastLap = this.lapTrajectories[this.lapTrajectories.length - 1];
    if (!lastLap) return null;
    
    return {
      bestLapTime: this.bestLapGhost.lapTime,
      bestLapIndex: this.bestLapGhost.lapIndex,
      currentLapTime: lastLap.lapTime,
      currentLapIndex: lastLap.lapIndex,
      timeDiff: lastLap.lapTime - this.bestLapGhost.lapTime,
      isNewBest: lastLap.lapTime <= this.bestLapGhost.lapTime
    };
  }

  getDetailedComparison() {
    if (!this.bestLapGhost || this.lapTrajectories.length === 0) return null;
    
    const lastLap = this.lapTrajectories[this.lapTrajectories.length - 1];
    if (!lastLap) return null;
    
    const bestFrames = this.bestLapGhost.frames;
    const currentFrames = lastLap.frames;
    
    const segmentCount = 5;
    const segments = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const bestStartIdx = Math.floor(i * bestFrames.length / segmentCount);
      const bestEndIdx = Math.floor((i + 1) * bestFrames.length / segmentCount) - 1;
      const currentStartIdx = Math.floor(i * currentFrames.length / segmentCount);
      const currentEndIdx = Math.floor((i + 1) * currentFrames.length / segmentCount) - 1;
      
      if (bestEndIdx > bestStartIdx && currentEndIdx > currentStartIdx) {
        const bestSegmentTime = bestFrames[bestEndIdx].t - bestFrames[bestStartIdx].t;
        const currentSegmentTime = currentFrames[currentEndIdx].t - currentFrames[currentStartIdx].t;
        const timeDiff = currentSegmentTime - bestSegmentTime;
        
        const bestAvgSpeed = this._calculateAverageSpeed(bestFrames, bestStartIdx, bestEndIdx);
        const currentAvgSpeed = this._calculateAverageSpeed(currentFrames, currentStartIdx, currentEndIdx);
        
        const bestMaxSpeed = this._calculateMaxSpeed(bestFrames, bestStartIdx, bestEndIdx);
        const currentMaxSpeed = this._calculateMaxSpeed(currentFrames, currentStartIdx, currentEndIdx);
        
        const bestNitroTime = this._calculateNitroTime(bestFrames, bestStartIdx, bestEndIdx);
        const currentNitroTime = this._calculateNitroTime(currentFrames, currentStartIdx, currentEndIdx);
        
        segments.push({
          segmentIndex: i,
          segmentName: this._getSegmentName(i, segmentCount),
          bestTime: bestSegmentTime,
          currentTime: currentSegmentTime,
          timeDiff: timeDiff,
          bestAvgSpeed: bestAvgSpeed,
          currentAvgSpeed: currentAvgSpeed,
          bestMaxSpeed: bestMaxSpeed,
          currentMaxSpeed: currentMaxSpeed,
          bestNitroTime: bestNitroTime,
          currentNitroTime: currentNitroTime,
          status: timeDiff > 100 ? 'slow' : (timeDiff < -100 ? 'fast' : 'equal')
        });
      }
    }
    
    const bestTotalNitro = this._calculateNitroTime(bestFrames, 0, bestFrames.length - 1);
    const currentTotalNitro = this._calculateNitroTime(currentFrames, 0, currentFrames.length - 1);
    
    const bestAvgSpeed = this._calculateAverageSpeed(bestFrames, 0, bestFrames.length - 1);
    const currentAvgSpeed = this._calculateAverageSpeed(currentFrames, 0, currentFrames.length - 1);
    
    const bestMaxSpeed = this._calculateMaxSpeed(bestFrames, 0, bestFrames.length - 1);
    const currentMaxSpeed = this._calculateMaxSpeed(currentFrames, 0, currentFrames.length - 1);
    
    return {
      lapComparison: this.getComparisonData(),
      segments: segments,
      bestAvgSpeed: bestAvgSpeed,
      currentAvgSpeed: currentAvgSpeed,
      bestMaxSpeed: bestMaxSpeed,
      currentMaxSpeed: currentMaxSpeed,
      bestTotalNitro: bestTotalNitro,
      currentTotalNitro: currentTotalNitro,
      bestFrames: bestFrames,
      currentFrames: currentFrames
    };
  }

  _getSegmentName(index, total) {
    const names = ['起步区', '第1弯道区', '直道区', '第2弯道区', '终点区'];
    return names[index] || `赛段${index + 1}`;
  }

  _calculateAverageSpeed(frames, startIdx, endIdx) {
    if (endIdx <= startIdx) return 0;
    let total = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      total += frames[i].speed || 0;
    }
    return total / (endIdx - startIdx + 1);
  }

  _calculateMaxSpeed(frames, startIdx, endIdx) {
    if (endIdx <= startIdx) return 0;
    let max = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      max = Math.max(max, frames[i].speed || 0);
    }
    return max;
  }

  _calculateNitroTime(frames, startIdx, endIdx) {
    if (endIdx <= startIdx) return 0;
    let nitroFrames = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      if (frames[i].nitro) nitroFrames++;
    }
    return nitroFrames * this.recordInterval;
  }

  getOptimalRaceLine() {
    if (!this.bestLapGhost) return null;
    return this.bestLapGhost.frames.map(f => ({
      x: f.x,
      y: f.y,
      speed: f.speed,
      nitro: f.nitro
    }));
  }

  getCurrentRaceLine() {
    if (this.lapTrajectories.length === 0) return null;
    const lastLap = this.lapTrajectories[this.lapTrajectories.length - 1];
    if (!lastLap) return null;
    return lastLap.frames.map(f => ({
      x: f.x,
      y: f.y,
      speed: f.speed,
      nitro: f.nitro
    }));
  }

  getDualTrajectoryComparison() {
    if (!this.bestLapGhost || this.lapTrajectories.length === 0) return null;
    
    const lastLap = this.lapTrajectories[this.lapTrajectories.length - 1];
    if (!lastLap) return null;
    
    return {
      bestTrajectory: this.getOptimalRaceLine(),
      currentTrajectory: this.getCurrentRaceLine(),
      bestTime: this.bestLapGhost.lapTime,
      currentTime: lastLap.lapTime
    };
  }

  getAnalysisSummary() {
    const detailed = this.getDetailedComparison();
    if (!detailed) return null;
    
    const slowSegments = detailed.segments.filter(s => s.status === 'slow');
    const fastSegments = detailed.segments.filter(s => s.status === 'fast');
    
    const suggestions = [];
    
    if (detailed.currentMaxSpeed < detailed.bestMaxSpeed * 0.95) {
      suggestions.push({
        type: 'speed',
        priority: 'high',
        text: `最高速度低于最佳圈速 ${((detailed.bestMaxSpeed - detailed.currentMaxSpeed) / detailed.bestMaxSpeed * 100).toFixed(1)}%，尝试在直道上更充分地加速`
      });
    }
    
    if (detailed.currentTotalNitro < detailed.bestTotalNitro * 0.7) {
      suggestions.push({
        type: 'nitro',
        priority: 'medium',
        text: `氮气使用时间少于最佳圈速，尝试在直道和出弯时更多使用氮气`
      });
    }
    
    if (detailed.currentAvgSpeed < detailed.bestAvgSpeed * 0.95) {
      suggestions.push({
        type: 'cornering',
        priority: 'high',
        text: `平均速度较低，注意过弯路线，保持更高的过弯速度`
      });
    }
    
    slowSegments.forEach(seg => {
      suggestions.push({
        type: 'segment',
        priority: 'medium',
        text: `${seg.segmentName}较慢，比最佳圈速慢 ${Utils.formatTime(seg.timeDiff)}，注意该路段的行驶路线`
      });
    });
    
    if (fastSegments.length > 0) {
      suggestions.push({
        type: 'positive',
        priority: 'low',
        text: `${fastSegments.length}个赛段表现出色，继续保持！`
      });
    }
    
    return {
      slowSegments: slowSegments,
      fastSegments: fastSegments,
      suggestions: suggestions
    };
  }

  clearBestLapGhost() {
    this.bestLapGhost = null;
    try {
      const key = this._getBestLapStorageKey();
      localStorage.removeItem(key);
    } catch (e) {}
  }

  startReplay(lapIndex = -1) {
    if (!this.bestLapGhost) return false;
    
    this.isReplayMode = true;
    this.replayLapIndex = lapIndex;
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
    return true;
  }

  stopReplay() {
    this.isReplayMode = false;
    this.replayLapIndex = 0;
    this.isReplayPaused = false;
  }

  pauseReplayGhost() {
    if (!this.isReplayMode) return;
    this.isReplayPaused = true;
  }

  resumeReplayGhost() {
    if (!this.isReplayMode) return;
    this.isReplayPaused = false;
  }

  toggleReplayPause() {
    if (!this.isReplayMode) return;
    this.isReplayPaused = !this.isReplayPaused;
    return this.isReplayPaused;
  }

  restartReplayGhost() {
    if (!this.bestLapGhost) return false;
    this.currentGhostFrameIndex = 0;
    this.ghostLapTime = 0;
    this.isReplayPaused = false;
    return true;
  }

  updateReplay(dt) {
    if (!this.isReplayMode || !this.bestLapGhost || this.isReplayPaused) return null;
    
    this.ghostLapTime += dt * 1000;
    
    const frames = this.bestLapGhost.frames;
    if (frames.length < 2) return null;
    
    while (this.currentGhostFrameIndex < frames.length - 1 && 
           frames[this.currentGhostFrameIndex + 1].t < this.ghostLapTime) {
      this.currentGhostFrameIndex++;
    }
    
    if (this.currentGhostFrameIndex >= frames.length - 1) {
      return { ...frames[frames.length - 1], finished: true };
    }
    
    const currFrame = frames[this.currentGhostFrameIndex];
    const nextFrame = frames[this.currentGhostFrameIndex + 1];
    const frameDuration = nextFrame.t - currFrame.t;
    const progress = frameDuration > 0 ? (this.ghostLapTime - currFrame.t) / frameDuration : 0;
    const t = Math.max(0, Math.min(1, progress));
    
    return {
      x: Utils.lerp(currFrame.x, nextFrame.x, t),
      y: Utils.lerp(currFrame.y, nextFrame.y, t),
      angle: Utils.lerpAngle(currFrame.angle, nextFrame.angle, t),
      speed: Utils.lerp(currFrame.speed, nextFrame.speed, t),
      nitro: nextFrame.nitro,
      drift: Utils.lerp(currFrame.drift, nextFrame.drift, t),
      lapTime: this.ghostLapTime,
      progress: this.ghostLapTime / this.bestLapGhost.lapTime,
      finished: false
    };
  }

  getReplayProgress() {
    if (!this.bestLapGhost || !this.isReplayMode) return 0;
    return Math.min(1, this.ghostLapTime / this.bestLapGhost.lapTime);
  }

  renderTrail(ctx, track) {
    if (!this.isGhostTrailVisible()) return;
    
    const frames = this.getBestLapTrajectory();
    if (frames.length < 2) return;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    
    ctx.beginPath();
    ctx.moveTo(frames[0].x, frames[0].y);
    for (let i = 1; i < frames.length; i++) {
      ctx.lineTo(frames[i].x, frames[i].y);
    }
    ctx.stroke();
    
    ctx.restore();
  }

  renderGhost(ctx, ghostState) {
    if (!ghostState || !this.ghostVisible) return;
    
    ctx.save();
    ctx.globalAlpha = 0.5;
    
    ctx.translate(ghostState.x, ghostState.y);
    ctx.rotate(ghostState.angle);
    
    const wheelBase = 24;
    const bikeWidth = 14;
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    
    ctx.fillStyle = '#ff00ff';
    ctx.globalAlpha = 0.6;
    
    ctx.beginPath();
    ctx.moveTo(wheelBase * 0.5, 0);
    ctx.lineTo(wheelBase * 0.2, -bikeWidth * 0.5);
    ctx.lineTo(-wheelBase * 0.3, -bikeWidth * 0.4);
    ctx.lineTo(-wheelBase * 0.5, -bikeWidth * 0.25);
    ctx.lineTo(-wheelBase * 0.5, bikeWidth * 0.25);
    ctx.lineTo(-wheelBase * 0.3, bikeWidth * 0.4);
    ctx.lineTo(wheelBase * 0.2, bikeWidth * 0.5);
    ctx.closePath();
    ctx.fill();
    
    if (ghostState.nitro) {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(-wheelBase * 0.5, -4);
      ctx.lineTo(-wheelBase * 0.9 - Math.random() * 8, 0);
      ctx.lineTo(-wheelBase * 0.5, 4);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
}
