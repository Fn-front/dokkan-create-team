import { memo, useEffect, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Image from 'next/image'
import styles from './TeamLayout.module.scss'
import type { Character, TeamSlot } from '@/functions/types/team'
import { cn } from '@/lib/utils'
import { ProhibitIcon } from '@/components/icons'
import KiMeter from '@/components/KiMeter'
import {
  getLeaderSkillKiValue,
  getPassiveSkillKiValue,
} from '@/functions/utils/skillUtils'

type TeamSlotComponentProps = {
  slot: TeamSlot
  index: number
  draggedFromPosition: number | null
  isDragging: boolean
  teamSlots: TeamSlot[]
  onCharacterDrop: (character: Character, position: number) => void
  onSlotClick: (position: number) => void
  onMouseDown: (e: React.MouseEvent, slot: TeamSlot) => void
}

const TeamSlotComponent = memo<TeamSlotComponentProps>(
  ({
    slot,
    index,
    draggedFromPosition,
    isDragging,
    teamSlots,
    onCharacterDrop,
    onSlotClick,
    onMouseDown,
  }) => {
    const isLeader = index === 0
    const isFriend = index === 6
    const slotRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
      const slotElement = slotRef.current
      if (slotElement) {
        const handleCustomDrop = (e: CustomEvent) => {
          const { character, position } = e.detail
          onCharacterDrop(character, position)
        }

        slotElement.addEventListener(
          'character-drop',
          handleCustomDrop as EventListener
        )
        return () => {
          slotElement.removeEventListener(
            'character-drop',
            handleCustomDrop as EventListener
          )
        }
      }
    }, [slot.position, onCharacterDrop])

    return (
      <div className={styles.slotWrapper}>
        <div
          ref={slotRef}
          key={slot.position}
          className={cn(
            styles.slot,
            slot.character && styles.occupied,
            draggedFromPosition === slot.position && isDragging && 'dragging'
          )}
          onClick={() => onSlotClick(slot.position)}
          onMouseDown={(e) => onMouseDown(e, slot)}
          data-testid="team-slot"
          data-position={slot.position}
          style={{
            pointerEvents: 'auto',
            ...(() => {
              // CharacterListからのドラッグ中はcursorを設定しない
              const bodyHasGrabbingCursor =
                typeof document !== 'undefined' &&
                document.body.style.getPropertyValue('cursor') === 'grabbing'
              if (bodyHasGrabbingCursor) {
                return {}
              }

              // TeamLayout内でのドラッグ
              if (draggedFromPosition === slot.position && isDragging) {
                return { cursor: 'grabbing' }
              }

              // 通常時
              return { cursor: slot.character ? 'grab' : 'default' }
            })(),
          }}
        >
          <div className={styles.slotContent}>
            {slot.character ? (
              <>
                <Image
                  className={styles.characterImage}
                  src={slot.character.imagePath || ''}
                  alt={slot.character.name}
                  width={100}
                  height={100}
                />
                {slot.character.skills && (
                  <KiMeter
                    kiValue={(() => {
                      // 自分のパッシブスキルからのki値を取得
                      const passiveKi = getPassiveSkillKiValue(
                        slot.character.skills
                      )

                      if (isLeader || isFriend) {
                        const leaderSlot = teamSlots.find(
                          (s: TeamSlot) => s.position === 0
                        )
                        const friendSlot = teamSlots.find(
                          (s: TeamSlot) => s.position === 6
                        )
                        const leaderKi = leaderSlot?.character?.skills
                          ? getLeaderSkillKiValue(leaderSlot.character.skills)
                          : 0
                        const friendKi = friendSlot?.character?.skills
                          ? getLeaderSkillKiValue(friendSlot.character.skills)
                          : 0
                        return leaderKi + friendKi + passiveKi
                      } else {
                        return passiveKi
                      }
                    })()}
                  />
                )}
              </>
            ) : null}
            {isLeader && <span className={styles.leaderBadge}>LEADER</span>}
            {isFriend && <span className={styles.friendBadge}>FRIEND</span>}
          </div>
        </div>
        {slot.character?.stats && (
          <div className={styles.characterStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>55%</span>
              <span className={styles.statValues}>
                {slot.character.stats.potential_55.ATK} / {slot.character.stats.potential_55.DEF}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>100%</span>
              <span className={styles.statValues}>
                {slot.character.stats.potential_100.ATK} / {slot.character.stats.potential_100.DEF}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

TeamSlotComponent.displayName = 'TeamSlotComponent'

type TeamLayoutProps = {
  teamSlots: TeamSlot[]
  onCharacterDrop: (character: Character, position: number) => void
  onSlotClick: (position: number) => void
  onCharacterRemove: (position: number) => void
  onCharacterMove: (fromPosition: number, toPosition: number) => void
  canMoveCharacter?: (fromPosition: number, toPosition: number) => boolean
}

const TeamLayout = memo<TeamLayoutProps>(
  ({
    teamSlots,
    onCharacterDrop,
    onSlotClick,
    onCharacterRemove,
    onCharacterMove,
    canMoveCharacter,
  }) => {
    // リーダースキルを取得する関数
    const getLeaderSkill = () => {
      const leaderSlot = teamSlots.find((slot) => slot.position === 0)

      if (!leaderSlot?.character?.skills) {
        return { text: 'リーダーを設置してください', conditions: null }
      }

      const skills = leaderSlot.character.skills
      let selectedSkill = null

      // 優先順位: super_extreme > post_extreme > pre_extreme
      if (skills.super_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.super_extreme.leader_skill
      } else if (skills.post_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.post_extreme.leader_skill
      } else if (skills.pre_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.pre_extreme.leader_skill
      }

      if (!selectedSkill) {
        return { text: 'スキル情報がありません', conditions: null }
      }

      return {
        text: selectedSkill.original_effect,
        conditions: selectedSkill.conditions || null
      }
    }

    // フレンドスキルを取得する関数
    const getFriendSkill = () => {
      const friendSlot = teamSlots.find((slot) => slot.position === 6)
      
      if (!friendSlot?.character?.skills) {
        return { text: 'フレンドを設置してください', conditions: null }
      }

      const skills = friendSlot.character.skills
      let selectedSkill = null

      // 優先順位: super_extreme > post_extreme > pre_extreme
      if (skills.super_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.super_extreme.leader_skill
      } else if (skills.post_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.post_extreme.leader_skill
      } else if (skills.pre_extreme?.leader_skill?.original_effect) {
        selectedSkill = skills.pre_extreme.leader_skill
      }

      if (!selectedSkill) {
        return { text: 'スキル情報がありません', conditions: null }
      }

      return {
        text: selectedSkill.original_effect,
        conditions: selectedSkill.conditions || null
      }
    }
    const [draggedFromPosition, setDraggedFromPosition] = useState<
      number | null
    >(null)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const draggedFromPositionRef = useRef<number | null>(null)
    const isDraggingRef = useRef<boolean>(false)
    const startPositionRef = useRef<{ x: number; y: number } | null>(null)
    const dragOffsetRef = useRef({
      x: 0,
      y: 0,
      originalWidth: 100,
      originalHeight: 100,
    })
    const dragImageRef = useRef<HTMLImageElement | null>(null)
    const draggedCharacterRef = useRef<Character | null>(null)
    const prohibitIconRef = useRef<HTMLDivElement | null>(null)
    const prohibitIconRootRef = useRef<Root | null>(null)

    // cursor override styleを削除する関数
    const removeCursorOverride = () => {
      const overrideStyle = document.getElementById('team-drag-cursor-override')
      if (overrideStyle) {
        document.head.removeChild(overrideStyle)
      }
    }

    // 移動制限チェック機能
    const checkMoveValidityAtPosition = (mouseX: number, mouseY: number) => {
      if (
        !draggedCharacterRef.current ||
        draggedFromPositionRef.current === null
      )
        return

      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY)
      const dropTarget = elementUnderMouse?.closest(
        '[data-testid="team-slot"]'
      ) as HTMLElement

      if (dropTarget) {
        const toPosition = parseInt(
          dropTarget.getAttribute('data-position') || '0'
        )
        const fromPosition = draggedFromPositionRef.current

        if (fromPosition !== toPosition && canMoveCharacter) {
          const canMove = canMoveCharacter(fromPosition, toPosition)
          if (canMove) {
            hideProhibitIcon()
          } else {
            showProhibitIcon()
          }
        } else {
          hideProhibitIcon()
        }
      } else {
        hideProhibitIcon()
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

      const root = createRoot(prohibitIcon)
      root.render(<ProhibitIcon size={16} />)
      prohibitIconRootRef.current = root
    }

    // コンポーネントアンマウント時のクリーンアップ
    useEffect(() => {
      return () => {
        // もしドラッグ中にコンポーネントがアンマウントされた場合のクリーンアップ
        if (draggedFromPositionRef.current !== null) {
          removeDragImage()
          removeProhibitIcon()
          document.removeEventListener('mousemove', handleSlotMouseMove)
          document.removeEventListener('mouseup', handleSlotMouseUp)
          document.removeEventListener('selectstart', preventSelection)
          document.body.style.userSelect = ''
          document.body.style.webkitUserSelect = ''
          document.body.style.removeProperty('-ms-user-select')
          document.body.style.removeProperty('-moz-user-select')
          document.body.style.removeProperty('cursor')

          // cursor override styleを削除
          removeCursorOverride()
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // チームスロットからのドラッグ開始
    const handleSlotMouseDown = (e: React.MouseEvent, slot: TeamSlot) => {
      if (!slot.character) return

      e.preventDefault()
      e.stopPropagation()

      const rect = e.currentTarget.getBoundingClientRect()
      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        originalWidth: rect.width,
        originalHeight: rect.height,
      }

      setDraggedFromPosition(slot.position)
      draggedFromPositionRef.current = slot.position
      isDraggingRef.current = false
      setIsDragging(false)
      startPositionRef.current = { x: e.clientX, y: e.clientY }

      // オフセットとキャラクター情報を保存
      dragOffsetRef.current = offset
      draggedCharacterRef.current = slot.character

      // ドラッグ中のテキスト選択を無効化
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.setProperty('-ms-user-select', 'none')
      document.body.style.setProperty('-moz-user-select', 'none')

      // 即座にカーソルを変更
      document.body.style.setProperty('cursor', 'grabbing', 'important')
      removeCursorOverride()
      const style = document.createElement('style')
      style.id = 'team-drag-cursor-override'
      style.textContent = '* { cursor: grabbing !important; }'
      document.head.appendChild(style)

      // グローバルマウスイベントを追加
      document.addEventListener('mousemove', handleSlotMouseMove)
      document.addEventListener('mouseup', handleSlotMouseUp)
      document.addEventListener('selectstart', preventSelection)
    }

    const handleSlotMouseMove = (e: MouseEvent) => {
      if (draggedFromPositionRef.current !== null && startPositionRef.current) {
        const deltaX = Math.abs(e.clientX - startPositionRef.current.x)
        const deltaY = Math.abs(e.clientY - startPositionRef.current.y)
        const dragThreshold = 5 // ピクセル

        // 閾値を超えたらドラッグ開始
        if (
          !isDraggingRef.current &&
          (deltaX > dragThreshold || deltaY > dragThreshold)
        ) {
          isDraggingRef.current = true
          setIsDragging(true)

          // ドラッグ画像を作成
          createDragImage(e.clientX, e.clientY)
        }

        // ドラッグ画像の位置を更新
        if (dragImageRef.current) {
          const offset = dragOffsetRef.current
          dragImageRef.current.style.left = `${e.clientX - offset.x}px`
          dragImageRef.current.style.top = `${e.clientY - offset.y}px`
        }

        // 禁止アイコンの位置も更新
        if (prohibitIconRef.current) {
          const offset = dragOffsetRef.current
          prohibitIconRef.current.style.left = `${e.clientX - offset.x}px`
          prohibitIconRef.current.style.top = `${e.clientY - offset.y}px`
        }

        // リアルタイムで移動可能性をチェック
        checkMoveValidityAtPosition(e.clientX, e.clientY)
      }
    }

    const handleSlotMouseUp = (e: MouseEvent) => {
      if (draggedFromPositionRef.current !== null) {
        // 実際にドラッグが開始されていた場合のみドロップ処理
        if (isDraggingRef.current) {
          // ドロップ対象を検索
          const elementUnderMouse = document.elementFromPoint(
            e.clientX,
            e.clientY
          )
          const dropTarget = elementUnderMouse?.closest(
            '[data-testid="team-slot"]'
          ) as HTMLElement

          if (dropTarget) {
            const targetPosition = parseInt(
              dropTarget.getAttribute('data-position') || '0'
            )

            if (targetPosition !== draggedFromPositionRef.current) {
              // チーム内でのキャラクター移動
              onCharacterMove(draggedFromPositionRef.current, targetPosition)
            }
          } else {
            // チーム外にドロップ = キャラクター削除
            onCharacterRemove(draggedFromPositionRef.current)
          }
        }
      }

      // ドラッグ画像と禁止アイコンを削除
      removeDragImage()
      removeProhibitIcon()

      // クリーンアップ
      setDraggedFromPosition(null)
      draggedFromPositionRef.current = null
      isDraggingRef.current = false
      setIsDragging(false)
      startPositionRef.current = null
      draggedCharacterRef.current = null
      document.removeEventListener('mousemove', handleSlotMouseMove)
      document.removeEventListener('mouseup', handleSlotMouseUp)
      document.removeEventListener('selectstart', preventSelection)
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.removeProperty('-ms-user-select')
      document.body.style.removeProperty('-moz-user-select')
      document.body.style.removeProperty('cursor')

      // cursor override styleを削除
      removeCursorOverride()
    }

    const preventSelection = (e: Event) => {
      e.preventDefault()
    }

    // ドラッグ画像を作成する関数
    const createDragImage = (mouseX: number, mouseY: number) => {
      if (!draggedCharacterRef.current || dragImageRef.current) return

      const offset = dragOffsetRef.current

      const dragImage = document.createElement('img')
      dragImage.src = draggedCharacterRef.current.imagePath || ''
      dragImage.alt = draggedCharacterRef.current.name
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

      // 掴んだ場所がマウス位置に来るように配置
      dragImage.style.left = `${mouseX - offset.x}px`
      dragImage.style.top = `${mouseY - offset.y}px`

      document.body.appendChild(dragImage)
      dragImageRef.current = dragImage
    }

    // ドラッグ画像を削除する関数
    const removeDragImage = () => {
      if (dragImageRef.current) {
        document.body.removeChild(dragImageRef.current)
        dragImageRef.current = null
      }
    }

    return (
      <div className={styles.container} data-testid="team-layout">
        {/* リーダースキル */}
        <div className={styles.leaderSkill}>
          <span className={styles.skillLabel}>リーダースキル</span>
          <div className={styles.skillText}>{getLeaderSkill().text}</div>
        </div>

        {/* フレンドスキル */}
        <div className={styles.friendSkill}>
          <span className={styles.skillLabel}>フレンドスキル</span>
          <div className={styles.skillText}>{getFriendSkill().text}</div>
        </div>

        {/* HP合計 */}
        <div className={styles.hpSection}>
          <span className={styles.hpLabel}>HP</span>
          <div className={styles.hpValue}>
            {(() => {
              const totalHP = teamSlots
                .filter(slot => slot.character?.stats)
                .reduce((sum, slot) => {
                  return sum + (slot.character?.stats?.potential_55.HP || 0)
                }, 0)
              return totalHP > 0 ? totalHP.toLocaleString() : '0'
            })()}
          </div>
        </div>

        {/* チーム編成枠 */}
        <div className={styles.teamSlots}>
          {teamSlots.map((slot, index) => (
            <TeamSlotComponent
              key={slot.position}
              slot={slot}
              index={index}
              draggedFromPosition={draggedFromPosition}
              isDragging={isDragging}
              teamSlots={teamSlots}
              onCharacterDrop={onCharacterDrop}
              onSlotClick={onSlotClick}
              onMouseDown={handleSlotMouseDown}
            />
          ))}
        </div>
      </div>
    )
  }
)

TeamLayout.displayName = 'TeamLayout'

export default TeamLayout
