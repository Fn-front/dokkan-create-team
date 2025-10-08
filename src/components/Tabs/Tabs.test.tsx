import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tabs from './Tabs'

describe('Tabs', () => {
  const mockTabs = [
    { value: 'tab1', label: 'タブ1', content: <div>コンテンツ1</div> },
    { value: 'tab2', label: 'タブ2', content: <div>コンテンツ2</div> },
    { value: 'tab3', label: 'タブ3', content: <div>コンテンツ3</div> },
  ]

  it('正常にレンダリングされる', () => {
    render(<Tabs tabs={mockTabs} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('すべてのタブラベルが表示される', () => {
    render(<Tabs tabs={mockTabs} />)
    expect(screen.getByRole('tab', { name: 'タブ1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'タブ2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'タブ3' })).toBeInTheDocument()
  })

  it('デフォルトで最初のタブが選択される', () => {
    render(<Tabs tabs={mockTabs} />)
    expect(screen.getByText('コンテンツ1')).toBeVisible()
  })

  it('defaultValueで指定したタブが選択される', () => {
    render(<Tabs tabs={mockTabs} defaultValue="tab2" />)
    expect(screen.getByText('コンテンツ2')).toBeVisible()
  })

  it('タブをクリックすると対応するコンテンツが表示される', async () => {
    const user = userEvent.setup()
    render(<Tabs tabs={mockTabs} />)

    // 最初はタブ1が表示
    expect(screen.getByText('コンテンツ1')).toBeVisible()

    // タブ2をクリック
    await user.click(screen.getByRole('tab', { name: 'タブ2' }))
    expect(screen.getByText('コンテンツ2')).toBeVisible()

    // タブ3をクリック
    await user.click(screen.getByRole('tab', { name: 'タブ3' }))
    expect(screen.getByText('コンテンツ3')).toBeVisible()
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <Tabs tabs={mockTabs} className="custom-tabs" />
    )
    expect(container.querySelector('.custom-tabs')).toBeInTheDocument()
  })

  it('空のタブ配列でもエラーにならない', () => {
    const { container } = render(<Tabs tabs={[]} />)
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument()
  })

  it('displayNameが設定されている', () => {
    expect(Tabs.displayName).toBe('Tabs')
  })

  describe('複数タブの切り替え', () => {
    it('タブ1→タブ2→タブ3と順番に切り替えられる', async () => {
      const user = userEvent.setup()
      render(<Tabs tabs={mockTabs} />)

      // 最初はタブ1
      expect(screen.getByText('コンテンツ1')).toBeVisible()

      // タブ2に切り替え
      await user.click(screen.getByRole('tab', { name: 'タブ2' }))
      expect(screen.getByText('コンテンツ2')).toBeVisible()

      // タブ3に切り替え
      await user.click(screen.getByRole('tab', { name: 'タブ3' }))
      expect(screen.getByText('コンテンツ3')).toBeVisible()

      // タブ1に戻る
      await user.click(screen.getByRole('tab', { name: 'タブ1' }))
      expect(screen.getByText('コンテンツ1')).toBeVisible()
    })
  })

  describe('1つだけのタブ', () => {
    it('タブが1つだけの場合も正常に動作する', () => {
      const singleTab = [
        {
          value: 'only',
          label: '唯一のタブ',
          content: <div>唯一のコンテンツ</div>,
        },
      ]

      render(<Tabs tabs={singleTab} />)
      expect(
        screen.getByRole('tab', { name: '唯一のタブ' })
      ).toBeInTheDocument()
      expect(screen.getByText('唯一のコンテンツ')).toBeVisible()
    })
  })

  describe('コンテンツの種類', () => {
    it('コンテンツがJSX要素の場合も正常に動作する', () => {
      const tabsWithComplexContent = [
        {
          value: 'complex1',
          label: '複雑1',
          content: (
            <div>
              <h2>見出し</h2>
              <p>段落</p>
              <button>ボタン</button>
            </div>
          ),
        },
        {
          value: 'complex2',
          label: '複雑2',
          content: (
            <ul>
              <li>項目1</li>
              <li>項目2</li>
            </ul>
          ),
        },
      ]

      render(<Tabs tabs={tabsWithComplexContent} />)
      expect(screen.getByText('見出し')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ボタン' })).toBeInTheDocument()
    })
  })

  describe('tablistとtabpanel', () => {
    it('Radix UIのtablistロールが設定される', () => {
      render(<Tabs tabs={mockTabs} />)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('各タブにtabロールが設定される', () => {
      render(<Tabs tabs={mockTabs} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
    })
  })

  describe('アクセシビリティ', () => {
    it('選択されたタブにaria-selected=trueが設定される', () => {
      render(<Tabs tabs={mockTabs} defaultValue="tab2" />)
      const tab2 = screen.getByRole('tab', { name: 'タブ2' })
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })

    it('選択されていないタブにaria-selected=falseが設定される', () => {
      render(<Tabs tabs={mockTabs} defaultValue="tab2" />)
      const tab1 = screen.getByRole('tab', { name: 'タブ1' })
      expect(tab1).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('クラス名の適用', () => {
    it('カスタムクラス名がRootに適用される', () => {
      const { container } = render(
        <Tabs tabs={mockTabs} className="my-custom-tabs" />
      )
      const root = container.querySelector('.my-custom-tabs')
      expect(root).toBeInTheDocument()
    })
  })
})
