# フォーム切り替えシステム

## リバーシブルフォーム切り替え

一部のキャラクターは`reversible_forms`プロパティを持ち、2つのフォーム間で切り替え可能です（例: ベジータ&孫悟空 ⇔ 孫悟空&ベジータ）。

### データ構造

- **reversible_forms配列**: 2つのフォームデータを持つ（切り替え可能なキャラクター専用）
- **forms配列との違い**: `reversible_forms`を持つキャラクターは`forms`を持たない（相互排他）
- **各フォーム**: `form_id`, `form_name`, `display_name`, `image_url`, `stats`, `skills`

### SwitchIconコンポーネント

- **場所**: `@/components/icons/SwitchIcon.tsx`
- **アイコン**: Material Design `MdSwapHoriz`
- **用途**: フォーム切り替えボタンのアイコン

### 判定関数

```typescript
// characterUtils.ts
export const isReversibleCharacter = (character: Character): boolean => {
  return !!(character.reversible_forms && character.reversible_forms.length > 1)
}

export const getImageUrl = (
  character: Character,
  formIndex: number = 0
): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].image_url || ''
  }
  // ... forms処理
}
```

### 状態管理（useTeam）

```typescript
// reversibleフォームの現在のインデックスを管理 (characterId -> formIndex)
const [reversibleFormIndexes, setReversibleFormIndexes] = useState<
  Record<string, number>
>({})

// フォーム切り替え
const toggleReversibleForm = useCallback((characterId: string) => {
  setReversibleFormIndexes((prev) => {
    const currentIndex = prev[characterId] || 0
    return {
      ...prev,
      [characterId]: currentIndex === 0 ? 1 : 0,
    }
  })
}, [])

// インデックス取得
const getReversibleFormIndex = useCallback(
  (characterId: string) => {
    return reversibleFormIndexes[characterId] || 0
  },
  [reversibleFormIndexes]
)
```

## 変身フォーム切り替え（forms配列）

一部のキャラクターは`forms`配列に複数のフォームを持ち、フォーム間で切り替え可能です（例: ゴジータ ⇔ 超サイヤ人ゴッドSSゴジータ）。

### データ構造

- **forms配列**: 2つ以上のフォームデータを持つ（変身可能なキャラクター）
- **reversible_formsとの違い**: `forms`は極限前/極限後などの階層を持つ、`reversible_forms`は2つのフォーム間の切り替えのみ
- **各フォーム**: `form_id`, `form_name`, `display_name`, `form_order`, `is_base_form`, `stats`, `skills`

### TransformIconコンポーネント

- **場所**: `@/components/icons/TransformIcon.tsx`
- **アイコン**: Material Design `MdAutorenew`
- **用途**: 変身ボタンのアイコン（上部中央配置）

### 判定関数

```typescript
// characterUtils.ts
export const hasMultipleForms = (character: Character): boolean => {
  return !!(character.forms && character.forms.length > 1)
}

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

### 状態管理（useTeam）

```typescript
// formsフォームの現在のインデックスを管理 (characterId -> formIndex)
const [formIndexes, setFormIndexes] = useState<Record<string, number>>({})

// フォーム切り替え（循環）
const toggleForm = useCallback(
  (characterId: string, maxFormIndex: number) => {
    setFormIndexes((prev) => {
      const currentIndex = prev[characterId] || 0
      const nextIndex = (currentIndex + 1) % (maxFormIndex + 1)
      return {
        ...prev,
        [characterId]: nextIndex,
      }
    })
  },
  []
)

// インデックス取得
const getFormIndex = useCallback(
  (characterId: string) => {
    return formIndexes[characterId] || 0
  },
  [formIndexes]
)
```

## UI実装

### CharacterList

- 右上に回転アイコンボタン配置
- クリックでフォーム切り替え（画像のみ変更）
- オレンジ色ホバーエフェクト

### TeamLayout / TeamSlot

- 同様に右上に回転アイコン配置
- **イベント競合解決**: スロットクリック（削除）との競合を回避
  - `onClickCapture`を使用してキャプチャフェーズで処理
  - `useRef`フラグ + `setTimeout(0)`で非同期リセット
  - `z-index: 100`で独立レイヤー化

### UI実装とスタイリング

- **アイコン位置**: `top: 0`, `left: 50%`, `transform: translateX(-50%)`で上部中央配置
- **switchButton（reversible）と同じ位置**: 両方のアイコンが上部中央に配置される
- **オレンジ色ホバーエフェクト**: `&:hover::before { background-color: var(--color-orange-500) }`
- **z-index: 100**: 他の要素より上位レイヤー

## 画像切り替えメカニズム

```tsx
// key propで強制再レンダリング
const formIndex = isReversible ? getReversibleFormIndex(character.id) :
                  hasMultiple ? getFormIndex(character.id) : 0

<Image
  src={getImageUrl(character, formIndex)}
  key={formIndex}  // formIndexが変わるとImageが再マウント
  ...
/>
```

## スタイリング

```scss
.switchButton,
.transformButton {
  position: absolute;
  top: 0;
  right: 0; // switchButton
  left: 50%; transform: translateX(-50%); // transformButton
  z-index: 100; // 他のボタンより上位
  pointer-events: auto; // 親のpointer-eventsに関係なく有効

  &:hover::before {
    background-color: var(--color-orange-500); // オレンジホバー
  }
}
```

## 計算への反映

**重要**: 変身切り替えは以下の全ての計算に反映される必要があります：

1. **気力メーター計算**: `getCharacterSkills(character, formIndex)`でスキル取得
2. **55%ステータス計算**: `getCharacterStats(character, formIndex)`でステータス取得
3. **100%ステータス計算**: 同上
4. **行動後ステータス計算**: 同上、必殺回数表示も含む
5. **リーダースキル表示**: formIndexに基づくスキル取得

## formIndex取得パターン

TeamSlotの各計算セクションで以下のパターンを使用：

```typescript
const isReversible = isReversibleCharacter(slot.character)
const hasMultiple = hasMultipleForms(slot.character)
let formIndex = 0
if (isReversible) {
  formIndex = getReversibleFormIndex(slot.character.id)
} else if (hasMultiple) {
  formIndex = getFormIndex(slot.character.id)
}
// 取得したformIndexを使用してスキル・ステータスを取得
const skills = getCharacterSkills(slot.character, formIndex)
const stats = getCharacterStats(slot.character, formIndex)
```

## 詳細ダイアログ表示

- **変身キャラクターの詳細**: 極限前/極限後/超極限の表示（フォーム名ではない）
- **タブラベル**: `EXTREME_LABELS[key]`（通常/極限/超極限）を使用
- **スキル取得**: formIndexを渡して現在のフォームのスキルを表示

## 重要な技術的ポイント

1. **イベント伝播制御**:
   - `onClickCapture`でキャプチャフェーズ処理
   - `e.preventDefault()` + `e.stopPropagation()`
   - 親要素のonClickをスキップするrefフラグ方式

2. **状態同期**:
   - キャラクターID単位で管理（position依存ではない）
   - CharacterListとTeamLayoutで同じ状態を共有

3. **型安全性**:
   - `reversible_forms`の存在チェック必須
   - formsとreversible_formsは相互排他
