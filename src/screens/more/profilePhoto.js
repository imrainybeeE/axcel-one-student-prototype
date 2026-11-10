// The student's chosen profile photo, a small square JPEG data URL saved on this device (null: show initials).
// Account sets it; the More profile card reads it with useProfilePhoto().
import { usePref } from '../../app'

const KEY = 'profilePhoto'

/** The photo's data URL, or null when none is set. */
export function useProfilePhoto() {
  return usePref(KEY, null)[0]
}

/** [photo, setPhoto]: setPhoto(dataUrl) saves it, setPhoto(null) removes it. */
export function useProfilePhotoState() {
  return usePref(KEY, null)
}

/** Read an image file, crop it to a centred square and shrink it to 320 px, so it fits in local storage. */
export function photoFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const out = Math.min(320, side)
      const canvas = document.createElement('canvas')
      canvas.width = out
      canvas.height = out
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.86))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')) }
    img.src = url
  })
}
