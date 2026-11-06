// The edge swipe back and the live screen drawn under it, loaded the first time a pushed screen appears:
// a root screen has nothing to swipe back to, so a first visit to a tab never downloads this.
import { useEdgeBack } from './edgeBack.js'
import { EdgeUnderlay } from './EdgeUnderlay.jsx'
import './edgeBack.css'

export default function EdgeBack() {
  useEdgeBack()
  return <EdgeUnderlay />
}
