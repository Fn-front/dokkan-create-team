import { test, expect } from '@playwright/test'

test('キャラクター重複制限機能テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3001')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('キャラクター重複制限テストを開始します...')

  // ブロリー（最初のキャラクター）を取得
  const brolyCharacter = page.locator('[data-testid="character-card"]').first()

  // 初期状態でブロリーが配置可能か確認
  const initialDisabledClass = await brolyCharacter.getAttribute('class')
  console.log('初期状態のブロリークラス:', initialDisabledClass)
  expect(initialDisabledClass).not.toContain('disabled')

  // 1. ブロリーをリーダースロット（position 0）に配置
  console.log('ブロリーをリーダースロットに配置中...')

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

  // 配置完了を待つ
  await page.waitForTimeout(500)

  // リーダースロットに配置されたことを確認
  const leaderSlotImage = await leaderSlot.locator('img').count()
  expect(leaderSlotImage).toBe(1)
  console.log('✓ ブロリーがリーダースロットに配置されました')

  // 2. ブロリーがメンバースロット（position 1-5）に配置不可になったか確認
  console.log('ブロリーのメンバースロット配置制限をテスト中...')

  const memberSlot = page.locator(
    '[data-testid="team-slot"][data-position="1"]'
  )
  const memberSlotBox = await memberSlot.boundingBox()

  // ブロリーをメンバースロットにドラッグ（配置されないはず）
  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    memberSlotBox.x + memberSlotBox.width / 2,
    memberSlotBox.y + memberSlotBox.height / 2
  )
  await page.mouse.up()

  await page.waitForTimeout(500)

  // メンバースロットには配置されていないことを確認
  const memberSlotImage = await memberSlot.locator('img').count()
  expect(memberSlotImage).toBe(0)
  console.log(
    '✓ ブロリーがメンバースロットに配置されませんでした（正しい制限）'
  )

  // 3. ブロリーがフレンドスロット（position 6）に配置可能か確認
  console.log('ブロリーをフレンドスロットに配置中...')

  const friendSlot = page.locator(
    '[data-testid="team-slot"][data-position="6"]'
  )
  const friendSlotBox = await friendSlot.boundingBox()

  await brolyCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    friendSlotBox.x + friendSlotBox.width / 2,
    friendSlotBox.y + friendSlotBox.height / 2
  )
  await page.mouse.up()

  await page.waitForTimeout(500)

  // フレンドスロットに配置されたことを確認
  const friendSlotImage = await friendSlot.locator('img').count()
  expect(friendSlotImage).toBe(1)
  console.log('✓ ブロリーがフレンドスロットに配置されました')

  // 4. 別のキャラクター（2番目）でメンバー配置テスト
  console.log('別キャラクターでメンバー配置をテスト中...')

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

  // メンバースロットに配置されたことを確認
  const memberSlotImageAfter = await memberSlot.locator('img').count()
  expect(memberSlotImageAfter).toBe(1)
  console.log('✓ 別キャラクターがメンバースロットに配置されました')

  // 5. 2番目のキャラクターが他のスロットに配置不可になったか確認
  console.log('メンバー配置後の制限をテスト中...')

  const anotherMemberSlot = page.locator(
    '[data-testid="team-slot"][data-position="2"]'
  )
  const anotherMemberSlotBox = await anotherMemberSlot.boundingBox()

  // 2番目のキャラクターを別のメンバースロットにドラッグ（配置されないはず）
  await secondCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    anotherMemberSlotBox.x + anotherMemberSlotBox.width / 2,
    anotherMemberSlotBox.y + anotherMemberSlotBox.height / 2
  )
  await page.mouse.up()

  await page.waitForTimeout(500)

  // 別のメンバースロットには配置されていないことを確認
  const anotherMemberSlotImage = await anotherMemberSlot.locator('img').count()
  expect(anotherMemberSlotImage).toBe(0)
  console.log(
    '✓ メンバー配置キャラクターが他スロットに配置されませんでした（正しい制限）'
  )

  // 6. 視覚的フィードバック（無効化表示）の確認
  console.log('視覚的フィードバックをテスト中...')

  // ブロリーのクラスに disabled が含まれているか確認（配置制限のため）
  const brolyClassAfterPlacement = await brolyCharacter.getAttribute('class')
  console.log('配置後のブロリークラス:', brolyClassAfterPlacement)

  // 2番目のキャラクターのクラスに disabled が含まれているか確認
  const secondCharacterClass = await secondCharacter.getAttribute('class')
  console.log('配置後の2番目キャラクタークラス:', secondCharacterClass)
  expect(secondCharacterClass).toContain('disabled')

  console.log('=== キャラクター重複制限テスト完了 ===')
})
