export interface IZvukGenre {
  id: number
  name: string
  shortName?: string
  sub?: IZvukGenre[]
}

export interface IZvukGenreResponse {
  result: {
    genres: IZvukGenre[]
  }
}

export interface IZvukImage {
  src: string
  palette: string | null
  palette_bottom: string | null
}

export interface ZvukPlaylist {
  updated: number
  description: string
  image_palette_bottom: string
  image_url_small: string
  chart: any
  track_ids: number[]
  is_public: boolean
  duration: number
  is_deleted: boolean
  id: number
  image_url_big: string
  user_id: number
  image_palette: string
  title: string
  search_title: string
  image_url: string
  has_image: boolean
  shared: boolean
  image: IZvukImage
}

export interface IZvukTrack {
  artist_ids: number[]
  has_flac: boolean
  genres: number[]
  release_id: number
  template: string
  lyrics: number | null
  title: string
  price: number
  search_title: string
  explicit: boolean
  search_credits: string
  release_title: string
  artist_names: string[]
  credits: string
  availability: number
  position: number
  duration: number
  highest_quality: string
  image: IZvukImage
  id: number
  condition: string
}

export interface ZvukTrackSearch {
  aname: string
  doc_type: string
  id: number
  score: number
  title: string
}

export interface IZvukRelease {
  artist_ids: number[]
  template: string
  title: string
  image: IZvukImage
  search_title: string
  explicit: boolean
  search_credits: string
  track_ids: number[]
  artist_names: string[]
  credits: string
  label_id: number
  availability: number
  has_image: boolean
  date: number
  price: number
  type: string
  id: number
  genre_ids: number[]
}

export interface ZvukReleaseSearchItem {
  aname: string
  doc_type: string
  duration: number
  id: number
  score: number
  title: string
}

export interface IZvukArtist {
  description: string
  title: string
  image: IZvukImage
  search_title: string
  has_image: boolean
  has_page: boolean
  id: number
}

export interface ArtistSearchItem {
  id: number
  doc_type: 'artist'
  score: number
  title: string
}

export interface ZvukPlaylistResponse {
  result: {
    releases: Record<string, IZvukRelease>
    tracks: Record<string, IZvukTrack>
    artists: Record<string, IZvukArtist>
    playlists: Record<string, ZvukPlaylist>
    radio_waves: any
    labels: any
    users: any
  }
}

export interface IZvukTrackInfoResponse {
  result: {
    releases: Record<string, IZvukRelease>
    tracks: Record<string, IZvukTrack>
    artists: Record<string, IZvukArtist>
  }
}

export interface IZvukArtistInfoResponse {
  result: {
    releases: Record<string, IZvukRelease>
    tracks: Record<string, IZvukTrack>
    artists: Record<string, IZvukArtist>
  }
}

export interface IZvukReleaseInfoResponse {
  result: {
    releases: Record<string, IZvukRelease>
  }
}

export interface ZvukTrackSearchResponse {
  result: {
    tracks: Record<string, IZvukTrack>
    artists: Record<string, IZvukArtist>
    releases: Record<string, IZvukRelease>
    search: {
      artists: {
        items: ArtistSearchItem[]
        next: number | null
        prev: number | null
        total: number
      }
      best_item: {
        doc_type: string
        id: number
      }
      releases: {
        items: ZvukReleaseSearchItem[]
        next: number | null
        prev: number | null
        total: number
      }
      tracks: {
        items: ZvukTrackSearch[]
        next: number | null
        prev: number | null
        total: number
      }
    }
  }
}

export interface TrackSearchResponse {
  tracks: Record<string, IZvukTrack>
  artists: Record<string, IZvukArtist>
  releases: Record<string, IZvukRelease>
  existTracks: number[]
}

export interface ZvukStreamResponse {
  result: {
    expire: number
    expire_delta: number
    stream: string
  }
}
