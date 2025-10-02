const { test, expect } = require('@playwright/test')

test('キャラクター一覧ドラッグ追従テスト', async ({ page }) => {
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

  // キャラクターカードの取得
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()

  console.log('キャラクターカード数:', await characterCards.count())

  if ((await characterCards.count()) > 0) {
    console.log('ドラッグ追従テストを開始します...')

    // 1. キャラクターカードの位置とサイズを取得
    const characterBox = await firstCharacter.boundingBox()
    console.log('キャラクター位置:', characterBox)

    if (characterBox) {
      // 実行前のスクリーンショット
      await page.screenshot({ path: 'tests/drag-follow-before.png' })

      // 2. マウスをキャラクターカードの中央に移動
      const startX = characterBox.x + characterBox.width / 2
      const startY = characterBox.y + characterBox.height / 2

      await page.mouse.move(startX, startY)

      // 3. マウスダウン（ドラッグ開始）
      await page.mouse.down()
      await page.waitForTimeout(100)

      // 4. 少し移動してドラッグ開始を促す
      await page.mouse.move(startX + 10, startY + 10, { steps: 3 })
      await page.waitForTimeout(200)

      // 5. ドラッグ画像が作成されたかチェック
      const dragImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'))
        return images.filter(
          (img) =>
            img.style.position === 'fixed' &&
            img.style.zIndex === '9999' &&
            img.style.pointerEvents === 'none'
        ).length
      })

      console.log('ドラッグ画像数:', dragImages)

      // 6. 複数の位置に移動してみる
      const positions = [
        { x: startX + 50, y: startY + 30 },
        { x: startX + 100, y: startY + 60 },
        { x: startX + 150, y: startY + 90 },
        { x: startX + 200, y: startY + 120 },
      ]

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]
        await page.mouse.move(pos.x, pos.y, { steps: 5 })
        await page.waitForTimeout(100)

        // ドラッグ画像の位置を確認
        const dragImagePosition = await page.evaluate(() => {
          const dragImage = Array.from(document.querySelectorAll('img')).find(
            (img) =>
              img.style.position === 'fixed' && img.style.zIndex === '9999'
          )
          if (dragImage) {
            return {
              left: parseFloat(dragImage.style.left),
              top: parseFloat(dragImage.style.top),
              visible: dragImage.style.display !== 'none',
            }
          }
          return null
        })

        console.log(
          `位置${i + 1}: マウス(${pos.x}, ${pos.y}) ドラッグ画像:`,
          dragImagePosition
        )

        // スクリーンショット（ドラッグ中）
        await page.screenshot({ path: `tests/drag-follow-moving-${i + 1}.png` })
      }

      // 7. マウスアップ（ドロップ）
      await page.mouse.up()
      await page.waitForTimeout(200)

      // 8. ドラッグ画像が削除されたかチェック
      const finalDragImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'))
        return images.filter(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        ).length
      })

      console.log('ドロップ後のドラッグ画像数:', finalDragImages)

      // 実行後のスクリーンショット
      await page.screenshot({ path: 'tests/drag-follow-after.png' })

      // 9. 結果検証
      console.log('=== ドラッグ追従テスト結果 ===')
      console.log('ドラッグ開始時の画像作成:', dragImages > 0)
      console.log('ドロップ後の画像削除:', finalDragImages === 0)
      console.log('収集したブラウザログ:', logs)

      // アサーション
      expect(dragImages).toBeGreaterThan(0) // ドラッグ画像が作成された
      expect(finalDragImages).toBe(0) // ドロップ後に画像が削除された

      return true
    }
  }

  return false
})
