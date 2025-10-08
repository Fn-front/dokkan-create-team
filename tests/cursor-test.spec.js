const { test, expect } = require('@playwright/test')

test('チームスロットドラッグ時のカーソル変化テスト', async ({ page }) => {
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
    }

    // 2. 配置されたキャラクターでカーソルテスト
    const leaderSlotImage = leaderSlot.locator('img')
    if ((await leaderSlotImage.count()) > 0) {
      // リーダースロットの位置を取得
      const slotBox = await leaderSlot.boundingBox()

      if (slotBox) {
        // スロットの中央にマウスを移動
        await page.mouse.move(
          slotBox.x + slotBox.width / 2,
          slotBox.y + slotBox.height / 2
        )

        // カーソルが grab になることを確認
        const initialCursor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).cursor
        })
        console.log('初期カーソル:', initialCursor)

        // マウスダウン
        await page.mouse.down()
        await page.waitForTimeout(100)

        // カーソルチェック（まだ grab のはず）
        const downCursor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).cursor
        })
        console.log('マウスダウン後カーソル:', downCursor)

        // 少し移動（ドラッグ開始）
        await page.mouse.move(
          slotBox.x + slotBox.width / 2 + 10,
          slotBox.y + slotBox.height / 2 + 10,
          { steps: 3 }
        )
        await page.waitForTimeout(100)

        // カーソルが grabbing になることを確認
        const draggingCursor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).cursor
        })
        console.log('ドラッグ中カーソル:', draggingCursor)

        // さらに移動
        await page.mouse.move(
          slotBox.x + slotBox.width / 2 + 50,
          slotBox.y + slotBox.height / 2 + 50,
          { steps: 5 }
        )
        await page.waitForTimeout(100)

        const stillDraggingCursor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).cursor
        })
        console.log('移動継続中カーソル:', stillDraggingCursor)

        // マウスアップ
        await page.mouse.up()
        await page.waitForTimeout(100)

        // カーソルがリセットされることを確認
        const finalCursor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).cursor
        })
        console.log('マウスアップ後カーソル:', finalCursor)

        // 結果をまとめ
        console.log('=== カーソル変化テスト結果 ===')
        console.log('初期:', initialCursor)
        console.log('マウスダウン:', downCursor)
        console.log('ドラッグ開始:', draggingCursor)
        console.log('ドラッグ継続:', stillDraggingCursor)
        console.log('終了:', finalCursor)

        // 期待値チェック
        expect(draggingCursor).toBe('grabbing')
        expect(stillDraggingCursor).toBe('grabbing')
      }
    }
  }
})
