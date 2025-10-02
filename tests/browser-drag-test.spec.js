const { test, expect } = require('@playwright/test')

test('ブラウザでのドラッグ&ドロップテスト', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')

  // 要素を取得
  const firstCharacter = page.locator('[data-testid="character-card"]').first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  // 要素の存在確認
  await expect(firstCharacter).toBeVisible()
  await expect(leaderSlot).toBeVisible()

  // 実行前のスクリーンショット
  await page.screenshot({ path: 'tests/browser-before.png' })

  // より自然なドラッグ&ドロップ
  const characterBox = await firstCharacter.boundingBox()
  const slotBox = await leaderSlot.boundingBox()

  if (characterBox && slotBox) {
    // キャラクターの中央から開始
    const startX = characterBox.x + characterBox.width / 2
    const startY = characterBox.y + characterBox.height / 2

    // スロットの中央に移動
    const endX = slotBox.x + slotBox.width / 2
    const endY = slotBox.y + slotBox.height / 2

    // マウスを移動してドラッグ開始
    await page.mouse.move(startX, startY)
    await page.mouse.down()

    // 少し待つ
    await page.waitForTimeout(100)

    // ターゲットに移動
    await page.mouse.move(endX, endY, { steps: 20 })

    // 少し待つ
    await page.waitForTimeout(100)

    // ドロップ
    await page.mouse.up()

    // 結果を確認
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'tests/browser-after.png' })

    const leaderSlotImage = leaderSlot.locator('img')
    const hasImage = (await leaderSlotImage.count()) > 0

    console.log('マウス操作でのドラッグ&ドロップ結果:', hasImage)

    if (hasImage) {
      console.log('✅ マウス操作でのドラッグ&ドロップ成功！')
    } else {
      console.log('❌ マウス操作でのドラッグ&ドロップ失敗')
    }
  }
})
