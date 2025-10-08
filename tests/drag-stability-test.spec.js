const { test } = require('@playwright/test')

test('ドラッグ位置の安定性テスト', async ({ page }) => {
  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')

  console.log('=== ドラッグ安定性テスト開始 ===')

  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()

  if ((await characterCards.count()) > 0) {
    const characterBox = await firstCharacter.boundingBox()

    if (characterBox) {
      console.log('キャラクター要素位置:', characterBox)

      // 同じ位置（中央）を3回ドラッグしてみる
      const centerX = characterBox.x + characterBox.width / 2
      const centerY = characterBox.y + characterBox.height / 2

      console.log(`テスト位置（中央）: (${centerX}, ${centerY})`)

      const results = []

      for (let i = 0; i < 3; i++) {
        console.log(`=== 試行 ${i + 1} ===`)

        // マウスを中央に移動
        await page.mouse.move(centerX, centerY)
        await page.waitForTimeout(100)

        // マウスダウン
        await page.mouse.down()
        await page.waitForTimeout(50)

        // 少し移動してドラッグ開始
        await page.mouse.move(centerX + 20, centerY + 20, { steps: 3 })
        await page.waitForTimeout(100)

        // ドラッグ画像の位置を取得
        const dragImagePos = await page.evaluate(() => {
          const dragImage = Array.from(document.querySelectorAll('img')).find(
            (img) =>
              img.style.position === 'fixed' && img.style.zIndex === '9999'
          )
          return dragImage
            ? {
                left: parseFloat(dragImage.style.left),
                top: parseFloat(dragImage.style.top),
                width: parseFloat(dragImage.style.width),
                height: parseFloat(dragImage.style.height),
              }
            : null
        })

        if (dragImagePos) {
          // 画像上の掴んだ場所（中央）の位置を計算
          const grabbedSpotX = dragImagePos.left + dragImagePos.width / 2
          const grabbedSpotY = dragImagePos.top + dragImagePos.height / 2

          console.log(`画像位置: (${dragImagePos.left}, ${dragImagePos.top})`)
          console.log(
            `画像サイズ: ${dragImagePos.width}×${dragImagePos.height}`
          )
          console.log(`掴んだ場所の位置: (${grabbedSpotX}, ${grabbedSpotY})`)
          console.log(`現在のマウス位置: (${centerX + 20}, ${centerY + 20})`)

          // マウス位置と掴んだ場所の位置の差
          const diffX = Math.abs(grabbedSpotX - (centerX + 20))
          const diffY = Math.abs(grabbedSpotY - (centerY + 20))

          console.log(`位置の差: (${diffX}, ${diffY})`)

          results.push({
            trial: i + 1,
            imagePos: dragImagePos,
            grabbedSpot: { x: grabbedSpotX, y: grabbedSpotY },
            mousePosX: centerX + 20,
            mousePosY: centerY + 20,
            diffX,
            diffY,
            isAccurate: diffX < 2 && diffY < 2, // 2px以内なら正確
          })
        }

        // マウスアップ
        await page.mouse.up()
        await page.waitForTimeout(200)
      }

      console.log('=== 結果サマリー ===')
      results.forEach((result) => {
        console.log(
          `試行${result.trial}: 差(${result.diffX.toFixed(1)}, ${result.diffY.toFixed(1)}) 正確性: ${result.isAccurate}`
        )
      })

      // 全試行で位置が安定しているかチェック
      const allAccurate = results.every((r) => r.isAccurate)
      const consistentPositions = results.every((r, i) => {
        if (i === 0) return true
        const prevResult = results[i - 1]
        const posDiffX = Math.abs(r.imagePos.left - prevResult.imagePos.left)
        const posDiffY = Math.abs(r.imagePos.top - prevResult.imagePos.top)
        return posDiffX < 2 && posDiffY < 2 // 前回と同じ位置に表示されるか
      })

      console.log('全試行で正確:', allAccurate)
      console.log('位置の一貫性:', consistentPositions)

      // 同じ位置（右下角）でもテスト
      console.log('=== 右下角テスト ===')
      const rightBottomX = characterBox.x + characterBox.width - 10
      const rightBottomY = characterBox.y + characterBox.height - 10

      console.log(`テスト位置（右下角）: (${rightBottomX}, ${rightBottomY})`)

      await page.mouse.move(rightBottomX, rightBottomY)
      await page.mouse.down()
      await page.mouse.move(rightBottomX + 30, rightBottomY + 30, { steps: 3 })
      await page.waitForTimeout(100)

      const rightBottomDragImagePos = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        return dragImage
          ? {
              left: parseFloat(dragImage.style.left),
              top: parseFloat(dragImage.style.top),
              width: parseFloat(dragImage.style.width),
              height: parseFloat(dragImage.style.height),
            }
          : null
      })

      if (rightBottomDragImagePos) {
        // 画像上の掴んだ場所（右下から10px内側）の位置を計算
        const grabbedSpotX =
          rightBottomDragImagePos.left + rightBottomDragImagePos.width - 10
        const grabbedSpotY =
          rightBottomDragImagePos.top + rightBottomDragImagePos.height - 10

        const diffX = Math.abs(grabbedSpotX - (rightBottomX + 30))
        const diffY = Math.abs(grabbedSpotY - (rightBottomY + 30))

        console.log(
          `右下角での位置の差: (${diffX.toFixed(1)}, ${diffY.toFixed(1)})`
        )
        console.log(`右下角での正確性: ${diffX < 2 && diffY < 2}`)
      }

      await page.mouse.up()
      await page.waitForTimeout(200)
    }
  }

  console.log('=== ドラッグ安定性テスト完了 ===')
})
