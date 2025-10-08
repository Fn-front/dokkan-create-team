import { render, screen } from '@testing-library/react'
import TeamLayout from './index'
import type { Character, TeamSlot } from '@/functions/types/team'

// Next/Imageをモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// hooksをモック
jest.mock('./hooks/useTeamDragDrop', () => ({
  useTeamDragDrop: () => ({
    draggedFromPosition: null,
    isDragging: false,
    handleSlotMouseDown: jest.fn(),
  }),
}))

jest.mock('../TeamSlot/hooks/useTeamSlotStats', () => ({
  useTeamSlotStats: () => ({
    stats55: { atk: 10000, def: 8000 },
    stats100: { atk: 15000, def: 12000 },
    superAttackCount: 0,
    statsAfterAction: { atk: 20000, def: 15000 },
  }),
}))

describe('TeamLayout', () => {
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

  const mockProps = {
    teamSlots: mockTeamSlots,
    onCharacterDrop: jest.fn(),
    onSlotClick: jest.fn(),
    onCharacterRemove: jest.fn(),
    onCharacterMove: jest.fn(),
    canMoveCharacter: jest.fn(() => true),
    toggleReversibleForm: jest.fn(),
    getReversibleFormIndex: jest.fn(() => 0),
    toggleForm: jest.fn(),
    getFormIndex: jest.fn(() => 0),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にレンダリングされる', () => {
    render(<TeamLayout {...mockProps} />)
    expect(screen.getByTestId('team-layout')).toBeInTheDocument()
  })

  it('TeamSkillDisplayが表示される', () => {
    render(<TeamLayout {...mockProps} />)
    const leaderLabels = screen.getAllByText('リーダースキル')
    const friendLabels = screen.getAllByText('フレンドスキル')
    expect(leaderLabels.length).toBeGreaterThan(0)
    expect(friendLabels.length).toBeGreaterThan(0)
  })

  it('7つのTeamSlotComponentが表示される', () => {
    render(<TeamLayout {...mockProps} />)
    const slots = screen.getAllByTestId('team-slot')
    expect(slots).toHaveLength(7)
  })

  it('リーダースロットにLEADERバッジが表示される', () => {
    render(<TeamLayout {...mockProps} />)
    expect(screen.getByText('LEADER')).toBeInTheDocument()
  })

  it('フレンドスロットにFRIENDバッジが表示される', () => {
    render(<TeamLayout {...mockProps} />)
    expect(screen.getByText('FRIEND')).toBeInTheDocument()
  })

  it('キャラクターが配置されているスロットに画像が表示される', () => {
    render(<TeamLayout {...mockProps} />)
    expect(screen.getByAltText('テストキャラクター')).toBeInTheDocument()
  })

  it('displayNameが設定されている', () => {
    expect(TeamLayout.displayName).toBe('TeamLayout')
  })
})
