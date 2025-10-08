import { render, screen } from '@testing-library/react'
import TeamSlotStats from './index'
import type { Character, TeamSlot } from '@/functions/types/team'

// hooksをモック
jest.mock('../../hooks/useCharacterStats', () => ({
  useNormalCharacterFinalStats: () => ({ atk: 10000, def: 8000 }),
  useLRActionStats: () => ({ atk: 20000, def: 15000 }),
  useSuperAttackCount: () => 0,
}))

describe('TeamSlotStats', () => {
  const mockCharacter: Character = {
    id: 1,
    name: 'テストキャラクター',
    forms: [
      {
        display_name: 'テストキャラクター',
        image_url: '/test.png',
        stats: { hp: 10000, atk: 8000, def: 5000 },
        skills: {
          pre_extreme: {
            leader_skill: {
              original_effect: 'リーダースキル',
              conditions: [],
              stat_boosts: [],
            },
            passive_skill: {
              original_effect: 'パッシブスキル',
              stat_boosts: [],
            },
          },
        },
      },
    ],
  }

  const mockTeamSlots: TeamSlot[] = [
    { character: mockCharacter, position: 0 },
    { character: null, position: 1 },
    { character: null, position: 2 },
    { character: null, position: 3 },
    { character: null, position: 4 },
    { character: null, position: 5 },
    { character: null, position: 6 },
  ]

  it('正常にレンダリングされる', () => {
    render(
      <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
    )
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('55%ステータスが表示される', () => {
    render(
      <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
    )
    expect(screen.getByText('55%')).toBeInTheDocument()
    const statValues = screen.getAllByText('10,000 / 8,000')
    expect(statValues.length).toBeGreaterThan(0)
  })

  it('100%ステータスが表示される', () => {
    render(
      <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
    )
    expect(screen.getByText('100%')).toBeInTheDocument()
    // 2つ目の10,000 / 8,000を取得
    const statValues = screen.getAllByText('10,000 / 8,000')
    expect(statValues).toHaveLength(2)
  })

  it('行動後ステータスが表示される', () => {
    render(
      <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
    )
    expect(screen.getByText('行動後（必殺1回）')).toBeInTheDocument()
    expect(screen.getByText('20,000 / 15,000')).toBeInTheDocument()
  })

  it('displayNameが設定されている', () => {
    expect(TeamSlotStats.displayName).toBe('TeamSlotStats')
  })

  describe('hooks呼び出し', () => {
    it('useNormalCharacterFinalStatsがpotential_55で呼ばれる', () => {
      const mockHook = jest.spyOn(
        require('../../hooks/useCharacterStats'),
        'useNormalCharacterFinalStats'
      )

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(mockHook).toHaveBeenCalledWith({
        character: mockCharacter,
        teamSlots: mockTeamSlots,
        potential: 'potential_55',
      })
    })

    it('useNormalCharacterFinalStatsがpotential_100で呼ばれる', () => {
      const mockHook = jest.spyOn(
        require('../../hooks/useCharacterStats'),
        'useNormalCharacterFinalStats'
      )

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(mockHook).toHaveBeenCalledWith({
        character: mockCharacter,
        teamSlots: mockTeamSlots,
        potential: 'potential_100',
      })
    })

    it('useLRActionStatsが呼ばれる', () => {
      const mockHook = jest.spyOn(
        require('../../hooks/useCharacterStats'),
        'useLRActionStats'
      )

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(mockHook).toHaveBeenCalledWith({
        character: mockCharacter,
        teamSlots: mockTeamSlots,
      })
    })

    it('useSuperAttackCountが呼ばれる', () => {
      const mockHook = jest.spyOn(
        require('../../hooks/useCharacterStats'),
        'useSuperAttackCount'
      )

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(mockHook).toHaveBeenCalled()
    })
  })

  describe('数値フォーマット', () => {
    it('ステータス値が3桁カンマ区切りで表示される', () => {
      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      // 10,000のようにカンマ区切りで表示される
      const statValues = screen.getAllByText(/10,000/)
      expect(statValues.length).toBeGreaterThan(0)
    })
  })

  describe('super_attack_count表示', () => {
    it('superAttackCount=0の場合、必殺1回と表示される', () => {
      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(screen.getByText('行動後（必殺1回）')).toBeInTheDocument()
    })

    it('superAttackCount=1の場合、必殺2回と表示される', () => {
      jest
        .spyOn(require('../../hooks/useCharacterStats'), 'useSuperAttackCount')
        .mockReturnValue(1)

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={mockTeamSlots} />
      )

      expect(screen.getByText('行動後（必殺2回）')).toBeInTheDocument()
    })
  })

  describe('異なるteamSlotsでの表示', () => {
    it('teamSlotsが空の配列でもエラーにならない', () => {
      const emptyTeamSlots: TeamSlot[] = []

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={emptyTeamSlots} />
      )

      expect(screen.getByText('55%')).toBeInTheDocument()
    })

    it('複数のキャラクターが配置されたteamSlotsでも正常に動作する', () => {
      const fullTeamSlots: TeamSlot[] = [
        { character: mockCharacter, position: 0 },
        { character: mockCharacter, position: 1 },
        { character: mockCharacter, position: 2 },
        { character: mockCharacter, position: 3 },
        { character: mockCharacter, position: 4 },
        { character: mockCharacter, position: 5 },
        { character: mockCharacter, position: 6 },
      ]

      render(
        <TeamSlotStats character={mockCharacter} teamSlots={fullTeamSlots} />
      )

      expect(screen.getByText('55%')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })
})
