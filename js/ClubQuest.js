const QuestRarity = {
  common: { name: '普通', color: '#888888', multiplier: 1 },
  rare: { name: '稀有', color: '#00f5ff', multiplier: 1.5 },
  epic: { name: '史诗', color: '#ff00ff', multiplier: 2 },
  legendary: { name: '传说', color: '#ffd700', multiplier: 3 }
};

const QuestTypes = {
  finish_race: {
    id: 'finish_race',
    name: '完成比赛',
    description: '完成 {target} 场比赛',
    icon: '🏁',
    unit: '场'
  },
  get_first: {
    id: 'get_first',
    name: '获得冠军',
    description: '获得 {target} 次第1名',
    icon: '🏆',
    unit: '次'
  },
  drift_distance: {
    id: 'drift_distance',
    name: '漂移距离',
    description: '累计漂移 {target} 米',
    icon: '🔥',
    unit: 'm'
  },
  use_nitro: {
    id: 'use_nitro',
    name: '氮气使用',
    description: '使用氮气累计 {target} 秒',
    icon: '💨',
    unit: '秒'
  },
  flawless_race: {
    id: 'flawless_race',
    name: '完美驾驶',
    description: '无碰撞完成 {target} 场比赛',
    icon: '🛡️',
    unit: '场'
  },
  best_lap: {
    id: 'best_lap',
    name: '最快单圈',
    description: '单圈成绩进入 {target} 秒以内',
    icon: '⚡',
    unit: '秒',
    isLowerBetter: true
  },
  destroy_obstacles: {
    id: 'destroy_obstacles',
    name: '破坏障碍',
    description: '累计破坏 {target} 个障碍物',
    icon: '💥',
    unit: '个'
  },
  top3_finish: {
    id: 'top3_finish',
    name: '跻身前三',
    description: '进入前3名 {target} 次',
    icon: '🥉',
    unit: '次'
  }
};

const QuestTypeKeys = Object.keys(QuestTypes);

const DailyQuestConfig = {
  questCount: 3,
  resetHour: 0,
  baseCoinReward: 100,
  baseXpReward: 50
};

const StreakMilestones = [
  { days: 3, name: '三日连胜', reward: { coins: 300, xp: 100 }, icon: '🔥' },
  { days: 7, name: '周连胜', reward: { coins: 800, xp: 300 }, icon: '⭐' },
  { days: 14, name: '半月连胜', reward: { coins: 2000, xp: 800 }, icon: '💎' },
  { days: 30, name: '月连胜', reward: { coins: 5000, xp: 2000 }, icon: '👑' }
];

const QuestTargetRanges = {
  finish_race: { common: [1, 2], rare: [2, 4], epic: [4, 6], legendary: [6, 10] },
  get_first: { common: [1, 1], rare: [1, 2], epic: [2, 3], legendary: [3, 5] },
  drift_distance: { common: [500, 1000], rare: [1000, 2000], epic: [2000, 4000], legendary: [4000, 8000] },
  use_nitro: { common: [10, 20], rare: [20, 40], epic: [40, 80], legendary: [80, 150] },
  flawless_race: { common: [1, 1], rare: [1, 2], epic: [2, 3], legendary: [3, 5] },
  best_lap: { common: [45, 50], rare: [35, 40], epic: [28, 32], legendary: [22, 25] },
  destroy_obstacles: { common: [5, 10], rare: [10, 20], epic: [20, 40], legendary: [40, 80] },
  top3_finish: { common: [1, 2], rare: [2, 3], epic: [3, 5], legendary: [5, 8] }
};

class ClubQuestManager {
  constructor() {
    this.dailyQuests = [];
    this.streakDays = 0;
    this.lastCompleteDate = null;
    this.lastRefreshDate = null;
    this.totalXp = 0;
    this.clubLevel = 1;
    this.claimedRewards = {};
    this.claimedStreakRewards = {};
    this._newlyCompletedQuests = [];
    this._notificationQueue = [];
    this._currentNotification = null;
    this._notificationTimer = 0;
    this._load();
    this._checkDailyReset();
  }

