import { collectStatValues } from '../statBoostUtils'

describe('collectStatValues', () => {
  describe('基本的な値の収集', () => {
    it('単純なatk値を収集する', () => {
      const obj = { atk: 100 }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(100)
    })

    it('単純なdef値を収集する', () => {
      const obj = { def: 50 }
      const result = collectStatValues(obj, 'def')
      expect(result).toBe(50)
    })

    it('単純なdef_down値を収集する', () => {
      const obj = { def_down: 30 }
      const result = collectStatValues(obj, 'def_down')
      expect(result).toBe(30)
    })

    it('複数の値を合計する', () => {
      const obj = {
        first: { atk: 100 },
        second: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(150)
    })
  })

  describe('ネストしたオブジェクトの処理', () => {
    it('ネストしたオブジェクトから値を再帰的に収集する', () => {
      const obj = {
        level1: {
          atk: 100,
          level2: {
            atk: 50,
            level3: {
              atk: 25,
            },
          },
        },
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(175)
    })
  })

  describe('除外オプション', () => {
    it('excludeBasic=trueの場合、basicキーを除外する', () => {
      const obj = {
        basic: { atk: 100 },
        other: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk', true)
      expect(result).toBe(50)
    })

    it('excludeBasic=falseの場合、basicキーを含める', () => {
      const obj = {
        basic: { atk: 100 },
        other: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk', false)
      expect(result).toBe(150)
    })

    it('defensiveキーは常に除外される', () => {
      const obj = {
        defensive: { atk: 100 },
        other: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(50)
    })

    it('includeConditions=falseの場合、conditionsキーを除外する', () => {
      const obj = {
        conditions: { atk: 100 },
        other: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk', false, false)
      expect(result).toBe(50)
    })

    it('includeConditions=trueの場合、conditionsキーを含める', () => {
      const obj = {
        conditions: { atk: 100 },
        other: { atk: 50 },
      }
      const result = collectStatValues(obj, 'atk', false, true)
      expect(result).toBe(150)
    })

    it('_supportで終わるキーは除外される', () => {
      const obj = {
        atk_support: { atk: 100 },
        def_support: { atk: 50 },
        other: { atk: 25 },
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(25)
    })
  })

  describe('ally_count動的計算', () => {
    it('ally_count条件で動的に計算する', () => {
      const obj = {
        ally_count: {
          target: ['超', '孫悟空の系譜'],
          atk: {
            per_ally: 0.1,
          },
        },
      }

      const mockCountAllies = jest.fn(() => 3)
      const result = collectStatValues(
        obj,
        'atk',
        false,
        false,
        '',
        mockCountAllies
      )

      expect(mockCountAllies).toHaveBeenCalledWith({
        type: 'attribute_or_category',
        targets: ['超', '孫悟空の系譜'],
        select: 'most',
      })
      expect(result).toBe(1.3) // 1.0 + 0.1 * 3
    })

    it('countAlliesForAllyCountが未指定の場合は0', () => {
      const obj = {
        ally_count: {
          target: ['超'],
          atk: {
            per_ally: 0.1,
          },
        },
      }

      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(0)
    })

    it('targetが空の場合はper_allyを使用しない', () => {
      const obj = {
        ally_count: {
          target: [],
          atk: {
            per_ally: 0.1,
          },
        },
      }

      const mockCountAllies = jest.fn(() => 3)
      const result = collectStatValues(
        obj,
        'atk',
        false,
        false,
        '',
        mockCountAllies
      )

      expect(mockCountAllies).not.toHaveBeenCalled()
      expect(result).toBe(0)
    })
  })

  describe('異なるstatTypeの処理', () => {
    it('atk以外のstatTypeは無視される', () => {
      const obj = {
        atk: 100,
        def: 50,
        def_down: 30,
      }

      expect(collectStatValues(obj, 'atk')).toBe(100)
      expect(collectStatValues(obj, 'def')).toBe(50)
      expect(collectStatValues(obj, 'def_down')).toBe(30)
    })
  })

  describe('エッジケース', () => {
    it('空のオブジェクトの場合は0を返す', () => {
      const obj = {}
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(0)
    })

    it('該当するstatTypeが存在しない場合は0を返す', () => {
      const obj = {
        def: 100,
        other: 50,
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(0)
    })

    it('数値以外の値は無視される', () => {
      const obj = {
        atk: 'invalid',
        other: { atk: 100 },
      }
      const result = collectStatValues(obj, 'atk')
      expect(result).toBe(100)
    })
  })
})
