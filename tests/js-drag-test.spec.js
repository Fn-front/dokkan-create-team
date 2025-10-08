const { test } = require('@playwright/test')

test('JavaScriptドラッグ&ドロップテスト', async ({ page }) => {
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

  // 実行前のスクリーンショット
  await page.screenshot({ path: 'tests/js-before.png' })

  // JavaScriptでドラッグ&ドロップをシミュレート
  const result = await page.evaluate(() => {
    const characterCard = document.querySelector(
      '[data-testid="character-card"]'
    )
    const teamSlot = document.querySelector(
      '[data-testid="team-slot"][data-position="0"]'
    )

    if (!characterCard || !teamSlot) {
      return { success: false, error: 'Elements not found' }
    }

    console.log('要素発見:', { characterCard, teamSlot })

    // ドラッグスタートイベントを作成
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    })

    // ドラッグオーバーイベントを作成
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer,
    })

    // ドロップイベントを作成
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer,
    })

    // データ転送にキャラクター情報を設定
    const characterData = {
      id: 1,
      name: '不滅の勇戦士エルフゴロー',
      imagePath: '/images/sample-character.png',
    }

    // データ設定はイベント発火前に行う必要がある
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: (type, data) => console.log('setData called:', type, data),
        getData: (type) => {
          console.log('getData called:', type)
          if (type === 'application/json') {
            return JSON.stringify(characterData)
          }
          return characterData.name
        },
        effectAllowed: 'move',
        dropEffect: 'move',
      },
    })

    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: dragStartEvent.dataTransfer,
    })

    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: dragStartEvent.dataTransfer,
    })

    console.log('ドラッグスタートイベント発火')
    characterCard.dispatchEvent(dragStartEvent)

    console.log('ドラッグオーバーイベント発火')
    teamSlot.dispatchEvent(dragOverEvent)

    console.log('ドロップイベント発火')
    teamSlot.dispatchEvent(dropEvent)

    return { success: true }
  })

  console.log('JavaScript実行結果:', result)

  // 少し待つ
  await page.waitForTimeout(2000)

  // 実行後のスクリーンショット
  await page.screenshot({ path: 'tests/js-after.png' })

  // リーダースロットに画像が配置されたかチェック
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )
  const leaderSlotImage = leaderSlot.locator('img')
  const hasImage = (await leaderSlotImage.count()) > 0

  console.log('リーダースロットに画像が配置されたか:', hasImage)
  console.log('収集したブラウザログ:', logs)

  return hasImage
})
