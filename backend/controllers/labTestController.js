const LabTest = require('../models/LabTest');
const labTestCatalog = require('../data/labTestCatalog');
const User = require('../models/User');

const scopeFilter = (user) => {
  if (!user) return {};
  if (user.role === 'Patient') return { patientId: user._id };
  return {};
};

exports.create = async (req, res) => {
  try {
    const { patientId, testType, scheduledDate, notes, category, labName, labLocation, batchOrderId } = req.body;
    const pid = req.user.role === 'Patient' ? req.user._id : (patientId || req.query.patientId);
    if (!pid) return res.json({ ok: false, msg: 'patientId required' });
    const docId = req.user.role === 'Doctor' || req.user.role === 'Admin' ? req.user._id : undefined;
    const test = await LabTest.create({ 
      patientId: pid, 
      doctorId: docId, 
      testType, 
      category,
      scheduledDate, 
      labName,
      labLocation,
      notes,
      batchOrderId 
    });
    res.json({ ok: true, labTest: test });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    if (req.query.patientId && req.user.role !== 'Patient') filter.patientId = req.query.patientId;
    const data = await LabTest.find(filter).sort('-createdAt');
    res.json({ ok: true, labTests: data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultUrl } = req.body;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const updateData = { status, resultUrl };
    if (status === 'completed' && !req.body.completedDate) {
      updateData.completedDate = new Date();
    }
    const updated = await LabTest.findOneAndUpdate(filter, updateData, { new: true });
    if (!updated) return res.status(404).json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, labTest: updated });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const deleted = await LabTest.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ ok: false, msg: 'Test not found' });
    res.json({ ok: true, msg: 'Test deleted successfully', labTest: deleted });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// Get lab test catalog
