import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getJourneyBySlug, type JourneyEntry } from '../data/journeys'
import { TIMELINE_END, TIMELINE_START } from '../data/timeline'
import NotFoundPage from './NotFoundPage'
import './JourneyPage.css'

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function JourneyPage() {
  const { slug } = useParams()
  const journey = slug ? getJourneyBySlug(slug) : undefined
  const [activeEntry, setActiveEntry] = useState<JourneyEntry | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const previousScrollRef = useRef<number | null>(null)
  const openEntry = useMemo(() => {
    if (!activeEntry) {
      return null
    }

    const date = activeEntry.entryDate ? new Date(activeEntry.entryDate) : undefined
    const dateLabel = date && !Number.isNaN(date.getTime()) ? formatDate(date) : 'Undated'

    const galleryImages = [
      ...(activeEntry.images?.map((src) => ({ src, alt: activeEntry.title })) ?? []),
      ...(activeEntry.image ? [{ src: activeEntry.image.src, alt: activeEntry.image.alt }] : []),
    ]

    return {
      entry: activeEntry,
      dateLabel,
      galleryImages,
    }
  }, [activeEntry])
  const modalContentRef = useRef<HTMLDivElement>(null)

  const closeEntryHandler = useCallback(() => {
    const previous = previousScrollRef.current
    setActiveEntry(null)
    if (previous !== null) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: previous, behavior: 'smooth' })
        previousScrollRef.current = null
      })
    } else {
      previousScrollRef.current = null
    }
  }, [])

  const openEntryHandler = useCallback((entry: JourneyEntry) => {
    previousScrollRef.current = window.scrollY
    setActiveImageIndex(0)
    setActiveEntry(entry)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    if (!activeEntry) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEntryHandler()
      }
      if (event.key === 'ArrowRight' && openEntry) {
        setActiveImageIndex((prev) =>
          prev === openEntry.galleryImages.length - 1 ? 0 : prev + 1,
        )
      }
      if (event.key === 'ArrowLeft' && openEntry) {
        setActiveImageIndex((prev) =>
          prev === 0 ? openEntry.galleryImages.length - 1 : prev - 1,
        )
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeEntry, closeEntryHandler, openEntry])

  useEffect(() => {
    if (!openEntry) {
      return
    }

    requestAnimationFrame(() => {
      modalContentRef.current?.scrollTo({ top: 0 })
    })
  }, [openEntry])

  if (!journey) {
    return <NotFoundPage />
  }

  const startDate = journey.startDate ? new Date(journey.startDate) : TIMELINE_START
  const endDate = journey.endDate ? new Date(journey.endDate) : TIMELINE_END
  const totalRange = endDate.getTime() - startDate.getTime()
  const now = Date.now()
  const clamped = Math.max(Math.min(now, endDate.getTime()), startDate.getTime())
  const elapsed = clamped - startDate.getTime()
  const completion = totalRange <= 0 ? 0 : Math.max(0, Math.min(1, elapsed / totalRange))

  const timeSummary = {
    startLabel: formatDate(startDate),
    endLabel: formatDate(endDate),
    completion,
  }

  const accentStyle = { '--accent': journey.accent } as CSSProperties

  return (
    <div className="journey" style={accentStyle}>
      <div className="journey__breadcrumbs">
        <Link to="/" className="journey__back">
          ← Return to the gallery
        </Link>
      </div>

      <section className="journey__hero" aria-labelledby="journey-title">
        <motion.div
          className="journey__hero-veil"
          style={{ backgroundImage: journey.background }}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        <div className="journey__hero-content">
          <p className="journey__eyebrow">Living record</p>
          <h1 id="journey-title">{journey.title}</h1>
          <p className="journey__tagline">{journey.mission}</p>
          <div className="journey__timeframe">
            <span>{timeSummary.startLabel}</span>
            <div className="journey__progress">
              <div
                className="journey__progress-bar"
                style={{ width: `${timeSummary.completion * 100}%` }}
              />
            </div>
            <span>{timeSummary.endLabel}</span>
          </div>
        </div>
      </section>

      <section className="journey__body">
        <motion.article
          className="journey__overview"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2>Why this matters</h2>
          <p className="journey__overview-lead">{journey.shortDescription}</p>
          <p>{journey.longDescription}</p>
        </motion.article>

        <motion.aside
          className="journey__details"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.85, ease: 'easeOut' }}
        >
          <h3>Anchors to remember</h3>
          <ul>
            {journey.anchors.map((anchor) => (
              <li key={anchor}>{anchor}</li>
            ))}
          </ul>
          <Link to={{ pathname: '/', hash: '#timeline' }} className="journey__cta">
            Back to the living timeline
          </Link>
        </motion.aside>
      </section>

      <section className="journey__entries" aria-labelledby="journey-entries-title">
        <div className="journey__entries-header">
          <h2 id="journey-entries-title">Latest entries</h2>
          <p>
            New updates land here as the exhibition evolves. Each entry starts with the day it was
            captured so future iterations are easy to trace.
          </p>
        </div>
        {journey.entries.length === 0 ? (
          <p className="journey__entries-empty">No entries logged yet. Check back soon.</p>
        ) : (
          <div className="journey__entries-grid">
              {journey.entries.map((entry) => {
                const date = entry.entryDate ? new Date(entry.entryDate) : undefined
                const dateLabel = date && !Number.isNaN(date.getTime()) ? formatDate(date) : 'Undated'
                const columns = Math.min(Math.max(entry.columns ?? 1, 1), 2)
                const rows = Math.min(Math.max(entry.rows ?? 1, 1), 2)
              const entryClassName = [
                'journey__entry',
                `journey__entry--columns-${columns}`,
                `journey__entry--rows-${rows}`,
                entry.highlight ? 'journey__entry--highlight' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <article key={entry.id} className={entryClassName}>
                  {((entry.images && entry.images.length > 0) || entry.image) ? (
                    <button
                      type="button"
                      className="journey__entry-gallery-button"
                      onClick={() => openEntryHandler(entry)}
                      aria-label={entry.title ? `Open entry details for ${entry.title}` : 'Open entry details'}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M4 5.75C4 4.784 4.784 4 5.75 4h12.5C19.216 4 20 4.784 20 5.75v12.5c0 .966-.784 1.75-1.75 1.75H5.75A1.75 1.75 0 0 1 4 18.25V5.75Zm1.75-.25a.25.25 0 0 0-.25.25v8.19l2.22-2.22a1.75 1.75 0 0 1 2.475 0l2.53 2.53 3.22-3.22a1.75 1.75 0 0 1 2.475 0l2.03 2.03V5.75a.25.25 0 0 0-.25-.25H5.75Zm12.5 13.5a.25.25 0 0 0 .25-.25v-2.94l-2.03-2.03a.25.25 0 0 0-.353 0l-3.396 3.396a1.75 1.75 0 0 1-2.475 0l-2.53-2.53a.25.25 0 0 0-.353 0L5 17.81v.44c0 .138.112.25.25.25h12.5ZM10.5 7.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  ) : null}
                  <header className="journey__entry-header">
                    <span className="journey__entry-date">{dateLabel}</span>
                    {entry.title ? <h3>{entry.title}</h3> : null}
                  </header>
                  {entry.text ? <p className="journey__entry-text">{entry.text}</p> : null}
                  {entry.image ? (
                    <div className="journey__entry-media">
                      <img
                        src={entry.image.src}
                        alt={entry.image.alt ?? entry.title ?? 'Journey entry image'}
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {openEntry ? (
        <motion.div
          className="journey__gallery-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeEntryHandler}
        >
          <motion.div
            className="journey__gallery-modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={openEntry.entry.title ? `Entry details for ${openEntry.entry.title}` : 'Entry details'}
          >
            <header className="journey__gallery-header">
              <div>
                <span className="journey__gallery-label">Entry gallery</span>
                {openEntry.entry.title ? <h3>{openEntry.entry.title}</h3> : null}
                <span className="journey__gallery-date">{openEntry.dateLabel}</span>
              </div>
              <button
                type="button"
                className="journey__gallery-close"
                onClick={closeEntryHandler}
                aria-label="Close gallery"
              >
                ×
              </button>
            </header>
            <div className="journey__gallery-content" ref={modalContentRef}>
              {openEntry.galleryImages.length > 0 ? (
                <div
                  className="journey__gallery-stage"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') {
                      setActiveImageIndex((prev) =>
                        prev === openEntry.galleryImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    if (event.key === 'ArrowLeft') {
                      setActiveImageIndex((prev) =>
                        prev === 0 ? openEntry.galleryImages.length - 1 : prev - 1,
                      )
                    }
                  }}
                >
                  {openEntry.galleryImages.map(({ src, alt }, index) => (
                    <div
                      key={src}
                      className={`journey__gallery-stage-image ${
                        index === activeImageIndex ? 'is-active' : ''
                      }`}
                    >
                      {index === activeImageIndex ? (
                        <img src={src} alt={alt ?? 'Journey entry visual'} />
                      ) : null}
                    </div>
                  ))}

                  {openEntry.galleryImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="journey__gallery-nav journey__gallery-nav--prev"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? openEntry.galleryImages.length - 1 : prev - 1,
                          )
                        }
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="journey__gallery-nav journey__gallery-nav--next"
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === openEntry.galleryImages.length - 1 ? 0 : prev + 1,
                          )
                        }
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}

              {openEntry.galleryImages.length > 1 ? (
                <div className="journey__gallery-thumbs">
                  {openEntry.galleryImages.map(({ src, alt }, index) => (
                    <button
                      key={src}
                      type="button"
                      className={`journey__gallery-thumb ${
                        activeImageIndex === index ? 'is-active' : ''
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={
                        alt ? `View ${alt}` : `View image ${index + 1} of ${openEntry.galleryImages.length}`
                      }
                    >
                      <img src={src} alt={alt ?? 'Journey entry thumbnail'} />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="journey__gallery-body">
                {openEntry.entry.highlight ? (
                  <span className="journey__gallery-highlight">Featured entry</span>
                ) : null}
                <p className="journey__gallery-date-inline">{openEntry.dateLabel}</p>
                {openEntry.entry.text ? <p>{openEntry.entry.text}</p> : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  )
}
