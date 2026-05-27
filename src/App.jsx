import { useState } from 'react';

const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const press = (button) => {
    if (button === '=') {
      try {
        setValue(String(Function(`"use strict"; return (${value || 0})`)()));
      } catch {
        setValue('Error');
      }
      return;
    }

    setValue((current) => (current === 'Error' ? button : current + button));
  };

  return (
    <main style={{ display: 'flex', gap: 12 }}>
      <button>almost!</button>
      <button onClick={() => setIsOpen(true)}>yoo</button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calculator"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          <div style={{ width: 220, padding: 16, background: 'white', borderRadius: 8 }}>
            <input value={value} readOnly aria-label="Calculator display" style={{ width: '100%', marginBottom: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {buttons.map((button) => (
                <button key={button} onClick={() => press(button)}>
                  {button}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={() => setValue('')}>Clear</button>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
