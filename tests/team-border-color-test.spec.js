const { test, expect } = require('@playwright/test')

test('チームスロットドラッグ時の枠線色テスト', async ({ page }) => {
  // ローカル開発サーバーにアクセス
  await page.goto('http://localhost:3001')
  await page.waitForLoadState('networkidle')

  console.log('=== チームスロット枠線色テスト開始 ===')

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

      // 2. 初期状態の枠線色を確認
      const initialBorderColor = await page.evaluate(() => {
        const slot = document.querySelector(
          '[data-testid="team-slot"][data-position="0"]'
        )
        if (slot) {
          return {
            borderColor: window.getComputedStyle(slot).borderColor,
            classes: slot.className,
          }
        }
        return null
      })

      console.log('初期状態:', initialBorderColor)

      // 3. ホバー時の枠線色を確認
      await page.hover('[data-testid="team-slot"][data-position="0"]')
      await page.waitForTimeout(100)

      const hoverBorderColor = await page.evaluate(() => {
        const slot = document.querySelector(
          '[data-testid="team-slot"][data-position="0"]'
        )
        if (slot) {
          return {
            borderColor: window.getComputedStyle(slot).borderColor,
            classes: slot.className,
          }
        }
        return null
      })

      console.log('ホバー時:', hoverBorderColor)

      // 4. ドラッグ開始時の枠線色を確認
      const slotBox = await leaderSlot.boundingBox()

      if (slotBox) {
        // マウスダウン
        await page.mouse.move(
          slotBox.x + slotBox.width / 2,
          slotBox.y + slotBox.height / 2
        )
        await page.mouse.down()
        await page.waitForTimeout(100)

        const mouseDownBorderColor = await page.evaluate(() => {
          const slot = document.querySelector(
            '[data-testid="team-slot"][data-position="0"]'
          )
          if (slot) {
            return {
              borderColor: window.getComputedStyle(slot).borderColor,
              classes: slot.className,
            }
          }
          return null
        })

        console.log('マウスダウン時:', mouseDownBorderColor)

        // 5. ドラッグ中の枠線色を確認
        await page.mouse.move(
          slotBox.x + slotBox.width / 2 + 20,
          slotBox.y + slotBox.height / 2 + 20,
          { steps: 5 }
        )
        await page.waitForTimeout(200)

        const draggingBorderColor = await page.evaluate(() => {
          const slot = document.querySelector(
            '[data-testid="team-slot"][data-position="0"]'
          )
          if (slot) {
            return {
              borderColor: window.getComputedStyle(slot).borderColor,
              classes: slot.className,
              hasDraggingClass: slot.classList.contains('dragging'),
            }
          }
          return null
        })

        console.log('ドラッグ中:', draggingBorderColor)

        // スクリーンショット（ドラッグ中の枠線色確認）
        await page.screenshot({ path: 'tests/team-border-dragging.png' })

        // 6. ドラッグ終了後の枠線色を確認
        await page.mouse.up()
        await page.waitForTimeout(200)

        const afterDragBorderColor = await page.evaluate(() => {
          const slot = document.querySelector(
            '[data-testid="team-slot"][data-position="0"]'
          )
          if (slot) {
            return {
              borderColor: window.getComputedStyle(slot).borderColor,
              classes: slot.className,
              hasDraggingClass: slot.classList.contains('dragging'),
            }
          }
          return null
        })

        console.log('ドラッグ終了後:', afterDragBorderColor)

        // 7. キャラクター一覧での枠線色と比較
        const characterBorderColors = await page.evaluate(() => {
          const card = document.querySelector('[data-testid="character-card"]')
          if (card) {
            const styles = window.getComputedStyle(card)
            return {
              normal: styles.borderColor,
              // CSS変数の値を取得
              blueColor: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-blue-400')
                .trim(),
              orangeColor: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-orange-500')
                .trim(),
              redColor: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-red-500')
                .trim(),
              redDarkColor: getComputedStyle(document.documentElement)
                .getPropertyValue('--color-red-600')
                .trim(),
            }
          }
          return null
        })

        console.log('キャラクター一覧の枠線色参考値:', characterBorderColors)

        // 結果検証
        console.log('=== 枠線色テスト結果 ===')
        console.log(
          'ドラッグ中にdraggingクラスが適用されているか:',
          draggingBorderColor?.hasDraggingClass
        )
        console.log(
          'ドラッグ終了後にdraggingクラスが削除されているか:',
          !afterDragBorderColor?.hasDraggingClass
        )

        // アサーション
        expect(draggingBorderColor?.hasDraggingClass).toBe(true) // ドラッグ中にdraggingクラスが追加される
        expect(afterDragBorderColor?.hasDraggingClass).toBe(false) // ドラッグ終了後にdraggingクラスが削除される
      }
    }
  }

  console.log('=== チームスロット枠線色テスト完了 ===')
})
