import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import fogImage from '../assets/fog.jpg'
import { journeys } from '../data/journeys'
import { FIRST_EXHIBITION_END, TIMELINE_END, TIMELINE_START } from '../data/timeline'
import './HomePage.css'

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const gradientSequence = [
  'radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.35), transparent 55%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.2), transparent 60%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))',
  'radial-gradient(circle at 10% 80%, rgba(14, 165, 233, 0.25), transparent 60%), radial-gradient(circle at 95% 5%, rgba(125, 211, 252, 0.35), transparent 55%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(17, 24, 39, 0.9))',
  'radial-gradient(circle at 75% 15%, rgba(248, 113, 113, 0.3), transparent 58%), radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.35), transparent 60%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))',
]

export default function HomePage() {
  const location = useLocation()
  const [activeJourneyId, setActiveJourneyId] = useState(journeys[0]?.id)
  const itemRefs = useRef(new Map<string, HTMLElement>())
  const activeIdRef = useRef(activeJourneyId)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    activeIdRef.current = activeJourneyId
  }, [activeJourneyId])

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '')
      if (targetId) {
        const el = document.getElementById(targetId)
        if (el) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        }
      }
    }
  }, [location.hash])

  const registerItem = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      const map = itemRefs.current
      if (node) {
        map.set(id, node)
        observerRef.current?.observe(node)
      } else {
        const existing = map.get(id)
        if (existing) {
          observerRef.current?.unobserve(existing)
        }
        map.delete(id)
      }
    },
    [],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (inView.length > 0) {
          const candidate = inView[0].target.getAttribute('data-journey-id')
          if (candidate && candidate !== activeIdRef.current) {
            setActiveJourneyId(candidate)
          }
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-20% 0px -30% 0px',
      },
    )
    observerRef.current = observer
    itemRefs.current.forEach((node) => observer.observe(node))

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [])

  const dateSummary = useMemo(() => {
    const startLabel = formatDate(TIMELINE_START)
    const endLabel = formatDate(TIMELINE_END)

    const totalRange = TIMELINE_END.getTime() - TIMELINE_START.getTime()
    const now = Date.now()
    const clamped = Math.max(Math.min(now, TIMELINE_END.getTime()), TIMELINE_START.getTime())
    const elapsed = clamped - TIMELINE_START.getTime()
    const completion = Math.max(0, Math.min(1, totalRange === 0 ? 0 : elapsed / totalRange))

    return {
      startLabel,
      endLabel,
      completion,
    }
  }, [])

  const exhibitionEndLabel = useMemo(() => formatDate(FIRST_EXHIBITION_END), [])

  const activeIndex = Math.max(
    0,
    journeys.findIndex((journey) => journey.id === activeJourneyId),
  )
  const progressValue =
    journeys.length > 1 ? (activeIndex / (journeys.length - 1)) * 100 : 100
  const trackStyle = useMemo(
    () => ({ '--progress': progressValue } as CSSProperties),
    [progressValue],
  )
  const timelineProgress = Math.round(dateSummary.completion * 100)
  const timelineProgressStyle = useMemo(
    () => ({ '--progressPerc': `${timelineProgress}%` }) as CSSProperties,
    [timelineProgress],
  )

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__backdrop">
          {gradientSequence.map((layer, index) => (
            <motion.div
              key={index}
              className="hero__gradient"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 40%'],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 24 + index * 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ backgroundImage: layer }}
            />
          ))}
          <motion.div
            className="hero__image-glow"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            <img src={fogImage} alt="Foggy scene with lone traveller" />
          </motion.div>
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Museum of Failure or Gallery of Trying?</p>
          <h1 id="hero-title">Charting every attempt from September 21, 2025 to September 21, 2026.</h1>
          <p className="hero__description">
            This is a living log of the goals I am chasing—documenting the work, the misses, and the
            small breakthroughs that stack into transformation. The first exhibition closes on
            {` ${exhibitionEndLabel}`}, and each storyline here is a room I will revisit to record the
            next iteration.
          </p>
          <motion.blockquote
            className="hero__quote"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
          >
            “Work Harder. Be Better.”
          </motion.blockquote>
        </div>
      </section>

      <section className="timeline" id="timeline" aria-labelledby="timeline-title">
        <div className="timeline__header">
          <p className="timeline__eyebrow">Timeline</p>
          <div>
            <h2 id="timeline-title">Mapping the first exhibition</h2>
            <p className="timeline__summary">
              Tracking the arc from {dateSummary.startLabel} through {dateSummary.endLabel}. This
              timeline is the running vlog—notes on experiments, goals, and drafts that will keep
              evolving across the full year.
            </p>
            <p className="timeline__subnote">
              The first exhibition is in focus until {exhibitionEndLabel}. Each section below is a
              living room of updates for that window.
            </p>
          </div>
          <div className="timeline__range" aria-hidden>
            <span>{dateSummary.startLabel}</span>
            <div className="timeline__progress" style={timelineProgressStyle}>
              <span className="timeline__progress-track" />
              <span className="timeline__progress-fill" />
              <span className="timeline__progress-glow" />
              <span className="timeline__progress-marker">
                <span className="timeline__progress-marker-core" />
              </span>
            </div>
            <span>{dateSummary.endLabel}</span>
          </div>
        </div>

        <div className="timeline__grid">
          <div className="timeline__track" style={trackStyle}>
            <div className="timeline__track-glow" />
          </div>

          <div className="timeline__items">
            {journeys.map((journey, index) => (
              <motion.article
                key={journey.id}
                className={`timeline__item ${
                  activeJourneyId === journey.id ? 'is-active' : ''
                }`}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.4, once: false }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                ref={registerItem(journey.id)}
                data-journey-id={journey.id}
                onFocus={() => setActiveJourneyId(journey.id)}
                onMouseEnter={() => setActiveJourneyId(journey.id)}
                style={
                  {
                    '--accent-color': journey.accent,
                    '--card-background': journey.background,
                  } as CSSProperties
                }
              >
                <Link to={`/${journey.slug}`} className="timeline__link">
                  <div className="timeline__meta">
                    <span className="timeline__meta-tag">{journey.mission}</span>
                    <h3>{journey.title}</h3>
                    <p>{journey.shortDescription}</p>
                    <span className="timeline__meta-cta">Open this log →</span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
