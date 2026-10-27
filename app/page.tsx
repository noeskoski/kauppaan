'use client'

import { useEffect, useState } from 'react'
import {
  addShoppingItem,
  deleteCompletedItems,
  deleteShoppingItem,
  getShoppingItems,
  type ShoppingItem,
  updateShoppingItem,
} from './database'
import ShoppingItemList from './components/ShoppingItemList'
import AddItemForm from './components/AddItemForm'
import Icon from './components/Icon'
import TopBar from './components/TopBar'
import Intro from './components/Intro'
import Footer from './components/Footer'

type ListFilter = 'all' | 'active' | 'completed'

function formatError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Tallennuksessa tapahtui odottamaton virhe.'
}

export default function Home() {
  const [databaseReady, setDatabaseReady] = useState(false)
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [filter, setFilter] = useState<ListFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadItems() {
      try {
        const storedItems = await getShoppingItems()

        if (active) {
          setDatabaseReady(true)
          setItems(storedItems)
        }
      } catch (loadError) {
        if (active) setError(formatError(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadItems()
    return () => {
      active = false
    }
  }, [])

  const remaining = items.filter((item) => !item.completed).length
  const completed = items.length - remaining
  const visibleItems = items.filter((item) => {
    if (filter === 'active') return !item.completed
    if (filter === 'completed') return item.completed
    return true
  })

  async function addItem(name: string, quantity: number): Promise<boolean> {
    if (!databaseReady || saving) return false

    const item: ShoppingItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      completed: false,
      createdAt: Date.now(),
    }

    setSaving(true)
    setError('')
    try {
      await addShoppingItem(item)
      setItems((current) => [...current, item])
      return true
    } catch (writeError) {
      setError(formatError(writeError))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function toggleItem(item: ShoppingItem) {
    if (!databaseReady || saving) return
    const updated = { ...item, completed: !item.completed }
    setSaving(true)
    setError('')
    try {
      await updateShoppingItem(updated)
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? updated : entry))
      )
    } catch (writeError) {
      setError(formatError(writeError))
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(item: ShoppingItem) {
    if (!databaseReady || saving) return
    setSaving(true)
    setError('')
    try {
      await deleteShoppingItem(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
    } catch (writeError) {
      setError(formatError(writeError))
    } finally {
      setSaving(false)
    }
  }

  async function clearCompleted() {
    if (!databaseReady || saving || completed === 0) return
    setSaving(true)
    setError('')
    try {
      await deleteCompletedItems(
        items.filter((item) => item.completed).map((item) => item.id)
      )
      setItems((current) => current.filter((item) => !item.completed))
    } catch (writeError) {
      setError(formatError(writeError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="app-shell">
      <TopBar loading={loading} error={error} />
      <Intro />

      <section className="list-card" aria-labelledby="list-title">
        <div className="list-heading">
          <div>
            <span className="section-label">OSTOSLISTA</span>
            <h2 id="list-title">Tämän reissun ostokset</h2>
          </div>
          <div className="item-count" aria-live="polite">
            <strong>{remaining}</strong>
            <span>{remaining === 1 ? 'tuote' : 'tuotetta'} jäljellä</span>
          </div>
        </div>

        <AddItemForm
          disabled={loading || !databaseReady || saving}
          onAdd={addItem}
        />

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="list-toolbar">
          <div
            className="filter-tabs"
            role="group"
            aria-label="Suodata ostoksia"
          >
            {(
              [
                ['all', 'Kaikki', items.length],
                ['active', 'Ostettavat', remaining],
                ['completed', 'Ostetut', completed],
              ] as const
            ).map(([key, label, count]) => (
              <button
                className={`filter-tab ${filter === key ? 'is-active' : ''}`}
                key={key}
                onClick={() => setFilter(key)}
                type="button"
                aria-pressed={filter === key}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
          {completed > 0 && (
            <button
              className="clear-button"
              onClick={clearCompleted}
              type="button"
              disabled={saving}
            >
              Tyhjennä ostetut
            </button>
          )}
        </div>

        <div className="shopping-list" aria-live="polite">
          {loading ? (
            <div className="empty-state">
              <span className="empty-icon loading-icon">
                <Icon name="bag" size={24} />
              </span>
              <strong>Avataan ostoslistaa...</strong>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name={items.length === 0 ? 'bag' : 'check'} size={24} />
              </span>
              <strong>
                {items.length === 0
                  ? 'Lista odottaa ensimmäistä ostostasi'
                  : filter === 'active'
                    ? 'Kaikki ostokset on hoidettu!'
                    : 'Ei ostettuja tuotteita vielä'}
              </strong>
              <span>
                {items.length === 0
                  ? 'Kirjoita tuote yllä olevaan kenttään.'
                  : filter === 'active'
                    ? 'Hienosti tehty. Kauppareissu on valmis.'
                    : 'Merkitse tuote ostetuksi, niin se näkyy täällä.'}
              </span>
            </div>
          ) : (
            <ShoppingItemList
              items={visibleItems}
              saving={saving}
              onToggle={(item) => void toggleItem(item)}
              onRemove={(item) => void removeItem(item)}
            />
          )}
        </div>

        <footer className="list-footer">
          <span>
            <span className="footer-spark">✳</span> Yksinkertaista, niin muistat
            paremmin.
          </span>
          {items.length > 0 && (
            <span>
              {completed} / {items.length} valmiina
            </span>
          )}
        </footer>
      </section>

      <Footer />
    </main>
  )
}
