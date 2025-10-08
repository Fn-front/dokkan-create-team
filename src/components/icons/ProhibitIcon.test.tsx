import { render } from '@testing-library/react'
import ProhibitIcon from './ProhibitIcon'

describe('ProhibitIcon', () => {
  it('デフォルトサイズ16でレンダリングされる', () => {
    const { container } = render(<ProhibitIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })

  it('カスタムサイズでレンダリングされる', () => {
    const { container } = render(<ProhibitIcon size={32} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(<ProhibitIcon className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
  })

  it('赤色のスタイルが適用される', () => {
    const { container } = render(<ProhibitIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveStyle({ color: '#ff1744' })
  })
})
