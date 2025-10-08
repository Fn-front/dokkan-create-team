const { test } = require('@playwright/test')

test('シンプルなドラッグ動作確認', async ({ page }) => {
  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('=== シンプルドラッグテスト開始 ===')

  // キャラクターカードの取得
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()

  if ((await characterCards.count()) > 0) {
    const characterBox = await firstCharacter.boundingBox()

    if (characterBox) {
      console.log('キャラクター要素位置:', characterBox)

      // 1. 中央をクリック
      const centerX = characterBox.x + characterBox.width / 2
      const centerY = characterBox.y + characterBox.height / 2

      console.log('=== 中央クリックテスト ===')
      console.log(`中央位置: (${centerX}, ${centerY})`)

      await page.mouse.move(centerX, centerY)
      await page.mouse.down()
      await page.mouse.move(centerX + 50, centerY + 30, { steps: 5 })
      await page.waitForTimeout(100)

      const centerDragImagePos = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        return dragImage
          ? {
              left: parseFloat(dragImage.style.left),
              top: parseFloat(dragImage.style.top),
            }
          : null
      })

      console.log('中央クリック時の画像位置:', centerDragImagePos)
      console.log('マウス位置:', { x: centerX + 50, y: centerY + 30 })

      await page.mouse.up()
      await page.waitForTimeout(200)

      // 2. 左上をクリック
      const topLeftX = characterBox.x + 10
      const topLeftY = characterBox.y + 10

      console.log('=== 左上クリックテスト ===')
      console.log(`左上位置: (${topLeftX}, ${topLeftY})`)

      await page.mouse.move(topLeftX, topLeftY)
      await page.mouse.down()
      await page.mouse.move(topLeftX + 50, topLeftY + 30, { steps: 5 })
      await page.waitForTimeout(100)

      const topLeftDragImagePos = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        return dragImage
          ? {
              left: parseFloat(dragImage.style.left),
              top: parseFloat(dragImage.style.top),
            }
          : null
      })

      console.log('左上クリック時の画像位置:', topLeftDragImagePos)
      console.log('マウス位置:', { x: topLeftX + 50, y: topLeftY + 30 })

      await page.mouse.up()
      await page.waitForTimeout(200)

      // 3. 右下をクリック
      const bottomRightX = characterBox.x + characterBox.width - 10
      const bottomRightY = characterBox.y + characterBox.height - 10

      console.log('=== 右下クリックテスト ===')
      console.log(`右下位置: (${bottomRightX}, ${bottomRightY})`)

      await page.mouse.move(bottomRightX, bottomRightY)
      await page.mouse.down()
      await page.mouse.move(bottomRightX + 50, bottomRightY + 30, { steps: 5 })
      await page.waitForTimeout(100)

      const bottomRightDragImagePos = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        return dragImage
          ? {
              left: parseFloat(dragImage.style.left),
              top: parseFloat(dragImage.style.top),
            }
          : null
      })

      console.log('右下クリック時の画像位置:', bottomRightDragImagePos)
      console.log('マウス位置:', { x: bottomRightX + 50, y: bottomRightY + 30 })

      await page.mouse.up()
      await page.waitForTimeout(200)

      // 4. 位置の違いを比較
      console.log('=== 位置比較結果 ===')

      if (
        centerDragImagePos &&
        topLeftDragImagePos &&
        bottomRightDragImagePos
      ) {
        console.log('中央クリック画像位置:', centerDragImagePos)
        console.log('左上クリック画像位置:', topLeftDragImagePos)
        console.log('右下クリック画像位置:', bottomRightDragImagePos)

        // 相対位置が正しく維持されているかチェック
        const centerToTopLeft = {
          x: centerDragImagePos.left - topLeftDragImagePos.left,
          y: centerDragImagePos.top - topLeftDragImagePos.top,
        }

        const bottomRightToCenter = {
          x: bottomRightDragImagePos.left - centerDragImagePos.left,
          y: bottomRightDragImagePos.top - centerDragImagePos.top,
        }

        console.log('中央と左上の差:', centerToTopLeft)
        console.log('右下と中央の差:', bottomRightToCenter)

        // 期待される差（スケール考慮: 100px → 80px）
        const expectedCenterToTopLeft = {
          x: (40 - 10) * 0.8, // (50-10) * 0.8 = 32
          y: (40 - 10) * 0.8, // (50-10) * 0.8 = 32
        }

        console.log('期待される中央と左上の差:', expectedCenterToTopLeft)

        const diffCorrect =
          Math.abs(centerToTopLeft.x - expectedCenterToTopLeft.x) < 2 &&
          Math.abs(centerToTopLeft.y - expectedCenterToTopLeft.y) < 2

        console.log('相対位置が正しく維持されているか:', diffCorrect)
      }
    }
  }

  console.log('=== シンプルドラッグテスト完了 ===')
})
