const AchievementRewards = {
  drift_trail_orange: { id: 'drift_trail_orange', name: '橙色漂移尾迹', type: 'trail', color: '#ff6600', rarity: 'common' },
  drift_trail_blue: { id: 'drift_trail_blue', name: '蓝色漂移尾迹', type: 'trail', color: '#00f5ff', rarity: 'rare' },
  drift_trail_rainbow: { id: 'drift_trail_rainbow', name: '彩虹漂移尾迹', type: 'trail', color: 'rainbow', rarity: 'legendary' },
  halo_gold: { id: 'halo_gold', name: '金色光环', type: 'halo', color: '#ffd700', rarity: 'rare' },
  halo_rainbow: { id: 'halo_rainbow', name: '彩虹光环', type: 'halo', color: 'rainbow', rarity: 'legendary' },
  skin_chrome: { id: 'skin_chrome', name: '镀铬皮肤', type: 'skin', color: '#c0c0c0', rarity: 'rare' },
  skin_gold: { id: 'skin_gold', name: '黄金皮肤', type: 'skin', color: '#ffd700', rarity: 'epic' },
  skin_rainbow: { id: 'skin_rainbow', name: '彩虹皮肤', type: 'skin', color: 'rainbow', rarity: 'legendary' },
  nitro_flame_blue: { id: 'nitro_flame_blue', name: '蓝色氮气焰', type: 'nitro', color: '#00f5ff', rarity: 'common' },
  nitro_flame_green: { id: 'nitro_flame_green', name: '绿色氮气焰', type: 'nitro', color: '#00ff66', rarity: 'rare' },
  nitro_flame_rainbow: { id: 'nitro_flame_rainbow', name: '彩虹氮气焰', type: 'nitro', color: 'rainbow', rarity: 'legendary' },
  title_rookie: { id: 'title_rookie', name: '新手车手', type: 'title', rarity: 'common' },
  title_veteran: { id: 'title_veteran', name: '老司机', type: 'title', rarity: 'rare' },
  title_legend: { id: 'title_legend', name: '传说车神', type: 'title', rarity: 'legendary' },
  emoji_thumbsup: { id: 'emoji_thumbsup', name: '点赞表情', type: 'emoji', icon: '👍', rarity: 'common' },
  emoji_rocket: { id: 'emoji_rocket', name: '火箭表情', type: 'emoji', icon: '🚀', rarity: 'rare' },
  emoji_crown: { id: 'emoji_crown', name: '皇冠表情', type: 'emoji', icon: '👑', rarity: 'epic' }
};

const RarityColors = {
  common: '#888888',
  rare: '#00f5ff',
  epic: '#ff00ff',
  legendary: '#ffd700'
};

const RarityNames = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

