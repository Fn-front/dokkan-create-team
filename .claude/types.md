# 型システム

## コア型定義 (`functions/types/team.ts`)

### キャラクター型

```typescript
type Character = {
  id: string
  base_name: string
  rarity: string
  attribute: string
  cost: number
  forms?: CharacterForm[]
  reversible_forms?: ReversibleForm[]
  link_skills: string[]
  categories?: string[]
}
```

### キャラクターフォーム型

```typescript
type CharacterForm = {
  form_id: string
  form_name: string
  display_name: string
  form_order: number
  is_base_form: boolean
  is_only_form: boolean
  stats: CharacterStats
  skills: CharacterSkills
  image_url: string
}
```

### チーム型

```typescript
type TeamSlot = {
  character: Character | null
  position: number // 0=leader, 1-5=members, 6=friend
}

type Team = {
  leader: Character | null
  members: (Character | null)[]
  friend: Character | null
}
```

## キャラクターデータ構造の重要なポイント

### forms配列とreversible_forms配列

- **forms配列**: 各キャラクターは複数のフォーム（通常/極限/超極限）を持つ
- **reversible_forms配列**: リバーシブルキャラクターは2つのフォームを持つ（formsと相互排他）

### データアクセス

- **通常キャラ**: `character.forms[0]`で最初のフォームを参照
- **リバーシブルキャラ**: `character.reversible_forms[formIndex]`で現在のフォームを参照
- **表示名**: `character.forms[0].display_name` または `character.name`（reversibleの場合）
- **画像**: `character.forms[0].image_url` または `character.reversible_forms[formIndex].image_url`
- **スキル**: `character.forms[0].skills` または `character.reversible_forms[formIndex].skills`
- **ステータス**: `character.forms[0].stats` または `character.stats`（reversibleの場合）

### 重要なルール

- **画像プロパティ名**: `image_url`（単数形）を使用（`image_urls`ではない）
- **画像パス**: `/images/character/`配下のローカル画像（ローマ字ファイル名）
- **キャラクター一意性**: `character.id`を使用（`name`ではない）
- **重要**: `characterUtils.ts`のヘルパー関数を使用してデータアクセスすること

## キャラクタースキル型定義

```typescript
type CharacterSkills = {
  pre_extreme?: SkillSet
  post_extreme?: SkillSet
  super_extreme?: SkillSet
}

type SkillSet = {
  leader_skill: Skill
  super_attack: Skill
  ultra_super_attack?: Skill
  passive_skill: Skill
  active_skill?: Skill
}

type Skill = {
  name: string
  conditions?: SkillCondition[]
  original_effect?: string
  effect?: string
}

type SkillCondition = {
  type: string
  target?: string[]
  ki?: number
  hp?: number
  atk?: number
  def?: number
}
```

## ステータス型定義

```typescript
type CharacterStats = {
  potential_55?: PotentialStats
  potential_100?: PotentialStats
}

type PotentialStats = {
  hp: number
  atk: number
  def: number
}
```

## ヘルパー関数 (`functions/utils/characterUtils.ts`)

### 画像URL取得

```typescript
export const getImageUrl = (
  character: Character,
  formIndex: number = 0
): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].image_url || ''
  }
  if (character.forms && character.forms.length > 0) {
    const index = Math.min(formIndex, character.forms.length - 1)
    return character.forms[index].image_url || ''
  }
  return ''
}
```

### 表示名取得

```typescript
export const getDisplayName = (character: Character): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    return character.reversible_forms[0].display_name
  }
  if (character.forms && character.forms.length > 0) {
    return character.forms[0].display_name
  }
  return character.base_name
}
```

### スキル取得

```typescript
export const getCharacterSkills = (
  character: Character,
  formIndex: number = 0
): CharacterSkills | null => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].skills
  }
  if (character.forms && character.forms.length > 0) {
    const index = Math.min(formIndex, character.forms.length - 1)
    return character.forms[index].skills
  }
  return null
}
```

### ステータス取得

```typescript
export const getCharacterStats = (
  character: Character,
  formIndex: number = 0
): CharacterStats | null => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].stats
  }
  if (character.forms && character.forms.length > 0) {
    const index = Math.min(formIndex, character.forms.length - 1)
    return character.forms[index].stats
  }
  return null
}
```

### フォーム判定

```typescript
// リバーシブルキャラクターかどうか
export const isReversibleCharacter = (character: Character): boolean => {
  return !!(character.reversible_forms && character.reversible_forms.length > 1)
}

// 複数フォームを持つかどうか
export const hasMultipleForms = (character: Character): boolean => {
  return !!(character.forms && character.forms.length > 1)
}
```

## 型安全性のルール

- **`any`型の使用禁止**: 常に適切な型定義または型安全なAPIを使用
- **型ガード使用**: `character.forms`や`character.reversible_forms`の存在チェック必須
- **ヘルパー関数優先**: 直接プロパティアクセスではなく`characterUtils.ts`の関数を使用
