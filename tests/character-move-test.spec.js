import { test, expect } from '@playwright/test'

test('チーム内キャラクター移動・入れ替え機能テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('チーム内キャラクター移動テストを開始します...')

  // 1. 2つのキャラクターをチームに配置
  console.log('キャラクターをチームに配置中...')

  const firstCharacter = page.locator('[data-testid="character-card"]').first()
  const secondCharacter = page.locator('[data-testid="character-card"]').nth(1)

  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )
  const memberSlot = page.locator(
    '[data-testid="team-slot"][data-position="1"]'
  )

  // 1番目のキャラクターをリーダースロットに配置
  const leaderSlotBox = await leaderSlot.boundingBox()
  await firstCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    leaderSlotBox.x + leaderSlotBox.width / 2,
    leaderSlotBox.y + leaderSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 2番目のキャラクターをメンバースロットに配置
  const memberSlotBox = await memberSlot.boundingBox()
  await secondCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 配置確認
  const leaderSlotImage = await leaderSlot.locator('img').count()
  const memberSlotImage = await memberSlot.locator('img').count()
  expect(leaderSlotImage).toBe(1)
  expect(memberSlotImage).toBe(1)
  console.log('✓ キャラクターがチームに配置されました')

  // 2. リーダースキルの初期表示を確認
  const initialLeaderSkill = await page
    .locator('[class*="leaderSkill"] [class*="skillText"]')
    .textContent()
  console.log('初期リーダースキル:', initialLeaderSkill)

  // 3. チーム内でキャラクターを移動（リーダー → メンバー）
  console.log('リーダーをメンバースロットに移動中...')

  const emptyMemberSlot = page.locator(
    '[data-testid="team-slot"][data-position="2"]'
  )
  const emptyMemberSlotBox = await emptyMemberSlot.boundingBox()

  await leaderSlot.hover()
  await page.mouse.down()
  await page.mouse.move(
    emptyMemberSlotBox.x + emptyMemberSlotBox.width / 2,
    emptyMemberSlotBox.y + emptyMemberSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 移動確認
  const leaderSlotAfterMove = await leaderSlot.locator('img').count()
  const emptyMemberSlotAfterMove = await emptyMemberSlot.locator('img').count()
  expect(leaderSlotAfterMove).toBe(0)
  expect(emptyMemberSlotAfterMove).toBe(1)
  console.log('✓ リーダーが空のメンバースロットに移動しました')

  // 4. リーダースキルの変更を確認
  const changedLeaderSkill = await page
    .locator('[class*="leaderSkill"] [class*="skillText"]')
    .textContent()
  console.log('変更後リーダースキル:', changedLeaderSkill)
  expect(changedLeaderSkill).not.toBe(initialLeaderSkill)
  console.log('✓ リーダースキルが変更されました')

  // 5. 最初のキャラクターを直接リーダースロットに戻す
  console.log('最初のキャラクターを直接リーダースロットに戻す...')

  // emptyMemberSlotにいるキャラクターをリーダースロットに戻す
  const finalLeaderSlotBox = await leaderSlot.boundingBox()

  await emptyMemberSlot.hover()
  await page.mouse.down()
  await page.mouse.move(
    finalLeaderSlotBox.x + finalLeaderSlotBox.width / 2,
    finalLeaderSlotBox.y + finalLeaderSlotBox.height / 2
  )
  await page.mouse.up()
  await page.waitForTimeout(500)

  // 最終確認
  const finalLeaderSlotImage = await leaderSlot.locator('img').count()
  expect(finalLeaderSlotImage).toBe(1)
  console.log('✓ 最初のキャラクターがリーダースロットに戻りました')

  // 6. 最終リーダースキル確認
  await page.waitForTimeout(1000) // UI更新を待つ
  const finalLeaderSkill = await page
    .locator('[class*="leaderSkill"] [class*="skillText"]')
    .textContent()
  console.log('最終リーダースキル:', finalLeaderSkill)

  // 最初のキャラクターが戻ったのでスキルも復活するはず
  expect(finalLeaderSkill).toBe(initialLeaderSkill)
  console.log('✓ リーダースキルが正しく表示されています')

  console.log('=== チーム内キャラクター移動テスト完了 ===')
})
