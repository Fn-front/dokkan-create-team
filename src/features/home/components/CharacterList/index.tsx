import { memo, useState, useRef, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Image from 'next/image'
import styles from './style.module.scss'
import { sampleCharacters } from '@/functions/data/characters'
import type { Character } from '@/functions/types/team'
import { cn } from '@/lib/utils'
import { ProhibitIcon, DetailIcon, SwitchIcon } from '@/components/icons'
import CharacterDetailDialog from '@/components/CharacterDetailDialog/CharacterDetailDialog'
import { useDialog } from '@/functions/hooks/useDialog'
import {
  getDisplayName,
  getImageUrl,
  getCharacterSkills,
  isReversibleCharacter,
} from '@/functions/utils/characterUtils'

type CharacterListProps = {
  onCharacterDragStart: (character: Character) => void
  canPlaceCharacter: (character: Character, position: number) => boolean
  toggleReversibleForm: (characterId: string) => void
  getReversibleFormIndex: (characterId: string) => number
}

const CharacterList = memo<CharacterListProps>(
  ({
    onCharacterDragStart,
    canPlaceCharacter,
    toggleReversibleForm,
    getReversibleFormIndex,
  }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedCharacter, setSelectedCharacter] =
      useState<Character | null>(null)
    const { open: dialogOpen, setOpen: setDialogOpen } = useDialog()

    // キャラクターがどこかに配置可能かチェックする関数
    const canPlaceAnywhere = (character: Character): boolean => {
      // 全ポジション（0-6）をチェック
      for (let position = 0; position <= 6; position++) {
        if (canPlaceCharacter(character, position)) {
          return true
        }
      }
      return false
    }

    // useRefを使って現在のドラッグキャラクターを追跡
    const dragCharacterRef = useRef<Character | null>(null)
    const dragImageRef = useRef<HTMLImageElement | null>(null)
    const prohibitIconRef = useRef<HTMLDivElement | null>(null)
    const prohibitIconRootRef = useRef<Root | null>(null)
    const dragOffsetRef = useRef({
      x: 0,
      y: 0,
      originalWidth: 100,
      originalHeight: 100,
    })

    // cursor override styleを削除する関数
    const removeCursorOverride = () => {
      const overrideStyle = document.getElementById('drag-cursor-override')
      if (overrideStyle) {
        document.head.removeChild(overrideStyle)
      }
    }

    // マウスイベントベースのドラッグ&ドロップ
    const handleMouseDown = (e: React.MouseEvent, character: Character) => {
      // デフォルトの動作（テキスト選択など）を防ぐ
      e.preventDefault()

      const rect = e.currentTarget.getBoundingClientRect()
      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        originalWidth: rect.width, // 元要素の実際のサイズを保存
        originalHeight: rect.height,
      }

      // refに即座に設定
      dragOffsetRef.current = offset

      // refを使って即座に設定
      dragCharacterRef.current = character
      onCharacterDragStart(character)

      // ドラッグ中のテキスト選択を無効化
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.setProperty('-ms-user-select', 'none')
      document.body.style.setProperty('-moz-user-select', 'none')

      // グローバルマウスイベントを追加
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('selectstart', preventSelection)
    }

    // テキスト選択を防ぐ関数
    const preventSelection = (e: Event) => {
      e.preventDefault()
    }

    // 指定位置での配置可能性をチェックし、禁止アイコンの表示を制御
    const checkDropValidityAtPosition = (mouseX: number, mouseY: number) => {
      if (!dragCharacterRef.current) return

      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY)
      const dropTarget = elementUnderMouse?.closest(
        '[data-testid="team-slot"]'
      ) as HTMLElement

      if (dropTarget) {
        const position = parseInt(
          dropTarget.getAttribute('data-position') || '0'
        )
        const canDrop = canPlaceCharacter(dragCharacterRef.current, position)

        if (canDrop) {
          hideProhibitIcon()
        } else {
          showProhibitIcon()
        }
      } else {
        hideProhibitIcon()
      }
    }

    // コンポーネントアンマウント時のクリーンアップ
    useEffect(() => {
      return () => {
        // もしドラッグ中にコンポーネントがアンマウントされた場合のクリーンアップ
        if (dragCharacterRef.current) {
          removeDragImage()
          removeProhibitIcon()
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.removeEventListener('selectstart', preventSelection)
          document.body.style.userSelect = ''
          document.body.style.webkitUserSelect = ''
          document.body.style.removeProperty('-ms-user-select')
          document.body.style.removeProperty('-moz-user-select')
          document.body.style.cursor = ''

          // cursor override styleを削除
          removeCursorOverride()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleMouseMove = (e: MouseEvent) => {
      if (dragCharacterRef.current) {
        if (!isDragging) {
          setIsDragging(true)

          // ドラッグ中のカーソルを変更
          document.body.style.setProperty('cursor', 'grabbing', 'important')
          // 既存のoverride styleがあれば削除してから追加
          removeCursorOverride()
          // 全ての要素のcursorを強制的に上書き
          const style = document.createElement('style')
          style.id = 'drag-cursor-override'
          style.textContent = '* { cursor: grabbing !important; }'
          document.head.appendChild(style)

          // ドラッグ画像を作成（現在のマウス位置で）
          createDragImage(e.clientX, e.clientY)
        }

        // ドラッグ画像の位置を更新（掴んだ場所からの相対位置を維持）
        if (dragImageRef.current) {
          const offset = dragOffsetRef.current // refから最新の値を取得
          dragImageRef.current.style.left = `${e.clientX - offset.x}px`
          dragImageRef.current.style.top = `${e.clientY - offset.y}px`
        }

        // 禁止アイコンの位置も更新
        if (prohibitIconRef.current) {
          const offset = dragOffsetRef.current
          prohibitIconRef.current.style.left = `${e.clientX - offset.x}px`
          prohibitIconRef.current.style.top = `${e.clientY - offset.y}px`
        }

        // リアルタイムで配置可能性をチェック
        checkDropValidityAtPosition(e.clientX, e.clientY)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (dragCharacterRef.current) {
        // ドロップ対象を検索
        const elementUnderMouse = document.elementFromPoint(
          e.clientX,
          e.clientY
        )
        const dropTarget = elementUnderMouse?.closest(
          '[data-testid="team-slot"]'
        ) as HTMLElement

        if (dropTarget) {
          const position = parseInt(
            dropTarget.getAttribute('data-position') || '0'
          )

          // 配置可能かチェック
          if (canPlaceCharacter(dragCharacterRef.current, position)) {
            // TeamLayoutのhandleDropを直接呼び出すため、カスタムイベントを発火
            const dropEvent = new CustomEvent('character-drop', {
              detail: { character: dragCharacterRef.current, position },
            })
            dropTarget.dispatchEvent(dropEvent)
          }
          // 配置不可の場合は何もしない（ドロップ無効）
        }
      }

      // ドラッグ画像と禁止アイコンを削除
      removeDragImage()
      removeProhibitIcon()

      // クリーンアップ
      setIsDragging(false)
      dragCharacterRef.current = null

      // イベントリスナーを削除
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectstart', preventSelection)

      // テキスト選択とカーソルを元に戻す
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.removeProperty('-ms-user-select')
      document.body.style.removeProperty('-moz-user-select')
      document.body.style.cursor = ''

      // cursor override styleを削除
      removeCursorOverride()
    }

    // ドラッグ画像を削除する関数
    const removeDragImage = () => {
      if (dragImageRef.current) {
        document.body.removeChild(dragImageRef.current)
        dragImageRef.current = null
      }
    }

    // 禁止アイコンを表示する関数
    const showProhibitIcon = () => {
      if (!prohibitIconRef.current) {
        createProhibitIcon()
      }
      if (prohibitIconRef.current) {
        prohibitIconRef.current.style.display = 'flex'
      }
    }

    // 禁止アイコンを非表示にする関数
    const hideProhibitIcon = () => {
      if (prohibitIconRef.current) {
        prohibitIconRef.current.style.display = 'none'
      }
    }

    // 禁止アイコンを削除する関数
    const removeProhibitIcon = () => {
      if (prohibitIconRef.current && prohibitIconRootRef.current) {
        prohibitIconRootRef.current.unmount()
        document.body.removeChild(prohibitIconRef.current)
        prohibitIconRef.current = null
        prohibitIconRootRef.current = null
      }
    }

    // 禁止アイコンを作成する関数
    const createProhibitIcon = () => {
      if (prohibitIconRef.current) return

      const prohibitIcon = document.createElement('div')

      prohibitIcon.style.position = 'fixed'
      prohibitIcon.style.pointerEvents = 'none'
      prohibitIcon.style.zIndex = '10000'
      prohibitIcon.style.display = 'flex'
      prohibitIcon.style.alignItems = 'center'
      prohibitIcon.style.justifyContent = 'center'
      prohibitIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
      prohibitIcon.style.borderRadius = '50%'
      prohibitIcon.style.width = '25px'
      prohibitIcon.style.height = '25px'
      prohibitIcon.style.boxShadow = '0 2px 6px rgba(255, 23, 68, 0.4)'
      prohibitIcon.style.border = '2px solid #ff1744'

      document.body.appendChild(prohibitIcon)
      prohibitIconRef.current = prohibitIcon

      // ReactコンポーネントをDOMにレンダリング
      const root = createRoot(prohibitIcon)
      root.render(<ProhibitIcon size={16} />)
      prohibitIconRootRef.current = root
    }

    // ドラッグ画像を作成する関数
    const createDragImage = (mouseX: number, mouseY: number) => {
      if (!dragCharacterRef.current || dragImageRef.current) return

      const offset = dragOffsetRef.current // refから最新の値を取得

      const dragImage = document.createElement('img')
      dragImage.src = getImageUrl(dragCharacterRef.current)
      dragImage.alt = getDisplayName(dragCharacterRef.current)
      dragImage.style.position = 'fixed'
      dragImage.style.pointerEvents = 'none'
      dragImage.style.zIndex = '9999'
      dragImage.style.width = `${offset.originalWidth}px`
      dragImage.style.height = `${offset.originalHeight}px`
      dragImage.style.borderRadius = '0.75rem'
      dragImage.style.objectFit = 'cover'
      dragImage.style.opacity = '0.8'
      dragImage.style.transform = 'rotate(5deg)'
      dragImage.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)'

      // 掴んだ場所がマウス位置に来るように配置（スケール計算不要）
      dragImage.style.left = `${mouseX - offset.x}px`
      dragImage.style.top = `${mouseY - offset.y}px`

      document.body.appendChild(dragImage)
      dragImageRef.current = dragImage
    }

    // 詳細ボタンクリック時の処理
    const handleDetailClick = (
      e: React.MouseEvent,
      character: Character
    ): void => {
      e.stopPropagation() // ドラッグ開始を防ぐ
      setSelectedCharacter(character)
      setDialogOpen(true)
    }

    // 回転アイコンクリック時の処理
    const handleSwitchClick = (
      e: React.MouseEvent,
      character: Character
    ): void => {
      e.stopPropagation() // ドラッグ開始を防ぐ
      toggleReversibleForm(character.id)
    }

    return (
      <div className={styles.container}>
        <h2 className={styles.title}>キャラクター一覧</h2>
        <div className={styles.grid}>
          {sampleCharacters.map((character) => {
            const isPlaceable = canPlaceAnywhere(character)
            const displayName = getDisplayName(character)
            const isReversible = isReversibleCharacter(character)
            const formIndex = isReversible
              ? getReversibleFormIndex(character.id)
              : 0
            const imageUrl = getImageUrl(character, formIndex)
            const skills = getCharacterSkills(character, formIndex)
            return (
              <div
                key={character.id}
                className={cn(
                  styles.characterCard,
                  !isPlaceable && styles.disabled
                )}
                onMouseDown={
                  isPlaceable ? (e) => handleMouseDown(e, character) : undefined
                }
                data-testid="character-card"
                role="button"
                tabIndex={isPlaceable ? 0 : -1}
              >
                {skills && (
                  <button
                    className={styles.detailButton}
                    onClick={(e) => handleDetailClick(e, character)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="詳細を表示"
                  >
                    <DetailIcon className={styles.detailIcon} />
                  </button>
                )}
                {isReversible && (
                  <button
                    className={styles.switchButton}
                    onClick={(e) => handleSwitchClick(e, character)}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label="フォーム切り替え"
                  >
                    <SwitchIcon className={styles.switchIcon} />
                  </button>
                )}
                {imageUrl ? (
                  <Image
                    className={styles.characterImage}
                    src={imageUrl}
                    alt={displayName}
                    width={100}
                    height={100}
                    key={formIndex}
                  />
                ) : (
                  <div className={styles.characterText}>{displayName}</div>
                )}
              </div>
            )
          })}
        </div>
        {selectedCharacter && (
          <CharacterDetailDialog
            character={selectedCharacter}
            formIndex={
              isReversibleCharacter(selectedCharacter)
                ? getReversibleFormIndex(selectedCharacter.id)
                : 0
            }
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    )
  }
)

CharacterList.displayName = 'CharacterList'

export default CharacterList