  _getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  _getYesterdayKey() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  }

  _load() {
    try {
      const data = localStorage.getItem('neonRacer_clubQuests');
      if (data) {
        const parsed = JSON.parse(data);
        this.dailyQuests = parsed.dailyQuests || [];
        this.streakDays = parsed.streakDays || 0;
        this.lastCompleteDate = parsed.lastCompleteDate || null;
        this.lastRefreshDate = parsed.lastRefreshDate || null;
        this.totalXp = parsed.totalXp || 0;
        this.clubLevel = parsed.clubLevel || 1;
        this.claimedRewards = parsed.claimedRewards || {};
        this.claimedStreakRewards = parsed.claimedStreakRewards || {};
      }
    } catch (e) {
      this.dailyQuests = [];
      this.streakDays = 0;
      this.lastCompleteDate = null;
      this.lastRefreshDate = null;
      this.totalXp = 0;
      this.clubLevel = 1;
      this.claimedRewards = {};
      this.claimedStreakRewards = {};
    }
  }

  _save() {
    try {
      localStorage.setItem('neonRacer_clubQuests', JSON.stringify({
        dailyQuests: this.dailyQuests,
        streakDays: this.streakDays,
        lastCompleteDate: this.lastCompleteDate,
        lastRefreshDate: this.lastRefreshDate,
        totalXp: this.totalXp,
        clubLevel: this.clubLevel,
        claimedRewards: this.claimedRewards,
        claimedStreakRewards: this.claimedStreakRewards
      }));
    } catch (e) {}
  }

  _checkDailyReset() {
    const todayKey = this._getTodayKey();
    if (this.lastRefreshDate !== todayKey) {
      this._refreshDailyQuests();
      this._checkStreakBreak();
    }
  }

  _checkStreakBreak() {
    const yesterdayKey = this._getYesterdayKey();
    if (this.lastCompleteDate && this.lastCompleteDate !== yesterdayKey && this.lastCompleteDate !== this._getTodayKey()) {
      this.streakDays = 0;
    }
  }

  _refreshDailyQuests() {
    const todayKey = this._getTodayKey();
    this.dailyQuests = this._generateDailyQuests();
    this.lastRefreshDate = todayKey;
    this._save();
  }

  _generateDailyQuests() {
    const quests = [];
    const usedTypes = [];
    const todayKey = this._getTodayKey();

    for (let i = 0; i < DailyQuestConfig.questCount; i++) {
      let typeId;
      do {
        typeId = QuestTypeKeys[Math.floor(Math.random() * QuestTypeKeys.length)];
      } while (usedTypes.includes(typeId) && usedTypes.length < QuestTypeKeys.length);
      usedTypes.push(typeId);

      const rarityRoll = Math.random();
      let rarity;
      if (rarityRoll < 0.5) rarity = 'common';
      else if (rarityRoll < 0.8) rarity = 'rare';
      else if (rarityRoll < 0.95) rarity = 'epic';
      else rarity = 'legendary';

      const ranges = QuestTargetRanges[typeId];
      const range = ranges ? ranges[rarity] : ranges.common;
      const target = Utils.randomInt(range[0], range[1]);

      const typeInfo = QuestTypes[typeId];
      const rarityInfo = QuestRarity[rarity];
      const baseCoin = DailyQuestConfig.baseCoinReward * rarityInfo.multiplier;
      const baseXp = DailyQuestConfig.baseXpReward * rarityInfo.multiplier;

      quests.push({
        id: `${todayKey}_${i}`,
        typeId: typeId,
        name: typeInfo.name,
        description: typeInfo.description.replace('{target}', target),
        icon: typeInfo.icon,
        unit: typeInfo.unit,
        target: target,
        progress: 0,
        rarity: rarity,
        rarityInfo: { name: rarityInfo.name, color: rarityInfo.color },
        reward: {
          coins: Math.floor(baseCoin * (target / (range[0] + range[1]) * 2)),
          xp: Math.floor(baseXp * (target / (range[0] + range[1]) * 2))
        },
        isLowerBetter: typeInfo.isLowerBetter || false,
        completed: false,
        claimed: false
      });
    }

    return quests;
  }

  updateProgress(typeId, value) {
    this._checkDailyReset();
    const typeInfo = QuestTypes[typeId];
    if (!typeInfo) return;

    let updated = false;

    for (const quest of this.dailyQuests) {
      if (quest.typeId !== typeId || quest.completed) continue;

      if (quest.isLowerBetter) {
        if (value > 0 && (quest.progress === 0 || value < quest.progress)) {
          quest.progress = value;
          updated = true;
        }
      } else {
        quest.progress += value;
        updated = true;
      }

      if (!quest.completed) {
        const isComplete = quest.isLowerBetter
          ? (quest.progress > 0 && quest.progress <= quest.target)
          : quest.progress >= quest.target;

        if (isComplete) {
          quest.completed = true;
          quest.progress = quest.target;
          this._newlyCompletedQuests.push(quest);
          this._notificationQueue.push({ type: 'quest_complete', quest });
          this._updateStreakOnComplete();
        }
      }
    }

    if (updated) {
      this._save();
    }
  }

  setProgress(typeId, value) {
    this._checkDailyReset();
    const typeInfo = QuestTypes[typeId];
    if (!typeInfo) return;

    let updated = false;

    for (const quest of this.dailyQuests) {
      if (quest.typeId !== typeId || quest.completed) continue;

      if (quest.isLowerBetter) {
        if (value > 0 && (quest.progress === 0 || value < quest.progress)) {
          quest.progress = value;
          updated = true;
        }
      } else {
        if (value > quest.progress) {
          quest.progress = value;
          updated = true;
        }
      }

      if (!quest.completed) {
        const isComplete = quest.isLowerBetter
          ? (quest.progress > 0 && quest.progress <= quest.target)
          : quest.progress >= quest.target;

        if (isComplete) {
          quest.completed = true;
          quest.progress = quest.target;
          this._newlyCompletedQuests.push(quest);
          this._notificationQueue.push({ type: 'quest_complete', quest });
          this._updateStreakOnComplete();
        }
      }
    }

    if (updated) {
      this._save();
    }
  }

  _updateStreakOnComplete() {
    const todayKey = this._getTodayKey();
    if (this.lastCompleteDate === todayKey) return;

    const allCompleted = this.dailyQuests.every(q => q.completed);
    if (allCompleted) {
      const yesterdayKey = this._getYesterdayKey();
      if (this.lastCompleteDate === yesterdayKey) {
        this.streakDays++;
      } else {
        this.streakDays = 1;
      }
      this.lastCompleteDate = todayKey;
      this._checkStreakMilestone();
    }
  }

  _checkStreakMilestone() {
    for (const milestone of StreakMilestones) {
      if (this.streakDays === milestone.days) {
        this._notificationQueue.push({ type: 'streak_milestone', milestone });
        break;
      }
    }
  }

  claimQuestReward(questId) {
    const quest = this.dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    quest.claimed = true;
    this.totalXp += quest.reward.xp;
    this.claimedRewards[questId] = { date: Date.now() };

    this._updateClubLevel();
    this._save();

    return {
      coins: quest.reward.coins,
      xp: quest.reward.xp
    };
  }

  claimAllRewards() {
    const rewards = { coins: 0, xp: 0 };
    for (const quest of this.dailyQuests) {
      if (quest.completed && !quest.claimed) {
        const result = this.claimQuestReward(quest.id);
        if (result) {
          rewards.coins += result.coins;
          rewards.xp += result.xp;
        }
      }
    }
    return rewards;
  }

  claimStreakReward(days) {
    const milestone = StreakMilestones.find(m => m.days === days);
    if (!milestone) return null;
    if (this.streakDays < days) return null;
    if (this.claimedStreakRewards[days]) return null;

    this.claimedStreakRewards[days] = { date: Date.now() };
    this.totalXp += milestone.reward.xp;

    this._updateClubLevel();
    this._save();

    return { ...milestone.reward };
  }

  _updateClubLevel() {
    const xpPerLevel = 500;
    const newLevel = Math.floor(this.totalXp / xpPerLevel) + 1;
    if (newLevel > this.clubLevel) {
      this.clubLevel = newLevel;
      this._notificationQueue.push({ type: 'level_up', level: newLevel });
    }
  }

  getDailyQuests() {
    this._checkDailyReset();
    return this.dailyQuests;
  }

  getStreakDays() {
    this._checkDailyReset();
    return this.streakDays;
  }

  getClubLevel() {
    return this.clubLevel;
  }

  getTotalXp() {
    return this.totalXp;
  }

  getXpForNextLevel() {
    const xpPerLevel = 500;
    return xpPerLevel - (this.totalXp % xpPerLevel);
  }

  getLevelProgress() {
    const xpPerLevel = 500;
    return (this.totalXp % xpPerLevel) / xpPerLevel;
  }

  getCompletedCount() {
    return this.dailyQuests.filter(q => q.completed).length;
  }

  getUnclaimedCount() {
    return this.dailyQuests.filter(q => q.completed && !q.claimed).length;
  }

  getStreakMilestones() {
    return StreakMilestones.map(milestone => ({
      ...milestone,
      achieved: this.streakDays >= milestone.days,
      claimed: !!this.claimedStreakRewards[milestone.days]
    }));
  }

  getNewlyCompletedQuests() {
    const result = [...this._newlyCompletedQuests];
    this._newlyCompletedQuests = [];
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
      this.updateProgress('finish_race', 1);
    }

    if (playerRank === 1) {
      this.updateProgress('get_first', 1);
    }

    if (playerRank && playerRank <= 3) {
      this.updateProgress('top3_finish', 1);
    }

    if (playerCollisions === 0 && finished) {
      this.updateProgress('flawless_race', 1);
    }

    if (raceDriftDistance) {
      this.updateProgress('drift_distance', Math.floor(raceDriftDistance));
    }

    if (bestLapTime && bestLapTime < Infinity) {
      const bestLapSeconds = bestLapTime / 1000;
      this.setProgress('best_lap', bestLapSeconds);
    }

    if (obstaclesDestroyed) {
      this.updateProgress('destroy_obstacles', obstaclesDestroyed);
    }

    if (nitroTotalTime) {
      this.updateProgress('use_nitro', Math.floor(nitroTotalTime));
    }
  }

  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(DailyQuestConfig.resetHour, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  formatTimeUntilReset() {
    const ms = this.getTimeUntilReset();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
