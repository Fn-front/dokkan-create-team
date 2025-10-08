import { test, expect } from '@playwright/test'

test('気力メーター表示確認テスト', async ({ page }) => {
  // 現在動作中のサーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('気力メーター表示テストを開始します...')

  // キャラクター一覧の最初のキャラクターを取得
  const firstCharacter = page.locator('[data-testid="character-card"]').first()
  await expect(firstCharacter).toBeVisible()

  // チームスロット（リーダー）を取得
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )
  await expect(leaderSlot).toBeVisible()

  // キャラクターをリーダースロットにドラッグ&ドロップ
  console.log('キャラクターをリーダースロットに配置中...')
  await firstCharacter.dragTo(leaderSlot)

  // 少し待機してDOM更新を確認
  await page.waitForTimeout(1000)

  // メーターの見た目を確認するため、スクリーンショットを撮影
  await page.screenshot({
    path: 'test-results/ki-meter-display.png',
    fullPage: true,
  })

  console.log('スクリーンショット保存完了: test-results/ki-meter-display.png')

  // 気力メーターが表示されているか確認（複数のセレクタを試す）
  const kiMeterSelectors = [
    '.kiMeter',
    '[class*="kiMeter"]',
    '[class*="styles_kiMeter"]',
  ]

  let kiMeterFound = false
  for (const selector of kiMeterSelectors) {
    const kiMeter = page.locator(selector)
    const count = await kiMeter.count()
    console.log(`セレクタ ${selector}: ${count}個見つかりました`)
    if (count > 0) {
      kiMeterFound = true
      await expect(kiMeter.first()).toBeVisible()
      break
    }
  }

  if (!kiMeterFound) {
    console.log('気力メーターが見つかりません - DOM構造を確認中...')
    const teamSlotContent = page.locator(
      '[data-testid="team-slot"][data-position="0"] .slotContent'
    )
    const innerHTML = await teamSlotContent.innerHTML()
    console.log('チームスロット内容:', innerHTML)
  }

  // テストを10秒間停止して手動確認可能にする
  console.log('10秒間停止 - ブラウザで気力メーターのデザインを確認してください')
  await page.waitForTimeout(10000)
})
