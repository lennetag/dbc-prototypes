//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

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
