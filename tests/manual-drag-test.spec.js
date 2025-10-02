const { test, expect } = require('@playwright/test')

test('手動ドラッグ&ドロップテスト', async ({ page }) => {
  // コンソールログを監視
  const logs = []
  page.on('console', (msg) => {
    logs.push(msg.text())
    console.log('ブラウザログ:', msg.text())
  })

  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3001')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  // タイトルが表示されているか確認
  await expect(page.getByText('ドッカンバトル チーム作成ツール')).toBeVisible()

  // キャラクターカードとチームスロットの取得
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  console.log('キャラクターカード数:', await characterCards.count())
  console.log(
    'チームスロット数:',
    await page.locator('[data-testid="team-slot"]').count()
  )

  // 実行前のスクリーンショット
  await page.screenshot({ path: 'tests/manual-before.png' })

  if ((await characterCards.count()) > 0) {
    console.log('手動ドラッグ&ドロップを開始します...')

    // 1. キャラクターカードの位置とサイズを取得
    const characterBox = await firstCharacter.boundingBox()
    const leaderBox = await leaderSlot.boundingBox()

    console.log('キャラクター位置:', characterBox)
    console.log('リーダースロット位置:', leaderBox)

    if (characterBox && leaderBox) {
      // 2. マウスをキャラクターカードの中央に移動
      await page.mouse.move(
        characterBox.x + characterBox.width / 2,
        characterBox.y + characterBox.height / 2
      )

      // 3. マウスダウン（ドラッグ開始）
      await page.mouse.down()

      // 4. 少し待つ
      await page.waitForTimeout(500)

      // 5. リーダースロットの中央にドラッグ
      await page.mouse.move(
        leaderBox.x + leaderBox.width / 2,
        leaderBox.y + leaderBox.height / 2,
        { steps: 10 }
      )

      // 6. 少し待つ
      await page.waitForTimeout(500)

      // 7. マウスアップ（ドロップ）
      await page.mouse.up()

      // 8. 少し待つ
      await page.waitForTimeout(1000)

      // ドロップ後の状態確認
      await page.screenshot({ path: 'tests/manual-after.png' })

      // リーダースロットに画像が配置されたかチェック
      const leaderSlotImage = leaderSlot.locator('img')
      const hasImage = (await leaderSlotImage.count()) > 0

      console.log('リーダースロットに画像が配置されたか:', hasImage)
      console.log('収集したブラウザログ:', logs)

      return hasImage
    }
  }

  return false
})
