import { render, screen } from '@testing-library/react'
import TeamSkillDisplay from './index'
import type { Character, TeamSlot } from '@/functions/types/team'

describe('TeamSkillDisplay', () => {
  const mockLeaderCharacter: Character = {
    id: 1,
    name: 'リーダー',
    forms: [
      {
        display_name: 'リーダー',
        image_url: '/leader.png',
        stats: {
          hp: 10000,
          atk: 8000,
          def: 5000,
          potential_55: { HP: '10000', ATK: '8000', DEF: '5000' },
        },
        skills: {
          pre_extreme: {
            leader_skill: {
              original_effect: 'HP、ATK、DEF50%UP',
              conditions: [{ hp: 1.5, atk: 1.5, def: 1.5 }],
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

  const mockFriendCharacter: Character = {
    id: 2,
    name: 'フレンド',
    forms: [
      {
        display_name: 'フレンド',
        image_url: '/friend.png',
        stats: {
          hp: 12000,
          atk: 9000,
          def: 6000,
          potential_55: { HP: '12000', ATK: '9000', DEF: '6000' },
        },
        skills: {
          pre_extreme: {
            leader_skill: {
              original_effect: 'HP、ATK、DEF70%UP',
              conditions: [{ hp: 1.7, atk: 1.7, def: 1.7 }],
              stat_boosts: [],
            },
            passive_skill: {
              original_effect: 'フレンドパッシブ',
              stat_boosts: [],
            },
          },
        },
      },
    ],
  }

  it('リーダーとフレンドが配置されている場合、スキルが表示される', () => {
    const teamSlots: TeamSlot[] = [
      { character: mockLeaderCharacter, position: 0 },
      { character: null, position: 1 },
      { character: null, position: 2 },
      { character: null, position: 3 },
      { character: null, position: 4 },
      { character: null, position: 5 },
      { character: mockFriendCharacter, position: 6 },
    ]

    render(<TeamSkillDisplay teamSlots={teamSlots} />)
    expect(screen.getByText('リーダースキル')).toBeInTheDocument()
    expect(screen.getByText('HP、ATK、DEF50%UP')).toBeInTheDocument()
    expect(screen.getByText('フレンドスキル')).toBeInTheDocument()
    expect(screen.getByText('HP、ATK、DEF70%UP')).toBeInTheDocument()
  })

  it('リーダーが配置されていない場合、プレースホルダーが表示される', () => {
    const teamSlots: TeamSlot[] = [
      { character: null, position: 0 },
      { character: null, position: 1 },
      { character: null, position: 2 },
      { character: null, position: 3 },
      { character: null, position: 4 },
      { character: null, position: 5 },
      { character: mockFriendCharacter, position: 6 },
    ]

    render(<TeamSkillDisplay teamSlots={teamSlots} />)
    expect(screen.getByText('リーダーを設置してください')).toBeInTheDocument()
  })

  it('フレンドが配置されていない場合、プレースホルダーが表示される', () => {
    const teamSlots: TeamSlot[] = [
      { character: mockLeaderCharacter, position: 0 },
      { character: null, position: 1 },
      { character: null, position: 2 },
      { character: null, position: 3 },
      { character: null, position: 4 },
      { character: null, position: 5 },
      { character: null, position: 6 },
    ]

    render(<TeamSkillDisplay teamSlots={teamSlots} />)
    expect(screen.getByText('フレンドを設置してください')).toBeInTheDocument()
  })

  it('HPラベルが表示される', () => {
    const teamSlots: TeamSlot[] = [
      { character: mockLeaderCharacter, position: 0 },
      { character: null, position: 1 },
      { character: null, position: 2 },
      { character: null, position: 3 },
      { character: null, position: 4 },
      { character: null, position: 5 },
      { character: mockFriendCharacter, position: 6 },
    ]

    render(<TeamSkillDisplay teamSlots={teamSlots} />)
    expect(screen.getByText('HP')).toBeInTheDocument()
  })

  it('スキル情報がない場合、エラーメッセージが表示される', () => {
    const noSkillCharacter: Character = {
      id: 3,
      name: 'スキルなし',
      forms: [
        {
          display_name: 'スキルなし',
          image_url: '/no-skill.png',
          stats: { hp: 10000, atk: 8000, def: 5000 },
          skills: {},
        },
      ],
    }

    const teamSlots: TeamSlot[] = [
      { character: noSkillCharacter, position: 0 },
      { character: null, position: 1 },
      { character: null, position: 2 },
      { character: null, position: 3 },
      { character: null, position: 4 },
      { character: null, position: 5 },
      { character: null, position: 6 },
    ]

    render(<TeamSkillDisplay teamSlots={teamSlots} />)
    expect(screen.getByText('スキル情報がありません')).toBeInTheDocument()
  })

  it('displayNameが設定されている', () => {
    expect(TeamSkillDisplay.displayName).toBe('TeamSkillDisplay')
  })

  describe('HP計算', () => {
    it('リーダーとフレンドのスキルでHP倍率が計算される', () => {
      const teamSlots: TeamSlot[] = [
        { character: mockLeaderCharacter, position: 0 },
        {
          character: {
            ...mockLeaderCharacter,
            id: 10,
            forms: [
              {
                ...mockLeaderCharacter.forms![0],
                stats: {
                  ...mockLeaderCharacter.forms![0].stats,
                  potential_55: { HP: '20000', ATK: '10000', DEF: '8000' },
                },
              },
            ],
          },
          position: 1,
        },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: mockFriendCharacter, position: 6 },
      ]

      const { container } = render(<TeamSkillDisplay teamSlots={teamSlots} />)
      const hpValue = container.querySelector('[class*="hpValue"]')
      expect(hpValue).toBeInTheDocument()
    })

    it('キャラクターが1体もいない場合、HPが0と表示される', () => {
      const emptyTeamSlots: TeamSlot[] = [
        { character: null, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: null, position: 6 },
      ]

      render(<TeamSkillDisplay teamSlots={emptyTeamSlots} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('スキル優先順位', () => {
    it('super_extremeのリーダースキルが優先される', () => {
      const superExtremeCharacter: Character = {
        id: 100,
        name: '超極限キャラ',
        forms: [
          {
            display_name: '超極限キャラ',
            image_url: '/super.png',
            stats: {
              hp: 10000,
              atk: 8000,
              def: 5000,
              potential_55: { HP: '10000', ATK: '8000', DEF: '5000' },
            },
            skills: {
              super_extreme: {
                leader_skill: {
                  original_effect: '超極限リーダースキル',
                  conditions: [{ hp: 2.0, atk: 2.0, def: 2.0 }],
                  stat_boosts: [],
                },
              },
              post_extreme: {
                leader_skill: {
                  original_effect: '極限リーダースキル',
                  conditions: [{ hp: 1.7, atk: 1.7, def: 1.7 }],
                  stat_boosts: [],
                },
              },
              pre_extreme: {
                leader_skill: {
                  original_effect: '通常リーダースキル',
                  conditions: [{ hp: 1.5, atk: 1.5, def: 1.5 }],
                  stat_boosts: [],
                },
              },
            },
          },
        ],
      }

      const teamSlots: TeamSlot[] = [
        { character: superExtremeCharacter, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: null, position: 6 },
      ]

      render(<TeamSkillDisplay teamSlots={teamSlots} />)
      expect(screen.getByText('超極限リーダースキル')).toBeInTheDocument()
    })

    it('super_extremeがない場合、post_extremeが使用される', () => {
      const postExtremeCharacter: Character = {
        id: 101,
        name: '極限キャラ',
        forms: [
          {
            display_name: '極限キャラ',
            image_url: '/post.png',
            stats: {
              hp: 10000,
              atk: 8000,
              def: 5000,
              potential_55: { HP: '10000', ATK: '8000', DEF: '5000' },
            },
            skills: {
              post_extreme: {
                leader_skill: {
                  original_effect: '極限リーダースキル',
                  conditions: [{ hp: 1.7, atk: 1.7, def: 1.7 }],
                  stat_boosts: [],
                },
              },
              pre_extreme: {
                leader_skill: {
                  original_effect: '通常リーダースキル',
                  conditions: [{ hp: 1.5, atk: 1.5, def: 1.5 }],
                  stat_boosts: [],
                },
              },
            },
          },
        ],
      }

      const teamSlots: TeamSlot[] = [
        { character: postExtremeCharacter, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: null, position: 6 },
      ]

      render(<TeamSkillDisplay teamSlots={teamSlots} />)
      expect(screen.getByText('極限リーダースキル')).toBeInTheDocument()
    })
  })

  describe('各セクションのクラス名', () => {
    it('leaderSkillクラスが適用される', () => {
      const teamSlots: TeamSlot[] = [
        { character: mockLeaderCharacter, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: null, position: 6 },
      ]

      const { container } = render(<TeamSkillDisplay teamSlots={teamSlots} />)
      const leaderSkillSection = container.querySelector(
        '[class*="leaderSkill"]'
      )
      expect(leaderSkillSection).toBeInTheDocument()
    })

    it('friendSkillクラスが適用される', () => {
      const teamSlots: TeamSlot[] = [
        { character: null, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: mockFriendCharacter, position: 6 },
      ]

      const { container } = render(<TeamSkillDisplay teamSlots={teamSlots} />)
      const friendSkillSection = container.querySelector(
        '[class*="friendSkill"]'
      )
      expect(friendSkillSection).toBeInTheDocument()
    })

    it('hpSectionクラスが適用される', () => {
      const teamSlots: TeamSlot[] = [
        { character: null, position: 0 },
        { character: null, position: 1 },
        { character: null, position: 2 },
        { character: null, position: 3 },
        { character: null, position: 4 },
        { character: null, position: 5 },
        { character: null, position: 6 },
      ]

      const { container } = render(<TeamSkillDisplay teamSlots={teamSlots} />)
      const hpSection = container.querySelector('[class*="hpSection"]')
      expect(hpSection).toBeInTheDocument()
    })
  })
})
