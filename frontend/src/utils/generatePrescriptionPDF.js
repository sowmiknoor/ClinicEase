import jsPDF from 'jspdf';

export const generatePrescriptionPDF = (prescription) => {
  const doc = new jsPDF();
  
  // Header - Clinic Name
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('ClinicEase', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Digital Healthcare Platform', 105, 25, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('PRESCRIPTION', 105, 50, { align: 'center' });
  
  // Prescription details box
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 60, 180, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, 60, 180, 25);
  
  let yPos = 68;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // Prescription ID and Date
  doc.text(`Prescription ID: ${prescription._id || 'N/A'}`, 20, yPos);
  yPos += 6;
  
  const prescriptionDate = prescription.createdAt 
    ? new Date(prescription.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })
    : 'N/A';
  doc.text(`Date Issued: ${prescriptionDate}`, 20, yPos);
  yPos += 6;
  
  if (prescription.validUntil) {
    const validDate = new Date(prescription.validUntil).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.text(`Valid Until: ${validDate}`, 20, yPos);
  }
  
  yPos = 95;
  
  // Patient Information
  doc.setFillColor(37, 99, 235);
  doc.rect(15, yPos, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('PATIENT INFORMATION', 20, yPos + 5);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  doc.setFont(undefined, 'normal');
  const patientName = prescription.patientId?.name || 'N/A';
  const patientEmail = prescription.patientId?.email || 'N/A';
  const patientPhone = prescription.patientId?.phone || 'N/A';
  
  doc.text(`Name: ${patientName}`, 20, yPos);
  yPos += 6;
  doc.text(`Email: ${patientEmail}`, 20, yPos);
  yPos += 6;
  doc.text(`Phone: ${patientPhone}`, 20, yPos);
  yPos += 10;
  
  // Doctor Information
  doc.setFillColor(37, 99, 235);
  doc.rect(15, yPos, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('PRESCRIBED BY', 20, yPos + 5);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  doc.setFont(undefined, 'normal');
  const doctorName = prescription.doctorId?.name || 'N/A';
  const doctorEmail = prescription.doctorId?.email || 'N/A';
  const doctorPhone = prescription.doctorId?.phone || 'N/A';
  
  doc.text(`Dr. ${doctorName}`, 20, yPos);
  yPos += 6;
  doc.text(`Email: ${doctorEmail}`, 20, yPos);
  yPos += 6;
  doc.text(`Phone: ${doctorPhone}`, 20, yPos);
  yPos += 10;
  
  // Diagnosis
  if (prescription.diagnosis) {
    doc.setFillColor(37, 99, 235);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('DIAGNOSIS', 20, yPos + 5);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
    
    doc.setFont(undefined, 'normal');
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, 170);
    doc.text(diagnosisLines, 20, yPos);
    yPos += (diagnosisLines.length * 6) + 8;
  }
  
  // Medications
  doc.setFillColor(37, 99, 235);
  doc.rect(15, yPos, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('MEDICATIONS', 20, yPos + 5);
  doc.setTextColor(0, 0, 0);
  yPos += 12;
  
  if (prescription.medications && prescription.medications.length > 0) {
    prescription.medications.forEach((med, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Medication number
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${med.name}`, 20, yPos);
      yPos += 6;
      
      doc.setFont(undefined, 'normal');
      doc.text(`   Dosage: ${med.dosage}`, 20, yPos);
      yPos += 5;
      doc.text(`   Frequency: ${med.frequency}`, 20, yPos);
      yPos += 5;
      
      if (med.duration) {
        doc.text(`   Duration: ${med.duration}`, 20, yPos);
        yPos += 5;
      }
      
      if (med.instructions) {
        const instructionsLines = doc.splitTextToSize(`   Instructions: ${med.instructions}`, 170);
        doc.text(instructionsLines, 20, yPos);
        yPos += (instructionsLines.length * 5);
      }
      
      if (med.refills !== undefined && med.refills !== null) {
        doc.text(`   Refills: ${med.refills}`, 20, yPos);
        yPos += 5;
      }
      
      yPos += 5; // Space between medications
    });
  } else {
    doc.text('No medications prescribed', 20, yPos);
    yPos += 10;
  }
  
  // Additional Notes
  if (prescription.notes) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(37, 99, 235);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('ADDITIONAL NOTES', 20, yPos + 5);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
    
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(prescription.notes, 170);
    doc.text(notesLines, 20, yPos);
    yPos += (notesLines.length * 6) + 10;
  }
  
  // Footer - Status and signature
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Status badge
    if (i === pageCount) {
      const status = prescription.status || 'active';
      let statusColor;
      if (status === 'active') statusColor = [34, 197, 94]; // Green
      else if (status === 'completed') statusColor = [107, 114, 128]; // Gray
      else statusColor = [239, 68, 68]; // Red
      
      doc.setFillColor(...statusColor);
      doc.roundedRect(15, 275, 30, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(status.toUpperCase(), 30, 280, { align: 'center' });
    }
    
    // Page number and disclaimer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('This is a computer-generated prescription from ClinicEase', 105, 290, { align: 'center' });
  }
  
  // Generate filename
  const fileName = `Prescription_${patientName.replace(/\s+/g, '_')}_${prescriptionDate.replace(/\s+/g, '_')}.pdf`;
  
  // Download the PDF
  doc.save(fileName);
};
