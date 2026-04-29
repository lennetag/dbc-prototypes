//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.get('/search-all-business-cases', (req, res) => {
  return res.render('search-all-business-cases')
})

/** Mock data for view-approvals and case detail prototypes */
const approvalCaseDetails = {
  'citizen-services-alpha': {
    title: 'Digital citizen services onboarding',
    reference: 'DBC-2026-0142',
    department: 'Department for Science, Innovation and Technology',
    totalValue: '£2.4m',
    businessCaseType: 'Incremental (Alpha)',
    approvals: [
      { role: 'Finance Business Partner', rag: 'green', furtherInfoRequested: 'None', comments: 'Economic annex aligns with departmental Green Book uplift assumptions.' },
      { role: 'Technology Assurance Lead', rag: 'amber', furtherInfoRequested: 'Hosting exit plan for legacy stacks', comments: 'Clarify migration window against live services dependency map.' },
      { role: 'Service Assessor Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'Operational readiness criteria for alpha exit are evidenced.' },
      { role: 'Technical Architect', rag: 'amber', furtherInfoRequested: 'Diagram for integration with Identity assurance', comments: 'Add sequence for token exchange with departmental IdP.' }
    ]
  },
  'national-data-exchange-live': {
    title: 'National data exchange — live service uplift',
    reference: 'DBC-2026-0891',
    department: 'Department for Environment, Food & Rural Affairs',
    totalValue: '£8.1m',
    businessCaseType: 'Incremental (Live)',
    approvals: [
      { role: 'Finance Business Partner', rag: 'amber', furtherInfoRequested: 'Sensitivity on unit cost beyond year 3', comments: 'Core benefits case acceptable; rerun if fuel indices move more than one point.' },
      { role: 'Technology Assurance Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'Resilience targets met for paired regions.' },
      { role: 'Service Assessor Lead', rag: 'amber', furtherInfoRequested: 'Customer support model for escalation path', comments: 'Second-line staffing numbers not yet contracted.' },
      { role: 'Technical Architect', rag: 'green', furtherInfoRequested: 'None', comments: 'Reference architecture aligns with departmental patterns.' }
    ]
  },
  'unified-portfolio-modernisation': {
    title: 'Unified cyber and legacy portfolio programme',
    reference: 'DBC-2026-0560',
    department: 'Cabinet Office',
    totalValue: '£41.5m',
    businessCaseType: 'Portfolio',
    approvals: [
      { role: 'Finance Business Partner', rag: 'red', furtherInfoRequested: 'Phasing of cash profiles vs CDEL', comments: 'Cannot support release of stage-gate funding until reconciliation with CF22.' },
      { role: 'Technology Assurance Lead', rag: 'amber', furtherInfoRequested: 'Independent technical review TOR', comments: 'Scope for ITRA acceptable subject to TOR sign-off.' },
      { role: 'Service Assessor Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'Portfolio risks map to departmental risk register entries.' },
      { role: 'Technical Architect', rag: 'amber', furtherInfoRequested: 'Evidence of pattern reuse across workstreams', comments: 'Strengthen commentary on sharing integration components.' }
    ]
  },
  'skills-matchmaking-discovery': {
    title: 'Skills matchmaking MVP (Discovery)',
    reference: 'DBC-2026-1203',
    department: 'Department for Education',
    totalValue: '£0.45m',
    businessCaseType: 'Incremental (Alpha)',
    approvals: [
      { role: 'Finance Business Partner', rag: 'green', furtherInfoRequested: 'None', comments: 'Proportionate for gateway one spend.' },
      { role: 'Technology Assurance Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'User research ethics sign-off referenced.' },
      { role: 'Service Assessor Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'No live service impact in this phase.' },
      { role: 'Technical Architect', rag: 'green', furtherInfoRequested: 'None', comments: 'Discovery technical spikes are appropriately bounded.' }
    ]
  },
  'data-literacy-internal-beta': {
    title: 'Data literacy tooling (internal Beta)',
    reference: 'DBC-2026-1338',
    department: 'Department for Science, Innovation and Technology',
    totalValue: '£1.85m',
    businessCaseType: 'Incremental (Beta)',
    approvals: [
      { role: 'Finance Business Partner', rag: 'green', furtherInfoRequested: 'None', comments: 'Beta run-rate within delegated limits.' },
      { role: 'Technology Assurance Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'Hosting pattern agreed.' },
      { role: 'Service Assessor Lead', rag: 'green', furtherInfoRequested: 'None', comments: 'Service criteria for Beta exit documented.' },
      { role: 'Technical Architect', rag: 'green', furtherInfoRequested: 'None', comments: 'Integrations bounded to departmental IdP.' }
    ]
  }
}

router.get('/view-approvals', (req, res) => {
  const projects = [
    { slug: 'citizen-services-alpha', projectName: 'Digital citizen services onboarding', projectType: 'Incremental (Alpha)', dueDate: '15 May 2026', valueMillions: 2.4 },
    { slug: 'national-data-exchange-live', projectName: 'National data exchange — live service uplift', projectType: 'Incremental (Live)', dueDate: '3 June 2026', valueMillions: 8.1 },
    { slug: 'unified-portfolio-modernisation', projectName: 'Unified cyber and legacy portfolio programme', projectType: 'Portfolio', dueDate: '22 April 2026', valueMillions: 41.5 },
    { slug: 'skills-matchmaking-discovery', projectName: 'Skills matchmaking MVP (Discovery)', projectType: 'Incremental (Alpha)', dueDate: '30 July 2026', valueMillions: 0.45 },
    { slug: 'data-literacy-internal-beta', projectName: 'Data literacy tooling (internal Beta)', projectType: 'Incremental (Beta)', dueDate: '10 August 2026', valueMillions: 1.85 }
  ]
  return res.render('view-approvals', { projects })
})

router.get('/view-approvals/:slug', (req, res) => {
  const summary = approvalCaseDetails[req.params.slug]
  if (!summary) {
    return res.redirect('/view-approvals')
  }
  return res.render('view-approval-detail', { summary })
})

/** E2E dashboard — pipeline Gantt + “my cases” table (prototype data) */
const pipelineQuarterCount = 20

function buildPipelineQuarterLabels (count = pipelineQuarterCount) {
  const labels = []
  let year = 2026
  let quarter = 2
  for (let i = 0; i < count; i++) {
    labels.push({ index: i, label: `Q${quarter} ${year}` })
    quarter += 1
    if (quarter > 4) {
      quarter = 1
      year += 1
    }
  }
  return labels
}

const e2ePipelineCases = [
  {
    slug: 'citizen-services-alpha',
    title: 'Digital citizen services onboarding',
    reference: 'DBC-2026-0142',
    department: 'Department for Science, Innovation and Technology',
    valueMillions: 2.4,
    stage: 'Alpha',
    lastUpdated: '12 April 2026',
    status: 'Review Requested',
    startQuarterIndex: 0,
    durationQuarters: 7,
    fullyApproved: false
  },
  {
    slug: 'national-data-exchange-live',
    title: 'National data exchange — live service uplift',
    reference: 'DBC-2026-0891',
    department: 'Department for Environment, Food & Rural Affairs',
    valueMillions: 8.1,
    stage: 'Live',
    lastUpdated: '8 April 2026',
    status: 'Further information requested',
    startQuarterIndex: 2,
    durationQuarters: 14,
    fullyApproved: false
  },
  {
    slug: 'unified-portfolio-modernisation',
    title: 'Unified cyber and legacy portfolio programme',
    reference: 'DBC-2026-0560',
    department: 'Cabinet Office',
    valueMillions: 41.5,
    stage: 'Programme',
    lastUpdated: '28 March 2026',
    status: 'Draft',
    startQuarterIndex: 1,
    durationQuarters: 17,
    fullyApproved: false
  },
  {
    slug: 'skills-matchmaking-discovery',
    title: 'Skills matchmaking MVP (Discovery)',
    reference: 'DBC-2026-1203',
    department: 'Department for Education',
    valueMillions: 0.45,
    stage: 'Discovery',
    lastUpdated: '22 April 2026',
    status: 'Draft',
    startQuarterIndex: 4,
    durationQuarters: 5,
    fullyApproved: false
  },
  {
    slug: 'data-literacy-internal-beta',
    title: 'Data literacy tooling (internal Beta)',
    reference: 'DBC-2026-1338',
    department: 'Department for Science, Innovation and Technology',
    valueMillions: 1.85,
    stage: 'Beta',
    lastUpdated: '18 April 2026',
    status: 'Review Requested',
    startQuarterIndex: 6,
    durationQuarters: 10,
    fullyApproved: true
  }
]

function getE2EPipelineCasesWithIndices () {
  return e2ePipelineCases.map((c, idx) => ({ ...c, rowIndex: idx }))
}

router.get('/my-business-cases', (req, res) => {
  const casesInProgress = e2ePipelineCases.map((c) => ({
    slug: c.slug,
    title: c.title,
    reference: c.reference,
    department: c.department,
    stage: c.stage,
    lastUpdated: c.lastUpdated,
    status: c.status,
    valueMillions: c.valueMillions
  }))
  return res.render('my-business-cases', { casesInProgress })
})

router.get('/department-pipeline', (req, res) => {
  const quarters = buildPipelineQuarterLabels()
  const totalValueMillions = e2ePipelineCases.reduce((sum, c) => sum + c.valueMillions, 0)
  const projectCount = e2ePipelineCases.length
  const unapprovedCount = e2ePipelineCases.filter((c) => !c.fullyApproved).length
  const approvedCount = e2ePipelineCases.filter((c) => c.fullyApproved).length
  const inDevelopment = e2ePipelineCases.filter((c) =>
    ['Discovery', 'Alpha', 'Beta'].includes(c.stage)
  )

  return res.render('department-pipeline', {
    quarters,
    pipelineCases: getE2EPipelineCasesWithIndices(),
    quarterIndices: quarters.map((q) => q.index),
    stats: {
      totalValueMillions: totalValueMillions.toFixed(2),
      projectCount,
      unapprovedCount,
      approvedCount,
      inDevelopmentCount: inDevelopment.length
    },
    inDevelopment
  })
})

router.get('/templates-and-examples', (req, res) => {
  const q = (req.query.q || '').toString().trim()
  const normalisedQuery = q.toLowerCase()

  // Mock content for prototype search results.
  const aiExamples = [
    { title: 'AI triage assistant for contact centre demand (Discovery)', department: 'Department for Work and Pensions', helpfulCount: 128 },
    { title: 'Using AI to reduce fraud risk in online applications (Alpha)', department: 'HM Revenue & Customs', helpfulCount: 94 },
    { title: 'AI-assisted caseworker workflow (Beta)', department: 'Home Office', helpfulCount: 77 },
    { title: 'AI tool for document classification and redaction (Beta)', department: 'Ministry of Justice', helpfulCount: 63 },
    { title: 'AI summarisation in internal knowledge services (Live)', department: 'Department for Education', helpfulCount: 211 },
    { title: 'AI for queue prediction and capacity planning (Live)', department: 'Department for Transport', helpfulCount: 52 },
    { title: 'Assuring AI-enabled decisions: governance and controls pack (Programme)', department: 'Department of Health and Social Care', helpfulCount: 39 },
    { title: 'Evaluating AI model performance and bias (Economic case appendix)', department: 'Department for Environment, Food & Rural Affairs', helpfulCount: 86 },
    { title: 'AI procurement approach for managed services (Commercial case)', department: 'Cabinet Office', helpfulCount: 41 },
    { title: 'Measuring benefits from AI automation (Benefits realisation)', department: 'Department for Science, Innovation and Technology', helpfulCount: 105 }
  ]

  const showResults = q.length > 0
  const aiQuery = normalisedQuery.includes('ai')
  const results = aiQuery ? aiExamples : []

  return res.render('templates-and-examples', {
    q,
    showResults,
    results,
    resultsCount: results.length
  })
})

router.post('/write-and-submit-business-case/how-to-draft', (req, res) => {
  const data = req.session.data || {}
  const method = data.draftBusinessCaseMethod

  if (method === 'upload') {
    return res.redirect('/write-and-submit-business-case/upload-document')
  }

  if (method === 'digital') {
    return res.redirect('/write-and-submit-business-case/start-digital-service')
  }

  return res.redirect('/write-and-submit-business-case/how-to-draft')
})

router.post('/write-and-submit-business-case/upload-document', (req, res) => {
  return res.redirect('/write-and-submit-business-case/overview')
})

router.post('/write-and-submit-business-case/digital-service/request-name', (req, res) => {
  return res.redirect('/write-and-submit-business-case/digital-service/total-nominal-budget')
})

router.post('/write-and-submit-business-case/digital-service/total-nominal-budget', (req, res) => {
  return res.redirect('/write-and-submit-business-case/overview')
})

router.post('/get-approval-to-spend/add', (req, res) => {
  const data = req.session.data || {}

  const option = {
    optionId: data.optionId,
    optionName: data.optionName,
    optionDescription: data.optionDescription,
    shortlisted: data.shortlisted,
    considerations: data.considerations
  }

  const hasAnyValue = Object.values(option).some(v => (v || '').toString().trim() !== '')
  if (!hasAnyValue) {
    return res.redirect('/get-approval-to-spend')
  }

  data.options = Array.isArray(data.options) ? data.options : []
  data.options.push(option)

  data.optionId = ''
  data.optionName = ''
  data.optionDescription = ''
  data.shortlisted = ''
  data.considerations = ''

  return res.redirect('/get-approval-to-spend')
 })
