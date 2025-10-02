const { test, expect } = require('@playwright/test')

test('手動ドラッグ&ドロップ機能のテスト', async ({ page }) => {
  // コンソールログを監視
  const logs = []
  page.on('console', (msg) => {
    logs.push(msg.text())
    console.log('ブラウザログ:', msg.text())
  })

  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  // キャラクターカードとチームスロットを取得
  const firstCharacter = page.locator('[data-testid="character-card"]').first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  console.log('要素の確認...')
  await expect(firstCharacter).toBeVisible()
  await expect(leaderSlot).toBeVisible()

  // 実行前のスクリーンショット
  await page.screenshot({ path: 'tests/manual-before.png' })

  // JavaScriptで直接ドラッグ&ドロップイベントを発火
  await page.evaluate(() => {
    const characterCard = document.querySelector(
      '[data-testid="character-card"]'
    )
    const leaderSlot = document.querySelector(
      '[data-testid="team-slot"][data-position="0"]'
    )

    if (characterCard && leaderSlot) {
      console.log('JavaScript: 要素が見つかりました')

      // DragStartイベント
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      // キャラクターデータをセット
      const characterData = {
        id: '1',
        name: '不滅の最凶戦士伝説の超サイヤ人ブロリー',
        imagePath: '',
        rarity: 5,
        type: 'PHY',
        cost: 58,
      }

      dragStartEvent.dataTransfer.setData(
        'application/json',
        JSON.stringify(characterData)
      )
      characterCard.dispatchEvent(dragStartEvent)
      console.log('JavaScript: dragstart イベント発火')

      // DragOverイベント
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer,
      })
      leaderSlot.dispatchEvent(dragOverEvent)
      console.log('JavaScript: dragover イベント発火')

      // Dropイベント
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer,
      })
      leaderSlot.dispatchEvent(dropEvent)
      console.log('JavaScript: drop イベント発火')
    } else {
      console.log('JavaScript: 要素が見つかりません')
    }
  })

  // 少し待つ
  await page.waitForTimeout(2000)

  // 実行後のスクリーンショット
  await page.screenshot({ path: 'tests/manual-after.png' })

  // 結果確認
  const leaderSlotImage = leaderSlot.locator('img')
  const hasImage = (await leaderSlotImage.count()) > 0

  console.log('リーダースロットに画像が配置されたか:', hasImage)
  console.log('収集したブラウザログ:', logs)

  if (hasImage) {
    console.log('✅ 手動ドラッグ&ドロップ成功！')
  } else {
    console.log('❌ 手動ドラッグ&ドロップ失敗')
  }

  // テスト結果をアサート
  expect(hasImage).toBe(true)
})
