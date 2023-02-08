export enum SongsDataStatus {
  STATUS_NEW = 1,
  STATUS_PROCESS = 2,
  STATUS_COMPLETED = 3,
}

export type SongDataStatusType =
  | SongsDataStatus.STATUS_NEW
  | SongsDataStatus.STATUS_PROCESS
  | SongsDataStatus.STATUS_COMPLETED
