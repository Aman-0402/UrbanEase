import logoImg from '../../Image/UrbanEase.png'

export default function Logo({ height = 36, style = {} }) {
  return (
    <img
      src={logoImg}
      alt="UrbanEase"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block', ...style }}
    />
  )
}
