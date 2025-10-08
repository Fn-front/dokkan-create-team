import { render } from '@testing-library/react'
import TransformIcon from './TransformIcon'

describe('TransformIcon', () => {
  it('デフォルトサイズ24でレンダリングされる', () => {
    const { container } = render(<TransformIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('カスタムサイズでレンダリングされる', () => {
    const { container } = render(<TransformIcon size={36} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '36')
    expect(svg).toHaveAttribute('height', '36')
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(<TransformIcon className="transform-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('transform-class')
  })
})
