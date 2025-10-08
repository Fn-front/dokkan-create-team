import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterDetailDialog from './CharacterDetailDialog'
import type { Character } from '@/functions/types/team'

describe('CharacterDetailDialog', () => {
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
              original_effect: 'テストリーダースキル',
              conditions: [],
              stat_boosts: [],
            },
            super_attack: {
              original_effect: 'テスト必殺技',
            },
            passive_skill: {
              original_effect: 'テストパッシブスキル',
              stat_boosts: [],
            },
          },
          post_extreme: {
            leader_skill: {
              original_effect: '極限リーダースキル',
              conditions: [],
              stat_boosts: [],
            },
            passive_skill: {
              original_effect: '極限パッシブスキル',
              stat_boosts: [],
            },
          },
        },
      },
    ],
    link_skills: ['リンク1', 'リンク2', 'リンク3'],
    categories: ['カテゴリ1', 'カテゴリ2'],
  }

  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    mockOnOpenChange.mockClear()
  })

  it('open=trueのときダイアログが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('テストキャラクター')).toBeInTheDocument()
  })

  it('open=falseのときダイアログが表示されない', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.queryByText('テストキャラクター')).not.toBeInTheDocument()
  })

  it('通常タブと極限タブが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByRole('tab', { name: '通常' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '極限' })).toBeInTheDocument()
  })

  it('デフォルトで最後のタブ（極限）が選択される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('極限リーダースキル')).toBeVisible()
  })

  it('タブを切り替えるとコンテンツが変わる', async () => {
    const user = userEvent.setup()
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // 通常タブをクリック
    await user.click(screen.getByRole('tab', { name: '通常' }))
    expect(screen.getByText('テストリーダースキル')).toBeVisible()
    expect(screen.getByText('テスト必殺技')).toBeVisible()
  })

  it('リーダースキルが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('リーダースキル')).toBeInTheDocument()
  })

  it('必殺技が表示される', async () => {
    const user = userEvent.setup()
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    await user.click(screen.getByRole('tab', { name: '通常' }))
    expect(screen.getByText('必殺技')).toBeInTheDocument()
    expect(screen.getByText('テスト必殺技')).toBeInTheDocument()
  })

  it('パッシブスキルが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('パッシブスキル')).toBeInTheDocument()
  })

  it('リンクスキルが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('リンクスキル')).toBeInTheDocument()
    expect(screen.getByText('リンク1')).toBeInTheDocument()
    expect(screen.getByText('リンク2')).toBeInTheDocument()
    expect(screen.getByText('リンク3')).toBeInTheDocument()
  })

  it('カテゴリが表示される', () => {
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ1')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ2')).toBeInTheDocument()
  })

  it('閉じるボタンをクリックするとonOpenChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    render(
      <CharacterDetailDialog
        character={mockCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    const closeButton = screen.getByRole('button', { name: '×' })
    await user.click(closeButton)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('スキルが存在しない場合nullを返す', () => {
    const emptyCharacter: Character = {
      id: 2,
      name: 'スキルなしキャラ',
      forms: [
        {
          display_name: 'スキルなし',
          image_url: '/empty.png',
          stats: { hp: 10000, atk: 8000, def: 5000 },
          skills: {},
        },
      ],
    }

    const { container } = render(
      <CharacterDetailDialog
        character={emptyCharacter}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('displayNameが設定されている', () => {
    expect(CharacterDetailDialog.displayName).toBe('CharacterDetailDialog')
  })

  describe('超必殺技の表示', () => {
    it('ultra_super_attackがある場合、超必殺技が表示される', async () => {
      const user = userEvent.setup()
      const characterWithUltra: Character = {
        ...mockCharacter,
        forms: [
          {
            ...mockCharacter.forms![0],
            skills: {
              pre_extreme: {
                ultra_super_attack: {
                  original_effect: 'テスト超必殺技',
                },
              },
            },
          },
        ],
      }

      render(
        <CharacterDetailDialog
          character={characterWithUltra}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      await user.click(screen.getByRole('tab', { name: '通常' }))
      expect(screen.getByText('超必殺技')).toBeInTheDocument()
      expect(screen.getByText('テスト超必殺技')).toBeInTheDocument()
    })
  })

  describe('アクティブスキルの表示', () => {
    it('active_skillがある場合、アクティブスキルが表示される', async () => {
      const user = userEvent.setup()
      const characterWithActive: Character = {
        ...mockCharacter,
        forms: [
          {
            ...mockCharacter.forms![0],
            skills: {
              pre_extreme: {
                active_skill: {
                  original_effect: 'テストアクティブスキル',
                },
              },
            },
          },
        ],
      }

      render(
        <CharacterDetailDialog
          character={characterWithActive}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      await user.click(screen.getByRole('tab', { name: '通常' }))
      expect(screen.getByText('アクティブスキル')).toBeInTheDocument()
      expect(screen.getByText('テストアクティブスキル')).toBeInTheDocument()
    })
  })

  describe('リンクスキルがない場合', () => {
    it('link_skillsがundefinedの場合、リンクスキルセクションが表示されない', () => {
      const characterWithoutLinks: Character = {
        ...mockCharacter,
        link_skills: undefined,
      }

      render(
        <CharacterDetailDialog
          character={characterWithoutLinks}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByText('リンクスキル')).not.toBeInTheDocument()
    })

    it('link_skillsが空配列の場合、リンクスキルセクションが表示されない', () => {
      const characterWithEmptyLinks: Character = {
        ...mockCharacter,
        link_skills: [],
      }

      render(
        <CharacterDetailDialog
          character={characterWithEmptyLinks}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByText('リンクスキル')).not.toBeInTheDocument()
    })
  })

  describe('カテゴリがない場合', () => {
    it('categoriesがundefinedの場合、カテゴリセクションが表示されない', () => {
      const characterWithoutCategories: Character = {
        ...mockCharacter,
        categories: undefined,
      }

      render(
        <CharacterDetailDialog
          character={characterWithoutCategories}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument()
    })

    it('categoriesが空配列の場合、カテゴリセクションが表示されない', () => {
      const characterWithEmptyCategories: Character = {
        ...mockCharacter,
        categories: [],
      }

      render(
        <CharacterDetailDialog
          character={characterWithEmptyCategories}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument()
    })
  })

  describe('ダイアログのタイトル', () => {
    it('キャラクター名がタイトルに表示される', () => {
      render(
        <CharacterDetailDialog
          character={mockCharacter}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const title = screen.getByText('テストキャラクター')
      expect(title).toBeInTheDocument()
    })
  })

  describe('formIndexによる表示切り替え', () => {
    it('formIndex=1の場合、2つ目のフォームのスキルが表示される', () => {
      const multiFormCharacter: Character = {
        ...mockCharacter,
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/form1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {
              pre_extreme: {
                leader_skill: {
                  original_effect: 'フォーム1スキル',
                  conditions: [],
                  stat_boosts: [],
                },
              },
            },
          },
          {
            display_name: 'フォーム2',
            image_url: '/form2.png',
            stats: { hp: 12000, atk: 9000, def: 6000 },
            skills: {
              pre_extreme: {
                leader_skill: {
                  original_effect: 'フォーム2スキル',
                  conditions: [],
                  stat_boosts: [],
                },
              },
            },
          },
        ],
      }

      render(
        <CharacterDetailDialog
          character={multiFormCharacter}
          formIndex={1}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByText('フォーム2スキル')).toBeInTheDocument()
    })
  })

  describe('超極限タブのみの場合', () => {
    it('super_extremeのみの場合、超極限タブだけが表示される', () => {
      const superExtremeOnly: Character = {
        ...mockCharacter,
        forms: [
          {
            ...mockCharacter.forms![0],
            skills: {
              super_extreme: {
                leader_skill: {
                  original_effect: '超極限リーダースキル',
                  conditions: [],
                  stat_boosts: [],
                },
              },
            },
          },
        ],
      }

      render(
        <CharacterDetailDialog
          character={superExtremeOnly}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByRole('tab', { name: '超極限' })).toBeInTheDocument()
      expect(
        screen.queryByRole('tab', { name: '極限' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('tab', { name: '通常' })
      ).not.toBeInTheDocument()
    })
  })
})
