const LeaderboardTrackKeys = ['all', 'stage1', 'stage2', 'stage3', 'stage4'];

const LeaderboardTrackNames = {
  all: '全部赛道',
  stage1: '新手训练营',
  stage2: '城市街道',
  stage3: '高速公路',
  stage4: '传奇之路'
};

const LeaderboardTrackColors = {
  all: '#00f5ff',
  stage1: '#00f5ff',
  stage2: '#ff00ff',
  stage3: '#ffff00',
  stage4: '#ff6600'
};

const LeaderboardFilterKeys = ['bestTime', 'bestLap', 'mostWins'];

const LeaderboardFilterNames = {
  bestTime: '总用时',
  bestLap: '最快圈',
  mostWins: '胜场数'
};

const LeaderboardSeasonKeys = ['all', 'spring', 'summer', 'autumn', 'winter'];

const LeaderboardSeasonNames = {
  all: '全赛季',
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
};

const MaxNicknameLength = 12;
const LeaderboardMaxEntries = 50;
const LeaderboardNicknameChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.';
const MinValidTime = 1000;
const LeaderboardVersion = 1;

class SeasonLeaderboardManager {
  constructor() {
    this.nickname = '';
    this.records = [];
    this.version = LeaderboardVersion;
    this._load();
  }

  _load() {
    try {
      const data = localStorage.getItem('neonRacer_seasonLeaderboard');
      if (data) {
        const saved = JSON.parse(data);
        this.nickname = this._sanitizeNickname(saved.nickname || '');
        this.records = this._validateRecords(saved.records || []);
        this.version = saved.version || 1;

        if (this.version < LeaderboardVersion) {
          this._migrateData(saved);
        }
      }
    } catch (e) {
      this.nickname = '';
      this.records = [];
      this.version = LeaderboardVersion;
    }
  }