const AchievementLines = {
  drift: {
    id: 'drift',
    name: '漂移大师',
    icon: '🔥',
    color: '#ff6600',
    description: '累计漂移距离',
    unit: 'm',
    pointsPerTier: 10,
    tiers: [
      { id: 'drift_1', name: '初入漂移', icon: '🏅', color: '#cd7f32', threshold: 1000, reward: 'drift_trail_orange', points: 5 },
      { id: 'drift_2', name: '漂移新手', icon: '🥉', color: '#cd7f32', threshold: 5000, reward: null, points: 10 },
      { id: 'drift_3', name: '漂移达人', icon: '🥈', color: '#c0c0c0', threshold: 20000, reward: 'drift_trail_blue', points: 20 },
      { id: 'drift_4', name: '漂移高手', icon: '🥇', color: '#ffd700', threshold: 50000, reward: 'halo_gold', points: 30 },
      { id: 'drift_5', name: '漂移专家', icon: '💎', color: '#00ffff', threshold: 100000, reward: 'skin_chrome', points: 50 },
      { id: 'drift_6', name: '漂移之王', icon: '👑', color: '#ff00ff', threshold: 200000, reward: 'drift_trail_rainbow', points: 100 }
    ]
  },
  champion: {
    id: 'champion',
    name: '冠军之路',
    icon: '🏆',
    color: '#ffff00',
    description: '完赛第1名次数',
    unit: '次',
    pointsPerTier: 20,
    tiers: [
      { id: 'champion_1', name: '初尝冠军', icon: '🏅', color: '#cd7f32', threshold: 1, reward: 'title_rookie', points: 10 },
      { id: 'champion_2', name: '小有名气', icon: '🥉', color: '#cd7f32', threshold: 3, reward: 'emoji_thumbsup', points: 20 },
      { id: 'champion_3', name: '连胜车手', icon: '🥈', color: '#c0c0c0', threshold: 6, reward: 'nitro_flame_blue', points: 30 },
      { id: 'champion_4', name: '赛道王者', icon: '🥇', color: '#ffd700', threshold: 10, reward: 'skin_gold', points: 50 },
      { id: 'champion_5', name: '冠军收割机', icon: '💎', color: '#00ffff', threshold: 20, reward: 'title_veteran', points: 80 },
      { id: 'champion_6', name: '传奇车神', icon: '👑', color: '#ff00ff', threshold: 50, reward: 'skin_rainbow', points: 150 }
    ]
  },
  flawless: {
    id: 'flawless',
    name: '无伤通关',
    icon: '🛡️',
    color: '#00ff66',
    description: '无碰撞完赛次数',
    unit: '次',
    pointsPerTier: 15,
    tiers: [
      { id: 'flawless_1', name: '小心驾驶', icon: '🏅', color: '#cd7f32', threshold: 1, reward: null, points: 10 },
      { id: 'flawless_2', name: '安全车手', icon: '🥉', color: '#cd7f32', threshold: 3, reward: 'nitro_flame_green', points: 15 },
      { id: 'flawless_3', name: '稳定发挥', icon: '🥈', color: '#c0c0c0', threshold: 6, reward: null, points: 25 },
      { id: 'flawless_4', name: '完美驾驶', icon: '🥇', color: '#ffd700', threshold: 10, reward: 'halo_rainbow', points: 40 },
      { id: 'flawless_5', name: '零失误王', icon: '💎', color: '#00ffff', threshold: 20, reward: 'emoji_crown', points: 60 },
      { id: 'flawless_6', name: '无瑕传说', icon: '👑', color: '#ff00ff', threshold: 30, reward: 'title_legend', points: 120 }
    ]
  },
  veteran: {
    id: 'veteran',
    name: '赛场老将',
    icon: '🎖️',
    color: '#aa66ff',
    description: '累计完成比赛场次',
    unit: '场',
    pointsPerTier: 8,
    tiers: [
      { id: 'veteran_1', name: '初出茅庐', icon: '🏅', color: '#cd7f32', threshold: 1, reward: null, points: 5 },
      { id: 'veteran_2', name: '赛场新秀', icon: '🥉', color: '#cd7f32', threshold: 5, reward: 'emoji_thumbsup', points: 10 },
      { id: 'veteran_3', name: '经验车手', icon: '🥈', color: '#c0c0c0', threshold: 15, reward: null, points: 20 },
      { id: 'veteran_4', name: '老司机', icon: '🥇', color: '#ffd700', threshold: 30, reward: 'title_veteran', points: 30 },
      { id: 'veteran_5', name: '赛场常青', icon: '💎', color: '#00ffff', threshold: 60, reward: 'skin_chrome', points: 50 },
      { id: 'veteran_6', name: '活化石', icon: '👑', color: '#ff00ff', threshold: 100, reward: 'emoji_rocket', points: 100 }
    ]
  },
  speedster: {
    id: 'speedster',
    name: '速度狂人',
    icon: '⚡',
    color: '#ff00aa',
    description: '最快单圈记录（毫秒）',
    unit: 'ms',
    isLowerBetter: true,
    pointsPerTier: 25,
    tiers: [
      { id: 'speedster_1', name: '起步加速', icon: '🏅', color: '#cd7f32', threshold: 60000, reward: null, points: 10 },
      { id: 'speedster_2', name: '风驰电掣', icon: '🥉', color: '#cd7f32', threshold: 45000, reward: 'nitro_flame_blue', points: 20 },
      { id: 'speedster_3', name: '极速玩家', icon: '🥈', color: '#c0c0c0', threshold: 35000, reward: null, points: 35 },
      { id: 'speedster_4', name: '闪电侠', icon: '🥇', color: '#ffd700', threshold: 28000, reward: 'emoji_rocket', points: 50 },
      { id: 'speedster_5', name: '音速车手', icon: '💎', color: '#00ffff', threshold: 22000, reward: 'skin_gold', points: 80 },
      { id: 'speedster_6', name: '光速传说', icon: '👑', color: '#ff00ff', threshold: 18000, reward: 'nitro_flame_rainbow', points: 150 }
    ]
  },
  destroyer: {
    id: 'destroyer',
    name: '破坏之王',
    icon: '💥',
    color: '#ff4444',
    description: '累计破坏障碍物数量',
    unit: '个',
    pointsPerTier: 12,
    tiers: [
      { id: 'destroyer_1', name: '初试牛刀', icon: '🏅', color: '#cd7f32', threshold: 5, reward: null, points: 5 },
      { id: 'destroyer_2', name: '破坏专家', icon: '🥉', color: '#cd7f32', threshold: 20, reward: null, points: 10 },
      { id: 'destroyer_3', name: '横冲直撞', icon: '🥈', color: '#c0c0c0', threshold: 50, reward: 'nitro_flame_green', points: 20 },
      { id: 'destroyer_4', name: '拆迁队长', icon: '🥇', color: '#ffd700', threshold: 100, reward: null, points: 35 },
      { id: 'destroyer_5', name: '毁灭战士', icon: '💎', color: '#00ffff', threshold: 200, reward: 'skin_chrome', points: 60 },
      { id: 'destroyer_6', name: '破坏之神', icon: '👑', color: '#ff00ff', threshold: 500, reward: 'halo_rainbow', points: 120 }
    ]
  },
  nitro: {
    id: 'nitro',
    name: '氮气大师',
    icon: '💨',
    color: '#00ddff',
    description: '累计使用氮气时长',
    unit: '秒',
    pointsPerTier: 15,
    tiers: [
      { id: 'nitro_1', name: '氮气新手', icon: '🏅', color: '#cd7f32', threshold: 10, reward: null, points: 5 },
      { id: 'nitro_2', name: '加速爱好者', icon: '🥉', color: '#cd7f32', threshold: 60, reward: 'nitro_flame_blue', points: 15 },
      { id: 'nitro_3', name: '氮气狂人', icon: '🥈', color: '#c0c0c0', threshold: 180, reward: null, points: 25 },
      { id: 'nitro_4', name: '加速狂魔', icon: '🥇', color: '#ffd700', threshold: 400, reward: 'emoji_rocket', points: 40 },
      { id: 'nitro_5', name: '氮气之神', icon: '💎', color: '#00ffff', threshold: 800, reward: 'nitro_flame_rainbow', points: 70 },
      { id: 'nitro_6', name: '永动机', icon: '👑', color: '#ff00ff', threshold: 1500, reward: 'halo_rainbow', points: 130 }
    ]
  }
};

