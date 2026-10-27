'use client'

import { useState, type FormEvent } from 'react'
import Icon from './Icon'

type AddItemFormProps = {
  disabled: boolean
  onAdd: (name: string, quantity: number) => Promise<boolean>
}

export default function AddItemForm({ disabled, onAdd }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const itemQuantity = Number(quantity)
  const validQuantity = Number.isInteger(itemQuantity) && itemQuantity >= 1

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const itemName = name.trim()
    if (!itemName || !validQuantity || disabled) return

    if (await onAdd(itemName, itemQuantity)) {
      setName('')
      setQuantity('1')
    }
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="new-item">
        Lisää ostoslistalle
      </label>
      <input
        id="new-item"
        type="text"
        maxLength={100}
        placeholder="Mitä tarvitset kaupasta?"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={disabled}
      />
      <label className="sr-only" htmlFor="item-quantity">
        Määrä
      </label>
      <input
        className="quantity-input"
        id="item-quantity"
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !name.trim() || !validQuantity}
      >
        <Icon name="plus" size={18} />
        <span>Lisää listalle</span>
      </button>
    </form>
  )
}
