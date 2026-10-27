import Icon from './Icon'

export default function Intro() {
  return (
    <section className="intro" aria-labelledby="page-title">
      <div className="intro-copy">
        <span className="eyebrow">
          <Icon name="spark" size={15} /> PIENI APU KAUPPAREISSULLE
        </span>
        <h1 id="page-title">
          Muista kaikki.
          <br />
          <span>Osta vain tarpeellinen.</span>
        </h1>
        <p>Kaikki ostokset yhdessä paikassa, aina käden ulottuvilla.</p>
      </div>
      <div className="intro-illustration" aria-hidden="true">
        <span className="illustration-sun" />
        <span className="illustration-leaf leaf-one" />
        <span className="illustration-leaf leaf-two" />
        <span className="illustration-bag">
          <Icon name="bag" size={76} />
        </span>
        <span className="illustration-fruit fruit-one" />
        <span className="illustration-fruit fruit-two" />
      </div>
    </section>
  )
}