const AchievementLineKeys = Object.keys(AchievementLines);

class AchievementManager {
  constructor() {
    this.progress = {};
    this.unlocked = {};
    this.totalPoints = 0;
    this.unlockedRewards = {};
    this._newlyUnlocked = [];
    this._newlyUnlockedRewards = [];
    this._notificationQueue = [];
    this._currentNotification = null;
    this._notificationTimer = 0;
    this._load();
  }

  _load() {
    try {
      const data = localStorage.getItem('neonRacer_achievements');
      if (data) {
        const parsed = JSON.parse(data);
        this.progress = parsed.progress || {};
        this.unlocked = parsed.unlocked || {};
        this.totalPoints = parsed.totalPoints || 0;
        this.unlockedRewards = parsed.unlockedRewards || {};
      }
    } catch (e) {
      this.progress = {};
      this.unlocked = {};
      this.totalPoints = 0;
      this.unlockedRewards = {};
    }
  }

  _save() {
    try {
      localStorage.setItem('neonRacer_achievements', JSON.stringify({
        progress: this.progress,
        unlocked: this.unlocked,
        totalPoints: this.totalPoints,
        unlockedRewards: this.unlockedRewards
      }));
    } catch (e) {}
  }

  updateProgress(lineId, value) {
    const line = AchievementLines[lineId];
    if (!line) return;

    if (line.isLowerBetter) {
      const current = this.progress[lineId];
      if (current === undefined || value < current) {
        this.progress[lineId] = value;
      }
    } else {
      this.progress[lineId] = (this.progress[lineId] || 0) + value;
    }
    this._checkUnlocks(lineId);
    this._save();
  }

  setProgress(lineId, value) {
    const line = AchievementLines[lineId];
    if (!line) return;

    if (line.isLowerBetter) {
      const current = this.progress[lineId];
      if (current === undefined || value < current) {
        this.progress[lineId] = value;
      }
    } else {
      this.progress[lineId] = value;
    }
    this._checkUnlocks(lineId);
    this._save();
  }