  _save() {
    try {
      localStorage.setItem('neonRacer_seasonLeaderboard', JSON.stringify({
        nickname: this.nickname,
        records: this.records,
        version: this.version,
        lastUpdated: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save leaderboard data:', e);
    }
  }

  _sanitizeNickname(name) {
    if (!name || typeof name !== 'string') return '';
    const filtered = name.split('').filter(c => LeaderboardNicknameChars.includes(c)).join('');
    return filtered.substring(0, MaxNicknameLength);
  }

  _validateRecords(records) {
    if (!Array.isArray(records)) return [];

    const validStages = LeaderboardTrackKeys;
    const validSeasons = LeaderboardSeasonKeys.filter(s => s !== 'all');
    const validDifficulties = ['easy', 'normal', 'hard', 'hell'];

    return records
      .filter(r => {
        if (!r || typeof r !== 'object') return false;
        if (!r.nickname || typeof r.nickname !== 'string') return false;
        if (!r.eventId || typeof r.eventId !== 'string') return false;
        if (typeof r.time !== 'number' || r.time < MinValidTime || !isFinite(r.time)) return false;
        if (typeof r.bestLap !== 'number' || r.bestLap < 100 || !isFinite(r.bestLap)) return false;
        if (typeof r.rank !== 'number' || r.rank < 1 || r.rank > 5) return false;
        return true;
      })
      .map(r => ({
        eventId: String(r.eventId).substring(0, 64),
        stageId: validStages.includes(r.stageId) ? r.stageId : 'all',
        season: validSeasons.includes(r.season) ? r.season : 'spring',
        nickname: this._sanitizeNickname(r.nickname),
        rank: Math.max(1, Math.min(5, Math.floor(r.rank))),
        time: Math.max(MinValidTime, Number(r.time)),
        bestLap: Math.max(100, Number(r.bestLap)),
        vehicleType: r.vehicleType || 'phantom',
        difficulty: validDifficulties.includes(r.difficulty) ? r.difficulty : 'normal',
        weatherType: r.weatherType || 'clear',
        wins: Math.max(0, Math.floor(r.wins || 0)),
        date: typeof r.date === 'number' ? r.date : Date.now()
      }));
  }

  _migrateData(saved) {
    this.version = LeaderboardVersion;
    if (saved.records) {
      this.records = this._validateRecords(saved.records);
    }
    this._save();
  }

  setNickname(name) {
    const oldNickname = this.nickname;
    this.nickname = this._sanitizeNickname(name);

    if (oldNickname && oldNickname !== this.nickname) {
      this.records.forEach(r => {
        if (r.nickname === oldNickname) {
          r.nickname = this.nickname;
        }
      });
    }

    this._save();
  }

  getNickname() {
    return this.nickname;
  }

  hasNickname() {
    return this.nickname.length > 0;
  }

  addNicknameChar(char) {
    if (typeof char !== 'string' || char.length !== 1) return;
    if (!LeaderboardNicknameChars.includes(char)) return;
    if (this.nickname.length >= MaxNicknameLength) return;
    this.nickname += char;
    this._save();
  }

  removeNicknameChar() {
    if (this.nickname.length === 0) return;
    this.nickname = this.nickname.slice(0, -1);
    this._save();
  }

  clearNickname() {
    this.nickname = '';
    this._save();
  }

  recordRace(result) {
    const {
      eventId,
      stageId,
      season,
      rank,
      time,
      bestLap,
      vehicleType,
      difficulty,
      weatherType
    } = result;

    if (!this.hasNickname()) return false;
    if (typeof rank !== 'number' || rank < 1 || rank > 5) return false;
    if (typeof time !== 'number' || time < MinValidTime || !isFinite(time)) return false;
    if (typeof bestLap !== 'number' || bestLap < 100 || !isFinite(bestLap)) return false;
    if (!eventId || typeof eventId !== 'string') return false;

    const validStages = LeaderboardTrackKeys;
    const validSeasons = LeaderboardSeasonKeys.filter(s => s !== 'all');
    const validDifficulties = ['easy', 'normal', 'hard', 'hell'];

    const safeStageId = validStages.includes(stageId) ? stageId : 'all';
    const safeSeason = validSeasons.includes(season) ? season : 'spring';
    const safeDiff = validDifficulties.includes(difficulty) ? difficulty : 'normal';
    const safeVehicle = typeof vehicleType === 'string' ? vehicleType.substring(0, 32) : 'phantom';
    const safeWeather = typeof weatherType === 'string' ? weatherType.substring(0, 32) : 'clear';

    const existingIdx = this.records.findIndex(r =>
      r.eventId === eventId && r.nickname === this.nickname
    );

    const entry = {
      eventId: eventId.substring(0, 64),
      stageId: safeStageId,
      season: safeSeason,
      nickname: this.nickname,
      rank: Math.max(1, Math.min(5, Math.floor(rank))),
      time: Math.max(MinValidTime, time),
      bestLap: Math.max(100, bestLap),
      vehicleType: safeVehicle,
      difficulty: safeDiff,
      weatherType: safeWeather,
      wins: 0,
      date: Date.now()
    };

    let updated = false;
    let isNewRecord = true;

    if (existingIdx >= 0) {
      const existing = this.records[existingIdx];
      isNewRecord = false;

      if (time < existing.time) {
        entry.time = time;
        updated = true;
      } else {
        entry.time = existing.time;
      }

      if (bestLap < existing.bestLap) {
        entry.bestLap = bestLap;
        updated = true;
      } else {
        entry.bestLap = existing.bestLap;
      }

      if (rank === 1) {
        entry.wins = (existing.wins || 0) + 1;
        updated = true;
      } else {
        entry.wins = existing.wins || 0;
      }

      entry.date = Date.now();
      this.records[existingIdx] = entry;
    } else {
      if (rank === 1) {
        entry.wins = 1;
      }
      this.records.push(entry);
      updated = true;
    }

    this._pruneOldRecords();
    this._save();

    return {
      updated,
      isNewRecord,
      isNewBestTime: existingIdx >= 0 ? time < this.records[existingIdx].time : true,
      isNewBestLap: existingIdx >= 0 ? bestLap < this.records[existingIdx].bestLap : true
    };
  }

  _pruneOldRecords() {
    if (this.records.length <= LeaderboardMaxEntries * 3) return;

    const byNickname = new Map();
    this.records.forEach((r, idx) => {
      if (!byNickname.has(r.nickname)) {
        byNickname.set(r.nickname, []);
      }
      byNickname.get(r.nickname).push({ ...r, _idx: idx });
    });

    const keptIndices = new Set();
    for (const entries of byNickname.values()) {
      const kept = entries
        .sort((a, b) => a.time - b.time)
        .slice(0, LeaderboardMaxEntries);
      kept.forEach(e => keptIndices.add(e._idx));
    }

    this.records = this.records.filter((_, idx) => keptIndices.has(idx));
  }

  getLeaderboard(options = {}) {
    const {
      trackFilter = 'all',
      sortKey = 'bestTime',
      seasonFilter = 'all'
    } = options;

    let filtered = [...this.records];

    if (trackFilter !== 'all' && LeaderboardTrackKeys.includes(trackFilter)) {
      filtered = filtered.filter(r => r.stageId === trackFilter);
    }

    if (seasonFilter !== 'all' && LeaderboardSeasonKeys.includes(seasonFilter)) {
      filtered = filtered.filter(r => r.season === seasonFilter);
    }

    const nicknameMap = new Map();
    for (const record of filtered) {
      const key = record.nickname;
      if (!nicknameMap.has(key)) {
        nicknameMap.set(key, {
          nickname: record.nickname,
          bestTime: Infinity,
          bestLap: Infinity,
          totalWins: 0,
          raceCount: 0,
          bestVehicle: record.vehicleType,
          lastPlayed: 0
        });
      }
      const agg = nicknameMap.get(key);
      if (record.time < agg.bestTime) {
        agg.bestTime = record.time;
        agg.bestVehicle = record.vehicleType;
      }
      if (record.bestLap < agg.bestLap) agg.bestLap = record.bestLap;
      agg.totalWins += (record.wins || 0);
      agg.raceCount++;
      agg.lastPlayed = Math.max(agg.lastPlayed, record.date);
    }

    let entries = [...nicknameMap.values()];

    switch (sortKey) {
      case 'bestTime':
        entries.sort((a, b) => {
          const aValid = a.bestTime < Infinity;
          const bValid = b.bestTime < Infinity;
          if (aValid !== bValid) return aValid ? -1 : 1;
          if (a.bestTime !== b.bestTime) return a.bestTime - b.bestTime;
          if (a.totalWins !== b.totalWins) return b.totalWins - a.totalWins;
          return b.raceCount - a.raceCount;
        });
        break;
      case 'bestLap':
        entries.sort((a, b) => {
          const aValid = a.bestLap < Infinity;
          const bValid = b.bestLap < Infinity;
          if (aValid !== bValid) return aValid ? -1 : 1;
          if (a.bestLap !== b.bestLap) return a.bestLap - b.bestLap;
          if (a.totalWins !== b.totalWins) return b.totalWins - a.totalWins;
          return b.raceCount - a.raceCount;
        });
        break;
      case 'mostWins':
        entries.sort((a, b) => {
          if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
          const aValid = a.bestTime < Infinity;
          const bValid = b.bestTime < Infinity;
          if (aValid !== bValid) return aValid ? -1 : 1;
          if (a.bestTime !== b.bestTime) return a.bestTime - b.bestTime;
          return b.raceCount - a.raceCount;
        });
        break;
      default:
        entries.sort((a, b) => a.bestTime - b.bestTime);
    }

    return entries.slice(0, LeaderboardMaxEntries);
  }

  getEntryDetails(nickname, options = {}) {
    const {
      trackFilter = 'all',
      seasonFilter = 'all'
    } = options;

    if (!nickname || typeof nickname !== 'string') return [];

    let filtered = this.records.filter(r => r.nickname === nickname);

    if (trackFilter !== 'all' && LeaderboardTrackKeys.includes(trackFilter)) {
      filtered = filtered.filter(r => r.stageId === trackFilter);
    }
    if (seasonFilter !== 'all' && LeaderboardSeasonKeys.includes(seasonFilter)) {
      filtered = filtered.filter(r => r.season === seasonFilter);
    }

    return filtered
      .sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return b.date - a.date;
      })
      .slice(0, 100);
  }

  canReset() {
    return this.records.length > 0;
  }

  resetLeaderboard() {
    this.records = [];
    this._save();
  }

  getPlayerRank(options = {}) {
    const nickname = this.nickname;
    if (!nickname) return -1;
    const leaderboard = this.getLeaderboard(options);
    const idx = leaderboard.findIndex(e => e.nickname === nickname);
    return idx >= 0 ? idx + 1 : -1;
  }

  getPlayerStats() {
    const nickname = this.nickname;
    if (!nickname) return null;

    const playerRecords = this.records.filter(r => r.nickname === nickname);
    if (playerRecords.length === 0) {
      return {
        nickname,
        raceCount: 0,
        totalWins: 0,
        bestTime: Infinity,
        bestLap: Infinity,
        avgTime: Infinity,
        podiumRate: 0,
        winRate: 0
      };
    }

    const totalWins = playerRecords.reduce((sum, r) => sum + (r.wins || 0), 0);
    const bestTime = Math.min(...playerRecords.map(r => r.time));
    const bestLap = Math.min(...playerRecords.map(r => r.bestLap));
    const avgTime = playerRecords.reduce((sum, r) => sum + r.time, 0) / playerRecords.length;
    const podiumCount = playerRecords.filter(r => r.rank <= 3).length;
    const firstPlaceCount = playerRecords.filter(r => r.rank === 1).length;

    return {
      nickname,
      raceCount: playerRecords.length,
      totalWins,
      bestTime,
      bestLap,
      avgTime,
      podiumRate: podiumCount / playerRecords.length,
      winRate: firstPlaceCount / playerRecords.length,
      firstPlaceCount,
      podiumCount
    };
  }

  getStats() {
    const totalRecords = this.records.length;
    const uniquePlayers = new Set(this.records.map(r => r.nickname)).size;
    const totalWins = this.records.reduce((sum, r) => sum + (r.wins || 0), 0);

    const validTimes = this.records.map(r => r.time).filter(t => t < Infinity);
    const validLaps = this.records.map(r => r.bestLap).filter(t => t < Infinity);

    const bestTime = validTimes.length > 0 ? Math.min(...validTimes) : Infinity;
    const bestLap = validLaps.length > 0 ? Math.min(...validLaps) : Infinity;
    const avgTime = validTimes.length > 0
      ? validTimes.reduce((s, t) => s + t, 0) / validTimes.length
      : Infinity;

    const bySeason = {};
    LeaderboardSeasonKeys.filter(s => s !== 'all').forEach(s => {
      bySeason[s] = this.records.filter(r => r.season === s).length;
    });

    return {
      totalRecords,
      uniquePlayers,
      totalWins,
      bestTime,
      bestLap,
      avgTime,
      bySeason,
      lastUpdated: this.records.length > 0
        ? Math.max(...this.records.map(r => r.date))
        : 0
    };
  }

  getTrackStats(trackId) {
    if (!LeaderboardTrackKeys.includes(trackId)) return null;

    const records = trackId === 'all'
      ? this.records
      : this.records.filter(r => r.stageId === trackId);

    if (records.length === 0) return null;

    const uniquePlayers = new Set(records.map(r => r.nickname)).size;
    const bestTime = Math.min(...records.map(r => r.time));
    const bestLap = Math.min(...records.map(r => r.bestLap));

    return {
      trackId,
      recordCount: records.length,
      uniquePlayers,
      bestTime,
      bestLap
    };
  }

  hasPlayerRecords() {
    if (!this.nickname) return false;
    return this.records.some(r => r.nickname === this.nickname);
  }

  exportData() {
    return {
      version: this.version,
      nickname: this.nickname,
      records: this.records,
      exportedAt: Date.now()
    };
  }

  importData(data) {
    if (!data || typeof data !== 'object') return false;

    try {
      const validatedRecords = this._validateRecords(data.records || []);
      const validatedNickname = this._sanitizeNickname(data.nickname || '');

      if (validatedNickname) {
        this.nickname = validatedNickname;
      }
      this.records = validatedRecords;
      this._save();
      return true;
    } catch (e) {
      console.warn('Failed to import leaderboard data:', e);
      return false;
    }
  }

  mergeData(data) {
    if (!data || !Array.isArray(data.records)) return { merged: 0, total: 0 };

    const importedRecords = this._validateRecords(data.records);
    let merged = 0;

    for (const record of importedRecords) {
      const existingIdx = this.records.findIndex(r =>
        r.eventId === record.eventId && r.nickname === record.nickname
      );

      if (existingIdx >= 0) {
        const existing = this.records[existingIdx];
        let changed = false;
        if (record.time < existing.time) {
          existing.time = record.time;
          changed = true;
        }
        if (record.bestLap < existing.bestLap) {
          existing.bestLap = record.bestLap;
          changed = true;
        }
        if (record.wins > existing.wins) {
          existing.wins = record.wins;
          changed = true;
        }
        if (record.date > existing.date) {
          existing.date = record.date;
        }
        if (changed) merged++;
      } else {
        this.records.push(record);
        merged++;
      }
    }

    if (merged > 0) {
      this._pruneOldRecords();
      this._save();
    }

    return { merged, total: importedRecords.length };
  }
}
