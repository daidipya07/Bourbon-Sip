export interface TipsyRead {
  cat: string
  tag: string
  time: string
  text: string
  proof: number
}

// Tipsy Reads entries are manually curated by the editor.
// Each entry must link to a real, verifiable source.
// Do not add fabricated or unverified claims.
// Add new entries through the admin panel (coming soon) or directly here with real sources.
export const tipsyData: TipsyRead[] = []
