import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import jsPDF from 'jspdf';
import './Billing.css';

export default function Billing() {
  const { t } = useLanguage();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'Patient';
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ amount: '', description: '', dueDate: '' });
  const [list, setList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const header = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchData = async () => {
    const query = userRole !== 'Patient' && patientId ? `?patientId=${patientId}` : '';
    const res = await fetch(`/api/billing${query}`, { headers: header });
    const data = await res.json();
    if (data.ok) setList(data.invoices || []);
  };

  const fetchDoctorPatients = async () => {
    if (userRole === 'Doctor') {
      const res = await fetch('/api/doctors/my-patients', { headers: header });
      const data = await res.json();
      if (data.ok) setPatients(data.patients || []);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchDoctorPatients();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if ((userRole === 'Doctor' || userRole === 'Admin') && !patientId) {
      alert('Please select a patient');
      return;
    }
    const payload = { ...form, amount: parseFloat(form.amount), patientId: userRole === 'Patient' ? userId : patientId };
    const res = await fetch('/api/billing', { method: 'POST', headers: header, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) { 
      setForm({ amount:'', description:'', dueDate:'' }); 
      if (userRole === 'Doctor') setPatientId('');
      fetchData(); 
      alert('Invoice created successfully!');
    } else {
      alert(data.message || 'Failed to create invoice');
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod('');
    setTransactionId('');
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // Payment gateway configuration
    const paymentGateways = {
      'bKash': {
        name: 'bKash',
        deepLink: 'bkash://payment',
        webUrl: 'https://www.bkash.com/merchant-payment',
        mobileUrl: 'https://shop.bkash.com/payment'
      },
      'Nagad': {
        name: 'Nagad',
        deepLink: 'nagad://payment',
        webUrl: 'https://nagad.com.bd/merchant-payment',
        mobileUrl: 'https://nagad.com.bd/payment'
      },
      'Rocket': {
        name: 'Rocket',
        deepLink: 'rocket://payment',
        webUrl: 'https://www.dutchbanglabank.com/rocket',
        mobileUrl: 'https://www.dutchbanglabank.com/rocket/payment'
      }
    };

    // Open payment gateway if it's a mobile wallet
    if (paymentGateways[paymentMethod]) {
      const gateway = paymentGateways[paymentMethod];
      const amount = selectedInvoice.amount;
      const invoiceId = selectedInvoice._id;
      
      // Create payment URL with parameters
      const paymentParams = new URLSearchParams({
        amount: amount,
        invoice: invoiceId,
        merchant: 'ClinicEase',
        callback: window.location.origin + '/billing'
      });

      // Try to open deep link (for mobile apps)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Try deep link first
        const deepLinkUrl = `${gateway.deepLink}?${paymentParams}`;
        window.location.href = deepLinkUrl;
        
        // Fallback to mobile web URL after a delay
        setTimeout(() => {
          const mobileUrl = `${gateway.mobileUrl}?${paymentParams}`;
          window.open(mobileUrl, '_blank');
        }, 1500);
      } else {
        // Desktop - open in new tab
        const webUrl = `${gateway.webUrl}?${paymentParams}`;
        window.open(webUrl, '_blank');
      }
      
      // Show confirmation dialog
      const confirmed = confirm(
        `You will be redirected to ${gateway.name} to complete the payment.\n\n` +
        `Amount: ৳${amount.toFixed(2)}\n` +
        `Invoice: ${invoiceId.substring(0, 10)}...\n\n` +
        `Click OK after completing the payment, or Cancel to go back.`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    // Update invoice status
    await fetch(`/api/billing/${selectedInvoice._id}/status`, { 
      method: 'PATCH', 
      headers: header, 
      body: JSON.stringify({ 
        status: 'paid', 
        paymentMethod, 
        transactionId: transactionId || `TXN-${Date.now()}`,
        paymentDate: new Date().toISOString()
      }) 
    });
    setShowPaymentModal(false);
    fetchData();
    alert('Payment processed successfully! Your invoice has been marked as paid.');
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/billing/${id}/status`, { method: 'PATCH', headers: header, body: JSON.stringify({ status }) });
    fetchData();
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    
    // Get doctor info from invoice or fallback to "ClinicEase"
    const doctorName = invoice.doctorId?.name || 'ClinicEase Medical Center';
    const doctorEmail = invoice.doctorId?.email || '';
    const doctorPhone = invoice.doctorId?.phone || '';
    
    // Get patient info for reference
    const patientName = invoice.patientId?.name || localStorage.getItem('userName') || 'Patient';
    
    // Header Background with gradient effect
    doc.setFillColor(16, 185, 129); // Green gradient start
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(5, 150, 105); // Green gradient end
    doc.rect(0, 30, 210, 15, 'F');
    
    // Logo/Brand Section - NO EMOJIS
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ClinicEase', 105, 22, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Healthcare Management System', 105, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 40, { align: 'center' });
    
    // Invoice Info Box (Top Right)
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(130, 52, 60, 30, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #', 135, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    const invoiceShort = invoice._id.substring(0, 10);
    doc.text(invoiceShort, 135, 64);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 135, 71);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 135, 76);
    
    // Status Badge
    const statusColors = {
      paid: { bg: [220, 252, 231], text: [22, 101, 52] },
      unpaid: { bg: [254, 243, 199], text: [161, 98, 7] },
      cancelled: { bg: [254, 226, 226], text: [153, 27, 27] }
    };
    const statusColor = statusColors[invoice.status] || statusColors.unpaid;
    doc.setFillColor(...statusColor.bg);
    doc.roundedRect(153, 56, 30, 7, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...statusColor.text);
    doc.text(invoice.status.toUpperCase(), 168, 61, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    // Patient Info Section
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, 52, 105, 30, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(20, 52, 105, 30, 3, 3, 'D');
    
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO:', 25, 59);
    
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(doctorName, 25, 67);
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    if (doctorEmail) doc.text('Email: ' + doctorEmail, 25, 73);
    if (doctorPhone) doc.text('Phone: ' + doctorPhone, 25, 78);
    
    // Patient Information (if needed for reference)
    // Can be added below or in a separate section
    
    // Services/Items Table Header
    doc.setFillColor(16, 185, 129);
    doc.rect(20, 92, 170, 10, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, 99);
    doc.text('AMOUNT', 185, 99, { align: 'right' });
    
    // Table Content
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    
    const description = invoice.description || 'Medical Services';
    const lines = doc.splitTextToSize(description, 135);
    const contentHeight = Math.max(lines.length * 6 + 12, 22);
    
    doc.rect(20, 102, 170, contentHeight, 'D');
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, 25, 110);
    
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('BDT ' + invoice.amount?.toFixed(2), 185, 110, { align: 'right' });
    
    // Total Section
    const totalY = 102 + contentHeight + 5;
    doc.setFillColor(240, 253, 244);
    doc.rect(20, totalY, 170, 16, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.rect(20, totalY, 170, 16, 'D');
    
    doc.setFontSize(14);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT:', 25, totalY + 11);
    doc.setFontSize(16);
    doc.text('BDT ' + invoice.amount?.toFixed(2), 185, totalY + 11, { align: 'right' });
    
    // Payment Details Section
    const paymentY = totalY + 24;
    if (invoice.paymentDate) {
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(20, paymentY, 170, 35, 3, 3, 'F');
      doc.setDrawColor(134, 239, 172);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, paymentY, 170, 35, 3, 3, 'D');
      
      doc.setFontSize(11);
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT INFORMATION', 25, paymentY + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(21, 128, 61);
      doc.text('Payment Method:', 25, paymentY + 16);
      doc.setTextColor(55, 65, 81);
      doc.text(invoice.paymentMethod || 'N/A', 75, paymentY + 16);
      
      doc.setTextColor(21, 128, 61);
      doc.text('Payment Date:', 25, paymentY + 23);
      doc.setTextColor(55, 65, 81);
      doc.text(new Date(invoice.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 75, paymentY + 23);
      
      if (invoice.transactionId) {
        doc.setTextColor(21, 128, 61);
        doc.text('Transaction ID:', 25, paymentY + 30);
        doc.setTextColor(55, 65, 81);
        doc.text(invoice.transactionId, 75, paymentY + 30);
      }
    } else if (invoice.dueDate) {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(20, paymentY, 170, 14, 3, 3, 'F');
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, paymentY, 170, 14, 3, 3, 'D');
      
      doc.setFontSize(10);
      doc.setTextColor(161, 98, 7);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT DUE DATE:', 25, paymentY + 9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(146, 64, 14);
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 85, paymentY + 9);
    }
    
    // Terms & Notes Section
    const notesY = invoice.paymentDate ? paymentY + 42 : (invoice.dueDate ? paymentY + 22 : paymentY);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, notesY, 170, 22, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 25, notesY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('- All payments are non-refundable unless stated otherwise.', 25, notesY + 13);
    doc.text('- Please keep this invoice for your records.', 25, notesY + 18);
    
    // Footer with Divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    
    // Checkmark circle
    doc.setFillColor(16, 185, 129);
    doc.circle(105, 276, 7, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('/', 105, 279, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing ClinicEase!', 105, 287, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('For any queries, contact us at: support@clinicease.com', 105, 292, { align: 'center' });
    doc.text('Phone: +880 1234-567890', 105, 297, { align: 'center' });
    
    // Save PDF
    const timestamp = new Date().getTime();
    doc.save(`ClinicEase-Invoice-${invoice.status}-${timestamp}.pdf`);
  };

  return (
    <div className="billing-container">
      <div className="billing-header">
        <div>
          <h1>💳 Billing & Payments</h1>
          <p className="subtitle">
            {userRole === 'Patient' && 'View and manage your invoices and payment status.'}
            {userRole === 'Doctor' && 'Create and manage patient invoices.'}
            {userRole === 'Admin' && 'Manage all system billing and invoices.'}
          </p>
        </div>
        {userRole === 'Doctor' && (
          <select className="search-input" value={patientId} onChange={e=>setPatientId(e.target.value)}>
            <option value="">All Patients</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>{p.name} - {p.email}</option>
            ))}
          </select>
        )}
        {userRole === 'Admin' && <input className="search-input" placeholder="Patient ID (Admin)" value={patientId} onChange={e=>setPatientId(e.target.value)} />}
      </div>

      {(userRole === 'Doctor' || userRole === 'Admin') && (
        <div className="billing-card">
          <h3>Create New Invoice</h3>
          <form onSubmit={submit}>
            {userRole === 'Doctor' && (
              <select className="form-input" value={patientId} onChange={e=>setPatientId(e.target.value)} required>
                <option value="">Select Patient *</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - {p.email}</option>
                ))}
              </select>
            )}
            {userRole === 'Admin' && (
              <input className="form-input" placeholder="Patient ID *" value={patientId} onChange={e=>setPatientId(e.target.value)} required />
            )}
            <div className="form-row">
              <input className="form-input" type="number" step="0.01" placeholder="Amount (৳)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required />
              <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
            </div>
            <textarea className="form-input" rows="3" placeholder="Description (services, consultation, etc.)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <button className="btn-submit" type="submit">Create Invoice</button>
          </form>
        </div>
      )}

      <div className="billing-card">
        <h3>{userRole === 'Patient' ? 'My Invoices' : 'All Invoices'}</h3>
        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <p>No invoices found.</p>
          </div>
        ) : (
        <div className="invoice-list">
          {list.map(inv => (
            <div key={inv._id} className={`invoice-card status-${inv.status}`}>
              <div className="invoice-header">
                <div className="invoice-amount">৳{inv.amount?.toFixed(2)}</div>
                <span className={`status-badge ${inv.status}`}>{inv.status.toUpperCase()}</span>
              </div>
              <div className="invoice-body">
                <p className="invoice-description">{inv.description}</p>
                <div className="invoice-details">
                  {inv.dueDate && <div className="detail-item">📅 Due: {new Date(inv.dueDate).toLocaleDateString()}</div>}
                  {inv.paymentDate && <div className="detail-item">✅ Paid: {new Date(inv.paymentDate).toLocaleDateString()}</div>}
                  {inv.paymentMethod && <div className="detail-item">💳 Method: {inv.paymentMethod}</div>}
                  {inv.transactionId && <div className="detail-item">🔖 TXN: {inv.transactionId}</div>}
                </div>
              </div>
              <div className="invoice-actions">
                {userRole === 'Patient' && inv.status === 'unpaid' && (
                  <button className="btn-pay" onClick={()=>openPaymentModal(inv)}>Pay Now</button>
                )}
                {(userRole === 'Doctor' || userRole === 'Admin') && (
                  <>
                    {inv.status === 'unpaid' && <button className="btn-secondary" onClick={()=>updateStatus(inv._id,'paid')}>Mark Paid</button>}
                    <button className="btn-cancel" onClick={()=>updateStatus(inv._id,'cancelled')}>Cancel</button>
                  </>
                )}
                <button className="btn-download" onClick={()=>downloadPDF(inv)} title="Download PDF">📄 Download PDF</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💳 Payment</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-info">
                <div className="payment-amount">৳{selectedInvoice.amount?.toFixed(2)}</div>
                <p className="payment-description">{selectedInvoice.description}</p>
              </div>
              
              <div className="payment-methods">
                <h4>Select Payment Method</h4>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'bKash' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="bKash" checked={paymentMethod === 'bKash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <div className="payment-logo bkash-logo">
                        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="#E2136E" width="200" height="60" rx="8"/>
                          <text x="100" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">bKash</text>
                        </svg>
                      </div>
                      <span className="option-name">bKash</span>
                      <span className="option-badge">Mobile Wallet</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'Nagad' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="Nagad" checked={paymentMethod === 'Nagad'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <div className="payment-logo nagad-logo">
                        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="#EE4023" width="200" height="60" rx="8"/>
                          <text x="100" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">Nagad</text>
                        </svg>
                      </div>
                      <span className="option-name">Nagad</span>
                      <span className="option-badge">Mobile Wallet</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'Rocket' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="Rocket" checked={paymentMethod === 'Rocket'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <div className="payment-logo rocket-logo">
                        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="#8B3A9C" width="200" height="60" rx="8"/>
                          <text x="100" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white" textAnchor="middle">Rocket</text>
                        </svg>
                      </div>
                      <span className="option-name">Rocket</span>
                      <span className="option-badge">Mobile Wallet</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'MasterCard' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="MasterCard" checked={paymentMethod === 'MasterCard'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <span className="option-icon">💳</span>
                      <span className="option-name">MasterCard</span>
                      <span className="option-badge">Card Payment</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'Visa' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="Visa" checked={paymentMethod === 'Visa'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <span className="option-icon">💳</span>
                      <span className="option-name">Visa</span>
                      <span className="option-badge">Card Payment</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'Cash' ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <div className="option-content">
                      <span className="option-icon">💵</span>
                      <span className="option-name">Cash</span>
                      <span className="option-badge">Pay at Clinic</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              
              <button className="btn-process-payment" onClick={processPayment}>Process Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
