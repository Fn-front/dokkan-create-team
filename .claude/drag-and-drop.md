# ドラッグ&ドロップシステム

## 実装方式

- HTML5 Drag & Drop APIではなく、**マウスイベントベース**でドラッグ&ドロップを実装
- CharacterList: キャラクター一覧からチームスロットへの配置
- TeamLayout: チームスロット間の移動・入れ替え、チーム外への削除

## マウス追従画像システム

- キャラクターをドラッグ時に、マウスの動きに合わせて画像が追従
- 画像サイズは元のキャラクターカードと同じサイズを維持
- 掴んだ場所からの相対位置を正確に保持（`dragOffset`で管理）
- 透明度、回転、影効果で視覚的フィードバックを提供

## 禁止アイコンシステム

- **react-icons使用**: `@/components/icons`で管理、Material Design（MdBlock）
- **表示条件**: 配置・移動制限に違反する場合にリアルタイム表示
- **表示位置**: ドラッグ画像と同じ位置に重ねて表示
- **実装箇所**: CharacterList（配置制限）、TeamLayout（移動制限）

## キャラクター重複制限

### 配置ルール

- **リーダー配置済み**: 同じキャラクターはフレンドのみ配置可能
- **フレンド配置済み**: 同じキャラクターはリーダーのみ配置可能
- **メンバー配置済み**: 同じキャラクターはどこにも配置不可

### 移動制限

- **リーダー・フレンド間**: 同じキャラクター同士は相互移動可能
- **メンバーから他**: 重複がある場合は移動不可
- **他からメンバー**: 重複がある場合は移動不可

## チーム内移動システム

- **空スロットへの移動**: 単純な位置変更
- **占有スロットへの移動**: キャラクター入れ替え
- **制限チェック**: 移動前に`canMoveCharacter`で検証
- **入れ替え制限**: 両方向の制限をチェック

## 重要な設計

- `useRef`を使用してドラッグ状態を即座に保存（React状態更新の非同期性回避）
- `dragOffsetRef`で掴んだ場所の相対位置を正確に管理
- `pointer-events: none`を子要素に設定してイベント競合を防止
- `preventDefault()`でテキスト選択やデフォルト動作を抑制
- グローバルイベントリスナーでドラッグ中の追跡
- カーソル状態管理（`grab` → `grabbing`）とCSS override

## 実装例

### useCharacterDragDrop（CharacterList）

```typescript
export const useCharacterDragDrop = ({
  onCharacterDragStart,
  canPlaceCharacter,
}: UseCharacterDragDropProps) => {
  const draggedCharacterRef = useRef<Character | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent, character: Character) => {
    // ドラッグ開始処理
    // マウス追従画像の作成
    // 禁止アイコンの制御
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // ドラッグ中の画像追従
      // 禁止アイコンの位置更新
    }

    const handleMouseUp = (e: MouseEvent) => {
      // ドロップ処理
      // クリーンアップ
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return { handleMouseDown }
}
```

### useTeamDragDrop（TeamLayout）

```typescript
export const useTeamDragDrop = ({
  onCharacterMove,
  onCharacterRemove,
  canMoveCharacter,
}: UseTeamDragDropProps) => {
  const [draggedFromPosition, setDraggedFromPosition] = useState<number | null>(
    null
  )
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const draggedSlotRef = useRef<TeamSlot | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleSlotMouseDown = (e: React.MouseEvent, slot: TeamSlot) => {
    // チーム内ドラッグ開始
    // カーソル変更
    // 禁止アイコン制御
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // ドラッグ中の処理
    }

    const handleMouseUp = (e: MouseEvent) => {
      // ドロップまたは削除処理
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return { draggedFromPosition, isDragging, handleSlotMouseDown }
}
```

## カーソル制御

```typescript
// ドラッグ開始時
document.body.style.setProperty('cursor', 'grabbing', 'important')

// ドラッグ終了時
document.body.style.removeProperty('cursor')
```

## イベント競合解決

ボタンクリックとスロットクリックの競合は以下のパターンで解決：

```typescript
const switchButtonClickedRef = useRef(false)

// ボタンクリック
<button
  onClickCapture={(e) => {
    e.preventDefault()
    e.stopPropagation()
    switchButtonClickedRef.current = true
    // ボタンの処理
    setTimeout(() => {
      switchButtonClickedRef.current = false
    }, 0)
  }}
>

// スロットクリック
<div onClick={() => {
  if (switchButtonClickedRef.current) {
    return
  }
  // スロットの処理
}}>
```
