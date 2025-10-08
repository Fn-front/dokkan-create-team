import { test, expect } from '@playwright/test'

test('キャラクター重複制限（移動後）テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('キャラクター重複制限（移動後）テストを開始します...')

  // 1. 同じキャラクター（ブロリー）をリーダーとフレンドに配置
  console.log('ブロリーをリーダーとフレンドに配置中...')

  const brolyCharacter = page.locator('[data-testid="character-card"]').first()

  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )
  const friendSlot = page.locator(
    '[data-testid="team-slot"][data-position="6"]'
  )

  // ブロリーをリーダースロットに配置
  const leaderSlotBox = await leaderSlot.boundingBox()
  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    leaderSlotBox.x + leaderSlotBox.width / 2,
    leaderSlotBox.y + leaderSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // ブロリーをフレンドスロットに配置
  const friendSlotBox = await friendSlot.boundingBox()
  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    friendSlotBox.x + friendSlotBox.width / 2,
    friendSlotBox.y + friendSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 配置確認
  const leaderSlotImage = await leaderSlot.locator('img').count()
  const friendSlotImage = await friendSlot.locator('img').count()
  expect(leaderSlotImage).toBe(1)
  expect(friendSlotImage).toBe(1)
  console.log('✓ ブロリーがリーダーとフレンドに配置されました')

  // リーダー+フレンドの組み合わせでは無効化されない（まだメンバーに配置可能）
  const brolyClassAfterPlacement = await brolyCharacter.getAttribute('class')
  expect(brolyClassAfterPlacement).not.toContain('disabled')
  console.log('✓ リーダー+フレンド配置時は無効化されていません（正常）')

  // 2. フレンドスロットのブロリーをメンバースロットに移動しようとする（制限されるはず）
  console.log(
    'フレンドのブロリーをメンバースロットに移動を試行中（制限予想）...'
  )

  const memberSlot = page.locator(
    '[data-testid="team-slot"][data-position="1"]'
  )
  const memberSlotBox = await memberSlot.boundingBox()

  await friendSlot.hover()
  await page.mouse.down()
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 移動が制限されて元の位置に残っていることを確認
  const friendSlotAfterMove = await friendSlot.locator('img').count()
  const memberSlotAfterMove = await memberSlot.locator('img').count()
  expect(friendSlotAfterMove).toBe(1) // フレンドスロットに残っている
  expect(memberSlotAfterMove).toBe(0) // メンバースロットは空のまま
  console.log(
    '✓ フレンドのブロリーのメンバースロット移動が正しく制限されました'
  )

  // 3. リーダースロットのブロリーをメンバースロットに移動しようとする（制限されるはず）
  console.log(
    'リーダーのブロリーをメンバースロットに移動を試行中（制限予想）...'
  )

  await leaderSlot.hover()
  await page.mouse.down()
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 移動が制限されて元の位置に残っていることを確認
  const leaderSlotAfterMove = await leaderSlot.locator('img').count()
  const memberSlotAfterSecondMove = await memberSlot.locator('img').count()
  expect(leaderSlotAfterMove).toBe(1) // リーダースロットに残っている
  expect(memberSlotAfterSecondMove).toBe(0) // メンバースロットは空のまま
  console.log(
    '✓ リーダーのブロリーのメンバースロット移動が正しく制限されました'
  )

  // 4. フレンドスロットに再度ブロリーを配置しようとする（失敗するはず）
  console.log(
    'キャラクター一覧からフレンドスロットへの再配置を試行中（失敗予想）...'
  )

  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    friendSlotBox.x + friendSlotBox.width / 2,
    friendSlotBox.y + friendSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // フレンドスロットのブロリーは元々いるので1のまま、新しいブロリーは追加されない
  const finalFriendSlotImage = await friendSlot.locator('img').count()
  expect(finalFriendSlotImage).toBe(1) // 元のフレンドブロリーがまだいる
  console.log(
    '✓ キャラクター一覧からフレンドスロットへの重複配置が正しく制限されました'
  )

  // 5. リーダースロットのブロリーを削除
  console.log('リーダースロットのブロリーを削除中...')

  await leaderSlot.hover()
  await page.mouse.down()
  // キャラクター一覧外にドロップして削除
  await page.mouse.move(50, 50)
  await page.mouse.up()
  await page.waitForTimeout(500)

  // リーダースロットが空になったことを確認
  const leaderSlotAfterRemoval = await leaderSlot.locator('img').count()
  expect(leaderSlotAfterRemoval).toBe(0)
  console.log('✓ リーダースロットのブロリーが削除されました')

  // 6. フレンドスロットのブロリーを空のリーダースロットに移動（許可されるはず）
  console.log('フレンドのブロリーをリーダースロットに移動中...')

  await friendSlot.hover()
  await page.mouse.down()
  await page.mouse.move(
    leaderSlotBox.x + leaderSlotBox.width / 2,
    leaderSlotBox.y + leaderSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // フレンド→リーダー移動の確認
  const finalLeaderSlotAfterFriendMove = await leaderSlot.locator('img').count()
  const finalFriendSlotAfterMove = await friendSlot.locator('img').count()
  expect(finalLeaderSlotAfterFriendMove).toBe(1)
  expect(finalFriendSlotAfterMove).toBe(0)
  console.log('✓ フレンドのブロリーがリーダースロットに移動しました')

  console.log('=== キャラクター重複制限（移動後）テスト完了 ===')
})
