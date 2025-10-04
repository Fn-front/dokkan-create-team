import { useCallback, useState } from 'react'
import type { Character, Team, TeamSlot } from '../types/team'

const createEmptySlot = (position: number): TeamSlot => ({
  character: null,
  position,
})

const initialTeam: Team = {
  leader: createEmptySlot(0),
  members: Array.from({ length: 5 }, (_, index) => createEmptySlot(index + 1)),
  friend: createEmptySlot(6),
}

export const useTeam = () => {
  const [team, setTeam] = useState<Team>(initialTeam)

  // キャラクターが配置可能かチェックする関数
  const canPlaceCharacter = useCallback(
    (character: Character, targetPosition: number) => {
      const allSlots = [team.leader, ...team.members, team.friend]

      // 同じキャラクターが既に配置されているスロットを検索
      const existingSlot = allSlots.find(
        (slot) => slot.character && slot.character.name === character.name
      )

      // 同じキャラクターが配置されていない場合は配置可能
      if (!existingSlot) {
        return true
      }

      // 既に配置されている場合の制限ルール
      const existingPosition = existingSlot.position

      // リーダー(0)に配置済みの場合、フレンド(6)にのみ配置可能
      if (existingPosition === 0) {
        return targetPosition === 6
      }

      // フレンド(6)に配置済みの場合、リーダー(0)にのみ配置可能
      if (existingPosition === 6) {
        return targetPosition === 0
      }

      // メンバー(1-5)に配置済みの場合、どこにも配置不可
      return false
    },
    [team]
  )

  const addCharacterToSlot = useCallback(
    (character: Character, position: number) => {
      // 配置可能かチェック
      if (!canPlaceCharacter(character, position)) {
        return false // 配置失敗を示すfalseを返す
      }

      setTeam((prevTeam) => {
        const newTeam = { ...prevTeam }

        if (position === 0) {
          newTeam.leader = { character, position }
        } else if (position === 6) {
          newTeam.friend = { character, position }
        } else {
          newTeam.members = newTeam.members.map((slot) =>
            slot.position === position ? { character, position } : slot
          )
        }

        return newTeam
      })

      return true // 配置成功を示すtrueを返す
    },
    [canPlaceCharacter]
  )

  const removeCharacterFromSlot = useCallback((position: number) => {
    setTeam((prevTeam) => {
      const newTeam = { ...prevTeam }

      if (position === 0) {
        newTeam.leader = createEmptySlot(0)
      } else if (position === 6) {
        newTeam.friend = createEmptySlot(6)
      } else {
        newTeam.members = newTeam.members.map((slot) =>
          slot.position === position ? createEmptySlot(position) : slot
        )
      }

      return newTeam
    })
  }, [])

  const moveCharacter = useCallback(
    (fromPosition: number, toPosition: number) => {
      if (fromPosition === toPosition) return false

      setTeam((prevTeam) => {
        // 現在の状態から移動元と移動先のキャラクターを取得
        const allSlots = [prevTeam.leader, ...prevTeam.members, prevTeam.friend]
        const fromSlot = allSlots.find((slot) => slot.position === fromPosition)
        const toSlot = allSlots.find((slot) => slot.position === toPosition)

        if (!fromSlot?.character) return prevTeam

        // 移動の制限チェック（一時的にfromSlotを空にした状態でチェック）
        const tempTeam = { ...prevTeam }
        if (fromPosition === 0) {
          tempTeam.leader = createEmptySlot(0)
        } else if (fromPosition === 6) {
          tempTeam.friend = createEmptySlot(6)
        } else {
          tempTeam.members = tempTeam.members.map((slot) =>
            slot.position === fromPosition
              ? createEmptySlot(fromPosition)
              : slot
          )
        }

        // 一時的な状態でcanPlaceCharacterをチェック
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

        // 移動先での制限チェック
        if (existingSlot) {
          const existingPosition = existingSlot.position

          // リーダー(0)に配置済みの場合、フレンド(6)にのみ配置可能
          if (existingPosition === 0 && toPosition !== 6) {
            return prevTeam
          }

          // フレンド(6)に配置済みの場合、リーダー(0)にのみ配置可能
          if (existingPosition === 6 && toPosition !== 0) {
            return prevTeam
          }

          // メンバー(1-5)に配置済みの場合、どこにも配置不可
          if (existingPosition >= 1 && existingPosition <= 5) {
            return prevTeam
          }
        }

        const newTeam = { ...prevTeam }

        // 移動先が空の場合は単純移動
        if (!toSlot?.character) {
          // 移動元をクリア
          if (fromPosition === 0) {
            newTeam.leader = createEmptySlot(0)
          } else if (fromPosition === 6) {
            newTeam.friend = createEmptySlot(6)
          } else {
            newTeam.members = newTeam.members.map((slot) =>
              slot.position === fromPosition
                ? createEmptySlot(fromPosition)
                : slot
            )
          }

          // 移動先に配置
          if (toPosition === 0) {
            newTeam.leader = { character: fromSlot.character, position: 0 }
          } else if (toPosition === 6) {
            newTeam.friend = { character: fromSlot.character, position: 6 }
          } else {
            newTeam.members = newTeam.members.map((slot) =>
              slot.position === toPosition
                ? { character: fromSlot.character, position: toPosition }
                : slot
            )
          }
        } else {
          // 移動先にキャラクターがいる場合は入れ替え
          const fromCharacter = fromSlot.character
          const toCharacter = toSlot.character

          // 移動元に移動先のキャラクターを配置
          if (fromPosition === 0) {
            newTeam.leader = { character: toCharacter, position: 0 }
          } else if (fromPosition === 6) {
            newTeam.friend = { character: toCharacter, position: 6 }
          } else {
            newTeam.members = newTeam.members.map((slot) =>
              slot.position === fromPosition
                ? { character: toCharacter, position: fromPosition }
                : slot
            )
          }

          // 移動先に移動元のキャラクターを配置
          if (toPosition === 0) {
            newTeam.leader = { character: fromCharacter, position: 0 }
          } else if (toPosition === 6) {
            newTeam.friend = { character: fromCharacter, position: 6 }
          } else {
            newTeam.members = newTeam.members.map((slot) =>
              slot.position === toPosition
                ? { character: fromCharacter, position: toPosition }
                : slot
            )
          }
        }

        return newTeam
      })

      return true
    },
    []
  )

  const getAllSlots = useCallback(() => {
    return [team.leader, ...team.members, team.friend]
  }, [team])

  const getSlotByPosition = useCallback(
    (position: number) => {
      if (position === 0) return team.leader
      if (position === 6) return team.friend
      return team.members.find((slot) => slot.position === position) || null
    },
    [team]
  )

  return {
    team,
    addCharacterToSlot,
    removeCharacterFromSlot,
    moveCharacter,
    getAllSlots,
    getSlotByPosition,
    canPlaceCharacter,
  }
}
