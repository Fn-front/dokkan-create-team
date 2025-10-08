# スキル表示・条件判定システム

## スキル表示システム

### 動的スキル表示機能

- **リーダースキル**: position 0（リーダースロット）のキャラクターのスキルを表示
- **フレンドスキル**: position 6（フレンドスロット）のキャラクターのスキルを表示
- **スキル優先順位**: super_extreme > post_extreme > pre_extreme
- **表示内容**: `leader_skill.original_effect`の値を動的に表示
- **未設置時**: 「リーダーを設置してください」「フレンドを設置してください」

### スキル取得ロジック

```typescript
// 優先順位に基づくスキル取得（forms[0]から取得）
const skills = character.forms[0].skills
if (skills.super_extreme?.leader_skill?.original_effect) {
  return skills.super_extreme.leader_skill.original_effect
}
if (skills.post_extreme?.leader_skill?.original_effect) {
  return skills.post_extreme.leader_skill.original_effect
}
if (skills.pre_extreme?.leader_skill?.original_effect) {
  return skills.pre_extreme.leader_skill.original_effect
}
```

**重要**: スキル参照時は必ず`character.forms[0].skills`からアクセスすること。`character.skills`は存在しません。

## リーダースキル条件判定システム

### 条件マッチングロジック

リーダー・フレンドスキルの適用には**必ず条件判定が必要**です。`matchesLeaderSkillCondition`関数を使用：

```typescript
const matchesLeaderSkillCondition = (
  character: Character,
  condition: { type: string; target: string[] }
): boolean => {
  const targets = condition.target

  // 属性判定
  if (condition.type === 'attribute') {
    return targets.some((target) => {
      // 「〜属性」（超/極なし）: 超〜 or 極〜 の両方が対象
      if (!target.startsWith('超') && !target.startsWith('極')) {
        const baseAttr = target.replace('属性', '')
        return (
          character.attribute === `超${baseAttr}` ||
          character.attribute === `極${baseAttr}`
        )
      }
      // 「超〜属性」「極〜属性」: 完全一致
      const targetAttr = target.replace('属性', '')
      return character.attribute === targetAttr
    })
  }

  // キャラクター名判定（「または」「&」はOR、最初の一致のみ）
  if (condition.type === 'character') {
    const displayName = getDisplayName(character)
    return targets.some((target) => {
      // 「または」「&」区切りの名前処理
      const nameVariations = target
        .split(/または|&/)
        .map((name) => name.trim())
      return nameVariations.some((name) => displayName.includes(name))
    })
  }

  // カテゴリ判定（配列のいずれかに一致すればtrue）
  if (condition.type === 'category') {
    if (!character.categories) return false
    return targets.some((target) => character.categories?.includes(target))
  }

  // 追加カテゴリ判定（配列のいずれかに一致すればtrue）
  if (condition.type === 'additional_category') {
    if (!character.categories) return false
    return targets.some((target) => character.categories?.includes(target))
  }

  return false
}
```

### 重要な実装ルール

1. **条件チェック必須**: リーダー・フレンドスキルの倍率を加算する前に、必ず`matchesLeaderSkillCondition`で条件チェック
2. **全ての一致条件を適用**: 複数条件がある場合、**マッチした全ての条件を加算**（`break`は使用しない）
3. **target配列**: `SkillCondition.target`は`string[]`型（配列形式）
4. **属性判定の違い**:
   - `力属性` → `超力` OR `極力` にマッチ
   - `超力属性` → `超力` のみにマッチ
   - `極力属性` → `極力` のみにマッチ

### 実装例

```typescript
// リーダースキルの倍率取得（条件チェック付き）
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (matchesLeaderSkillCondition(character, condition)) {
      if (condition.atk !== undefined) atkMultiplier += condition.atk
      if (condition.def !== undefined) defMultiplier += condition.def
      if (condition.hp !== undefined) hpMultiplier += condition.hp
      // breakは使用しない - 全ての一致条件を適用
    }
  }
}
```

## よくあるバグ

### ❌ 間違い: 条件チェックなしで全条件を加算

```typescript
// これはバグ！条件に関係なく全て加算される
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (condition.atk !== undefined) atkMultiplier += condition.atk
  }
}
```

### ❌ 間違い: breakを使用して最初の一致のみ適用

```typescript
// これはバグ！additional_category等の追加条件が適用されない
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (matchesLeaderSkillCondition(character, condition)) {
      if (condition.atk !== undefined) atkMultiplier += condition.atk
      break // 間違い！
    }
  }
}
```

### ✅ 正しい: 条件チェックして全ての一致条件を適用

```typescript
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (matchesLeaderSkillCondition(character, condition)) {
      if (condition.atk !== undefined) atkMultiplier += condition.atk
      if (condition.def !== undefined) defMultiplier += condition.def
      // breakなし - 全条件をチェック
    }
  }
}
```

## 実装箇所

- `src/features/home/hooks/useCharacterStats.ts`: hooks内の計算ロジック
- `src/features/home/components/TeamSlot/hooks/useTeamSlotStats.tsx`: スロット内の計算ロジック
- `src/features/home/components/TeamSkillDisplay/index.tsx`: スキル表示UI

**注意**: useTeamSlotStatsとuseCharacterStatsの両方に同じ条件判定ロジックがあります。将来的には共通化を検討してください。

## テスト

- **動的スキル表示テスト**: `tests/skill-display-test.spec.js`
- **テスト内容**: 初期状態、キャラクター設置、削除時の動作検証
- **表示メッセージ変更**: 「リーダーキャラクターを設置してください」→「リーダーを設置してください」
