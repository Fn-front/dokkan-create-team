import { render } from '@testing-library/react'
import DetailIcon from './DetailIcon'

describe('DetailIcon', () => {
  it('正常にレンダリングされる', () => {
    const { container } = render(<DetailIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(<DetailIcon className="detail-icon" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('detail-icon')
  })
})
