# Axcel One student redesign prototype

An interactive concept for the student side of Axcel One. Its not connected to the school's systems and does not provide real sign-in. It's built in React like Axcel One, so most of it can be carried over directly.

## Preview

The public preview is published with GitHub Pages: https://imrainybeee.github.io/axcel-one-student-prototype/

## Film

How Axcel One changed, from the original app to the current prototype (1 minute):

<video controls width="100%" src="https://imrainybeee.github.io/axcel-one-student-prototype/video/evolution.mp4">
  <a href="https://imrainybeee.github.io/axcel-one-student-prototype/video/evolution.mp4">Watch the evolution film</a>
</video>

[Open or download the evolution film](https://imrainybeee.github.io/axcel-one-student-prototype/video/evolution.mp4)

Earlier films: [Draft 2](https://imrainybeee.github.io/axcel-one-student-prototype/video/draft-2.mp4), [Draft 3](https://imrainybeee.github.io/axcel-one-student-prototype/video/draft-3.mp4)

## Run locally

```sh
npm ci
npm run dev
```

To build the site:

```sh
npm run build
```

The Pages build sets `VITE_BASE_PATH` to the repository's project-site path. Local builds use `/` by default.
