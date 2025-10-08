import { cn } from '../utils'

describe('cn', () => {
  it('複数のクラス名を結合できる', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('条件付きクラス名を処理できる', () => {
    const result = cn('base', { active: true, disabled: false })
    expect(result).toBe('base active')
  })

  it('配列を処理できる', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('undefinedやnullを無視する', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('空の入力で空文字を返す', () => {
    const result = cn()
    expect(result).toBe('')
  })
})
