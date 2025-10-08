import { countAlliesForAllyCount } from '../allyCountUtils'
import type { TeamSlot } from '@/functions/types/team'
import type { Character } from '@/functions/types/character'

describe('countAlliesForAllyCount', () => {
  const createMockCharacter = (
    attribute: string,
    categories?: string[]
  ): Character => ({
    id: 1,
    name: 'Test Character',
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
  })

  const createMockTeamSlot = (character: Character | null): TeamSlot => ({
    character,
    instanceId: character ? `${character.id}-1` : null,
  })

  describe('attribute_or_category条件', () => {
    it('属性（超）のキャラクター数をカウントする', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['超'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('超力')),
        createMockTeamSlot(createMockCharacter('超知')),
        createMockTeamSlot(createMockCharacter('極力')),
        createMockTeamSlot(null),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(2)
    })

    it('属性（極）のキャラクター数をカウントする', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['極'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('極力')),
        createMockTeamSlot(createMockCharacter('極速')),
        createMockTeamSlot(createMockCharacter('超力')),
        createMockTeamSlot(null),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(2)
    })

    it('カテゴリのキャラクター数をカウントする', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['孫悟空の系譜'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('超力', ['孫悟空の系譜'])),
        createMockTeamSlot(createMockCharacter('超知', ['孫悟空の系譜'])),
        createMockTeamSlot(createMockCharacter('極力', ['ベジータの系譜'])),
        createMockTeamSlot(null),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(2)
    })

    it('属性とカテゴリの多い方をカウントする（属性が多い場合）', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['超', '孫悟空の系譜'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('超力', [])),
        createMockTeamSlot(createMockCharacter('超知', [])),
        createMockTeamSlot(createMockCharacter('超体', [])),
        createMockTeamSlot(createMockCharacter('極力', ['孫悟空の系譜'])),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(3) // 属性（超）が3体、カテゴリが1体
    })

    it('属性とカテゴリの多い方をカウントする（カテゴリが多い場合）', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['超', '孫悟空の系譜'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('超力', ['孫悟空の系譜'])),
        createMockTeamSlot(createMockCharacter('極力', ['孫悟空の系譜'])),
        createMockTeamSlot(createMockCharacter('極知', ['孫悟空の系譜'])),
        createMockTeamSlot(createMockCharacter('極体', [])),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(3) // 属性（超）が1体、カテゴリが3体
    })

    it('空のチームスロットの場合は0を返す', () => {
      const condition = {
        type: 'attribute_or_category',
        targets: ['超'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(null),
        createMockTeamSlot(null),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(0)
    })
  })

  describe('未対応の条件タイプ', () => {
    it('未対応の条件タイプの場合は0を返す', () => {
      const condition = {
        type: 'unknown_type',
        targets: ['超'],
        select: 'most',
      }
      const teamSlots: TeamSlot[] = [
        createMockTeamSlot(createMockCharacter('超力')),
      ]

      const result = countAlliesForAllyCount(condition, teamSlots)
      expect(result).toBe(0)
    })
  })
})
