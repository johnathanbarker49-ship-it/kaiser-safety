import { DocumentSubmission, SafetyDocument, ToolboxTalkSubmission, Employee, FormField } from '@/types/safety';

// Generate PDF HTML content for a document submission
export const generateDocumentPDF = (
  submission: DocumentSubmission,
  document: SafetyDocument | undefined,
  employee: Employee | undefined
): void => {
  const formFields: FormField[] = document?.form_fields 
    ? (typeof document.form_fields === 'string' 
        ? JSON.parse(document.form_fields) 
        : document.form_fields)
    : [];

  const renderFieldValue = (field: FormField): string => {
    const value = submission.form_data?.[field.name];
    
    if (field.type === 'checklist') {
      const checkedItems = value || [];
      return field.items?.map(item => {
        const isChecked = checkedItems.includes(item);
        return `
          <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
            <div style="width: 16px; height: 16px; border: 1px solid ${isChecked ? '#22c55e' : '#d1d5db'}; border-radius: 3px; background: ${isChecked ? '#22c55e' : 'white'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${isChecked ? '<span style="color: white; font-size: 12px;">✓</span>' : ''}
            </div>
            <span style="font-size: 14px; color: ${isChecked ? '#111827' : '#6b7280'};">${item}</span>
          </div>
        `;
      }).join('') || '';
    }

    if (!value) {
      return '<span style="color: #9ca3af; font-style: italic;">Not provided</span>';
    }

    return `<span style="color: #111827;">${value}</span>`;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document?.title || 'Document'} - ${submission.id.slice(0, 8).toUpperCase()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e3a5f; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #60a5fa; padding-bottom: 24px; margin-bottom: 24px; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .icon-box { width: 56px; height: 56px; background: #60a5fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
        .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .subtitle { color: #6b7280; margin-top: 4px; }
        .logo-box { width: 80px; height: 80px; border: 2px solid #bfdbfe; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #eff6ff, #fef3c7); }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .info-item label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
        .info-item p { font-size: 14px; color: #1e3a5f; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e3a5f; margin-bottom: 12px; }
        .description { color: #374151; font-size: 14px; }
        .field { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; }
        .field:last-child { border-bottom: none; }
        .field-label { font-size: 14px; font-weight: 500; color: #1e3a5f; margin-bottom: 8px; }
        .field-value { padding-left: 16px; }
        .signature-section { background: #f0f9ff; padding: 24px; border-radius: 8px; margin-top: 24px; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
        .signature-box { }
        .signature-label { font-size: 14px; font-weight: 500; color: #1e3a5f; margin-bottom: 8px; }
        .signature-line { border-bottom: 2px solid #1e3a5f; height: 60px; }
        .signature-image { height: 60px; border: 1px solid #bfdbfe; border-radius: 8px; padding: 4px; background: white; }
        .signature-image img { height: 100%; width: auto; object-fit: contain; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
        .footer-brand { color: #60a5fa; font-weight: 500; }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <div class="icon-box">📋</div>
            <div>
              <h1 class="title">${document?.title || 'Document Submission'}</h1>
              <p class="subtitle">${document?.category || 'Safety Document'} • Version ${document?.version || '1.0'}</p>
            </div>
          </div>
          <div class="logo-box">
            <span style="font-size: 11px; color: #60a5fa; text-align: center; font-weight: 500;">Company<br/>Logo</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Document ID</label>
            <p style="font-family: monospace;">${submission.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div class="info-item">
            <label>Date</label>
            <p>${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div class="info-item">
            <label>Employee</label>
            <p>${employee?.name || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Status</label>
            <p style="color: ${submission.status === 'submitted' ? '#22c55e' : submission.status === 'expired' ? '#ef4444' : '#6b7280'}; font-weight: 500;">
              ${submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'Submitted'}
            </p>
          </div>
        </div>

        ${document?.description ? `
        <div class="section">
          <h2 class="section-title">Description</h2>
          <p class="description">${document.description}</p>
        </div>
        ` : ''}

        <div class="section">
          <h2 class="section-title">Form Fields</h2>
          ${formFields.map((field, index) => `
            <div class="field">
              <div class="field-label">${index + 1}. ${field.label}${field.required ? ' <span style="color: #ef4444; font-size: 12px;">*Required</span>' : ''}</div>
              <div class="field-value">${renderFieldValue(field)}</div>
            </div>
          `).join('')}
        </div>

        <div class="signature-section">
          <h2 class="section-title">Certification & Signature</h2>
          <p style="font-size: 14px; color: #374151; margin-bottom: 16px;">
            I certify that I have read and understood the contents of this document. 
            I agree to comply with all safety requirements and procedures outlined herein.
          </p>
          
          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-label">Employee Signature</div>
              ${submission.signature ? `
                <div class="signature-image">
                  <img src="${submission.signature}" alt="Signature" />
                </div>
              ` : '<div class="signature-line"></div>'}
            </div>
            <div class="signature-box">
              <div class="signature-label">Date Signed</div>
              <p style="font-size: 14px; color: #1e3a5f;">
                ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-CA') : '___________________'}
              </p>
            </div>
          </div>

          <div class="signature-grid" style="margin-top: 24px;">
            <div class="signature-box">
              <div class="signature-label">Supervisor Signature</div>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <div class="signature-label">Date</div>
              <div style="border-bottom: 1px solid #1e3a5f; height: 32px;"></div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>
            <p class="footer-brand">Kaiser - Canadian Construction Safety Platform</p>
            <p>OHSA Compliant • CSA Standards • WSIB Ready</p>
          </div>
          <div style="text-align: right;">
            <p>Page 1 of 1</p>
            <p>Generated: ${new Date().toLocaleDateString('en-CA')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// Generate PDF HTML content for a toolbox talk submission
export const generateToolboxTalkPDF = (
  submission: ToolboxTalkSubmission,
  employees: Employee[]
): void => {
  const talk = submission.toolbox_talk_data;
  
  const getEmployeeName = (empId: string): string => {
    const emp = employees.find(e => e.id === empId);
    return emp?.name || 'Unknown';
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Toolbox Talk - ${talk.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e3a5f; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #22c55e; padding-bottom: 24px; margin-bottom: 24px; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .icon-box { width: 56px; height: 56px; background: #22c55e; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
        .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .subtitle { color: #6b7280; margin-top: 4px; }
        .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-left: 8px; }
        .logo-box { width: 80px; height: 80px; border: 2px solid #bbf7d0; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4, #fef3c7); }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .info-item label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
        .info-item p { font-size: 14px; color: #1e3a5f; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e3a5f; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .section-icon { width: 24px; height: 24px; background: #22c55e; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
        .content-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e; }
        .content-box p { color: #374151; font-size: 14px; white-space: pre-wrap; }
        .list { list-style: none; padding: 0; }
        .list li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #374151; }
        .list li::before { content: "•"; color: #22c55e; font-weight: bold; }
        .signature-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .signature-table th { background: #f0fdf4; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #1e3a5f; border-bottom: 2px solid #22c55e; }
        .signature-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .signature-table tr:last-child td { border-bottom: none; }
        .signature-image { height: 40px; }
        .signature-image img { height: 100%; width: auto; object-fit: contain; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
        .status-signed { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
        .footer-brand { color: #22c55e; font-weight: 500; }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <div class="icon-box">🔧</div>
            <div>
              <h1 class="title">${talk.title}</h1>
              <p class="subtitle">
                ${talk.category}
                <span class="badge">${talk.duration}</span>
              </p>
            </div>
          </div>
          <div class="logo-box">
            <span style="font-size: 11px; color: #22c55e; text-align: center; font-weight: 500;">Company<br/>Logo</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Reference ID</label>
            <p style="font-family: monospace;">${submission.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div class="info-item">
            <label>Conducted</label>
            <p>${submission.conducted_at ? new Date(submission.conducted_at).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div class="info-item">
            <label>Presenter</label>
            <p>${submission.presenter_name || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Project Site</label>
            <p>${submission.project_site || '___________________'}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">📝</span>
            Overview
          </h2>
          <div class="content-box">
            <p>${talk.overview}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">📚</span>
            Content
          </h2>
          <div class="content-box">
            <p>${talk.content}</p>
          </div>
        </div>

        ${talk.keyPoints && talk.keyPoints.length > 0 ? `
        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">⭐</span>
            Key Points
          </h2>
          <ul class="list">
            ${talk.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${talk.discussionQuestions && talk.discussionQuestions.length > 0 ? `
        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">❓</span>
            Discussion Questions
          </h2>
          <ul class="list">
            ${talk.discussionQuestions.map(q => `<li>${q}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="section">
          <h2 class="section-title">
            <span class="section-icon">✍️</span>
            Attendance & Signatures
          </h2>
          <table class="signature-table">
            <thead>
              <tr>
                <th style="width: 30%;">Employee Name</th>
                <th style="width: 30%;">Signature</th>
                <th style="width: 25%;">Date Signed</th>
                <th style="width: 15%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${submission.assigned_employees.map(empId => {
                const sig = submission.signatures.find(s => s.employee_id === empId);
                const empName = getEmployeeName(empId);
                return `
                  <tr>
                    <td>${empName}</td>
                    <td>
                      ${sig?.signature ? `
                        <div class="signature-image">
                          <img src="${sig.signature}" alt="Signature" />
                        </div>
                      ` : '<span style="color: #9ca3af;">___________________</span>'}
                    </td>
                    <td>${sig?.signed_at ? new Date(sig.signed_at).toLocaleDateString('en-CA') : '-'}</td>
                    <td>
                      <span class="status-badge ${sig ? 'status-signed' : 'status-pending'}">
                        ${sig ? 'Signed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div>
            <p class="footer-brand">Kaiser - Canadian Construction Safety Platform</p>
            <p>OHSA Compliant • CSA Standards • WSIB Ready</p>
          </div>
          <div style="text-align: right;">
            <p>Page 1 of 1</p>
            <p>Generated: ${new Date().toLocaleDateString('en-CA')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// Generate PDF for equipment checklist submission
export const generateEquipmentChecklistPDF = (
  submission: DocumentSubmission,
  employee: Employee | undefined
): void => {
  const formData = submission.form_data || {};
  const projectInfo = formData.projectInfo || {};
  const checklistItems = formData.checklistItems || [];
  const equipmentName = formData.equipmentName || 'Equipment';
  const approvedForUse = formData.approvedForUse;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${equipmentName} Pre-Use Inspection</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e3a5f; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #f59e0b; padding-bottom: 24px; margin-bottom: 24px; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .icon-box { width: 56px; height: 56px; background: #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
        .title { font-size: 24px; font-weight: bold; color: #1e3a5f; }
        .subtitle { color: #6b7280; margin-top: 4px; }
        .approval-badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-top: 8px; }
        .approved { background: #dcfce7; color: #166534; }
        .not-approved { background: #fee2e2; color: #991b1b; }
        .logo-box { width: 80px; height: 80px; border: 2px solid #fcd34d; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #fffbeb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .info-item label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
        .info-item p { font-size: 14px; color: #1e3a5f; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e3a5f; margin-bottom: 12px; }
        .checklist-table { width: 100%; border-collapse: collapse; }
        .checklist-table th { background: #fffbeb; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #1e3a5f; border-bottom: 2px solid #f59e0b; }
        .checklist-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .checklist-table tr:last-child td { border-bottom: none; }
        .status-pass { color: #166534; font-weight: 500; }
        .status-fail { color: #991b1b; font-weight: 500; }
        .status-na { color: #6b7280; }
        .notes-box { background: #f9fafb; padding: 12px; border-radius: 8px; font-size: 14px; color: #374151; min-height: 40px; }
        .signature-section { background: #fffbeb; padding: 24px; border-radius: 8px; margin-top: 24px; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
        .signature-label { font-size: 14px; font-weight: 500; color: #1e3a5f; margin-bottom: 8px; }
        .signature-line { border-bottom: 2px solid #1e3a5f; height: 60px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
        .footer-brand { color: #f59e0b; font-weight: 500; }
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <div class="icon-box">🚛</div>
            <div>
              <h1 class="title">${equipmentName} Pre-Use Inspection</h1>
              <p class="subtitle">Daily Equipment Checklist</p>
              <span class="approval-badge ${approvedForUse ? 'approved' : 'not-approved'}">
                ${approvedForUse ? 'APPROVED FOR USE' : 'NOT APPROVED FOR USE'}
              </span>
            </div>
          </div>
          <div class="logo-box">
            <span style="font-size: 11px; color: #f59e0b; text-align: center; font-weight: 500;">Company<br/>Logo</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Project Name</label>
            <p>${projectInfo.projectName || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Inspector</label>
            <p>${projectInfo.inspectorName || employee?.name || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Inspection Date</label>
            <p>${projectInfo.inspectionDate || new Date().toLocaleDateString('en-CA')}</p>
          </div>
          <div class="info-item">
            <label>Equipment ID/Unit #</label>
            <p>${projectInfo.equipmentId || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Hour Meter Reading</label>
            <p>${projectInfo.hourMeterReading || '___________________'}</p>
          </div>
          <div class="info-item">
            <label>Location</label>
            <p>${submission.project_site || '___________________'}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Inspection Checklist</h2>
          <table class="checklist-table">
            <thead>
              <tr>
                <th style="width: 50%;">Item</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 35%;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${checklistItems.map((item: any) => `
                <tr>
                  <td>${item.label || item.name}</td>
                  <td>
                    <span class="${item.status === 'pass' ? 'status-pass' : item.status === 'fail' ? 'status-fail' : 'status-na'}">
                      ${item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'N/A'}
                    </span>
                  </td>
                  <td style="font-size: 12px; color: #6b7280;">${item.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${formData.generalNotes ? `
        <div class="section">
          <h2 class="section-title">General Notes / Deficiencies</h2>
          <div class="notes-box">${formData.generalNotes}</div>
        </div>
        ` : ''}

        <div class="signature-section">
          <h2 class="section-title">Certification</h2>
          <p style="font-size: 14px; color: #374151; margin-bottom: 16px;">
            I certify that I have completed this pre-use inspection and the equipment is ${approvedForUse ? 'safe for operation' : 'NOT safe for operation'}.
          </p>
          
          <div class="signature-grid">
            <div>
              <div class="signature-label">Inspector Signature</div>
              <div class="signature-line"></div>
            </div>
            <div>
              <div class="signature-label">Date</div>
              <p style="font-size: 14px; color: #1e3a5f;">
                ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-CA') : '___________________'}
              </p>
            </div>
          </div>

          <div class="signature-grid" style="margin-top: 24px;">
            <div>
              <div class="signature-label">Supervisor Signature (if not approved)</div>
              <div class="signature-line"></div>
            </div>
            <div>
              <div class="signature-label">Date</div>
              <div style="border-bottom: 1px solid #1e3a5f; height: 32px;"></div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>
            <p class="footer-brand">Kaiser - Canadian Construction Safety Platform</p>
            <p>OHSA Compliant • CSA Standards • WSIB Ready</p>
          </div>
          <div style="text-align: right;">
            <p>Page 1 of 1</p>
            <p>Generated: ${new Date().toLocaleDateString('en-CA')}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
