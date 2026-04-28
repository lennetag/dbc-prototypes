//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-and-javascript
//

const SAIL_MATRIX = [
  ['SAIL I', 'SAIL II', 'SAIL III', 'SAIL IV'],
  ['SAIL II', 'SAIL III', 'SAIL III', 'SAIL V'],
  ['SAIL III', 'SAIL III', 'SAIL IV', 'SAIL V'],
  ['SAIL IV', 'SAIL IV', 'SAIL IV', 'SAIL VI'],
  ['SAIL V', 'SAIL V', 'SAIL V', 'SAIL VI']
]

/** Population densities above UK SORA envelope for this prototype (strictly heavier than Populated). */
const POPULATION_OUT_OF_SCOPE_VALUES = ['dense_gt500km2']

const OUT_SCOPE_SORA_MESSAGE =
  'This combination exceed UK SORA limits'

/**
 * UK SORA Operational Authorisation — total fixed charge (initial application).
 * Source: CAA “Charges for a UK SORA-based Operational Authorisation” (2026/27 table).
 * https://www.caa.co.uk/drones/specific-category/uk-sora-based-operational-authorisations/charges-for-a-uk-sora-based-operational-authorisation/
 * No VAT (as published). Assumes first application in the period; excludes excess hourly charges.
 */
const FEES_FOR_SAIL = {
  'SAIL I': 2422,
  'SAIL II': 3806,
  'SAIL III': 10380,
  'SAIL IV': 13840,
  'SAIL V': 17300,
  'SAIL VI': 17300
}

const DEFAULT_SAIL_FEE_FALLBACK = FEES_FOR_SAIL['SAIL IV']

/**
 * Operational Safety Objectives per SAIL tier (columns SAIL I–VI).
 * Source: AMC1 Article 11, Table 11 — Operational Safety Objectives (OSO).
 * https://regulatorylibrary.caa.co.uk/2019-947/Content/Article%2011/AMC1%20Article%2011%20Conducting%20a%20UK%20Specific%20Operation%20Risk%20Assessment%20(UK%20SORA).htm
 * Levels: NR = not required; L/M/H = required robustness. (Also published in CAP 3017.)
 */
const AMC1_TABLE11_OSOS = [
  { id: 'OSO01', desc: 'Ensure the operator is competent and/or proven', r: ['NR', 'L', 'M', 'H', 'H', 'H'] },
  { id: 'OSO02', desc: 'UAS manufactured by competent and/or proven entity', r: ['NR', 'NR', 'L', 'M', 'H', 'H'] },
  { id: 'OSO03', desc: 'UAS maintained by competent and/or proven entity', r: ['L', 'L', 'M', 'M', 'H', 'H'] },
  { id: 'OSO04', desc: 'UAS components essential to safe operations are designed to an Airworthiness Design Standard (ADS)', r: ['NR', 'NR', 'NR', 'L', 'M', 'H'] },
  { id: 'OSO05', desc: 'UAS is designed considering system safety and reliability', r: ['NR', 'NR', 'L', 'M', 'H', 'H'] },
  { id: 'OSO06', desc: 'C3 link performance is appropriate for the operation', r: ['NR', 'L', 'L', 'M', 'H', 'H'] },
  { id: 'OSO07', desc: 'Conformity check of the UAS configuration', r: ['L', 'L', 'M', 'M', 'H', 'H'] },
  {
    id: 'OSO08',
    desc: 'Operational procedures are defined, validated and adhered to address normal, abnormal and emergency situations potentially resulting from technical issues with the UAS or external systems supporting UAS operation, human errors or critical environmental conditions',
    r: ['L', 'M', 'H', 'H', 'H', 'H']
  },
  {
    id: 'OSO09',
    desc: 'Remote crew trained and current and able to control the normal, abnormal and emergency situations potentially resulting from technical issues with the UAS or external systems supporting UAS operation, human errors or critical environmental conditions situation',
    r: ['L', 'L', 'M', 'M', 'H', 'H']
  },
  { id: 'OSO13', desc: 'External services supporting UAS operations are adequate to the operation', r: ['L', 'L', 'M', 'H', 'H', 'H'] },
  { id: 'OSO16', desc: 'Multi crew coordination', r: ['L', 'L', 'M', 'M', 'H', 'H'] },
  { id: 'OSO17', desc: 'Remote crew is fit to operate', r: ['L', 'L', 'M', 'M', 'H', 'H'] },
  { id: 'OSO18', desc: 'Automatic protection of the flight envelope from Human Error', r: ['NR', 'NR', 'L', 'M', 'H', 'H'] },
  { id: 'OSO19', desc: 'Safe recovery from Human Error', r: ['NR', 'NR', 'L', 'M', 'M', 'H'] },
  { id: 'OSO20', desc: 'A Human Factors evaluation has been performed and the HMI found appropriate for the mission', r: ['NR', 'L', 'L', 'M', 'M', 'H'] },
  { id: 'OSO23', desc: 'Environmental conditions for safe operations defined, measurable and adhered to', r: ['L', 'L', 'M', 'M', 'H', 'H'] },
  { id: 'OSO24', desc: 'UAS designed and qualified for adverse environmental conditions', r: ['NR', 'NR', 'M', 'H', 'H', 'H'] }
]

