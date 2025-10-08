# ステータス計算システム

## ATK/DEF/HP計算ロジック（55%/100%）

キャラクターの最終ステータス計算は以下の順序で実行：

### 1. 基本ステータス

`potential_55` または `potential_100` の値を使用

### 2. リーダー・フレンドスキル適用

- **HP**: 倍率を加算後、`-1処理`を適用
  ```
  floor(baseHP × (leader + friend - 1))
  ```

- **ATK/DEF**: 倍率を加算（-1処理なし）
  ```
  floor(baseATK × (leader + friend))
  ```

### 3. パッシブスキル stat_boosts 計算

1. `basic` 値で乗算（`basic.atk`, `basic.def`）
2. `basic` 以外の全ATK/DEF値を再帰的に収集・合計（**`conditions`と`defensive`と`_support`を除外**）
3. **最終値 = basic適用後 + floor(basic適用後 × (その他ブースト合計 - 1))**

### 4. DEF down効果

`def_down`値を基本DEFから減算

### 5. 攻撃倍率適用（ATKのみ）

最後の`_extreme`キーの`ultra_super_attack.multiplier`を適用

## 行動後計算ロジック（LRのみ）

LRキャラクターの行動後ATK/DEF計算：

### 1. パッシブスキル計算

`conditions`を含み、`defensive`と`_support`のみ除外して計算

### 2. LR専用計算式

```
finalATK = (パッシブ適用後ATK × ultra_super_attack.multiplier) +
           (パッシブ適用後ATK × super_attack.multiplier × super_attack_count) +
           ((基本ATK × stat_boost.atk) × stat_boost.atk × super_attack_count)
```

## 再帰的ステータス収集

### 55%/100%用（conditions, defensive, _support除外）

```typescript
const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false
): number => {
  let total = 0

  for (const [key, value] of Object.entries(obj)) {
    // 除外キーをスキップ
    if (
      key === 'conditions' ||
      key === 'defensive' ||
      key.endsWith('_support')
    ) {
      continue
    }

    // basic除外オプション
    if (excludeBasic && key === 'basic') {
      continue
    }

    // ally_count動的計算
    if (parentKey === 'ally_count' && key === statType) {
      const perAlly = (value as Record<string, unknown>)?.per_ally
      if (typeof perAlly === 'number') {
        const condition = obj.condition
        if (condition) {
          const allyCount = countAlliesForAllyCount(condition)
          return 1.0 + perAlly * allyCount
        }
      }
    }

    // 数値の場合
    if (typeof value === 'number' && key === statType) {
      total += value
    }

    // オブジェクトの場合は再帰
    if (typeof value === 'object' && value !== null) {
      total += collectStatValues(value as Record<string, unknown>, statType, excludeBasic, key)
    }
  }

  return total
}
```

### 行動後用（defensive, _support除外、conditions含む）

```typescript
const collectStatValuesWithConditions = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false
): number => {
  // defensiveと_supportのみ除外、conditionsを含む
}
```

## 計算式例

### ベジータ（post_extreme、potential_100）

```
【HP計算】
1. 基本HP: 22,538
2. リーダー・フレンド（加算 + -1処理）:
   totalMultiplier = 2.8 + 2.8 = 5.6
   finalHP = floor(22,538 × (5.6 - 1))
          = floor(22,538 × 4.6)
          = 103,674

【ATK計算】
1. 基本ATK: 21,780
2. リーダー・フレンド（加算、-1処理なし）:
   currentATK = floor(21,780 × (2.8 + 2.8))
              = floor(21,780 × 5.6)
              = 121,967
3. パッシブbasic適用:
   basicATK = floor(121,967 × 2.4) = 292,720
4. パッシブturn_start適用:
   その他ブースト = 1.3
   finalATK = 292,720 + floor(292,720 × (1.3 - 1))
           = 292,720 + 87,816
           = 380,536

【DEF計算】
1. 基本DEF: 12,981
2. リーダー・フレンド: floor(12,981 × 5.6) = 72,693
3. パッシブbasic: floor(72,693 × 2.4) = 174,463
4. パッシブturn_start: 174,463 + floor(174,463 × (1.6 - 1)) = 279,140
```

### ブロリー（super_extreme、potential_100）

```
1. 基本ATK: 23,480
2. リーダー・フレンド: floor(23,480 × (2.8 + 2.8)) = 131,488
3. Basic適用: floor(131,488 × 3.6) = 473,356
4. その他ブースト（conditions除外）: 3.0 + 3.6 + 1.26 = 7.86
5. 最終ATK: 473,356 + floor(473,356 × (7.86 - 1)) = 3,720,578
```

