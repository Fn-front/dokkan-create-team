import { memo, useRef, useEffect } from 'react'
import Image from 'next/image'
import styles from './style.module.scss'
import type { Character, TeamSlot } from '@/functions/types/team'
import { cn } from '@/lib/utils'
import { SwitchIcon, TransformIcon } from '@/components/icons'
import KiMeter from '@/components/KiMeter'
import {
  getLeaderSkillKiValue,
  getPassiveSkillKiValue,
} from '@/functions/utils/skillUtils'
import {
  getDisplayName,
  getImageUrl,
  getCharacterSkills,
  isReversibleCharacter,
  hasMultipleForms,
} from '@/functions/utils/characterUtils'
import { useTeamSlotStats } from './hooks/useTeamSlotStats'

type TeamSlotComponentProps = {
  slot: TeamSlot
  index: number
  draggedFromPosition: number | null
  isDragging: boolean
  teamSlots: TeamSlot[]
  onCharacterDrop: (character: Character, position: number) => void
  onSlotClick: (position: number) => void
  onMouseDown: (e: React.MouseEvent, slot: TeamSlot) => void
  toggleReversibleForm: (characterId: string) => void
  getReversibleFormIndex: (characterId: string) => number
  toggleForm: (characterId: string, maxFormIndex: number) => void
  getFormIndex: (characterId: string) => number
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
    toggleReversibleForm,
    getReversibleFormIndex,
    toggleForm,
    getFormIndex,
  }) => {
    const switchButtonClickedRef = useRef(false)
    const isLeader = index === 0
    const isFriend = index === 6
    const slotRef = useRef<HTMLDivElement>(null)

    // フォームインデックスを取得
    const isReversible = slot.character
      ? isReversibleCharacter(slot.character)
      : false
    const hasMultiple = slot.character
      ? hasMultipleForms(slot.character)
      : false
    let formIndex = 0
    if (slot.character) {
      if (isReversible) {
        formIndex = getReversibleFormIndex(slot.character.id)
      } else if (hasMultiple) {
        formIndex = getFormIndex(slot.character.id)
      }
    }

    // ステータス計算
    const { stats55, stats100, superAttackCount, statsAfterAction } =
      useTeamSlotStats(slot, formIndex, teamSlots)

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
          onClick={() => {
            if (switchButtonClickedRef.current) {
              return
            }
            onSlotClick(slot.position)
          }}
          onMouseDown={(e) => onMouseDown(e, slot)}
          data-testid="team-slot"
          data-position={slot.position}
          style={{
            pointerEvents: 'auto',
            ...(() => {
              const bodyHasGrabbingCursor =
                typeof document !== 'undefined' &&
                document.body.style.getPropertyValue('cursor') === 'grabbing'
              if (bodyHasGrabbingCursor) {
                return {}
              }

              if (draggedFromPosition === slot.position && isDragging) {
                return { cursor: 'grabbing' }
              }

              return { cursor: slot.character ? 'grab' : 'default' }
            })(),
          }}
        >
          <div className={styles.slotContent}>
            {slot.character ? (
              <>
                <Image
                  className={styles.characterImage}
                  src={getImageUrl(slot.character, formIndex)}
                  alt={getDisplayName(slot.character)}
                  width={100}
                  height={100}
                  key={formIndex}
                />
                {isReversible && (
                  <button
                    className={styles.switchButton}
                    onClickCapture={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      switchButtonClickedRef.current = true
                      toggleReversibleForm(slot.character!.id)
                      setTimeout(() => {
                        switchButtonClickedRef.current = false
                      }, 0)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    data-switch-button="true"
                    aria-label="フォーム切り替え"
                  >
                    <SwitchIcon className={styles.switchIcon} />
                  </button>
                )}
                {hasMultiple && (
                  <button
                    className={styles.transformButton}
                    onClickCapture={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      switchButtonClickedRef.current = true
                      toggleForm(
                        slot.character!.id,
                        slot.character!.forms!.length - 1
                      )
                      setTimeout(() => {
                        switchButtonClickedRef.current = false
                      }, 0)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    data-transform-button="true"
                    aria-label="変身"
                  >
                    <TransformIcon className={styles.transformIcon} />
                  </button>
                )}
                {(() => {
                  const skills = getCharacterSkills(slot.character, formIndex)
                  if (!skills) return null

                  const passiveKi = getPassiveSkillKiValue(skills)

                  if (isLeader || isFriend) {
                    const leaderSlot = teamSlots.find(
                      (s: TeamSlot) => s.position === 0
                    )
                    const friendSlot = teamSlots.find(
                      (s: TeamSlot) => s.position === 6
                    )

                    let leaderFormIndex = 0
                    if (leaderSlot?.character) {
                      const isLeaderReversible = isReversibleCharacter(
                        leaderSlot.character
                      )
                      const isLeaderMultiple = hasMultipleForms(
                        leaderSlot.character
                      )
                      if (isLeaderReversible) {
                        leaderFormIndex = getReversibleFormIndex(
                          leaderSlot.character.id
                        )
                      } else if (isLeaderMultiple) {
                        leaderFormIndex = getFormIndex(leaderSlot.character.id)
                      }
                    }

                    let friendFormIndex = 0
                    if (friendSlot?.character) {
                      const isFriendReversible = isReversibleCharacter(
                        friendSlot.character
                      )
                      const isFriendMultiple = hasMultipleForms(
                        friendSlot.character
                      )
                      if (isFriendReversible) {
                        friendFormIndex = getReversibleFormIndex(
                          friendSlot.character.id
                        )
                      } else if (isFriendMultiple) {
                        friendFormIndex = getFormIndex(friendSlot.character.id)
                      }
                    }

                    const leaderSkills = leaderSlot?.character
                      ? getCharacterSkills(
                          leaderSlot.character,
                          leaderFormIndex
                        )
                      : null
                    const friendSkills = friendSlot?.character
                      ? getCharacterSkills(
                          friendSlot.character,
                          friendFormIndex
                        )
                      : null
                    const leaderKi = leaderSkills
                      ? getLeaderSkillKiValue(leaderSkills)
                      : 0
                    const friendKi = friendSkills
                      ? getLeaderSkillKiValue(friendSkills)
                      : 0
                    return <KiMeter kiValue={leaderKi + friendKi + passiveKi} />
                  } else {
                    return <KiMeter kiValue={passiveKi} />
                  }
                })()}
              </>
            ) : null}
            {isLeader && <span className={styles.leaderBadge}>LEADER</span>}
            {isFriend && <span className={styles.friendBadge}>FRIEND</span>}
          </div>
        </div>
        {slot.character && (
          <div className={styles.characterStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>55%</span>
              <span className={styles.statValues}>
                {stats55
                  ? `${stats55.atk.toLocaleString()} / ${stats55.def.toLocaleString()}`
                  : '0 / 0'}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>100%</span>
              <span className={styles.statValues}>
                {stats100
                  ? `${stats100.atk.toLocaleString()} / ${stats100.def.toLocaleString()}`
                  : '0 / 0'}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>
                行動後（必殺{superAttackCount + 1}回）
              </span>
              <span className={styles.statValues}>
                {statsAfterAction
                  ? `${statsAfterAction.atk.toLocaleString()} / ${statsAfterAction.def.toLocaleString()}`
                  : '0 / 0'}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

TeamSlotComponent.displayName = 'TeamSlotComponent'

export default TeamSlotComponent