  _checkUnlocks(lineId) {
    const line = AchievementLines[lineId];
    if (!line) return;

    const currentValue = this.progress[lineId] || 0;

    for (const tier of line.tiers) {
      if (!this.unlocked[tier.id]) {
        const unlocked = line.isLowerBetter
          ? (currentValue > 0 && currentValue <= tier.threshold)
          : currentValue >= tier.threshold;

        if (unlocked) {
          this.unlocked[tier.id] = { date: Date.now() };
          this.totalPoints += tier.points || 0;

          if (tier.reward && AchievementRewards[tier.reward]) {
            if (!this.unlockedRewards[tier.reward]) {
              this.unlockedRewards[tier.reward] = { date: Date.now(), tierId: tier.id };
              this._newlyUnlockedRewards.push(AchievementRewards[tier.reward]);
            }
          }

          this._newlyUnlocked.push({
            tier,
            line,
            value: currentValue
          });
          this._notificationQueue.push({
            tier,
            line,
            value: currentValue
          });
        }
      }
    }
  }

  getNewlyUnlocked() {
    const result = [...this._newlyUnlocked];
    this._newlyUnlocked = [];
    return result;
  }

  getNewlyUnlockedRewards() {
    const result = [...this._newlyUnlockedRewards];
    this._newlyUnlockedRewards = [];
    return result;
  }

  getNextNotification() {
    if (!this._currentNotification && this._notificationQueue.length > 0) {
      this._currentNotification = this._notificationQueue.shift();
      this._notificationTimer = 3.0;
    }
    return this._currentNotification;
  }

  updateNotificationTimer(dt) {
    if (this._currentNotification) {
      this._notificationTimer -= dt;
      if (this._notificationTimer <= 0) {
        this._currentNotification = null;
      }
    }
  }

  getProgress(lineId) {
    return this.progress[lineId] || 0;
  }

  getTierStatus(tierId) {
    return this.unlocked[tierId] || null;
  }

  getLineStatus(lineId) {
    const line = AchievementLines[lineId];
    if (!line) return null;

    const currentValue = this.progress[lineId] || 0;
    let highestUnlockedTier = -1;
    let nextTier = null;

    if (line.isLowerBetter) {
      for (let i = line.tiers.length - 1; i >= 0; i--) {
        const tier = line.tiers[i];
        if (this.unlocked[tier.id]) {
          highestUnlockedTier = Math.max(highestUnlockedTier, i);
        }
      }
      for (let i = 0; i < line.tiers.length; i++) {
        if (!this.unlocked[line.tiers[i].id]) {
          nextTier = line.tiers[i];
          break;
        }
      }
    } else {
      for (let i = 0; i < line.tiers.length; i++) {
        if (this.unlocked[line.tiers[i].id]) {
          highestUnlockedTier = i;
        } else if (!nextTier) {
          nextTier = line.tiers[i];
        }
      }
    }

    return {
      currentValue,
      highestUnlockedTier,
      nextTier,
      totalTiers: line.tiers.length,
      isComplete: highestUnlockedTier === line.tiers.length - 1
    };
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }

  getTotalCount() {
    let total = 0;
    for (const lineId of AchievementLineKeys) {
      total += AchievementLines[lineId].tiers.length;
    }
    return total;
  }

  getTotalPoints() {
    return this.totalPoints;
  }

  hasReward(rewardId) {
    return !!this.unlockedRewards[rewardId];
  }

  getUnlockedRewards() {
    return Object.keys(this.unlockedRewards);
  }

  getRewardsByType(type) {
    return Object.keys(this.unlockedRewards).filter(id => {
      const reward = AchievementRewards[id];
      return reward && reward.type === type;
    });
  }

  getRewardInfo(rewardId) {
    return AchievementRewards[rewardId] || null;
  }

  processRaceResults(results) {
    const {
      playerRank,
      playerCollisions,
      raceDriftDistance,
      bestLapTime,
      obstaclesDestroyed,
      nitroTotalTime,
      finished
    } = results;

    if (finished) {
      this.updateProgress('veteran', 1);
    }

    this.updateProgress('drift', Math.floor(raceDriftDistance));

    if (playerRank === 1) {
      this.updateProgress('champion', 1);
    }

    if (playerCollisions === 0 && finished) {
      this.updateProgress('flawless', 1);
    }

    if (bestLapTime && bestLapTime < Infinity) {
      this.setProgress('speedster', Math.floor(bestLapTime));
    }

    if (obstaclesDestroyed) {
      this.updateProgress('destroyer', obstaclesDestroyed);
    }

    if (nitroTotalTime) {
      this.updateProgress('nitro', Math.floor(nitroTotalTime));
    }
  }
}
