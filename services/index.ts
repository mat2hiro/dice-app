import crypto from 'crypto'

export const uidColor = (uid: string = ''): string =>
  '#' +
  crypto
    .createHash('md5')
    .update(uid)
    .digest('hex')
    .slice(0, 6)

export const bgColorStyle = (bg: string = '#fff') => {
  const r = parseInt(bg.substr(1, 2), 16)
  const g = parseInt(bg.substr(3, 2), 16)
  const b = parseInt(bg.substr(5, 2), 16)

  const cl = (r * 299 + g * 587 + b * 114) / 1000 < 128 ? '#fff' : '#000'
  return {
    background: bg,
    color: cl
  }
}
