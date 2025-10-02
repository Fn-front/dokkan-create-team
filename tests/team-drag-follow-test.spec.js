const { test, expect } = require('@playwright/test')

test('チームスロットドラッグ追従テスト', async ({ page }) => {
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

  console.log('=== チームスロットドラッグ追従テスト開始 ===')

  // まずキャラクターをチームスロットに配置
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  if ((await characterCards.count()) > 0) {
    // 1. キャラクターをリーダースロットに配置
    const characterBox = await firstCharacter.boundingBox()
    const leaderBox = await leaderSlot.boundingBox()

    console.log('キャラクター位置:', characterBox)
    console.log('リーダースロット位置:', leaderBox)

    if (characterBox && leaderBox) {
      await page.mouse.move(
        characterBox.x + characterBox.width / 2,
        characterBox.y + characterBox.height / 2
      )
      await page.mouse.down()
      await page.mouse.move(
        leaderBox.x + leaderBox.width / 2,
        leaderBox.y + leaderBox.height / 2,
        { steps: 5 }
      )
      await page.mouse.up()
      await page.waitForTimeout(500)

      console.log('キャラクターをリーダースロットに配置完了')

      // 実行前のスクリーンショット
      await page.screenshot({ path: 'tests/team-drag-before.png' })

      // 2. チームスロットからのドラッグテスト
      const leaderSlotImage = leaderSlot.locator('img')
      if ((await leaderSlotImage.count()) > 0) {
        console.log('チームスロットからのドラッグテストを開始')

        // リーダースロットの位置を取得
        const slotBox = await leaderSlot.boundingBox()

        if (slotBox) {
          // スロットの右下角をクリック（オフセットテスト）
          const clickX = slotBox.x + slotBox.width - 10
          const clickY = slotBox.y + slotBox.height - 10

          console.log(`クリック位置: (${clickX}, ${clickY})`)
          console.log(`スロット左上角: (${slotBox.x}, ${slotBox.y})`)

          // マウスをスロットの右下角に移動
          await page.mouse.move(clickX, clickY)

          // マウスダウン
          await page.mouse.down()
          await page.waitForTimeout(100)

          // 少し移動してドラッグ開始
          await page.mouse.move(clickX + 20, clickY + 20, { steps: 3 })
          await page.waitForTimeout(200)

          // ドラッグ画像が作成されたかチェック
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

          // 複数の位置に移動してみる
          const positions = [
            { x: clickX + 50, y: clickY + 30 },
            { x: clickX + 100, y: clickY + 60 },
            { x: clickX + 150, y: clickY + 90 },
            { x: clickX + 200, y: clickY + 120 },
          ]

          for (let i = 0; i < positions.length; i++) {
            const pos = positions[i]
            await page.mouse.move(pos.x, pos.y, { steps: 5 })
            await page.waitForTimeout(100)

            // ドラッグ画像の位置を確認
            const dragImagePosition = await page.evaluate(() => {
              const dragImage = Array.from(
                document.querySelectorAll('img')
              ).find(
                (img) =>
                  img.style.position === 'fixed' && img.style.zIndex === '9999'
              )
              if (dragImage) {
                return {
                  left: parseFloat(dragImage.style.left),
                  top: parseFloat(dragImage.style.top),
                  width: parseFloat(dragImage.style.width),
                  height: parseFloat(dragImage.style.height),
                  visible: dragImage.style.display !== 'none',
                }
              }
              return null
            })

            console.log(
              `位置${i + 1}: マウス(${pos.x}, ${pos.y}) ドラッグ画像:`,
              dragImagePosition
            )

            // 掴んだ場所の相対位置を確認
            if (dragImagePosition) {
              const expectedOffsetX = clickX - slotBox.x
              const expectedOffsetY = clickY - slotBox.y
              const grabbedSpotX = dragImagePosition.left + expectedOffsetX
              const grabbedSpotY = dragImagePosition.top + expectedOffsetY

              const diffX = Math.abs(grabbedSpotX - pos.x)
              const diffY = Math.abs(grabbedSpotY - pos.y)

              console.log(
                `期待オフセット: (${expectedOffsetX}, ${expectedOffsetY})`
              )
              console.log(`掴んだ場所位置: (${grabbedSpotX}, ${grabbedSpotY})`)
              console.log(
                `位置の差: (${diffX.toFixed(1)}, ${diffY.toFixed(1)})`
              )
            }

            // スクリーンショット（ドラッグ中）
            await page.screenshot({
              path: `tests/team-drag-moving-${i + 1}.png`,
            })
          }

          // マウスアップ（ドロップ）
          await page.mouse.up()
          await page.waitForTimeout(200)

          // ドラッグ画像が削除されたかチェック
          const finalDragImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'))
            return images.filter(
              (img) =>
                img.style.position === 'fixed' && img.style.zIndex === '9999'
            ).length
          })

          console.log('ドロップ後のドラッグ画像数:', finalDragImages)

          // 実行後のスクリーンショット
          await page.screenshot({ path: 'tests/team-drag-after.png' })

          // 結果検証
          console.log('=== チームスロットドラッグ追従テスト結果 ===')
          console.log('ドラッグ開始時の画像作成:', dragImages > 0)
          console.log('ドロップ後の画像削除:', finalDragImages === 0)
          console.log('収集したブラウザログ:', logs)

          // アサーション
          expect(dragImages).toBeGreaterThan(0) // ドラッグ画像が作成された
          expect(finalDragImages).toBe(0) // ドロップ後に画像が削除された
        }
      } else {
        console.log('リーダースロットにキャラクターが配置されていません')
      }
    }
  }

  console.log('=== チームスロットドラッグ追従テスト完了 ===')
})
