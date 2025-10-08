import type { Character } from '@/functions/types/team'
import {
  getFirstForm,
  getCharacterSkills,
  isReversibleCharacter,
  hasMultipleForms,
  getDisplayName,
  getImageUrl,
  getCharacterStats,
  getPassiveSkill,
} from '../characterUtils'

describe('characterUtils', () => {
  describe('getFirstForm', () => {
    it('formsの最初の要素を返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/test1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {
              pre_extreme: {
                leader_skill: { conditions: [], stat_boosts: [] },
                passive_skill: { stat_boosts: [] },
              },
            },
          },
        ],
      }
      const result = getFirstForm(character)
      expect(result).toEqual(character.forms![0])
    })

    it('formsが空の場合nullを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
      }
      const result = getFirstForm(character)
      expect(result).toBeNull()
    })
  })

  describe('isReversibleCharacter', () => {
    it('reversible_formsが2つ以上ある場合trueを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        reversible_forms: [
          { image_url: '/test1.png', skills: {} },
          { image_url: '/test2.png', skills: {} },
        ],
      }
      expect(isReversibleCharacter(character)).toBe(true)
    })

    it('reversible_formsが1つの場合falseを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        reversible_forms: [{ image_url: '/test1.png', skills: {} }],
      }
      expect(isReversibleCharacter(character)).toBe(false)
    })

    it('reversible_formsがない場合falseを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
      }
      expect(isReversibleCharacter(character)).toBe(false)
    })
  })

  describe('hasMultipleForms', () => {
    it('formsが2つ以上ある場合trueを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/test1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
          {
            display_name: 'フォーム2',
            image_url: '/test2.png',
            stats: { hp: 12000, atk: 9000, def: 6000 },
            skills: {},
          },
        ],
      }
      expect(hasMultipleForms(character)).toBe(true)
    })

    it('formsが1つの場合falseを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/test1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
        ],
      }
      expect(hasMultipleForms(character)).toBe(false)
    })
  })

  describe('getDisplayName', () => {
    it('reversible_formsがある場合、nameを返す', () => {
      const character: Character = {
        id: 1,
        name: 'リバーシブルキャラ',
        reversible_forms: [{ image_url: '/test.png', skills: {} }],
      }
      expect(getDisplayName(character)).toBe('リバーシブルキャラ')
    })

    it('formsがある場合、forms[0].display_nameを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: '表示名',
            image_url: '/test.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
        ],
      }
      expect(getDisplayName(character)).toBe('表示名')
    })

    it('どちらもない場合、空文字を返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
      }
      expect(getDisplayName(character)).toBe('')
    })
  })

  describe('getImageUrl', () => {
    it('reversible_formsから指定インデックスの画像URLを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        reversible_forms: [
          { image_url: '/test1.png', skills: {} },
          { image_url: '/test2.png', skills: {} },
        ],
      }
      expect(getImageUrl(character, 0)).toBe('/test1.png')
      expect(getImageUrl(character, 1)).toBe('/test2.png')
    })

    it('インデックスが範囲外の場合、最後の要素を返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        reversible_forms: [
          { image_url: '/test1.png', skills: {} },
          { image_url: '/test2.png', skills: {} },
        ],
      }
      expect(getImageUrl(character, 99)).toBe('/test2.png')
    })

    it('formsから画像URLを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/form1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
        ],
      }
      expect(getImageUrl(character, 0)).toBe('/form1.png')
    })
  })

  describe('getPassiveSkill', () => {
    it('super_extremeのパッシブスキルを優先して返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'テスト',
            image_url: '/test.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {
              super_extreme: {
                passive_skill: { stat_boosts: [{ type: 'atk', value: 100 }] },
              },
              post_extreme: {
                passive_skill: { stat_boosts: [{ type: 'atk', value: 80 }] },
              },
            },
          },
        ],
      }
      const result = getPassiveSkill(character)
      expect(result?.stat_boosts).toEqual([{ type: 'atk', value: 100 }])
    })

    it('super_extremeがない場合、post_extremeを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
        forms: [
          {
            display_name: 'テスト',
            image_url: '/test.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {
              post_extreme: {
                passive_skill: { stat_boosts: [{ type: 'atk', value: 80 }] },
              },
            },
          },
        ],
      }
      const result = getPassiveSkill(character)
      expect(result?.stat_boosts).toEqual([{ type: 'atk', value: 80 }])
    })

    it('スキルがない場合nullを返す', () => {
      const character: Character = {
        id: 1,
        name: 'テストキャラ',
      }
      const result = getPassiveSkill(character)
      expect(result).toBeNull()
    })
  })
})
