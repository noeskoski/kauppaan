import Icon from './Icon'

type TopBarProps = {
  loading: boolean
  error: string
}

export default function TopBar({ loading, error }: TopBarProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="Kauppaan etusivu">
        <span className="brand-mark">
          <Icon name="bag" size={21} />
        </span>
        <span>
          kauppaan<span className="brand-period">.</span>
        </span>
      </a>
      <div className="storage-status">
        <span
          className={`status-dot ${loading ? 'is-loading' : error ? 'has-error' : ''}`}
        />
        {loading
          ? 'Avataan listaa'
          : error
            ? 'Tallennus ei käytössä'
            : 'Tallentuu laitteellesi'}
      </div>
    </header>
  )
}
