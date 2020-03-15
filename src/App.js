import React, { useState, useEffect, useRef, useMemo } from "react"
import serializeForm from "form-serialize"
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link
} from "react-router-dom"
import { useTranslation, Trans } from 'react-i18next';

function App() {
  let [persons, setPersons] = useState(4)
  let doFocusRef = useRef(false)
  let focusRef = useRef()
  let formRef = useRef()
  let navigate = useNavigate()

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (doFocusRef.current === false) {
      doFocusRef.current = true
    } else {
      focusRef.current.focus()
    }
  }, [persons])

  function handleSubmit(event) {
    event.preventDefault()
    let values = serializeForm(event.target, { hash: true }).ages.filter(
      v => v !== "UNSET"
    )
    navigate(`infected/?ages=${values.map(v => v)}`)
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t('title')}</h1>
        <p>{t('intro')}</p>
      </div>
      <hr />
      <form id="HouseHoldForm" ref={formRef} onSubmit={handleSubmit}>
        {Array.from({ length: persons }).map((_, index, arr) => (
          <label
            key={index}
            ref={arr.length - 1 === index ? focusRef : undefined}
          >
            <span>
              {index === 0 ? t('form.your-age') : t('form.household-member', {index: index})}:
            </span>{" "}
            <AgeSelect defaultValue={index < 2 ? 40 : undefined} />
          </label>
        ))}
        <button type="button" onClick={() => setPersons(persons + 1)}>
          {t('form.add-another')}
        </button>
        <button type="submit">{t('form.next')}</button>
      </form>
    </div>
  )
}

function AgeSelect(props) {
  const { t } = useTranslation();
  return (
    <select name="ages" {...props}>
      <option value="UNSET">{t('form.set-age')}</option>
      {Array.from({ length: 100 }).map((_, index) => (
        <option key={index}>{index}</option>
      ))}
    </select>
  )
}

////////////////////////////////////////////////////////////////////////////////
function Infection() {
  const { t } = useTranslation();

  let location = useLocation()
  let navigate = useNavigate()
  let ages = parseAges(location.search)
  if (ages === null) {
    setTimeout(() => navigate("/"), [])
    return null
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t('infected.title')}</h1>
        <p>{t('infected.paragraph1')}</p>
      </div>
      <div id="DiceRolls" className="center">
        {ages.map((age, index) => (
          <DiceRoll key={index} age={age} />
        ))}
      </div>
      <p>{t('infected.paragraph2')}</p>
      <Link className="big-link" to={`/killers${location.search}`}>{t('infected.kill-count')}</Link>

      <hr />
      <h2>{t('infected.more-info')}</h2>
      <p>
        <Trans i18nKey="infected.paragraph3">
          Unless you're over 60, or are immuno-comprimised{" "} <i>(lots of your friends and family are!)</i> you're going to have to click the button a lot before you die.
        </Trans>
      </p>
      {/*TODO: italic formatting in parahraph3*/}
      <p>{t('infected.paragraph4')}</p>
      <p>
        <Trans i18nKey="infected.paragraph5">
          Not quite. People have been quoting how many deaths per year there are for the flu (<a href="https://www.cdc.gov/flu/about/burden/index.html#:~:text="> 12,000 to 61,000 </a>) to the deaths so far with coronavirus (<a href="https://www.cnn.com/interactive/2020/health/coronavirus-maps-and-cases/">~50</a>) in the US.
        </Trans>
      </p>
      <p>{t('infected.paragraph6')}</p>
      <ul>
        <li>{t('infected.fatality-rate')}</li>
        <li>{t('infected.infection-growth-rate')}</li>
      </ul>
      <p>
        <Trans i18nKey="infected.paragraph7">
          The flu has a general fatality rate of 0.1%<br />COVID-19's fatality rate right now is 3.4%
        </Trans>
      </p>
      <p>
        <Trans i18nKey="infected.paragraph8">
          <a href="https://www.sciencealert.com/covid-19-s-death-rate-is-higher-than-thought-but-it-should-drop">That's 34x</a>. The red bar here is 34 times bigger.
        </Trans>
      </p>

      <div className="bars">
        <div className="bar covid">
          <span className="padding-adjust">{t('infected.covid-19')}</span>
        </div>
        <div className="bar flu">
          <span className="padding-adjust">{t('infected.influenza')}</span>
        </div>
      </div>
      <p>
        <Trans i18nKey="infected.paragraph9">
          It's easy to tell this virus is worse even without all the data, <b>the flu doesn't completely overwhelm the health care system</b> in Italy each year, but <a href="https://www.theatlantic.com/ideas/archive/2020/03/who-gets-hospital-bed/607807/">that's exactly what coronavirus has done</a>.
        </Trans>
      </p>
      <p>{t('infected.paragraph10')}</p>
      <p>{t('infected.paragraph11')}</p>
    </div>
  )
}

