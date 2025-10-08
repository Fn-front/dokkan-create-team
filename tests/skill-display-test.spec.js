import { test, expect } from '@playwright/test'

test('動的スキル表示機能テスト', async ({ page }) => {
  // テスト用サーバーにアクセス
  await page.goto('http://localhost:3000')

  // ページの読み込み完了を待つ
  await page.waitForLoadState('networkidle')

  console.log('動的スキル表示テストを開始します...')

  // 初期状態のリーダースキルとフレンドスキル確認
  const initialLeaderSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(1) > div:nth-child(2)'
  )
  const initialFriendSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(2) > div:nth-child(2)'
  )

  console.log('初期リーダースキル:', initialLeaderSkill)
  console.log('初期フレンドスキル:', initialFriendSkill)

  // 初期状態では設置メッセージが表示されるべき
  expect(initialLeaderSkill).toBe('リーダーを設置してください')
  expect(initialFriendSkill).toBe('フレンドを設置してください')

  // 最初のキャラクターをリーダースロット（position 0）にドラッグ&ドロップ
  console.log('最初のキャラクターをリーダースロットに配置中...')

  const firstCharacter = page.locator('[data-testid="character-card"]').first()
  const leaderSlot = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  const leaderSlotBox = await leaderSlot.boundingBox()

  // ドラッグ&ドロップ実行
  await firstCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    leaderSlotBox.x + leaderSlotBox.width / 2,
    leaderSlotBox.y + leaderSlotBox.height / 2
  )
  await page.mouse.up()

  // リーダースキルの更新を待つ
  await page.waitForTimeout(500)

  // リーダースキルが動的に更新されているか確認
  const updatedLeaderSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(1) > div:nth-child(2)'
  )
  console.log('更新後リーダースキル:', updatedLeaderSkill)

  // リーダースキルが初期メッセージから変更されたことを確認
  expect(updatedLeaderSkill).not.toBe(initialLeaderSkill)
  expect(updatedLeaderSkill).not.toBe('')

  // 最初のキャラクターをフレンドスロット（position 6）にもドラッグ&ドロップ
  console.log('最初のキャラクターをフレンドスロットに配置中...')

  const secondCharacter = page.locator('[data-testid="character-card"]').first()
  const friendSlot = page.locator(
    '[data-testid="team-slot"][data-position="6"]'
  )

  const friendSlotBox = await friendSlot.boundingBox()

  // ドラッグ&ドロップ実行
  await secondCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(
    friendSlotBox.x + friendSlotBox.width / 2,
    friendSlotBox.y + friendSlotBox.height / 2
  )
  await page.mouse.up()

  // フレンドスキルの更新を待つ
  await page.waitForTimeout(500)

  // フレンドスキルが動的に更新されているか確認
  const updatedFriendSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(2) > div:nth-child(2)'
  )
  console.log('更新後フレンドスキル:', updatedFriendSkill)

  // フレンドスキルが初期メッセージから変更され、リーダースキルと同じになることを確認
  expect(updatedFriendSkill).not.toBe(initialFriendSkill)
  expect(updatedFriendSkill).toBe(updatedLeaderSkill)

  // ドラッグアウトテスト：リーダーキャラクターを削除
  console.log('リーダーキャラクターを削除中...')

  const leaderSlotWithCharacter = page.locator(
    '[data-testid="team-slot"][data-position="0"]'
  )

  // チーム外の安全な場所（下部）にドラッグ
  await leaderSlotWithCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(400, 800) // チーム外の下部
  await page.mouse.up()

  // リーダースキルのクリアを待つ
  await page.waitForTimeout(500)

  // リーダースキルがクリアされているか確認
  const clearedLeaderSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(1) > div:nth-child(2)'
  )
  console.log('削除後リーダースキル:', clearedLeaderSkill)

  expect(clearedLeaderSkill).toBe('リーダーを設置してください')

  // フレンドキャラクターも削除
  console.log('フレンドキャラクターを削除中...')

  const friendSlotWithCharacter = page.locator(
    '[data-testid="team-slot"][data-position="6"]'
  )

  // チーム外の安全な場所（下部）にドラッグ
  await friendSlotWithCharacter.hover()
  await page.mouse.down()
  await page.mouse.move(400, 800) // チーム外の下部
  await page.mouse.up()

  // フレンドスキルのクリアを待つ
  await page.waitForTimeout(500)

  // フレンドスキルがクリアされているか確認
  const clearedFriendSkill = await page.textContent(
    '[data-testid="team-layout"] > div:nth-child(2) > div:nth-child(2)'
  )
  console.log('削除後フレンドスキル:', clearedFriendSkill)

  expect(clearedFriendSkill).toBe('フレンドを設置してください')

  console.log('=== 動的スキル表示テスト完了 ===')
})