## -1処理の適用範囲

- **HP**: リーダー・フレンドスキルの加算後に`-1処理`を適用
- **ATK/DEF**: リーダー・フレンドスキルは`-1処理なし`、パッシブスキルのbasic以外のみ`-1処理`を適用
- **非適用**: basic値、攻撃倍率(multiplier)

## 条件分岐

- **55%/100%表示**: `conditions`と`defensive`と`_support`を除外
- **行動後表示（LRのみ）**: `conditions`を含み、`defensive`と`_support`を除外

## stat_boosts除外ルール

パッシブスキルの`stat_boosts`計算時、以下のキーは**除外**されます:

- **conditions**: 55%/100%計算時のみ除外（行動後は含む）
- **defensive**: 全計算で除外（防御時のみ発動する効果）
- **\_support**: 全計算で除外（味方サポート効果、自身には適用されない）
  - 例: `ally_support`, `extreme_ally_support` など

## ally_count計算システム

**ally_count**は、実際のチーム構成に基づいて動的にブースト値を計算します。

### JSON構造

```json
"ally_count": {
  "condition": {
    "type": "attribute_or_category",
    "targets": ["超", "未来編"],
    "select": "most"
  },
  "atk": { "per_ally": 0.5, "max": 2.5 },
  "def": { "per_ally": 0.5, "max": 2.5 }
}
```

### 計算ロジック

1. **体数カウント**:
   - `targets`配列の各要素に対してマッチするキャラクターをカウント
   - 属性（"超"/"極"）: `character.attribute.startsWith(target)`でチェック
   - カテゴリ（"未来編"等）: `character.categories?.includes(target)`でチェック
   - **自分自身も含む**（`ts.position === slot.position`でフィルタしない）

2. **最終値の選択**:
   - `select: "most"`: 属性カウントとカテゴリカウントの大きい方を使用
   - `Math.max(attributeCount, categoryCount)`

3. **ブースト計算**:
   - 計算式: `1.0 + (per_ally × 体数)`
   - 例: `per_ally: 0.5`、体数1の場合 → `1.0 + (0.5 × 1) = 1.5`

### 実装例

```typescript
const countAlliesForAllyCount = (condition: {
  type: string
  targets: string[]
  select: string
}): number => {
  if (condition.type === 'attribute_or_category') {
    let attributeCount = 0
    let categoryCount = 0

    teamSlots.forEach((ts) => {
      if (!ts.character) return

      condition.targets.forEach((target) => {
        if (target === '超' || target === '極') {
          if (ts.character.attribute.startsWith(target)) {
            attributeCount++
          }
        } else if (ts.character.categories?.includes(target)) {
          categoryCount++
        }
      })
    })

    if (condition.select === 'most') {
      return Math.max(attributeCount, categoryCount)
    }
  }
  return 0
}
```

## multiplier適用ロジック（55%/100%）

**重要**: 55%/100%のATK計算では、`ultra_super_attack.multiplier`が存在する場合に適用されます。

```typescript
// ultra_super_attackがある_extremeキーから攻撃倍率を取得
const getAttackMultiplier = () => {
  if (!slot.character?.forms[0]?.skills) return null

  const skills = slot.character.forms[0].skills
  const extremeKeys = Object.keys(skills).filter((key) =>
    key.endsWith('_extreme')
  )

  if (extremeKeys.length === 0) return null

  // 後ろから順にultra_super_attackがあるキーを探す
  for (let i = extremeKeys.length - 1; i >= 0; i--) {
    const extremeKey = extremeKeys[i]
    const skillSet = skills[extremeKey as keyof typeof skills]

    if (skillSet && skillSet.ultra_super_attack?.multiplier) {
      return skillSet.ultra_super_attack.multiplier
    }
  }

  return null
}
```

**ポイント**:
- 最後の`_extreme`キーから順に遡り、`ultra_super_attack.multiplier`が存在する最初のキーを使用
- `super_extreme`が全てnullの場合は、`post_extreme`のmultiplierを使用
- multiplierが見つからない場合は適用しない（DEFには常に適用しない）

## 実装箇所

- `src/features/home/hooks/useCharacterStats.ts`: hooks内の計算ロジック
- `src/features/home/components/TeamSlot/hooks/useTeamSlotStats.tsx`: スロット内の計算ロジック
