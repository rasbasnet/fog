import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found" role="alert">
      <h1>Lost in the fog</h1>
      <p>
        This room is still under construction—or maybe it never existed. Let’s head back to the
        gallery of trying and choose another path.
      </p>
      <Link to="/" className="not-found__cta">
        Return home
      </Link>
    </div>
  )
}
