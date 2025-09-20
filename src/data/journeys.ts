import journeysJson from './journeys.json'

export type JourneyEntry = {
  id: string
  entryDate: string
  title?: string
  text?: string
  image?: {
    src: string
    alt?: string
  }
  columns?: 1 | 2
  rows?: 1 | 2
  highlight?: boolean
  images?: string[]
}

export type Journey = {
  id: string
  slug: string
  title: string
  startDate: string
  endDate: string
  shortDescription: string
  longDescription: string
  mission: string
  anchors: string[]
  coverArt: string
  entries: JourneyEntry[]
  background: string
  accent: string
}

const baseFromEnv = import.meta.env.BASE_URL ?? '/'

const withBase = (path?: string | null) => {
  if (!path) return undefined
  if (/^https?:/.test(path)) return path
  const normalizedBase = baseFromEnv.endsWith('/') ? baseFromEnv.slice(0, -1) : baseFromEnv
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

const journeysData = (journeysJson as Journey[]).map((journey) => ({
  ...journey,
  coverArt: withBase(journey.coverArt) ?? journey.coverArt,
  entries:
    journey.entries?.map((entry) => ({
      ...entry,
      images: entry.images?.map((imagePath) => withBase(imagePath) ?? imagePath) ?? [],
      image: entry.image
        ? {
            ...entry.image,
            src: withBase(entry.image.src) ?? entry.image.src,
          }
        : undefined,
    })) ?? [],
}))

export const journeys: Journey[] = journeysData

export const getJourneyBySlug = (slug: string) =>
  journeys.find((journey) => journey.slug === slug)
