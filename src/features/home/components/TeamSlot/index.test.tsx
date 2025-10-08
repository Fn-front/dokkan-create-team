import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamSlotComponent from './index'
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
jest.mock('./hooks/useTeamSlotStats', () => ({
  useTeamSlotStats: () => ({
    stats55: { atk: 10000, def: 8000 },
    stats100: { atk: 15000, def: 12000 },
    superAttackCount: 0,
    statsAfterAction: { atk: 20000, def: 15000 },
  }),
}))

describe('TeamSlotComponent', () => {
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

  const mockSlot: TeamSlot = {
    character: mockCharacter,
    position: 1,
  }

  const mockEmptySlot: TeamSlot = {
    character: null,
    position: 1,
  }

  const mockTeamSlots: TeamSlot[] = [
    { character: mockCharacter, position: 0 }, // Leader
    { character: null, position: 1 },
    { character: null, position: 2 },
    { character: null, position: 3 },
    { character: null, position: 4 },
    { character: null, position: 5 },
    { character: mockCharacter, position: 6 }, // Friend
  ]

  const mockProps = {
    draggedFromPosition: null,
    isDragging: false,
    teamSlots: mockTeamSlots,
    onCharacterDrop: jest.fn(),
    onSlotClick: jest.fn(),
    onMouseDown: jest.fn(),
    toggleReversibleForm: jest.fn(),
    getReversibleFormIndex: jest.fn(() => 0),
    toggleForm: jest.fn(),
    getFormIndex: jest.fn(() => 0),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にレンダリングされる', () => {
    render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)
    expect(screen.getByTestId('team-slot')).toBeInTheDocument()
  })

  it('キャラクターが配置されている場合、画像が表示される', () => {
    render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)
    const image = screen.getByAltText('テストキャラクター')
    expect(image).toBeInTheDocument()
  })

  it('キャラクターが配置されていない場合、画像が表示されない', () => {
    render(
      <TeamSlotComponent slot={mockEmptySlot} index={1} {...mockProps} />
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('リーダースロット（index=0）の場合、LEADERバッジが表示される', () => {
    const leaderSlot: TeamSlot = { character: mockCharacter, position: 0 }
    render(<TeamSlotComponent slot={leaderSlot} index={0} {...mockProps} />)
    expect(screen.getByText('LEADER')).toBeInTheDocument()
  })

  it('フレンドスロット（index=6）の場合、FRIENDバッジが表示される', () => {
    const friendSlot: TeamSlot = { character: mockCharacter, position: 6 }
    render(<TeamSlotComponent slot={friendSlot} index={6} {...mockProps} />)
    expect(screen.getByText('FRIEND')).toBeInTheDocument()
  })

  it('スロットをクリックするとonSlotClickが呼ばれる', async () => {
    const user = userEvent.setup()
    render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)

    await user.click(screen.getByTestId('team-slot'))
    expect(mockProps.onSlotClick).toHaveBeenCalledWith(1)
  })

  it('キャラクターが配置されている場合、ステータスが表示される', () => {
    render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)

    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('10,000 / 8,000')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('15,000 / 12,000')).toBeInTheDocument()
    expect(screen.getByText('行動後（必殺1回）')).toBeInTheDocument()
    expect(screen.getByText('20,000 / 15,000')).toBeInTheDocument()
  })

  it('reversible_formsがある場合、切り替えボタンが表示される', () => {
    const reversibleCharacter: Character = {
      ...mockCharacter,
      reversible_forms: [
        { image_url: '/form1.png', skills: {} },
        { image_url: '/form2.png', skills: {} },
      ],
    }
    const reversibleSlot: TeamSlot = {
      character: reversibleCharacter,
      position: 1,
    }

    render(
      <TeamSlotComponent slot={reversibleSlot} index={1} {...mockProps} />
    )
    expect(screen.getByLabelText('フォーム切り替え')).toBeInTheDocument()
  })

  it('切り替えボタンをクリックするとtoggleReversibleFormが呼ばれる', async () => {
    const user = userEvent.setup()
    const reversibleCharacter: Character = {
      ...mockCharacter,
      reversible_forms: [
        { image_url: '/form1.png', skills: {} },
        { image_url: '/form2.png', skills: {} },
      ],
    }
    const reversibleSlot: TeamSlot = {
      character: reversibleCharacter,
      position: 1,
    }

    render(
      <TeamSlotComponent slot={reversibleSlot} index={1} {...mockProps} />
    )

    const switchButton = screen.getByLabelText('フォーム切り替え')
    await user.click(switchButton)
    expect(mockProps.toggleReversibleForm).toHaveBeenCalledWith(1)
  })

  it('複数formsがある場合、変身ボタンが表示される', () => {
    const transformCharacter: Character = {
      ...mockCharacter,
      forms: [
        {
          display_name: 'フォーム1',
          image_url: '/form1.png',
          stats: { hp: 10000, atk: 8000, def: 5000 },
          skills: {},
        },
        {
          display_name: 'フォーム2',
          image_url: '/form2.png',
          stats: { hp: 12000, atk: 9000, def: 6000 },
          skills: {},
        },
      ],
    }
    const transformSlot: TeamSlot = {
      character: transformCharacter,
      position: 1,
    }

    render(<TeamSlotComponent slot={transformSlot} index={1} {...mockProps} />)
    expect(screen.getByLabelText('変身')).toBeInTheDocument()
  })

  it('変身ボタンをクリックするとtoggleFormが呼ばれる', async () => {
    const user = userEvent.setup()
    const transformCharacter: Character = {
      ...mockCharacter,
      forms: [
        {
          display_name: 'フォーム1',
          image_url: '/form1.png',
          stats: { hp: 10000, atk: 8000, def: 5000 },
          skills: {},
        },
        {
          display_name: 'フォーム2',
          image_url: '/form2.png',
          stats: { hp: 12000, atk: 9000, def: 6000 },
          skills: {},
        },
      ],
    }
    const transformSlot: TeamSlot = {
      character: transformCharacter,
      position: 1,
    }

    render(<TeamSlotComponent slot={transformSlot} index={1} {...mockProps} />)

    const transformButton = screen.getByLabelText('変身')
    await user.click(transformButton)
    expect(mockProps.toggleForm).toHaveBeenCalledWith(1, 1)
  })

  it('ドラッグ中の場合、draggingクラスが適用される', () => {
    render(
      <TeamSlotComponent
        slot={mockSlot}
        index={1}
        {...mockProps}
        draggedFromPosition={1}
        isDragging={true}
      />
    )
    const slot = screen.getByTestId('team-slot')
    expect(slot).toHaveClass('dragging')
  })

  it('data-position属性が設定される', () => {
    render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)
    const slot = screen.getByTestId('team-slot')
    expect(slot).toHaveAttribute('data-position', '1')
  })

  it('displayNameが設定されている', () => {
    expect(TeamSlotComponent.displayName).toBe('TeamSlotComponent')
  })

  describe('カーソルスタイル', () => {
    it('キャラクターが配置されている場合、grabカーソルが設定される', () => {
      render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)
      const slot = screen.getByTestId('team-slot')
      expect(slot).toHaveStyle({ cursor: 'grab' })
    })

    it('キャラクターが配置されていない場合、defaultカーソルが設定される', () => {
      render(
        <TeamSlotComponent slot={mockEmptySlot} index={1} {...mockProps} />
      )
      const slot = screen.getByTestId('team-slot')
      expect(slot).toHaveStyle({ cursor: 'default' })
    })

    it('ドラッグ中の場合、grabbingカーソルが設定される', () => {
      render(
        <TeamSlotComponent
          slot={mockSlot}
          index={1}
          {...mockProps}
          draggedFromPosition={1}
          isDragging={true}
        />
      )
      const slot = screen.getByTestId('team-slot')
      expect(slot).toHaveStyle({ cursor: 'grabbing' })
    })
  })

  describe('occupiedクラス', () => {
    it('キャラクターが配置されている場合、occupiedクラスが適用される', () => {
      render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)
      const slot = screen.getByTestId('team-slot')
      expect(slot).toHaveClass('occupied')
    })

    it('キャラクターが配置されていない場合、occupiedクラスが適用されない', () => {
      render(
        <TeamSlotComponent slot={mockEmptySlot} index={1} {...mockProps} />
      )
      const slot = screen.getByTestId('team-slot')
      expect(slot).not.toHaveClass('occupied')
    })
  })

  describe('KiMeter表示', () => {
    it('リーダースロットの場合、KiMeterが表示される', () => {
      const leaderSlot: TeamSlot = { character: mockCharacter, position: 0 }
      const { container } = render(
        <TeamSlotComponent slot={leaderSlot} index={0} {...mockProps} />
      )
      // KiMeterはcircleクラスを持つ
      const kiMeter = container.querySelector('[class*="circle"]')
      expect(kiMeter).toBeInTheDocument()
    })

    it('フレンドスロットの場合、KiMeterが表示される', () => {
      const friendSlot: TeamSlot = { character: mockCharacter, position: 6 }
      const { container } = render(
        <TeamSlotComponent slot={friendSlot} index={6} {...mockProps} />
      )
      const kiMeter = container.querySelector('[class*="circle"]')
      expect(kiMeter).toBeInTheDocument()
    })

    it('通常スロットの場合もKiMeterが表示される', () => {
      const { container } = render(
        <TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />
      )
      const kiMeter = container.querySelector('[class*="circle"]')
      expect(kiMeter).toBeInTheDocument()
    })
  })

  describe('onMouseDownイベント', () => {
    it('スロットをマウスダウンするとonMouseDownが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />)

      await user.pointer({
        keys: '[MouseLeft>]',
        target: screen.getByTestId('team-slot'),
      })
      expect(mockProps.onMouseDown).toHaveBeenCalledWith(
        expect.any(Object),
        mockSlot
      )
    })
  })

  describe('切り替えボタンの動作', () => {
    it('切り替えボタンクリック時、スロットのonClickが呼ばれない', async () => {
      const user = userEvent.setup()
      const reversibleCharacter: Character = {
        ...mockCharacter,
        reversible_forms: [
          { image_url: '/form1.png', skills: {} },
          { image_url: '/form2.png', skills: {} },
        ],
      }
      const reversibleSlot: TeamSlot = {
        character: reversibleCharacter,
        position: 1,
      }

      render(
        <TeamSlotComponent slot={reversibleSlot} index={1} {...mockProps} />
      )

      const switchButton = screen.getByLabelText('フォーム切り替え')
      await user.click(switchButton)

      // switchButtonClickedRefがtrueになるため、onSlotClickは呼ばれない
      expect(mockProps.onSlotClick).not.toHaveBeenCalled()
    })

    it('変身ボタンクリック時、スロットのonClickが呼ばれない', async () => {
      const user = userEvent.setup()
      const transformCharacter: Character = {
        ...mockCharacter,
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/form1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
          {
            display_name: 'フォーム2',
            image_url: '/form2.png',
            stats: { hp: 12000, atk: 9000, def: 6000 },
            skills: {},
          },
        ],
      }
      const transformSlot: TeamSlot = {
        character: transformCharacter,
        position: 1,
      }

      render(<TeamSlotComponent slot={transformSlot} index={1} {...mockProps} />)

      const transformButton = screen.getByLabelText('変身')
      await user.click(transformButton)

      expect(mockProps.onSlotClick).not.toHaveBeenCalled()
    })

    it('切り替えボタンにdata-switch-button属性が設定される', () => {
      const reversibleCharacter: Character = {
        ...mockCharacter,
        reversible_forms: [
          { image_url: '/form1.png', skills: {} },
          { image_url: '/form2.png', skills: {} },
        ],
      }
      const reversibleSlot: TeamSlot = {
        character: reversibleCharacter,
        position: 1,
      }

      const { container } = render(
        <TeamSlotComponent slot={reversibleSlot} index={1} {...mockProps} />
      )

      const switchButton = container.querySelector('[data-switch-button="true"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('変身ボタンにdata-transform-button属性が設定される', () => {
      const transformCharacter: Character = {
        ...mockCharacter,
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/form1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
          {
            display_name: 'フォーム2',
            image_url: '/form2.png',
            stats: { hp: 12000, atk: 9000, def: 6000 },
            skills: {},
          },
        ],
      }
      const transformSlot: TeamSlot = {
        character: transformCharacter,
        position: 1,
      }

      const { container } = render(
        <TeamSlotComponent slot={transformSlot} index={1} {...mockProps} />
      )

      const transformButton = container.querySelector(
        '[data-transform-button="true"]'
      )
      expect(transformButton).toBeInTheDocument()
    })
  })

  describe('character-dropカスタムイベント', () => {
    it('character-dropイベントが発火するとonCharacterDropが呼ばれる', () => {
      const { container } = render(
        <TeamSlotComponent slot={mockSlot} index={1} {...mockProps} />
      )

      const slotElement = screen.getByTestId('team-slot')
      const customEvent = new CustomEvent('character-drop', {
        detail: {
          character: mockCharacter,
          position: 1,
        },
      })

      slotElement.dispatchEvent(customEvent)
      expect(mockProps.onCharacterDrop).toHaveBeenCalledWith(mockCharacter, 1)
    })
  })

  describe('フォームインデックス', () => {
    it('reversible_formsの場合、getReversibleFormIndexが呼ばれる', () => {
      const reversibleCharacter: Character = {
        ...mockCharacter,
        reversible_forms: [
          { image_url: '/form1.png', skills: {} },
          { image_url: '/form2.png', skills: {} },
        ],
      }
      const reversibleSlot: TeamSlot = {
        character: reversibleCharacter,
        position: 1,
      }

      render(
        <TeamSlotComponent slot={reversibleSlot} index={1} {...mockProps} />
      )

      expect(mockProps.getReversibleFormIndex).toHaveBeenCalledWith(1)
    })

    it('複数formsの場合、getFormIndexが呼ばれる', () => {
      const transformCharacter: Character = {
        ...mockCharacter,
        forms: [
          {
            display_name: 'フォーム1',
            image_url: '/form1.png',
            stats: { hp: 10000, atk: 8000, def: 5000 },
            skills: {},
          },
          {
            display_name: 'フォーム2',
            image_url: '/form2.png',
            stats: { hp: 12000, atk: 9000, def: 6000 },
            skills: {},
          },
        ],
      }
      const transformSlot: TeamSlot = {
        character: transformCharacter,
        position: 1,
      }

      render(<TeamSlotComponent slot={transformSlot} index={1} {...mockProps} />)

      expect(mockProps.getFormIndex).toHaveBeenCalledWith(1)
    })
  })

  describe('ステータスなしの場合', () => {
    it('キャラクターが配置されていない場合、ステータスが表示されない', () => {
      render(
        <TeamSlotComponent slot={mockEmptySlot} index={1} {...mockProps} />
      )

      expect(screen.queryByText('55%')).not.toBeInTheDocument()
      expect(screen.queryByText('100%')).not.toBeInTheDocument()
    })
  })
})
