import { render } from '@testing-library/react'
import KiMeter from './index'

describe('KiMeter', () => {
  it('正常にレンダリングされる', () => {
    const { container } = render(<KiMeter kiValue={12} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('24個のセグメントが生成される', () => {
    const { container } = render(<KiMeter kiValue={0} />)
    const segments = container.querySelectorAll('[class*="segment"]')
    expect(segments).toHaveLength(24)
  })

  it('指定したki値の数だけactiveクラスが付与される', () => {
    const { container } = render(<KiMeter kiValue={6} />)
    const activeSegments = container.querySelectorAll('[class*="active"]')
    expect(activeSegments).toHaveLength(6)
  })

  it('ki値が12の場合、12個のセグメントがアクティブになる', () => {
    const { container } = render(<KiMeter kiValue={12} />)
    const activeSegments = container.querySelectorAll('[class*="active"]')
    expect(activeSegments).toHaveLength(12)
  })

  it('ki値が24の場合、全セグメントがアクティブになる', () => {
    const { container } = render(<KiMeter kiValue={24} />)
    const activeSegments = container.querySelectorAll('[class*="active"]')
    expect(activeSegments).toHaveLength(24)
  })

  it('最初の12個はfirstRoundクラスを持つ', () => {
    const { container } = render(<KiMeter kiValue={0} />)
    const firstRoundSegments = container.querySelectorAll(
      '[class*="firstRound"]'
    )
    expect(firstRoundSegments).toHaveLength(12)
  })

  it('後半の12個はsecondRoundクラスを持つ', () => {
    const { container } = render(<KiMeter kiValue={0} />)
    const secondRoundSegments = container.querySelectorAll(
      '[class*="secondRound"]'
    )
    expect(secondRoundSegments).toHaveLength(12)
  })

  it('各セグメントに正しい角度のtransformが適用される', () => {
    const { container } = render(<KiMeter kiValue={0} />)
    const segments = container.querySelectorAll('[class*="segment"]')

    // 最初のセグメント（0度）
    expect(segments[0]).toHaveStyle({ transform: 'rotate(0deg)' })
    // 2番目のセグメント（30度）
    expect(segments[1]).toHaveStyle({ transform: 'rotate(30deg)' })
    // 13番目のセグメント（0度、2周目）
    expect(segments[12]).toHaveStyle({ transform: 'rotate(0deg)' })
  })

  it('displayNameが設定されている', () => {
    expect(KiMeter.displayName).toBe('KiMeter')
  })

  describe('境界値テスト', () => {
    it('ki値が0の場合、全セグメントが非アクティブ', () => {
      const { container } = render(<KiMeter kiValue={0} />)
      const activeSegments = container.querySelectorAll('[class*="active"]')
      expect(activeSegments).toHaveLength(0)
    })

    it('ki値が負の場合でもエラーにならない', () => {
      const { container } = render(<KiMeter kiValue={-5} />)
      const activeSegments = container.querySelectorAll('[class*="active"]')
      expect(activeSegments).toHaveLength(0)
    })

    it('ki値が24を超えても24個までしかアクティブにならない', () => {
      const { container } = render(<KiMeter kiValue={30} />)
      const activeSegments = container.querySelectorAll('[class*="active"]')
      // kiValue=30でも、最大24個のセグメントまで
      expect(activeSegments.length).toBeLessThanOrEqual(24)
    })
  })

  describe('角度計算の詳細', () => {
    it('13番目のセグメントは2周目の開始（角度0度）', () => {
      const { container } = render(<KiMeter kiValue={0} />)
      const segments = container.querySelectorAll('[class*="segment"]')
      expect(segments[12]).toHaveStyle({ transform: 'rotate(0deg)' })
    })

    it('最後のセグメント（24番目）は330度', () => {
      const { container } = render(<KiMeter kiValue={0} />)
      const segments = container.querySelectorAll('[class*="segment"]')
      // 24番目は index=23、23 % 12 = 11、11 * 30 = 330度
      expect(segments[23]).toHaveStyle({ transform: 'rotate(330deg)' })
    })

    it('7番目のセグメントは180度', () => {
      const { container } = render(<KiMeter kiValue={0} />)
      const segments = container.querySelectorAll('[class*="segment"]')
      // 7番目は index=6、6 * 30 = 180度
      expect(segments[6]).toHaveStyle({ transform: 'rotate(180deg)' })
    })
  })

  describe('クラス構造', () => {
    it('kiMeterクラスを持つ外側のdivが存在する', () => {
      const { container } = render(<KiMeter kiValue={12} />)
      const kiMeter = container.querySelector('[class*="kiMeter"]')
      expect(kiMeter).toBeInTheDocument()
    })

    it('circleクラスを持つdivが存在する', () => {
      const { container } = render(<KiMeter kiValue={12} />)
      const circle = container.querySelector('[class*="circle"]')
      expect(circle).toBeInTheDocument()
    })

    it('全セグメントがsegmentクラスを持つ', () => {
      const { container } = render(<KiMeter kiValue={0} />)
      const segments = container.querySelectorAll('[class*="segment"]')
      expect(segments).toHaveLength(24)
      segments.forEach((segment) => {
        expect(segment.className).toContain('segment')
      })
    })
  })

  describe('アクティブ状態のインクリメント', () => {
    it('ki値を1増やすごとにアクティブセグメントが1つ増える', () => {
      for (let ki = 0; ki <= 24; ki++) {
        const { container } = render(<KiMeter kiValue={ki} />)
        const activeSegments = container.querySelectorAll('[class*="active"]')
        expect(activeSegments).toHaveLength(ki)
      }
    })
  })
})
