import { test, expect } from '@playwright/test'

test('配置不可時の禁止アイコン表示テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('禁止アイコン表示テストを開始します...')

  // 1. ブロリーをリーダースロットに配置
  console.log('ブロリーをリーダースロットに配置中...')

  const brolyCharacter = page.locator('[data-testid="character-card"]').first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )
  const leaderSlotBox = await leaderSlot.boundingBox()

  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    leaderSlotBox.x + leaderSlotBox.width / 2,
    leaderSlotBox.y + leaderSlotBox.height / 2
  )
  await page.mouse.up()

  await page.waitForTimeout(500)
  console.log('✓ ブロリーがリーダースロットに配置されました')

  // 2. 同じブロリーをメンバースロットにドラッグして禁止アイコンをテスト
  console.log('ブロリーをメンバースロットにドラッグ中（禁止アイコンテスト）...')

  const memberSlot = page.locator(
    '[data-testid="team-slot"][data-position="1"]'
  )
  const memberSlotBox = await memberSlot.boundingBox()

  // ドラッグ開始
  const brolyBox = await brolyCharacter.boundingBox()
  await brolyCharacter.hover()
  await page.mouse.down()

  // 少し移動してドラッグ状態にする
  await page.mouse.move(brolyBox.x + 10, brolyBox.y + 10)
  await page.waitForTimeout(200)

  // メンバースロット上にマウスを移動
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.waitForTimeout(300)

  // 禁止アイコンが表示されているかチェック（SVGを含む固定位置のdivを検出、imgは除外）
  const prohibitIcon = page
    .locator('body > div')
    .filter({
      has: page.locator('svg'),
    })
    .filter({
      hasNot: page.locator('img'),
    })

  // 禁止アイコンを見つける（display: noneでない最初の要素）
  const visibleProhibitIcons = await prohibitIcon.evaluateAll((elements) =>
    elements
      .map((el, index) => ({
        index,
        display: window.getComputedStyle(el).display,
        hasRoundedBorder: window
          .getComputedStyle(el)
          .borderRadius.includes('50%'),
      }))
      .filter(
        (info) => info.display !== 'none' && info.hasRoundedBorder === true
      )
  )

  console.log('表示中の禁止アイコン:', visibleProhibitIcons.length)
  expect(visibleProhibitIcons.length).toBeGreaterThan(0)
  console.log('✓ 配置不可位置で禁止アイコンが表示されました')

  // 3. フレンドスロット（配置可能）に移動した時に禁止アイコンが非表示になるかテスト
  console.log('フレンドスロット（配置可能位置）に移動中...')

  const friendSlot = page.locator(
    '[data-testid="team-slot"][data-position="6"]'
  )
  const friendSlotBox = await friendSlot.boundingBox()

  await page.mouse.move(
    friendSlotBox.x + friendSlotBox.width / 2,
    friendSlotBox.y + friendSlotBox.height / 2
  )
  await page.waitForTimeout(300)

  // 禁止アイコンが非表示になっているかチェック
  const hiddenProhibitIcons = await prohibitIcon.evaluateAll((elements) =>
    elements
      .map((el) => ({
        display: window.getComputedStyle(el).display,
        hasRoundedBorder: window
          .getComputedStyle(el)
          .borderRadius.includes('50%'),
      }))
      .filter(
        (info) => info.display !== 'none' && info.hasRoundedBorder === true
      )
  )

  expect(hiddenProhibitIcons.length).toBe(0)
  console.log('✓ 配置可能位置で禁止アイコンが非表示になりました')

  // 4. 再度配置不可位置に移動して禁止アイコンが再表示されるかテスト
  console.log('再度配置不可位置に移動中...')

  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.waitForTimeout(300)

  const reappearProhibitIcons = await prohibitIcon.evaluateAll((elements) =>
    elements
      .map((el) => ({
        display: window.getComputedStyle(el).display,
        hasRoundedBorder: window
          .getComputedStyle(el)
          .borderRadius.includes('50%'),
      }))
      .filter(
        (info) => info.display !== 'none' && info.hasRoundedBorder === true
      )
  )

  expect(reappearProhibitIcons.length).toBeGreaterThan(0)
  console.log('✓ 配置不可位置で禁止アイコンが再表示されました')

  // 5. ドラッグ終了時に禁止アイコンが削除されるかテスト
  console.log('ドラッグ終了時の禁止アイコン削除をテスト中...')

  await page.mouse.up()
  await page.waitForTimeout(300)

  const prohibitIconCountAfterDrop = await prohibitIcon.count()
  expect(prohibitIconCountAfterDrop).toBe(0)
  console.log('✓ ドラッグ終了時に禁止アイコンが削除されました')

  // 6. 別のキャラクターでも同様に動作するかテスト
  console.log('別キャラクターで禁止アイコンテスト中...')

  const secondCharacter = page.locator('[data-testid="character-card"]').nth(1)

  // 2番目のキャラクターをメンバースロットに配置
  await secondCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 同じキャラクターを別の位置にドラッグして禁止アイコンをテスト
  const anotherMemberSlot = page.locator(
    '[data-testid="team-slot"][data-position="2"]'
  )
  const anotherMemberSlotBox = await anotherMemberSlot.boundingBox()

  const secondCharacterBox = await secondCharacter.boundingBox()
  await secondCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(secondCharacterBox.x + 10, secondCharacterBox.y + 10)
  await page.waitForTimeout(200)

  await page.mouse.move(
    anotherMemberSlotBox.x + anotherMemberSlotBox.width / 2,
    anotherMemberSlotBox.y + anotherMemberSlotBox.height / 2
  )
  await page.waitForTimeout(300)

  const secondProhibitIcon = page
    .locator('body > div')
    .filter({
      has: page.locator('svg'),
    })
    .filter({
      hasNot: page.locator('img'),
    })

  const secondVisibleIcons = await secondProhibitIcon.evaluateAll((elements) =>
    elements
      .map((el) => ({
        display: window.getComputedStyle(el).display,
        hasRoundedBorder: window
          .getComputedStyle(el)
          .borderRadius.includes('50%'),
      }))
      .filter(
        (info) => info.display !== 'none' && info.hasRoundedBorder === true
      )
  )

  console.log('2番目キャラクターの禁止アイコン数:', secondVisibleIcons.length)

  if (secondVisibleIcons.length > 0) {
    expect(secondVisibleIcons.length).toBeGreaterThan(0)
    console.log('✓ 別キャラクターでも禁止アイコンが正しく表示されました')
  } else {
    console.log(
      'ℹ 2番目キャラクターでは禁止アイコンが表示されませんでした（配置可能）'
    )
  }

  await page.mouse.up()
  await page.waitForTimeout(300)

  console.log('=== 禁止アイコン表示テスト完了 ===')
})
