const { test, expect } = require('@playwright/test')

test('ドラッグ&ドロップ機能のテスト', async ({ page }) => {
  // コンソールログを監視
  const logs = []
  page.on('console', (msg) => {
    logs.push(msg.text())
    console.log('ブラウザログ:', msg.text())
  })

  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3002')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  // タイトルが表示されているか確認
  await expect(page.getByText('ドッカンバトル チーム作成ツール')).toBeVisible()

  // キャラクター一覧とチーム編成エリアが存在するか確認
  await expect(page.getByText('キャラクター一覧')).toBeVisible()
  await expect(page.getByText('リーダースキル')).toBeVisible()

  // キャラクターカードの存在確認
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()

  // チームスロットの存在確認
  const teamSlots = page.locator('[data-testid="team-slot"]')
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  console.log('キャラクターカード数:', await characterCards.count())
  console.log('チームスロット数:', await teamSlots.count())

  // 実行前のスクリーンショット
  await page.screenshot({ path: 'tests/before-drag-drop.png' })

  // ドラッグ&ドロップの実行
  if ((await characterCards.count()) > 0 && (await teamSlots.count()) > 0) {
    console.log('ドラッグ&ドロップを開始します...')

    // より詳細なドラッグ&ドロップ
    await firstCharacter.dragTo(leaderSlot)

    // 少し待つ
    await page.waitForTimeout(2000)

    // ドロップ後の状態確認
    await page.screenshot({ path: 'tests/after-drag-drop.png' })

    // リーダースロットに画像が配置されたかチェック
    const leaderSlotImage = leaderSlot.locator('img')
    const hasImage = (await leaderSlotImage.count()) > 0

    console.log('リーダースロットに画像が配置されたか:', hasImage)

    if (hasImage) {
      console.log('✅ ドラッグ&ドロップ成功！')
    } else {
      console.log('❌ ドラッグ&ドロップ失敗')
    }

    // コンソールログの確認
    console.log('収集したブラウザログ:', logs)

    return hasImage
  } else {
    console.log('キャラクターまたはスロットが見つかりません')
    await page.screenshot({ path: 'tests/error-state.png' })
    return false
  }
})