const SAIL_LABEL_ORDER = ['SAIL I', 'SAIL II', 'SAIL III', 'SAIL IV', 'SAIL V', 'SAIL VI']

const DIMENSION_WEIGHT = {
  under1m: 2,
  under3m: 3,
  under8m: 4,
  under20m: 6
}

const SPEED_WEIGHT = {
  below25ms: 2,
  below35ms: 3,
  below75ms: 5,
  below120ms: 6
}

const POPULATION_WEIGHT = {
  controlled: 2,
  sparse_lt5km2: 3,
  light_lt50km2: 5,
  populated_lt500km2: 6,
  dense_gt500km2: 9
}

function clampInt (value, low, high) {
  const n = Number(value)
  if (Number.isNaN(n)) return low
  return Math.min(high, Math.max(low, Math.round(n)))
}

function deriveInitialGrcNumeric (dimension, speed, population) {
  const d = DIMENSION_WEIGHT[dimension] ?? 4
  const s = SPEED_WEIGHT[speed] ?? 5
  const p = POPULATION_WEIGHT[population] ?? 6
  const total = d + s + p
  return clampInt(total / 2.5, 2, 7)
}

function grcNumericToMatrixRowIndex (numeric) {
  if (numeric <= 2) return 0
  if (numeric <= 4) return 1
  if (numeric === 5) return 2
  if (numeric === 6) return 3
  return 4
}

function mitigationGrcDeduction (formEl) {
  let n = 0
  const m1a = formEl.querySelector('[name="mitigation-m1a"]:checked')
  const m1b = formEl.querySelector('[name="mitigation-m1b"]:checked')
  const m2low = formEl.querySelector('[name="mitigation-m2-low"]:checked')
  const m2high = formEl.querySelector('[name="mitigation-m2-high"]:checked')

  if (m1a) n += 1
  if (m1b) n += 1
  if (m2high) {
    n += 2
  } else if (m2low) {
    n += 1
  }
  return n
}

function readArcColumnIndexFromBase (arcBaseRadio) {
  if (!arcBaseRadio) return 2
  const map = { arcA: 0, arcB: 1, arcC: 2, arcD: 3 }
  return map[arcBaseRadio.value] ?? 2
}

function deriveFinalArcColumn (formEl, arcColumnFromSelection) {
  const strategicOn = !!formEl.querySelector('[name="mitigation-strategic-arc"]:checked')
  let col = arcColumnFromSelection
  if (strategicOn) col = Math.max(0, col - 1)
  return col
}

function formatGrcNumeric (numeric) {
  return `GRC ${numeric}`
}

