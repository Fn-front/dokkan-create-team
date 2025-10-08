const { test } = require('@playwright/test')

test('ドラッグ時の掴んだ場所からの相対位置テスト', async ({ page }) => {
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

  // キャラクターカードの取得
  const characterCards = page.locator('[data-testid="character-card"]')
  const firstCharacter = characterCards.first()

  if ((await characterCards.count()) > 0) {
    console.log('ドラッグオフセットテストを開始します...')

    // キャラクターカードの位置とサイズを取得
    const characterBox = await firstCharacter.boundingBox()
    console.log('キャラクター要素:', characterBox)

    if (characterBox) {
      // 要素の右下角をクリック（オフセットをテスト）
      const clickX = characterBox.x + characterBox.width - 10 // 右端から10px内側
      const clickY = characterBox.y + characterBox.height - 10 // 下端から10px内側

      console.log(`クリック位置: (${clickX}, ${clickY})`)
      console.log(`要素左上角: (${characterBox.x}, ${characterBox.y})`)
      console.log(
        `オフセット: (${clickX - characterBox.x}, ${clickY - characterBox.y})`
      )

      // 実行前のスクリーンショット
      await page.screenshot({ path: 'tests/drag-offset-before.png' })

      // マウスを要素の右下角に移動
      await page.mouse.move(clickX, clickY)

      // マウスダウン
      await page.mouse.down()
      await page.waitForTimeout(100)

      // 少し移動してドラッグ開始
      await page.mouse.move(clickX + 20, clickY + 20, { steps: 3 })
      await page.waitForTimeout(300)

      // ドラッグ画像の位置を確認
      const dragImageInfo = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        if (dragImage) {
          return {
            left: parseFloat(dragImage.style.left),
            top: parseFloat(dragImage.style.top),
            width: parseFloat(dragImage.style.width),
            height: parseFloat(dragImage.style.height),
          }
        }
        return null
      })

      console.log('ドラッグ画像情報:', dragImageInfo)

      if (dragImageInfo) {
        // ドラッグ画像の右下角の位置を計算
        const dragImageRightBottom = {
          x: dragImageInfo.left + dragImageInfo.width,
          y: dragImageInfo.top + dragImageInfo.height,
        }

        // 現在のマウス位置
        const currentMouseX = clickX + 20
        const currentMouseY = clickY + 20

        console.log(`現在のマウス位置: (${currentMouseX}, ${currentMouseY})`)
        console.log(
          `ドラッグ画像左上: (${dragImageInfo.left}, ${dragImageInfo.top})`
        )
        console.log(
          `ドラッグ画像右下: (${dragImageRightBottom.x}, ${dragImageRightBottom.y})`
        )

        // 期待する位置（掴んだ場所のオフセットを維持）
        const expectedOffset = {
          x: clickX - characterBox.x,
          y: clickY - characterBox.y,
        }
        const expectedImagePos = {
          x: currentMouseX - expectedOffset.x,
          y: currentMouseY - expectedOffset.y,
        }

        console.log(
          `期待するオフセット: (${expectedOffset.x}, ${expectedOffset.y})`
        )
        console.log(
          `期待する画像位置: (${expectedImagePos.x}, ${expectedImagePos.y})`
        )

        // 許容誤差（1px）
        const tolerance = 1
        const positionCorrect =
          Math.abs(dragImageInfo.left - expectedImagePos.x) <= tolerance &&
          Math.abs(dragImageInfo.top - expectedImagePos.y) <= tolerance

        console.log('位置の正確性:', positionCorrect)
      }

      // 移動中のスクリーンショット
      await page.screenshot({ path: 'tests/drag-offset-moving.png' })

      // 別の位置に移動
      await page.mouse.move(clickX + 100, clickY + 50, { steps: 5 })
      await page.waitForTimeout(200)

      // 再度位置確認
      const finalDragImageInfo = await page.evaluate(() => {
        const dragImage = Array.from(document.querySelectorAll('img')).find(
          (img) => img.style.position === 'fixed' && img.style.zIndex === '9999'
        )
        if (dragImage) {
          return {
            left: parseFloat(dragImage.style.left),
            top: parseFloat(dragImage.style.top),
          }
        }
        return null
      })

      console.log('最終ドラッグ画像位置:', finalDragImageInfo)

      // 最終スクリーンショット
      await page.screenshot({ path: 'tests/drag-offset-final.png' })

      // マウスアップ
      await page.mouse.up()
      await page.waitForTimeout(200)

      // 実行後のスクリーンショット
      await page.screenshot({ path: 'tests/drag-offset-after.png' })

      console.log('=== ドラッグオフセットテスト完了 ===')
    }
  }
})
