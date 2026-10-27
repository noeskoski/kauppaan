import type { ShoppingItem } from '../database'

type ShoppingItemListProps = {
  items: ShoppingItem[]
  saving: boolean
  onToggle: (item: ShoppingItem) => void
  onRemove: (item: ShoppingItem) => void
}

function ItemIcon({
  name,
  size = 17,
}: {
  name: 'check' | 'trash'
  size?: number
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'check' ? (
        <path d="m5 12 4 4L19 6" />
      ) : (
        <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" />
      )}
    </svg>
  )
}

export default function ShoppingItemList({
  items,
  saving,
  onToggle,
  onRemove,
}: ShoppingItemListProps) {
  return (
    <ul className="item-list">
      {items.map((item) => (
        <li
          className={`shopping-item ${item.completed ? 'is-completed' : ''}`}
          key={item.id}
        >
          <button
            className="check-button"
            type="button"
            onClick={() => onToggle(item)}
            aria-label={`${item.completed ? 'Merkitse ostamattomaksi' : 'Merkitse ostetuksi'}: ${item.name}`}
            aria-pressed={item.completed}
            disabled={saving}
          >
            {item.completed && <ItemIcon name="check" size={15} />}
          </button>
          <span className="item-name">
            {item.name}
            {item.quantity > 1 && (
              <span className="item-quantity"> × {item.quantity}</span>
            )}
          </span>
          {item.completed && <span className="bought-label">OSTETTU</span>}
          <button
            className="remove-button"
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Poista ${item.name}`}
            disabled={saving}
          >
            <ItemIcon name="trash" />
          </button>
        </li>
      ))}
    </ul>
  )
}
