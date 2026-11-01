// True inside the screen drawn under a pushed one during the edge swipe (EdgeUnderlay.jsx): screens skip their
// side effects there (the document title, announcements, opening sheets, the mini now capsule).
import { createContext } from 'react'

export const UnderlayContext = createContext(false)