// https://www.worldometers.info/coronavirus/coronavirus-age-sex-demographics/
let rates = [
  [9, 0],
  [19, 0.002],
  [29, 0.002],
  [39, 0.002],
  [49, 0.004],
  [59, 0.013],
  [69, 0.036],
  [79, 0.08],
  [79, 0.148]
]

function DiceRoll({ age }) {
  let [state, setState] = useState("alive") // alive, dead, rolling
  let [rolls, setRolls] = useState(0)

  let rate = useMemo(() => {
    let rate
    for (let [maxAge, ageRate] of rates) {
      rate = ageRate
      if (age < maxAge) break
    }
    return rate
  }, [age])

  function rollDice() {
    setRolls(rolls + 1)
    setState("rolling")
  }

  useEffect(() => {
    if (state === "rolling") {
      let timer = setTimeout(() => {
        let rando = Math.random()
        if (rando <= rate) {
          setState("dead")
        } else {
          setState("alive")
        }
      }, 200)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [state, rate])

  return (
    <div className="DiceRoll" data-state={state}>
      <div>
        <span aria-label={state} role="img">
          {state === "dead"
            ? "💀"
            : state === "alive"
            ? "😅"
            : state === "rolling"
            ? "🤮"
            : null}
        </span>{" "}
        <span>
          <b>{age} year old</b>
          <br />
          Fatality Rate: {(rate * 100).toFixed(1)}%
        </span>
      </div>
      <div>
        <button disabled={state === "dead"} onClick={rollDice}>
          Roll the dice
        </button>{" "}
        <span>Rolls: {rolls}</span>
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////////////////////////
function KillCount({ ages }) {
  const { t } = useTranslation();
  let [infected, setInfected] = useState(1)
  let [weeks, setWeeks] = useState(1)
  let rate = 0.034
  let Ro = 2

  let killed = Math.round(infected * rate)

  function nextWeek() {
    setInfected(infected * Ro)
    setWeeks(weeks + 1)
  }

  return (
    <div id="KillCount">
      <div aria-hidden="true">
        {Array.from({ length: killed }).map((_, index) => (
          // eslint-disable-next-line
          <span key={index}>💀</span>
        ))}
      </div>
      <p>{t('killers.form.weeks', {weeks: weeks})}</p>
      <p>{t('killers.form.infected', {infected: infected})}</p>
      <p>{t('killers.form.killed', {killed: killed})}</p>
      <button onClick={nextWeek}>{t('killers.form.next-week')}</button>
    </div>
  )
}

function Killers() {
  const { t } = useTranslation()
  let location = useLocation()
  let navigate = useNavigate()
  let ages = parseAges(location.search)
  if (ages === null) {
    setTimeout(() => navigate("/"), [])
    return null
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t('killers.title')}</h1>
        <p>{t('killers.paragraph1')}</p>
        <p>{t('killers.paragraph2')}</p>
        <p>{t('killers.paragraph3')}</p>
      </div>
      <KillCount ages={ages} />
      <p>
        <Trans i18nKey="killers.paragraph4">
          So please, stay home. And while you're there <a href="https://medium.com/@joschabach/flattening-the-curve-is-a-deadly-delusion-eea324fe9727">I think this article is worth your time.</a>. Containment seems to be the best action right now given the numbers.
        </Trans>
      </p>
      <hr />
      <h2>{t('killers.more-info')}</h2>
      <p>
        <Trans i18nKey="killers.paragraph5">
          <Link to={`/infected${location.search}`}>On the previous page we looked at the fatality rate</Link> of COVID-19 and saw that statistically, you and your family will probably be fine, but social distancing isn't about you.
        </Trans>
      </p>
      <p>{t('killers.paragraph6')}</p>
      <p>{t('killers.paragraph7')}</p>
      <a
        style={{ display: "block", border: "solid 1px" }}
        href="https://www.worldometers.info/coronavirus/country/us/"
      >
        <img
          style={{ width: "100%" }}
          alt={t('killers.image-alt-text')}
          src="/graph.png"
        />
      </a>
      <p>
        <Trans i18nKey="killers.paragraph8">
          The <i>Attack Rate</i> of COVID-19 is estimated by the World Health Organization to be <a href="https://www.worldometers.info/coronavirus/#repro">between 1.4 and 2.5</a>. That means if you get it, you're going to infect 2 other people (other studies have it as high as 4!). By comparison, the flu is 1.3 and anything less than 1 will just die off.
        </Trans>
      </p>
    </div>
  )
}

function parseAges(search) {
  let params = new URLSearchParams(search)
  try {
    return params
      .get("ages")
      .split(",")
      .map(str => Number(str))
  } catch (e) {
    return null
  }
}

function AppRoot() {
  let location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/infected" element={<Infection />} />
      <Route path="/killers" element={<Killers />} />
    </Routes>
  )
}

export default () => (
  <BrowserRouter>
    <AppRoot />
  </BrowserRouter>
)
