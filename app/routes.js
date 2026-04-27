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