function formatGbpWholePounds (poundsWhole) {
  const n = Number(poundsWhole)
  if (Number.isNaN(n)) return '£—'
  return `£${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
}

function arcColumnLetter (columnIndexZeroBased) {
  return ['a', 'b', 'c', 'd'][columnIndexZeroBased]
}

function sailTierIndexFromLabel (sailLabel) {
  const i = SAIL_LABEL_ORDER.indexOf(sailLabel?.trim() ?? '')
  return i >= 0 ? i : 3
}

function robustnessLabel (code) {
  const map = { L: 'Low', M: 'Medium', H: 'High' }
  return map[code] ?? code
}

function applicableOsosForEstimatedSail (sailLabel) {
  const t = sailTierIndexFromLabel(sailLabel)
  const out = []
  for (const row of AMC1_TABLE11_OSOS) {
    const level = row.r[t]
    if (level && level !== 'NR') out.push({ id: row.id, desc: row.desc, level })
  }
  return out
}

function formatOsoAccordionHeading (applicableCount) {
  const base = 'See Operational Safety Objectives (OSOs)'
  if (applicableCount === 0) {
    return `${base} — none applicable at this SAIL`
  }
  const noun = applicableCount === 1 ? 'OSO' : 'OSOs'
  return `${base} — ${applicableCount} ${noun} applicable`
}

function populateOsoListAndHeading (listEl, headingEl, sailLabel) {
  const rows = applicableOsosForEstimatedSail(sailLabel)
  if (headingEl) {
    headingEl.textContent = formatOsoAccordionHeading(rows.length)
  }
  if (!listEl) return
  if (rows.length === 0) {
    listEl.innerHTML = '<li class="govuk-body-s">No operational safety objectives listed for this SAIL tier in Table 11 (check inputs).</li>'
    return
  }
  listEl.innerHTML = rows
    .map(
      (o) =>
        `<li class="govuk-!-margin-bottom-3"><strong>${o.id}</strong> (${robustnessLabel(o.level)} robustness): ${o.desc}</li>`
    )
    .join('')
}

const SAIL_MATRIX_HIGHLIGHT_INTRINSIC = 'app-caa-sail-matrix__cell--intrinsic'
const SAIL_MATRIX_HIGHLIGHT_FINAL = 'app-caa-sail-matrix__cell--final'

function sailMatrixCellBaseLabel (td) {
  const fromData = td?.dataset?.appSailBase?.trim()
  if (fromData) return fromData
  return (td?.textContent ?? '').replace(/\s*\([^)]*\)\s*/g, '').replace(/\s+/g, ' ').trim()
}

function clearSailMatrixHighlights (tableEl) {
  if (!tableEl) return
  tableEl.querySelectorAll('tbody td').forEach((td) => {
    td.classList.remove(SAIL_MATRIX_HIGHLIGHT_INTRINSIC, SAIL_MATRIX_HIGHLIGHT_FINAL)
    const base = sailMatrixCellBaseLabel(td)
    if (base) td.textContent = base
  })
}

function setSailMatrixHighlights (tableEl, intrinsicRowIdx, intrinsicColIdx, finalRowIdx, finalColIdx) {
  clearSailMatrixHighlights(tableEl)
  if (!tableEl) return
  const rows = tableEl.querySelectorAll('tbody tr')
  const intrinsicTd = rows[intrinsicRowIdx]?.querySelectorAll('td')[intrinsicColIdx]
  const finalTd = rows[finalRowIdx]?.querySelectorAll('td')[finalColIdx]
  intrinsicTd?.classList.add(SAIL_MATRIX_HIGHLIGHT_INTRINSIC)
  finalTd?.classList.add(SAIL_MATRIX_HIGHLIGHT_FINAL)

  if (intrinsicTd && finalTd && intrinsicTd === finalTd) {
    intrinsicTd.textContent = `${sailMatrixCellBaseLabel(intrinsicTd)} (Intrinsic, Final)`
  } else {
    if (intrinsicTd) {
      intrinsicTd.textContent = `${sailMatrixCellBaseLabel(intrinsicTd)} (Intrinsic)`
    }
    if (finalTd) {
      finalTd.textContent = `${sailMatrixCellBaseLabel(finalTd)} (Final)`
    }
  }
}

window.GOVUKPrototypeKit.documentReady(() => {
  const form = document.getElementById('caa-sail-form')
  const elInitial = document.getElementById('caa-calculator-initial-grc')
  const elFinal = document.getElementById('caa-calculator-final-grc')
  const elIntrinsicArc = document.getElementById('caa-calculator-intrinsic-arc')
  const elFinalArc = document.getElementById('caa-calculator-final-arc')
  const elFee = document.getElementById('caa-calculator-fee')
  const elIntrinsicSail = document.getElementById('caa-calculator-intrinsic-sail')
  const elSail = document.getElementById('caa-calculator-sail')
  const elScope = document.getElementById('caa-calculator-scope-message')
  const elOsoWrap = document.getElementById('caa-osos-accordion-wrap')
  const elOsoList = document.getElementById('caa-calculator-osos-list')
  const elOsoHeading = document.getElementById('caa-calculator-osos-heading-label')
  const sailMatrixTable = document.querySelector('.app-caa-sail-matrix')

  const m2Low = document.getElementById('mitigation-m2-low-input')
  const m2High = document.getElementById('mitigation-m2-high-input')

  function recalc () {
    if (!form || !elInitial) return

    const dimensionRadio = form.querySelector('[name="ground-dimension"]:checked')
    const speedRadio = form.querySelector('[name="ground-max-speed"]:checked')
    const populationRadio = form.querySelector('[name="ground-population"]:checked')

    const initialNum = deriveInitialGrcNumeric(
      dimensionRadio?.value,
      speedRadio?.value,
      populationRadio?.value
    )

    const mitigGrcDeduction = mitigationGrcDeduction(form)
    let finalNum = clampInt(initialNum - mitigGrcDeduction, 1, 7)

    const arcRadio = form.querySelector('[name="airspace-arc"]:checked')
    const arcFromSelectionIdx = readArcColumnIndexFromBase(arcRadio)
    const effectiveArcIdx = deriveFinalArcColumn(form, arcFromSelectionIdx)

    elInitial.textContent = formatGrcNumeric(initialNum)
    const grcDelta = finalNum - initialNum
    const grcFinalSuffix =
      grcDelta !== 0 ? ` (${grcDelta > 0 ? '+' : ''}${grcDelta})` : ''
    elFinal.textContent = `${formatGrcNumeric(finalNum)}${grcFinalSuffix}`

    const intrinsicLetter = arcColumnLetter(arcFromSelectionIdx)
    const finalLetter = arcColumnLetter(effectiveArcIdx)
    const arcColumnDelta = effectiveArcIdx - arcFromSelectionIdx
    if (elIntrinsicArc) {
      elIntrinsicArc.textContent = `ARC-${intrinsicLetter}`
    }
    if (elFinalArc) {
      const suffix =
        arcColumnDelta !== 0 ? ` (${arcColumnDelta > 0 ? '+' : ''}${arcColumnDelta})` : ''
      elFinalArc.textContent = `ARC-${finalLetter}${suffix}`
    }

    const populationValue = populationRadio?.value
    const sailOutOfScope =
      !!populationValue && POPULATION_OUT_OF_SCOPE_VALUES.includes(populationValue)

    if (sailOutOfScope) {
      elSail.textContent = 'Out of scope'
      if (elIntrinsicSail) elIntrinsicSail.textContent = 'Out of scope'
      elFee.textContent = '—'
      clearSailMatrixHighlights(sailMatrixTable)
      if (elOsoWrap) {
        elOsoWrap.hidden = true
      }
      if (elOsoHeading) {
        elOsoHeading.textContent = 'See Operational Safety Objectives (OSOs)'
      }
      if (elScope) {
        elScope.textContent = OUT_SCOPE_SORA_MESSAGE
        elScope.hidden = false
      }
      return
    }

    if (elScope) {
      elScope.textContent = ''
      elScope.hidden = true
    }

    if (elOsoWrap) {
      elOsoWrap.hidden = false
    }

    const intrinsicRowIdx = grcNumericToMatrixRowIndex(initialNum)
    const intrinsicSail = SAIL_MATRIX[intrinsicRowIdx][arcFromSelectionIdx]
    if (elIntrinsicSail) elIntrinsicSail.textContent = intrinsicSail

    const rowIdx = grcNumericToMatrixRowIndex(finalNum)
    const sail = SAIL_MATRIX[rowIdx][effectiveArcIdx]
    const feeAmount = FEES_FOR_SAIL[sail] ?? DEFAULT_SAIL_FEE_FALLBACK

    elFee.textContent = formatGbpWholePounds(feeAmount)
    elSail.textContent = sail
    populateOsoListAndHeading(elOsoList, elOsoHeading, sail)
    setSailMatrixHighlights(
      sailMatrixTable,
      intrinsicRowIdx,
      arcFromSelectionIdx,
      rowIdx,
      effectiveArcIdx
    )
  }

  function enforceM2Exclusion (changedCheckbox) {
    if (!m2Low || !m2High || !changedCheckbox) return
    if (!changedCheckbox.checked) return
    if (changedCheckbox === m2Low && m2High.checked) {
      m2High.checked = false
    } else if (changedCheckbox === m2High && m2Low.checked) {
      m2Low.checked = false
    }
  }

  function onFormChange (e) {
    const tgt = e.target
    if (tgt === m2Low || tgt === m2High) {
      enforceM2Exclusion(tgt)
    }
    recalc()
  }

  if (form) {
    form.addEventListener('change', onFormChange)
    form.addEventListener('submit', (ev) => ev.preventDefault())
    recalc()
  }

  /** CAA page — simulated AI assistant (prototype only, no backend). */
  const aiToggle = document.getElementById('caa-ai-toggle')
  const aiPanel = document.getElementById('caa-ai-panel')
  const aiInput = document.getElementById('caa-ai-input')
  const aiSubmit = document.getElementById('caa-ai-submit')
  const aiResponse = document.getElementById('caa-ai-response')
  const aiStatus = document.getElementById('caa-ai-response-status')

  const CAA_AI_TOGGLE_LABEL_CLOSED = 'Ask a question (AI-assistant)'
  const CAA_AI_TOGGLE_LABEL_OPEN = 'hide AI Assistant'

  if (aiToggle && aiPanel && aiInput && aiSubmit && aiResponse) {
    let streamTimer = null
    let busy = false

    aiToggle.addEventListener('click', () => {
      const open = aiPanel.hasAttribute('hidden')
      aiPanel.hidden = !open
      aiToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
      aiToggle.textContent = aiPanel.hidden ? CAA_AI_TOGGLE_LABEL_CLOSED : CAA_AI_TOGGLE_LABEL_OPEN
      if (open) aiInput.focus()
    })

    function setBusy (isBusy) {
      busy = isBusy
      aiSubmit.disabled = isBusy
      aiInput.disabled = isBusy
      aiResponse.classList.toggle('is-busy', isBusy)
      if (aiStatus) aiStatus.textContent = isBusy ? 'Assistant is drafting a reply' : ''
    }

    function clearStreamTimer () {
      if (streamTimer != null) {
        clearInterval(streamTimer)
        streamTimer = null
      }
    }

    function buildSimulatedAnswer (question) {
      const q = question.trim() || '(no question typed)'
      return (
        `[Based on CAP 3017 / AMC1 Article 11]\n\n` +
          `Regarding your question (${q}), a further UK SORA assessment is generally expected where there is a material change to your operation—for example aircraft energy or containment, geography, achievable SAIL tier, mitigation robustness, or organisational factors—such that conclusions from a previous assessment would no longer be valid.\n\n` +
          `This is prototype text only; always verify in AMC1 Article 11 and CAP 3017 (including Tables on OSOs per SAIL) and the Regulatory Library before making compliance decisions.`
      )
    }

    function runSimulatedReply () {
      if (busy) return
      clearStreamTimer()

      aiResponse.innerHTML =
        '<p class="govuk-body-s govuk-!-margin-bottom-0 app-caa-ai-panel__search-msg">Searching approved guidance…</p>'
      setBusy(true)
      aiResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

      const searchMs = 550 + Math.floor(Math.random() * 250)

      window.setTimeout(() => {
        const full = buildSimulatedAnswer(aiInput.value || '')
        aiResponse.innerHTML =
          '<p class="govuk-body app-caa-ai-panel__stream-target govuk-!-margin-bottom-0">' +
            '<span class="app-caa-ai-panel__stream-text"></span><span class="app-caa-ai-panel__caret" aria-hidden="true"></span>' +
          '</p>'
        const textSpan = aiResponse.querySelector('.app-caa-ai-panel__stream-text')
        if (!textSpan) {
          setBusy(false)
          return
        }

        let i = 0
        streamTimer = setInterval(() => {
          const chunk = Math.min(full.length - i, 1 + Math.floor(Math.random() * 3))
          i += chunk
          textSpan.textContent = full.slice(0, i)

          if (i >= full.length) {
            clearStreamTimer()
            const caret = aiResponse.querySelector('.app-caa-ai-panel__caret')
            if (caret?.parentNode) caret.parentNode.removeChild(caret)
            setBusy(false)
          }
        }, 18)
      }, searchMs)
    }

    aiSubmit.addEventListener('click', runSimulatedReply)

    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !busy) {
        e.preventDefault()
        runSimulatedReply()
      }
    })
  }
})
