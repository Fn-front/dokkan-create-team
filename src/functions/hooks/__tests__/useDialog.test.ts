import { renderHook, act } from '@testing-library/react'
import { useDialog } from '../useDialog'

describe('useDialog', () => {
  it('初期状態でopenがfalseである', () => {
    const { result } = renderHook(() => useDialog())
    expect(result.current.open).toBe(false)
  })

  it('openDialogを呼ぶとopenがtrueになる', () => {
    const { result } = renderHook(() => useDialog())

    act(() => {
      result.current.openDialog()
    })

    expect(result.current.open).toBe(true)
  })

  it('closeDialogを呼ぶとopenがfalseになる', () => {
    const { result } = renderHook(() => useDialog())

    act(() => {
      result.current.openDialog()
    })
    expect(result.current.open).toBe(true)

    act(() => {
      result.current.closeDialog()
    })
    expect(result.current.open).toBe(false)
  })

  it('toggleDialogを呼ぶとopenが反転する', () => {
    const { result } = renderHook(() => useDialog())

    expect(result.current.open).toBe(false)

    act(() => {
      result.current.toggleDialog()
    })
    expect(result.current.open).toBe(true)

    act(() => {
      result.current.toggleDialog()
    })
    expect(result.current.open).toBe(false)
  })

  it('setOpenで直接openの値を設定できる', () => {
    const { result } = renderHook(() => useDialog())

    act(() => {
      result.current.setOpen(true)
    })
    expect(result.current.open).toBe(true)

    act(() => {
      result.current.setOpen(false)
    })
    expect(result.current.open).toBe(false)
  })
})
