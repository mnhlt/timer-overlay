import { useState, useEffect } from 'react'

interface HotkeySelectorProps {
  onChange?: (hotkey: string) => void
}

const modifierKeys = ['Control', 'Alt', 'Shift', 'Command', 'Option']
const letterKeys = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
const functionKeys = Array.from({ length: 12 }, (_, i) => `F${i + 1}`)
const numberKeys = Array.from('0123456789')
const mouseButtons = [
  { value: 'LEFT', label: 'Left Click' },
  { value: 'RIGHT', label: 'Right Click' },
  { value: 'MIDDLE', label: 'Middle Click' },
  { value: 'BUTTON4', label: 'Mouse Button 4 (Back)' },
  { value: 'BUTTON5', label: 'Mouse Button 5 (Forward)' }
]

const allKeys = [...letterKeys, ...functionKeys, ...numberKeys]

export function HotkeySelector({ onChange }: HotkeySelectorProps) {
  const [triggerType, setTriggerType] = useState<'keyboard' | 'mouse'>('keyboard')
  const [firstKey, setFirstKey] = useState('Control')
  const [secondKey, setSecondKey] = useState('Shift')
  const [thirdKey, setThirdKey] = useState('T')
  const [mouseButton, setMouseButton] = useState('LEFT')

  useEffect(() => {
    if (triggerType === 'keyboard') {
      // Build hotkey string based on selected keys
      const parts = []
      if (firstKey !== '') parts.push(firstKey)
      if (secondKey !== '') parts.push(secondKey)
      parts.push(thirdKey)
      
      const hotkey = parts.join('+')
      onChange?.(hotkey)
      window.electronAPI.updateTrigger('keyboard', hotkey)
    } else {
      // Send mouse button selection
      onChange?.(mouseButton)
      window.electronAPI.updateTrigger('mouse', mouseButton)
    }
  }, [triggerType, firstKey, secondKey, thirdKey, mouseButton, onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Trigger Type:</label>
        <select
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value as 'keyboard' | 'mouse')}
          style={{ padding: '0.5rem' }}
        >
          <option value="keyboard">Keyboard Shortcut</option>
          <option value="mouse">Mouse Button</option>
        </select>
      </div>

      {triggerType === 'keyboard' ? (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ marginRight: '0.5rem' }}>Modifier Keys (Optional):</label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <select
              value={firstKey}
              onChange={(e) => setFirstKey(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="">None</option>
              {modifierKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {firstKey && <span>+</span>}
            <select
              value={secondKey}
              onChange={(e) => setSecondKey(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="">None</option>
              {modifierKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {secondKey && <span>+</span>}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ marginRight: '0.5rem' }}>Trigger Key:</label>
            <select
              value={thirdKey}
              onChange={(e) => setThirdKey(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              {allKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Note: Single key shortcuts will work but may interfere with typing. Consider using at least one modifier key.
          </div>
        </>
      ) : (
        <div>
          <label style={{ marginRight: '0.5rem' }}>Mouse Button:</label>
          <select
            value={mouseButton}
            onChange={(e) => setMouseButton(e.target.value)}
            style={{ padding: '0.5rem', minWidth: '200px' }}
          >
            {mouseButtons.map((button) => (
              <option key={button.value} value={button.value}>
                {button.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
} 