// Maps Ledger cases to Academy playlists + mini-games.
// Used by lecture and drill case renderers to embed real video + game content.

import type { Case } from '@/types/ledger'
import { PLAYLISTS } from '@/lib/academy/playlists'

export interface AcademyLink {
  playlistSlug: string
  gameSlug: string         // same as playlistSlug in current model
  playlistTitle: string
  gameTitle: string
  ytPlaylistId: string
  accentColor: string
}

// Per-case overrides — for cases where auto-mapping doesn't fit.
// Key = ledger case ID (e.g. 'V001', 'D003', etc.)
const CASE_OVERRIDES: Record<string, string> = {
  // Optional: hard-pin specific case IDs to specific playlist slugs.
  // Currently empty — auto-mapping handles everything.
}

/**
 * For lectures (Vol I) and drills (Vol II), return the matching Academy
 * playlist + game. Cycles through the 10 academy entries by case number.
 */
export function academyLinkFor(c: Case): AcademyLink | null {
  if (c.type !== 'lecture' && c.type !== 'drill') return null

  const override = CASE_OVERRIDES[c.id]
  let playlist
  if (override) {
    playlist = PLAYLISTS.find(p => p.slug === override)
  } else {
    // Cycle by case number → position in PLAYLISTS array
    const idx = ((c.number - 1) % PLAYLISTS.length + PLAYLISTS.length) % PLAYLISTS.length
    playlist = PLAYLISTS[idx]
  }
  if (!playlist) return null

  return {
    playlistSlug: playlist.slug,
    gameSlug: playlist.slug,
    playlistTitle: playlist.title,
    gameTitle: playlist.gameTitle,
    ytPlaylistId: playlist.ytPlaylistId,
    accentColor: playlist.accentColor,
  }
}
