import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterList from './index'
import type { Character } from '@/functions/types/team'

// Next/Imageをモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// sampleCharactersをモック
jest.mock('@/functions/data/characters', () => ({
  sampleCharacters: [
    {
      id: 1,
      name: 'テストキャラ1',
      forms: [
        {
          display_name: 'テストキャラ1',
          image_url: '/test1.png',
          stats: { hp: 10000, atk: 8000, def: 5000 },
          skills: {
            pre_extreme: {
              leader_skill: {
                original_effect: 'スキル1',
                conditions: [],
                stat_boosts: [],
              },
              passive_skill: { stat_boosts: [] },
            },
          },
        },
      ],
    },
    {
      id: 2,
      name: 'テストキャラ2',
      forms: [
        {
          display_name: 'テストキャラ2',
          image_url: '/test2.png',
          stats: { hp: 12000, atk: 9000, def: 6000 },
          skills: {
            pre_extreme: {
              leader_skill: {
                original_effect: 'スキル2',
                conditions: [],
                stat_boosts: [],
              },
              passive_skill: { stat_boosts: [] },
            },
          },
        },
      ],
    },
  ],
}))

// hooksをモック
jest.mock('./hooks/useCharacterDragDrop', () => ({
  useCharacterDragDrop: () => ({
    handleMouseDown: jest.fn(),
  }),
}))

jest.mock('@/functions/hooks/useDialog', () => ({
  useDialog: () => ({
    open: false,
    setOpen: jest.fn(),
  }),
}))

describe('CharacterList', () => {
  const mockProps = {
    onCharacterDragStart: jest.fn(),
    canPlaceCharacter: jest.fn(() => true),
    toggleReversibleForm: jest.fn(),
    getReversibleFormIndex: jest.fn(() => 0),
    toggleForm: jest.fn(),
    getFormIndex: jest.fn(() => 0),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にレンダリングされる', () => {
    render(<CharacterList {...mockProps} />)
    expect(screen.getByText('キャラクター一覧')).toBeInTheDocument()
  })

  it('sampleCharactersが表示される', () => {
    render(<CharacterList {...mockProps} />)
    expect(screen.getByAltText('テストキャラ1')).toBeInTheDocument()
    expect(screen.getByAltText('テストキャラ2')).toBeInTheDocument()
  })

  it('配置可能なキャラクターはdisabledクラスがない', () => {
    render(<CharacterList {...mockProps} />)
    const cards = screen.getAllByTestId('character-card')
    cards.forEach((card) => {
      expect(card).not.toHaveClass('disabled')
    })
  })

  it('配置不可のキャラクターはdisabledクラスが付く', () => {
    const propsWithNoPlacement = {
      ...mockProps,
      canPlaceCharacter: jest.fn(() => false),
    }
    render(<CharacterList {...propsWithNoPlacement} />)
    const cards = screen.getAllByTestId('character-card')
    cards.forEach((card) => {
      expect(card).toHaveClass('disabled')
    })
  })

  it('詳細ボタンをクリックするとダイアログが開く', async () => {
    const mockSetOpen = jest.fn()
    jest.spyOn(require('@/functions/hooks/useDialog'), 'useDialog').mockReturnValue({
      open: false,
      setOpen: mockSetOpen,
    })

    const user = userEvent.setup()
    render(<CharacterList {...mockProps} />)

    const detailButtons = screen.getAllByLabelText('詳細を表示')
    await user.click(detailButtons[0])

    expect(mockSetOpen).toHaveBeenCalledWith(true)
  })

  it('reversible_formsがある場合、切り替えボタンが表示される', () => {
    // reversibleキャラクターを追加
    const mockModule = require('@/functions/data/characters')
    mockModule.sampleCharacters = [
      {
        id: 3,
        name: 'リバーシブルキャラ',
        reversible_forms: [
          { image_url: '/rev1.png', skills: {} },
          { image_url: '/rev2.png', skills: {} },
        ],
      },
    ]

    render(<CharacterList {...mockProps} />)
    expect(screen.queryByLabelText('フォーム切り替え')).toBeInTheDocument()
  })

  it('複数formsがある場合、変身ボタンが表示される', () => {
    // 変身キャラクターを追加
    const mockModule = require('@/functions/data/characters')
    mockModule.sampleCharacters = [
      {
        id: 4,
        name: '変身キャラ',
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
      },
    ]

    render(<CharacterList {...mockProps} />)
    expect(screen.queryByLabelText('変身')).toBeInTheDocument()
  })

  it('displayNameが設定されている', () => {
    expect(CharacterList.displayName).toBe('CharacterList')
  })
})
