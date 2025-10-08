import { matchesLeaderSkillCondition } from '../leaderSkillUtils'
import type { Character } from '@/functions/types/team'

describe('matchesLeaderSkillCondition', () => {
  const createMockCharacter = (
    attribute: string,
    name: string,
    categories?: string[]
  ): Character => ({
    id: 1,
    name,
    attribute,
    type: 'AGL',
    rarity: 'UR',
    cost: 58,
    hp: 10000,
    atk: 10000,
    def: 5000,
    leaderSkill: '',
    categories: categories || [],
    superAttack: '',
    passiveSkill: '',
    links: [],
    characterImageUrl: '',
    forms: [
      {
        display_name: name,
        image_url: '',
        skills: {
          pre_extreme: {
            leader_skill: { conditions: [], description: '' },
            passive_skill: { stat_boosts: {} },
            super_attack: { description: '' },
          },
        },
        stats: { hp: 10000, atk: 10000, def: 5000 },
      },
    ],
  })

  describe('属性判定', () => {
    it('「力属性」の場合、超力と極力の両方が対象', () => {
      const condition = { type: 'attribute', target: ['力属性'] }

      const superChar = createMockCharacter('超力', 'Test1')
      const extremeChar = createMockCharacter('極力', 'Test2')
      const otherChar = createMockCharacter('超知', 'Test3')

      expect(matchesLeaderSkillCondition(superChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(extremeChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(otherChar, condition)).toBe(false)
    })

    it('「超力属性」の場合、超力のみが対象', () => {
      const condition = { type: 'attribute', target: ['超力属性'] }

      const superChar = createMockCharacter('超力', 'Test1')
      const extremeChar = createMockCharacter('極力', 'Test2')

      expect(matchesLeaderSkillCondition(superChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(extremeChar, condition)).toBe(false)
    })

    it('「極力属性」の場合、極力のみが対象', () => {
      const condition = { type: 'attribute', target: ['極力属性'] }

      const superChar = createMockCharacter('超力', 'Test1')
      const extremeChar = createMockCharacter('極力', 'Test2')

      expect(matchesLeaderSkillCondition(superChar, condition)).toBe(false)
      expect(matchesLeaderSkillCondition(extremeChar, condition)).toBe(true)
    })

    it('複数の属性条件に一致する', () => {
      const condition = { type: 'attribute', target: ['力属性', '知属性'] }

      const aglChar = createMockCharacter('超力', 'Test1')
      const intChar = createMockCharacter('極知', 'Test2')
      const otherChar = createMockCharacter('超速', 'Test3')

      expect(matchesLeaderSkillCondition(aglChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(intChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(otherChar, condition)).toBe(false)
    })
  })

  describe('キャラクター名判定', () => {
    it('キャラクター名が一致する', () => {
      const condition = { type: 'character', target: ['孫悟空'] }

      const gokuChar = createMockCharacter('超力', '孫悟空')
      const vegetaChar = createMockCharacter('超力', 'ベジータ')

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(vegetaChar, condition)).toBe(false)
    })

    it('部分一致でキャラクター名が一致する', () => {
      const condition = { type: 'character', target: ['悟空'] }

      const gokuChar = createMockCharacter('超力', '孫悟空')
      const gohanChar = createMockCharacter('超力', '孫悟飯')

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(gohanChar, condition)).toBe(false)
    })

    it('「または」条件で最初の名前のみに一致する', () => {
      const condition = { type: 'character', target: ['孫悟空または超サイヤ人'] }

      const gokuChar = createMockCharacter('超力', '孫悟空')
      const ssChar = createMockCharacter('超力', '超サイヤ人孫悟飯')
      const gokuSsChar = createMockCharacter('超力', '超サイヤ人孫悟空')

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(ssChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(gokuSsChar, condition)).toBe(false) // 両方に一致するのでNG
    })

    it('「&」条件で最初の名前のみに一致する', () => {
      const condition = { type: 'character', target: ['孫悟空&ベジータ'] }

      const gokuChar = createMockCharacter('超力', '孫悟空')
      const vegetaChar = createMockCharacter('超力', 'ベジータ')
      const bothChar = createMockCharacter('超力', '孫悟空&ベジータ')

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(vegetaChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(bothChar, condition)).toBe(false) // 両方に一致するのでNG
    })
  })

  describe('カテゴリ判定', () => {
    it('カテゴリに一致する', () => {
      const condition = { type: 'category', target: ['孫悟空の系譜'] }

      const gokuChar = createMockCharacter('超力', 'Test', ['孫悟空の系譜'])
      const vegetaChar = createMockCharacter('超力', 'Test', ['ベジータの系譜'])

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(vegetaChar, condition)).toBe(false)
    })

    it('カテゴリが空の場合はfalse', () => {
      const condition = { type: 'category', target: ['孫悟空の系譜'] }
      const char = createMockCharacter('超力', 'Test', [])

      expect(matchesLeaderSkillCondition(char, condition)).toBe(false)
    })

    it('複数のカテゴリ条件のいずれかに一致する', () => {
      const condition = {
        type: 'category',
        target: ['孫悟空の系譜', 'ベジータの系譜'],
      }

      const gokuChar = createMockCharacter('超力', 'Test', ['孫悟空の系譜'])
      const vegetaChar = createMockCharacter('超力', 'Test', ['ベジータの系譜'])
      const otherChar = createMockCharacter('超力', 'Test', ['人造人間'])

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(vegetaChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(otherChar, condition)).toBe(false)
    })
  })

  describe('追加カテゴリ判定', () => {
    it('追加カテゴリに一致する', () => {
      const condition = {
        type: 'additional_category',
        target: ['孫悟空の系譜'],
      }

      const gokuChar = createMockCharacter('超力', 'Test', ['孫悟空の系譜'])
      const vegetaChar = createMockCharacter('超力', 'Test', ['ベジータの系譜'])

      expect(matchesLeaderSkillCondition(gokuChar, condition)).toBe(true)
      expect(matchesLeaderSkillCondition(vegetaChar, condition)).toBe(false)
    })
  })

  describe('未対応の条件タイプ', () => {
    it('未対応の条件タイプの場合はfalse', () => {
      const condition = { type: 'unknown_type', target: ['test'] }
      const char = createMockCharacter('超力', 'Test')

      expect(matchesLeaderSkillCondition(char, condition)).toBe(false)
    })
  })
})
