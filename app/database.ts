export type ShoppingItem = {
  id: string
  name: string
  quantity: number
  completed: boolean
  createdAt: number
}

const DATABASE_NAME = 'kauppaan'
const STORE_NAME = 'items'

let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (!databasePromise) {
    const opening = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1)

      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () =>
        reject(request.error ?? new Error('Tietokantaa ei voitu avata.'))
      request.onblocked = () =>
        reject(new Error('Tietokannan avaus estyi toisessa välilehdessä.'))
    })
    const pending = opening.catch((error: unknown) => {
      databasePromise = undefined
      throw error
    })
    databasePromise = pending
    return pending
  }

  return databasePromise
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Tietokantatapahtuma epäonnistui.'))
    transaction.onabort = () =>
      reject(
        transaction.error ?? new Error('Tietokantatapahtuma keskeytettiin.')
      )
  })
}

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readonly')
  const done = transactionComplete(transaction)
  const request = transaction.objectStore(STORE_NAME).getAll()
  const results = new Promise<ShoppingItem[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as ShoppingItem[])
    request.onerror = () =>
      reject(request.error ?? new Error('Ostoslistaa ei voitu lukea.'))
  })

  const [items] = await Promise.all([results, done])
  return items
    .map((item) => ({ ...item, quantity: item.quantity ?? 1 }))
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function addShoppingItem(item: ShoppingItem): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const done = transactionComplete(transaction)
  transaction.objectStore(STORE_NAME).add(item)
  await done
}

export async function updateShoppingItem(item: ShoppingItem): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const done = transactionComplete(transaction)
  transaction.objectStore(STORE_NAME).put(item)
  await done
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const done = transactionComplete(transaction)
  transaction.objectStore(STORE_NAME).delete(id)
  await done
}

export async function deleteCompletedItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  const done = transactionComplete(transaction)
  const store = transaction.objectStore(STORE_NAME)
  ids.forEach((id) => store.delete(id))
  await done
}
