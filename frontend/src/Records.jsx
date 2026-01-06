import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import './Care.css';

export default function Records() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const userName = localStorage.getItem('userName') || 'User';
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ title: '', description: '', attachmentUrl: '' });
  const [list, setList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchData = async () => {
    const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
    const res = await fetch(`/api/records${query}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.records || []);
  };
  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, patientId: userRole === 'Patient' ? userId : (patientId || userId) };
    const res = await fetch('/api/records', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { setForm({ title:'', description:'', attachmentUrl:'' }); fetchData(); }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadPDF = (record) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Helper function to add text with wrapping
      const addText = (text, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach(line => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 3;
      };

      // Header
      doc.setFillColor(67, 56, 202);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL RECORD', pageWidth / 2, 18, { align: 'center' });
      doc.setFontSize(11);
      doc.text('ClinicEase Healthcare System', pageWidth / 2, 28, { align: 'center' });
      
      yPosition = 50;
      doc.setTextColor(0, 0, 0);

      // Record Title
      addText(record.title || 'Medical Record', 16, true);
      yPosition += 2;

      // Date
      addText(`Date: ${formatDate(record.createdAt)}`, 10);
      yPosition += 2;

      // Doctor Information
      if (record.doctorId) {
        addText('ISSUED BY', 12, true);
        addText(`Doctor: Dr. ${record.doctorId.name}`);
        if (record.doctorId.email) addText(`Email: ${record.doctorId.email}`);
        if (record.doctorId.phone) addText(`Phone: ${record.doctorId.phone}`);
        yPosition += 5;
      } else {
        addText('Type: Self-Recorded (Symptom Check)', 10);
        yPosition += 5;
      }

      // Patient Information
      if (record.patientId) {
        addText('PATIENT INFORMATION', 12, true);
        addText(`Name: ${record.patientId.name}`);
        if (record.patientId.email) addText(`Email: ${record.patientId.email}`);
        yPosition += 5;
      }

      // Description/Details
      if (record.description) {
        addText('DETAILS', 12, true);
        addText(record.description);
        yPosition += 5;
      }

      // Attachment URL
      if (record.attachmentUrl) {
        addText('ATTACHMENT', 12, true);
        addText(record.attachmentUrl);
      }

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated document from ClinicEase.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 5, { align: 'center' });

      // Save PDF
      const fileName = `Medical_Record_${record.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="care-section">
      <div className="care-header">
        <div>
          <h2>📋 Medical Records</h2>
          <p className="lead">
            {userRole === 'Patient' 
              ? 'View your medical records including symptom checks and doctor-issued reports.' 
              : 'Upload structured records or links. Doctors/admin can target a specific patient.'}
          </p>
        </div>
        {userRole !== 'Patient' && <input className="input" placeholder="Patient ID" value={patientId} onChange={e=>setPatientId(e.target.value)} />}
      </div>

      {userRole !== 'Patient' && (
        <form className="card add-record-form" onSubmit={submit}>
          <div className="form-header">
            <h4>📝 Add Record</h4>
            <p className="form-subtitle">Create a new medical record for patient reference</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Record Title</label>
              <input 
                className="input" 
                placeholder="E.g., Annual Checkup, Blood Test Results" 
                value={form.title} 
                onChange={e=>setForm({...form,title:e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Attachment URL</label>
              <input 
                className="input" 
                placeholder="https://example.com/document.pdf" 
                value={form.attachmentUrl} 
                onChange={e=>setForm({...form,attachmentUrl:e.target.value})} 
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea 
              className="input textarea-large" 
              placeholder="Enter detailed medical record information, findings, or notes..." 
              value={form.description} 
              onChange={e=>setForm({...form,description:e.target.value})} 
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <span className="btn-icon">💾</span>
              Save Record
            </button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => setForm({ title: '', description: '', attachmentUrl: '' })}
            >
              <span className="btn-icon">🔄</span>
              Reset
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <h4>{userRole === 'Patient' ? 'Your Medical Records' : 'Existing Records'}</h4>
        <ul className="list">
          {list.map(r => (
            <li key={r._id} className="list-item record-item">
              <div className="record-content">
                <div className="record-header-info">
                  <div className="record-title">{r.title}</div>
                  <div className="record-meta">
                    <span className="record-date">📅 {formatDate(r.createdAt)}</span>
                    {r.doctorId ? (
                      <span className="record-doctor">👨‍⚕️ Dr. {r.doctorId.name}</span>
                    ) : (
                      <span className="record-type">🔍 Self-Recorded</span>
                    )}
                  </div>
                  {r.description && (
                    <div className="record-preview">
                      {r.description.substring(0, 150)}{r.description.length > 150 ? '...' : ''}
                    </div>
                  )}
                </div>
                <div className="record-actions">
                  <button 
                    className="btn-small btn-view" 
                    onClick={() => setSelectedRecord(r)}
                  >
                    👁️ View
                  </button>
                  <button 
                    className="btn-small btn-download" 
                    onClick={() => downloadPDF(r)}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            </li>
          ))}
          {list.length===0 && (
            <li className="muted empty-message">
              {userRole === 'Patient' ? '📭 No medical records yet. Symptom checks you save will appear here.' : 'No records yet.'}
            </li>
          )}
        </ul>
      </div>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecord.title}</h2>
              <button className="modal-close" onClick={() => setSelectedRecord(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="record-detail-section">
                <p className="detail-label">Date & Time</p>
                <p className="detail-value">📅 {formatDate(selectedRecord.createdAt)}</p>
              </div>

              {selectedRecord.doctorId ? (
                <div className="record-detail-section">
                  <p className="detail-label">Issued By</p>
                  <p className="detail-value">
                    👨‍⚕️ Dr. {selectedRecord.doctorId.name}<br/>
                    {selectedRecord.doctorId.email && `📧 ${selectedRecord.doctorId.email}`}<br/>
                    {selectedRecord.doctorId.phone && `📞 ${selectedRecord.doctorId.phone}`}
                  </p>
                </div>
              ) : (
                <div className="record-detail-section">
                  <p className="detail-label">Record Type</p>
                  <p className="detail-value">🔍 Self-Recorded (Symptom Check)</p>
                </div>
              )}

              {selectedRecord.description && (
                <div className="record-detail-section">
                  <p className="detail-label">Details</p>
                  <pre className="detail-value record-description">{selectedRecord.description}</pre>
                </div>
              )}

              {selectedRecord.attachmentUrl && (
                <div className="record-detail-section">
                  <p className="detail-label">Attachment</p>
                  <p className="detail-value">
                    <a href={selectedRecord.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      {selectedRecord.attachmentUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => downloadPDF(selectedRecord)}>
                📄 Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
