import { useState } from 'react'
import { assetPath } from '../../app/router.js'
import { Button } from '../../ui/Button.jsx'
import { Sheet } from '../../ui/Sheet.jsx'

const mascot = assetPath('/brand/axcel-ai-mascot.svg')

export default function TutorIdea({ placement }) {
  const [open, setOpen] = useState(false)
  const titleId = `tutor-idea-title-${placement}`

  return (
    <>
      <section className={`ai-tutor-card ai-tutor-card--${placement}`} aria-labelledby={titleId}>
        <img className="ai-tutor-mascot" src={mascot} alt="" />
        <div className="ai-tutor-copy">
          <span className="ai-tutor-label">Future idea</span>
          <h2 id={titleId}>Axcel AI tutor</h2>
          <p>Friendly help with lessons and revision.</p>
        </div>
        <Button variant="primary" size="compact" full onClick={() => setOpen(true)}>See the idea</Button>
      </section>
      <Sheet open={open} onClose={() => setOpen(false)} title="Axcel AI tutor">
        <div className="ai-tutor-sheet">
          <img src={mascot} alt="" />
          <p>A future Axcel One tutor could help students understand lessons, ask study questions, and practise topics.</p>
          <p>This is a concept; the tutor isn’t active in this prototype.</p>
        </div>
      </Sheet>
    </>
  )
}
