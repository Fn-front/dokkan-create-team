import { useState, useRef, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Character, TeamSlot } from '@/functions/types/team'
import { ProhibitIcon } from '@/components/icons'
import { getDisplayName, getImageUrl } from '@/functions/utils/characterUtils'

type UseTeamDragDropProps = {
  onCharacterMove: (fromPosition: number, toPosition: number) => void
  onCharacterRemove: (position: number) => void
  canMoveCharacter?: (fromPosition: number, toPosition: number) => boolean
}

export const useTeamDragDrop = ({
  onCharacterMove,
  onCharacterRemove,
  canMoveCharacter,
}: UseTeamDragDropProps) => {
  const [draggedFromPosition, setDraggedFromPosition] = useState<number | null>(
    null
  )
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
    if (!draggedCharacterRef.current || draggedFromPositionRef.current === null)
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

    dragOffsetRef.current = offset
    draggedCharacterRef.current = slot.character

    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.setProperty('-ms-user-select', 'none')
    document.body.style.setProperty('-moz-user-select', 'none')

    document.body.style.setProperty('cursor', 'grabbing', 'important')
    removeCursorOverride()
    const style = document.createElement('style')
    style.id = 'team-drag-cursor-override'
    style.textContent = '* { cursor: grabbing !important; }'
    document.head.appendChild(style)

    document.addEventListener('mousemove', handleSlotMouseMove)
    document.addEventListener('mouseup', handleSlotMouseUp)
    document.addEventListener('selectstart', preventSelection)
  }

  const handleSlotMouseMove = (e: MouseEvent) => {
    if (draggedFromPositionRef.current !== null && startPositionRef.current) {
      const deltaX = Math.abs(e.clientX - startPositionRef.current.x)
      const deltaY = Math.abs(e.clientY - startPositionRef.current.y)
      const dragThreshold = 5

      if (
        !isDraggingRef.current &&
        (deltaX > dragThreshold || deltaY > dragThreshold)
      ) {
        isDraggingRef.current = true
        setIsDragging(true)

        createDragImage(e.clientX, e.clientY)
      }

      if (dragImageRef.current) {
        const offset = dragOffsetRef.current
        dragImageRef.current.style.left = `${e.clientX - offset.x}px`
        dragImageRef.current.style.top = `${e.clientY - offset.y}px`
      }

      if (prohibitIconRef.current) {
        const offset = dragOffsetRef.current
        prohibitIconRef.current.style.left = `${e.clientX - offset.x}px`
        prohibitIconRef.current.style.top = `${e.clientY - offset.y}px`
      }

      checkMoveValidityAtPosition(e.clientX, e.clientY)
    }
  }

  const handleSlotMouseUp = (e: MouseEvent) => {
    if (draggedFromPositionRef.current !== null) {
      if (isDraggingRef.current) {
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
            onCharacterMove(draggedFromPositionRef.current, targetPosition)
          }
        } else {
          onCharacterRemove(draggedFromPositionRef.current)
        }
      }
    }

    removeDragImage()
    removeProhibitIcon()

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
    dragImage.src = getImageUrl(draggedCharacterRef.current)
    dragImage.alt = getDisplayName(draggedCharacterRef.current)
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

  return {
    draggedFromPosition,
    isDragging,
    handleSlotMouseDown,
  }
}
