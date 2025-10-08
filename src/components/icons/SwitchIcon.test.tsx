import { render } from '@testing-library/react'
import SwitchIcon from './SwitchIcon'

describe('SwitchIcon', () => {
  it('デフォルトサイズ24でレンダリングされる', () => {
    const { container } = render(<SwitchIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('カスタムサイズでレンダリングされる', () => {
    const { container } = render(<SwitchIcon size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(<SwitchIcon className="switch-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('switch-class')
  })

  it('displayNameが設定されている', () => {
    expect(SwitchIcon.displayName).toBe('SwitchIcon')
  })
})
