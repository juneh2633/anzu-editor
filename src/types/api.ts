export interface RadarData {
  idx: number;
  chartIdx: number;
  notes: number;
  peak: number;
  tsumami: number;
  tricky: number;
  handtrip: number;
  onehand: number;
}

export interface ChartData {
  chartIdx: number;
  songIdx: number;
  level: number;
  type: string;
  jacket: string;
  effector: string;
  illustrator: string;
  maxExscore: number;
  maxChain: number;
  chipCount: number;
  holdCount: number;
  tsumamiCount: number;
  radar: RadarData;
}

export interface SongData {
  songIdx: number;
  title: string;
  artist: string;
  ascii: string;
  asciiTitle: string;
  asciiArtist: string;
  titleYomigana: string;
  artistYomigana: string;
  version: number;
  mainBpm: number | null;
  bpm: string;
  genreTxt: string;
  date: string;
  konaste: boolean;
  chart: ChartData[];
}

export interface TypeMetadata {
  typeName: string;
  typeShortName: string;
  color: number;
}

export interface RankMetadata {
  idx: number;
  name: string;
  shortName: string;
  color: number;
}

export interface RankMetadata {
  rankName: string;
  rankFilterName: string;
  rankShortName: string;
  color: number;
}

export interface ScoreMetadata {
  scoreName: string;
  big: number;
  color: number;
}

export interface VersionMetadata {
  versionName: string;
  color: number;
}

export interface ChartMetaResponse {
  metaData: {
    type: TypeMetadata[];
    rank: RankMetadata[];
    score: ScoreMetadata[];
    version: VersionMetadata[];
  };
  chartData: SongData[];
}

export interface ChartListItem {
  chartIdx: number;
  targetScore: number | null;
  targetClearType?: number | null;
}

export interface TierItem {
  tierIdx: number;
  tier: string;
  chartList: ChartListItem[];
}

export interface TierPart {
  partIdx: number;
  partName: string;
  description: string;
  tierList: TierItem[];
}

export interface TierResponse {
  data: TierPart[];
}

export interface LoginRequest {
  id: string;
  pw: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface LoginErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  rankIdx: number;
  isAdmin: boolean;
}

// 곡 추가를 위한 타입들
export enum ChartTypeCode {
  novice = 'novice',
  advanced = 'advanced',
  exhaust = 'exhaust',
  maximum = 'maximum',
  infinite = 'infinite',
  gravity = 'gravity',
  heavenly = 'heavenly',
  vivid = 'vivid',
  exceed = 'exceed',
  ultimate = 'ultimate',
}

export interface RadarDto {
  notes: number;
  peak: number;
  tsumami: number;
  tricky: number;
  handtrip: number;
  onehand: number;
}

export interface DifficultyDto {
  level: number;
  type: string;
  effectorName: string;
  illustratorName: string;
  max_exscore: string;
  radar: RadarDto;
  max_chain: string;
  chip_count: string;
  hold_count: string;
  tsumami_count: string;
}

export interface NewSongDto {
  songid: string;
  title: string;
  artist: string;
  version: string;
  bpm: string;
  genres: string[];
  date: string;
  eac_exc: boolean;
  difficulties: DifficultyDto[];
}

export interface SongIdxWithTypeDto {
  songIdx: string;
  type: string;
}

export interface NewChartDto {
  songIdx: number;
  level: number;
  type: string;
  effectorName: string;
  illustratorName: string;
  radar: RadarDto;
}

export interface UpdateChartDto {
  chartIdx: number;
  songIdx: number;
  level: number;
  type: string;
  effectorName: string;
  illustratorName: string;
  radar: RadarDto;
}

// 버전 관련 타입들
export interface GetVersionDto {
  version: string;
}

export interface UpdateVersionDto {
  version: string;
}

export interface VersionResponse {
  version: string;
}