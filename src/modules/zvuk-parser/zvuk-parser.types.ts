export enum ZvukSitemap {
  TRACK = 'track',
  ARTIST = 'artist',
  RELEASE = 'release',
}

export enum ZvukSitemapStatus {
  STATUS_NEW = 1,
  STATUS_PROCESS = 2,
  STATUS_COMPLETED = 3,
}

export type ZvukSitemapType = ZvukSitemap.ARTIST | ZvukSitemap.RELEASE | ZvukSitemap.TRACK

export type ZvukSitemapStatusType =
  | ZvukSitemapStatus.STATUS_NEW
  | ZvukSitemapStatus.STATUS_PROCESS
  | ZvukSitemapStatus.STATUS_COMPLETED

export enum ZvukParserUrls {
  BASE_URL = 'https://sber-zvuk.com',
  SEARCH_URL = '/sapi/search',
  SONGS_URL = '/sapi/meta',
  ARTISTS_URL = '/sapi/meta',
  RELEASES_URL = '/sapi/meta',
  GENRES_URL = '/api/genre',
  NEW_TRACKS = '/api/tiny/playlists',
  POPULAR_SONGS_URL = '/api/tiny/playlists',
  LYRICS = '/api/tiny/lyrics',
  TRACKS_XML_URL = 'https://zvuk.com/sitemaps/tracks.xml',
  STREAM_URL = '/api/tiny/track/stream', // https://sber-zvuk.com/api/tiny/track/stream?id=79828594&quality=high
}

export enum ZvukSitemapUrl {
  TRACKS = 'https://zvuk.com/sitemaps/tracks.xml',
}
