// What every screen after the first needs and Today doesn't: the rest of the icons, the screen-to-screen
// transitions and the styles several screens share. lazyRoute loads it with each screen's code, so it is always
// here before that screen renders.
import '../ui/icons-more.jsx'
import './transitions.css'
import '../ui/screens-shared.css'
