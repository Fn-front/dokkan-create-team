'use client'

import { useCallback } from 'react'
import styles from './styles.module.scss'
import TeamLayout from './components/TeamLayout'
import CharacterList from './components/CharacterList'
import { useTeam } from '@/functions/hooks/useTeam'
import type { Character } from '@/functions/types/team'

export default function HomePage() {
  const {
    addCharacterToSlot,
    removeCharacterFromSlot,
    moveCharacter,
    getAllSlots,
    canPlaceCharacter,
    team,
  } = useTeam()

  const handleCharacterDragStart = useCallback(() => {
    // ドラッグ開始時の処理（現在は何もしない）
  }, [])

  const handleCharacterDrop = useCallback(
    (character: Character, position: number) => {
      addCharacterToSlot(character, position)
    },
    [addCharacterToSlot]
  )

  const handleSlotClick = useCallback(
    (position: number) => {
      removeCharacterFromSlot(position)
    },
    [removeCharacterFromSlot]
  )

  const handleCharacterMove = useCallback(
    (fromPosition: number, toPosition: number) => {
      moveCharacter(fromPosition, toPosition)
    },
    [moveCharacter]
  )

  const canMoveCharacter = useCallback(
    (fromPosition: number, toPosition: number) => {
      if (fromPosition === toPosition) return false

      const allSlots = [team.leader, ...team.members, team.friend]
      const fromSlot = allSlots.find((slot) => slot.position === fromPosition)
      const toSlot = allSlots.find((slot) => slot.position === toPosition)

      if (!fromSlot?.character) return false

      // 移動先にキャラクターがいる場合は入れ替えを考慮
      if (toSlot?.character) {
        // 同じキャラクター同士の入れ替えは許可
        if (fromSlot.character.name === toSlot.character.name) {
          return true
        }

        // 異なるキャラクター同士の入れ替えの場合、両方向の制限をチェック
        // まず、fromSlotのキャラクターがtoPositionに移動可能かチェック
        const tempTeam1 = { ...team }
        if (fromPosition === 0) {
          tempTeam1.leader = { character: null, position: 0 }
        } else if (fromPosition === 6) {
          tempTeam1.friend = { character: null, position: 6 }
        } else {
          tempTeam1.members = tempTeam1.members.map((slot) =>
            slot.position === fromPosition
              ? { character: null, position: fromPosition }
              : slot
          )
        }

        const tempAllSlots1 = [
          tempTeam1.leader,
          ...tempTeam1.members,
          tempTeam1.friend,
        ]
        const existingSlot1 = tempAllSlots1.find(
          (slot) =>
            slot.character &&
            fromSlot.character &&
            slot.character.name === fromSlot.character.name
        )

        if (existingSlot1) {
          const existingPosition1 = existingSlot1.position
          if (existingPosition1 === 0 && toPosition !== 6) return false
          if (existingPosition1 === 6 && toPosition !== 0) return false
          if (existingPosition1 >= 1 && existingPosition1 <= 5) return false
        }

        // 次に、toSlotのキャラクターがfromPositionに移動可能かチェック
        const tempTeam2 = { ...team }
        if (toPosition === 0) {
          tempTeam2.leader = { character: null, position: 0 }
        } else if (toPosition === 6) {
          tempTeam2.friend = { character: null, position: 6 }
        } else {
          tempTeam2.members = tempTeam2.members.map((slot) =>
            slot.position === toPosition
              ? { character: null, position: toPosition }
              : slot
          )
        }

        const tempAllSlots2 = [
          tempTeam2.leader,
          ...tempTeam2.members,
          tempTeam2.friend,
        ]
        const existingSlot2 = tempAllSlots2.find(
          (slot) =>
            slot.character &&
            toSlot.character &&
            slot.character.name === toSlot.character.name
        )

        if (existingSlot2) {
          const existingPosition2 = existingSlot2.position
          if (existingPosition2 === 0 && fromPosition !== 6) return false
          if (existingPosition2 === 6 && fromPosition !== 0) return false
          if (existingPosition2 >= 1 && existingPosition2 <= 5) return false
        }

        return true
      } else {
        // 移動先が空の場合の制限チェック
        const tempTeam = { ...team }
        if (fromPosition === 0) {
          tempTeam.leader = { character: null, position: 0 }
        } else if (fromPosition === 6) {
          tempTeam.friend = { character: null, position: 6 }
        } else {
          tempTeam.members = tempTeam.members.map((slot) =>
            slot.position === fromPosition
              ? { character: null, position: fromPosition }
              : slot
          )
        }

        const tempAllSlots = [
          tempTeam.leader,
          ...tempTeam.members,
          tempTeam.friend,
        ]
        const existingSlot = tempAllSlots.find(
          (slot) =>
            slot.character &&
            fromSlot.character &&
            slot.character.name === fromSlot.character.name
        )

        if (existingSlot) {
          const existingPosition = existingSlot.position

          if (existingPosition === 0 && toPosition !== 6) return false
          if (existingPosition === 6 && toPosition !== 0) return false
          if (existingPosition >= 1 && existingPosition <= 5) return false
        }

        return true
      }
    },
    [team]
  )

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>ドッカンバトル チーム作成ツール</h1>
        <p className={styles.description}>最適なチーム編成を作成しましょう</p>

        <TeamLayout
          teamSlots={getAllSlots()}
          onCharacterDrop={handleCharacterDrop}
          onSlotClick={handleSlotClick}
          onCharacterRemove={removeCharacterFromSlot}
          onCharacterMove={handleCharacterMove}
          canMoveCharacter={canMoveCharacter}
        />
        <CharacterList
          onCharacterDragStart={handleCharacterDragStart}
          canPlaceCharacter={canPlaceCharacter}
        />
      </main>
    </div>
  )
}
