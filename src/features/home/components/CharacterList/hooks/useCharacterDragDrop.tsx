import { useState, useRef, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Character } from '@/functions/types/team'
import { ProhibitIcon } from '@/components/icons'
import { getDisplayName, getImageUrl } from '@/functions/utils/characterUtils'

type UseCharacterDragDropProps = {
  onCharacterDragStart: (character: Character) => void
  canPlaceCharacter: (character: Character, position: number) => boolean
}

export const useCharacterDragDrop = ({
  onCharacterDragStart,
  canPlaceCharacter,
}: UseCharacterDragDropProps) => {
  const [isDragging, setIsDragging] = useState(false)
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

  // 指定位置での配置可能性をチェックし、禁止アイコンの表示を制御
  const checkDropValidityAtPosition = (mouseX: number, mouseY: number) => {
    if (!dragCharacterRef.current) return

    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY)
    const dropTarget = elementUnderMouse?.closest(
      '[data-testid="team-slot"]'
    ) as HTMLElement

    if (dropTarget) {
      const position = parseInt(dropTarget.getAttribute('data-position') || '0')
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

        removeCursorOverride()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMouseDown = (e: React.MouseEvent, character: Character) => {
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      originalWidth: rect.width,
      originalHeight: rect.height,
    }

    dragOffsetRef.current = offset
    dragCharacterRef.current = character
    onCharacterDragStart(character)

    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.setProperty('-ms-user-select', 'none')
    document.body.style.setProperty('-moz-user-select', 'none')

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectstart', preventSelection)
  }

  const preventSelection = (e: Event) => {
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragCharacterRef.current) {
      if (!isDragging) {
        setIsDragging(true)

        document.body.style.setProperty('cursor', 'grabbing', 'important')
        removeCursorOverride()
        const style = document.createElement('style')
        style.id = 'drag-cursor-override'
        style.textContent = '* { cursor: grabbing !important; }'
        document.head.appendChild(style)

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

      checkDropValidityAtPosition(e.clientX, e.clientY)
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (dragCharacterRef.current) {
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
      const dropTarget = elementUnderMouse?.closest(
        '[data-testid="team-slot"]'
      ) as HTMLElement

      if (dropTarget) {
        const position = parseInt(
          dropTarget.getAttribute('data-position') || '0'
        )

        if (canPlaceCharacter(dragCharacterRef.current, position)) {
          const dropEvent = new CustomEvent('character-drop', {
            detail: { character: dragCharacterRef.current, position },
          })
          dropTarget.dispatchEvent(dropEvent)
        }
      }
    }

    removeDragImage()
    removeProhibitIcon()

    setIsDragging(false)
    dragCharacterRef.current = null

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('selectstart', preventSelection)

    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
    document.body.style.removeProperty('-ms-user-select')
    document.body.style.removeProperty('-moz-user-select')
    document.body.style.cursor = ''

    removeCursorOverride()
  }

  const removeDragImage = () => {
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current)
      dragImageRef.current = null
    }
  }

  const showProhibitIcon = () => {
    if (!prohibitIconRef.current) {
      createProhibitIcon()
    }
    if (prohibitIconRef.current) {
      prohibitIconRef.current.style.display = 'flex'
    }
  }

  const hideProhibitIcon = () => {
    if (prohibitIconRef.current) {
      prohibitIconRef.current.style.display = 'none'
    }
  }

  const removeProhibitIcon = () => {
    if (prohibitIconRef.current && prohibitIconRootRef.current) {
      prohibitIconRootRef.current.unmount()
      document.body.removeChild(prohibitIconRef.current)
      prohibitIconRef.current = null
      prohibitIconRootRef.current = null
    }
  }

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

  const createDragImage = (mouseX: number, mouseY: number) => {
    if (!dragCharacterRef.current || dragImageRef.current) return

    const offset = dragOffsetRef.current

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

    dragImage.style.left = `${mouseX - offset.x}px`
    dragImage.style.top = `${mouseY - offset.y}px`

    document.body.appendChild(dragImage)
    dragImageRef.current = dragImage
  }

  return {
    handleMouseDown,
  }
}