exports.getCatalog = async (req, res) => {
  try {
    res.json({ ok: true, catalog: labTestCatalog });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// Generate PDF for a lab test
exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id, ...scopeFilter(req.user) };
    const labTest = await LabTest.findOne(filter).populate('patientId', 'name email phone');
    
    if (!labTest) return res.status(404).json({ ok: false, msg: 'Lab test not found' });

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #2b9edb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0b3a5b; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .section { margin: 25px 0; }
    .section-title { background: #f0f8ff; padding: 10px; border-left: 4px solid #2b9edb; font-weight: bold; color: #0b3a5b; margin-bottom: 15px; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: bold; width: 200px; color: #0b3a5b; }
    .info-value { flex: 1; }
    .status-badge { 
      display: inline-block; 
      padding: 6px 14px; 
      border-radius: 6px; 
      font-weight: bold; 
      font-size: 12px;
      text-transform: uppercase;
    }
    .status-completed { background: #d4edda; color: #155724; border: 1px solid #28a745; }
    .status-ordered { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
    .status-scheduled { background: #d1ecf1; color: #0c5460; border: 1px solid #17a2b8; }
    .status-in_progress { background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
    .results-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 15px; }
    .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .result-item { background: white; padding: 12px; border-radius: 6px; border-left: 3px solid #2b9edb; }
    .result-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .result-value { font-size: 18px; font-weight: bold; color: #0b3a5b; margin: 5px 0; }
    .result-range { font-size: 11px; color: #999; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(43, 158, 219, 0.05); z-index: -1; font-weight: bold; }
  </style>
</head>
<body>
  <div class="watermark">CLINICEASE</div>
  
  <div class="header">
    <h1>🏥 CLINICEASE</h1>
    <p>Laboratory Test Report</p>
    <p style="font-size: 12px; color: #999;">Generated on ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <div class="section-title">📋 Test Information</div>
    <div class="info-row">
      <div class="info-label">Test ID:</div>
      <div class="info-value">${labTest._id}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Test Type:</div>
      <div class="info-value"><strong>${labTest.testType || 'N/A'}</strong></div>
    </div>
    <div class="info-row">
      <div class="info-label">Category:</div>
      <div class="info-value">${labTest.category || 'General'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Status:</div>
      <div class="info-value">
        <span class="status-badge status-${labTest.status}">${labTest.status}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">👤 Patient Information</div>
    <div class="info-row">
      <div class="info-label">Patient Name:</div>
      <div class="info-value">${labTest.patientId?.name || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Patient ID:</div>
      <div class="info-value">${labTest.patientId?._id || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email:</div>
      <div class="info-value">${labTest.patientId?.email || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Phone:</div>
      <div class="info-value">${labTest.patientId?.phone || 'N/A'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📅 Test Schedule</div>
    <div class="info-row">
      <div class="info-label">Ordered Date:</div>
      <div class="info-value">${labTest.createdAt ? new Date(labTest.createdAt).toLocaleString() : 'N/A'}</div>
    </div>
    ${labTest.scheduledDate ? `
    <div class="info-row">
      <div class="info-label">Scheduled Date:</div>
      <div class="info-value">${new Date(labTest.scheduledDate).toLocaleString()}</div>
    </div>` : ''}
    ${labTest.completedDate ? `
    <div class="info-row">
      <div class="info-label">Completed Date:</div>
      <div class="info-value">${new Date(labTest.completedDate).toLocaleString()}</div>
    </div>` : ''}
  </div>

  ${labTest.labName || labTest.labLocation ? `
  <div class="section">
    <div class="section-title">🏢 Laboratory Information</div>
    ${labTest.labName ? `
    <div class="info-row">
      <div class="info-label">Lab Name:</div>
      <div class="info-value">${labTest.labName}</div>
    </div>` : ''}
    ${labTest.labLocation ? `
    <div class="info-row">
      <div class="info-label">Lab Location:</div>
      <div class="info-value">${labTest.labLocation}</div>
    </div>` : ''}
  </div>` : ''}

  ${labTest.testResults && labTest.testResults.value ? `
  <div class="section">
    <div class="section-title">🔬 Test Results</div>
    <div class="results-box">
      <div class="results-grid">
        <div class="result-item">
          <div class="result-label">Test Value</div>
          <div class="result-value">${labTest.testResults.value} ${labTest.testResults.unit || ''}</div>
        </div>
        ${labTest.testResults.normalRange ? `
        <div class="result-item">
          <div class="result-label">Normal Range</div>
          <div class="result-value">${labTest.testResults.normalRange}</div>
        </div>` : ''}
      </div>
      ${labTest.testResults.interpretation ? `
      <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #10b981;">
        <div class="result-label">Interpretation</div>
        <div style="margin-top: 5px; color: #0b3a5b;">${labTest.testResults.interpretation}</div>
      </div>` : ''}
    </div>
  </div>` : ''}

  ${labTest.notes || labTest.patientNotes ? `
  <div class="section">
    <div class="section-title">📝 Notes</div>
    ${labTest.notes ? `
    <div style="margin-bottom: 15px;">
      <strong style="color: #0b3a5b;">Doctor's Notes:</strong>
      <div style="margin-top: 5px; padding: 12px; background: #f8f9fa; border-radius: 6px;">${labTest.notes}</div>
    </div>` : ''}
    ${labTest.patientNotes ? `
    <div>
      <strong style="color: #0b3a5b;">Patient's Notes:</strong>
      <div style="margin-top: 5px; padding: 12px; background: #f8f9fa; border-radius: 6px;">${labTest.patientNotes}</div>
    </div>` : ''}
  </div>` : ''}

  <div class="footer">
    <p><strong>CLINICEASE</strong> - Your Health, Simplified</p>
    <p>This is a computer-generated report and does not require a signature.</p>
    <p>⚠️ This report is confidential and intended solely for the patient and authorized healthcare providers.</p>
  </div>
</body>
</html>
    `;

    res.json({ 
      ok: true, 
      html: htmlContent,
      labTest: labTest 
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

// Generate combined PDF for batch order
exports.generateBatchPDF = async (req, res) => {
  try {
    const { batchOrderId } = req.params;
    const filter = { batchOrderId, ...scopeFilter(req.user) };
    const labTests = await LabTest.find(filter).populate('patientId', 'name email phone').sort('createdAt');
    
    if (!labTests || labTests.length === 0) {
      return res.status(404).json({ ok: false, msg: 'No tests found for this batch order' });
    }

    const patient = labTests[0].patientId;
    const labInfo = labTests[0].labName ? `${labTests[0].labName}${labTests[0].labLocation ? ', ' + labTests[0].labLocation : ''}` : 'N/A';

    // Generate HTML content for combined PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #2b9edb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0b3a5b; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    .section { margin: 25px 0; page-break-inside: avoid; }
    .section-title { background: #f0f8ff; padding: 10px; border-left: 4px solid #2b9edb; font-weight: bold; color: #0b3a5b; margin-bottom: 15px; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: bold; width: 200px; color: #0b3a5b; }
    .info-value { flex: 1; }
    .test-card { 
      background: #f8f9fa; 
      padding: 20px; 
      border-radius: 8px; 
      border: 2px solid #e0f0f8;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    .test-header {
      background: linear-gradient(135deg, #2b9edb, #1f6fb1);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      margin: -20px -20px 15px -20px;
      font-size: 18px;
      font-weight: bold;
    }
    .test-category {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 10px;
    }
    .status-badge { 
      display: inline-block; 
      padding: 6px 14px; 
      border-radius: 6px; 
      font-weight: bold; 
      font-size: 12px;
      text-transform: uppercase;
    }
    .status-completed { background: #d4edda; color: #155724; border: 1px solid #28a745; }
    .status-ordered { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
    .status-scheduled { background: #d1ecf1; color: #0c5460; border: 1px solid #17a2b8; }
    .status-in_progress { background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
    .status-cancelled { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .results-box { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0; margin-top: 12px; }
    .test-detail { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
    .test-detail-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: bold; }
    .test-detail-value { color: #0b3a5b; margin-top: 3px; }
    .summary-box { background: #e8f4ff; padding: 20px; border-radius: 8px; border: 2px solid #2b9edb; margin: 25px 0; }
    .summary-title { font-size: 20px; color: #0b3a5b; font-weight: bold; margin-bottom: 15px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(43, 158, 219, 0.05); z-index: -1; font-weight: bold; }
    @media print {
      .test-card { page-break-inside: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="watermark">CLINICEASE</div>
  
  <div class="header">
    <h1>🏥 CLINICEASE</h1>
    <p>Comprehensive Laboratory Test Report</p>
    <p style="font-size: 12px; color: #999;">Generated on ${new Date().toLocaleString()}</p>
    <p style="font-size: 12px; color: #999;">Batch Order ID: ${batchOrderId}</p>
  </div>

  <div class="section">
    <div class="section-title">👤 Patient Information</div>
    <div class="info-row">
      <div class="info-label">Patient Name:</div>
      <div class="info-value">${patient?.name || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Patient ID:</div>
      <div class="info-value">${patient?._id || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email:</div>
      <div class="info-value">${patient?.email || 'N/A'}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Phone:</div>
      <div class="info-value">${patient?.phone || 'N/A'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🏢 Laboratory Information</div>
    <div class="info-row">
      <div class="info-label">Laboratory:</div>
      <div class="info-value">${labInfo}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Total Tests:</div>
      <div class="info-value"><strong>${labTests.length} Test${labTests.length > 1 ? 's' : ''}</strong></div>
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-title">📊 Test Summary</div>
    ${labTests.map((test, idx) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1ecf1;">
        <span><strong>${idx + 1}.</strong> ${test.testType}</span>
        <span class="status-badge status-${test.status}">${test.status}</span>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">🔬 Detailed Test Results</div>
    ${labTests.map((test, idx) => `
      <div class="test-card">
        <div class="test-header">
          ${idx + 1}. ${test.testType}
          ${test.category ? `<span class="test-category">${test.category}</span>` : ''}
        </div>
        
        <div class="test-detail">
          <div class="test-detail-label">Test ID</div>
          <div class="test-detail-value">${test._id}</div>
        </div>

        <div class="test-detail">
          <div class="test-detail-label">Status</div>
          <div class="test-detail-value"><span class="status-badge status-${test.status}">${test.status}</span></div>
        </div>

        ${test.scheduledDate ? `
        <div class="test-detail">
          <div class="test-detail-label">Scheduled Date</div>
          <div class="test-detail-value">${new Date(test.scheduledDate).toLocaleString()}</div>
        </div>` : ''}

        ${test.completedDate ? `
        <div class="test-detail">
          <div class="test-detail-label">Completed Date</div>
          <div class="test-detail-value">${new Date(test.completedDate).toLocaleString()}</div>
        </div>` : ''}

        ${test.testResults && test.testResults.value ? `
        <div class="results-box">
          <div class="test-detail-label" style="margin-bottom: 10px;">🔬 Results</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <div class="test-detail-label">Value</div>
              <div style="font-size: 20px; font-weight: bold; color: #0b3a5b; margin-top: 5px;">
                ${test.testResults.value} ${test.testResults.unit || ''}
              </div>
            </div>
            ${test.testResults.normalRange ? `
            <div>
              <div class="test-detail-label">Normal Range</div>
              <div style="font-size: 16px; color: #0b3a5b; margin-top: 5px;">
                ${test.testResults.normalRange}
              </div>
            </div>` : ''}
          </div>
          ${test.testResults.interpretation ? `
          <div style="margin-top: 12px; padding: 10px; background: #e8f4ff; border-radius: 4px; border-left: 3px solid #2b9edb;">
            <div class="test-detail-label">Interpretation</div>
            <div style="margin-top: 5px; color: #0b3a5b;">${test.testResults.interpretation}</div>
          </div>` : ''}
        </div>` : `
        <div class="results-box">
          <div style="text-align: center; color: #999; font-style: italic; padding: 10px;">
            Results pending
          </div>
        </div>`}

        ${test.notes ? `
        <div class="test-detail">
          <div class="test-detail-label">Notes</div>
          <div class="test-detail-value">${test.notes}</div>
        </div>` : ''}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p><strong>CLINICEASE</strong> - Your Health, Simplified</p>
    <p>This is a computer-generated comprehensive report for ${labTests.length} test${labTests.length > 1 ? 's' : ''} and does not require a signature.</p>
    <p>⚠️ This report is confidential and intended solely for the patient and authorized healthcare providers.</p>
  </div>
</body>
</html>
    `;

    res.json({ ok: true, html: htmlContent, testCount: labTests.length });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
};

