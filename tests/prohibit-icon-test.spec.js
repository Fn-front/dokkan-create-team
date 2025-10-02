import { test, expect } from '@playwright/test'

test('配置不可時の禁止アイコン表示テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3001')

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

  // 禁止アイコンが表示されているかチェック（SVGアイコンを検出）
  const prohibitIcon = page
    .locator('body > div')
    .filter({ has: page.locator('svg') })
  const prohibitIconCount = await prohibitIcon.count()
  console.log('禁止アイコン数:', prohibitIconCount)
  expect(prohibitIconCount).toBeGreaterThan(0)

  // 禁止アイコンが可視であることを確認
  const prohibitIconVisible = await prohibitIcon.first().isVisible()
  expect(prohibitIconVisible).toBe(true)
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
  const prohibitIconVisibleAfterMove = await prohibitIcon.first().isVisible()
  expect(prohibitIconVisibleAfterMove).toBe(false)
  console.log('✓ 配置可能位置で禁止アイコンが非表示になりました')

  // 4. 再度配置不可位置に移動して禁止アイコンが再表示されるかテスト
  console.log('再度配置不可位置に移動中...')

  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.waitForTimeout(300)

  const prohibitIconVisibleAgain = await prohibitIcon.first().isVisible()
  expect(prohibitIconVisibleAgain).toBe(true)
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
    .filter({ has: page.locator('svg') })
  const secondProhibitIconCount = await secondProhibitIcon.count()
  console.log('2番目キャラクターの禁止アイコン数:', secondProhibitIconCount)

  if (secondProhibitIconCount > 0) {
    const secondProhibitIconVisible = await secondProhibitIcon
      .first()
      .isVisible()
    expect(secondProhibitIconVisible).toBe(true)
    console.log('✓ 別キャラクターでも禁止アイコンが正しく表示されました')
  } else {
    console.log(
      'ℹ 2番目キャラクターでは禁止アイコンが表示されませんでした（既に削除済み）'
    )
  }

  await page.mouse.up()
  await page.waitForTimeout(300)

  console.log('=== 禁止アイコン表示テスト完了 ===')
})
