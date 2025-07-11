import { useState } from 'react'

const ExportReport = ({ data, reportType = 'analysis' }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generateTextReport = () => {
    if (reportType === 'analysis') {
      return `
AI MEDICINE SAFETY ANALYSIS REPORT
Generated: ${formatDate()}

MEDICATION: ${data.medicine || 'N/A'}

WOMEN'S HEALTH SAFETY:
Risk Level: ${data.womenSafety?.riskLevel || 'Unknown'}
${data.womenSafety?.summary || 'No information available'}

PEDIATRIC SAFETY:
Risk Level: ${data.childrenSafety?.riskLevel || 'Unknown'}
${data.childrenSafety?.summary || 'No information available'}

PREGNANCY SAFETY:
Risk Level: ${data.pregnancySafety?.riskLevel || 'Unknown'}
FDA Category: ${data.pregnancySafety?.fdaCategory || 'Unknown'}
${data.pregnancySafety?.summary || 'No information available'}

SIDE EFFECTS:
${data.sideEffects?.map(effect => `- ${effect.category}: ${effect.effects.join(', ')}`).join('\n') || 'None reported'}

CLINICAL TRIALS:
${data.clinicalTrials?.summary || 'No information available'}

ALTERNATIVES:
${data.alternatives?.map(alt => `- ${alt.name}: ${alt.reason}`).join('\n') || 'None suggested'}

DISCLAIMER:
${data.disclaimer || 'This analysis is for informational purposes only. Always consult with healthcare professionals before making medical decisions.'}
      `.trim()
    } else {
      // Interaction report
      return `
AI DRUG INTERACTION ANALYSIS REPORT
Generated: ${formatDate()}

MEDICATIONS ANALYZED:
${data.medications?.join(', ') || 'N/A'}

INTERACTION SUMMARY:
Overall Risk: ${data.overallRisk || 'Unknown'}
${data.summary || 'No information available'}

DETAILED INTERACTIONS:
${data.interactions?.map(interaction => `
- ${interaction.drugs.join(' + ')}
  Severity: ${interaction.severity}
  Description: ${interaction.description}
  Recommendation: ${interaction.recommendation}
`).join('\n') || 'None found'}

RECOMMENDATIONS:
${data.recommendations?.join('\n- ') || 'None provided'}

DISCLAIMER:
This interaction analysis is for informational purposes only. Always consult with healthcare professionals before making medical decisions.
      `.trim()
    }
  }

  const downloadTextFile = () => {
    const content = generateTextReport()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medicine-${reportType}-report-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateHTMLReport = () => {
    const content = generateTextReport()
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medicine Safety Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { border-bottom: 3px solid #1565c0; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1565c0; margin: 0; }
        .section { margin-bottom: 25px; padding: 15px; border-left: 4px solid #e3f2fd; background: #f8fafc; }
        .section h2 { color: #1565c0; margin-top: 0; }
        .risk-high { border-left-color: #d32f2f; background: #ffebee; }
        .risk-moderate { border-left-color: #f57c00; background: #fff3e0; }
        .risk-low { border-left-color: #388e3c; background: #e8f5e8; }
        .disclaimer { background: #fff3e0; border: 1px solid #f57c00; padding: 15px; border-radius: 5px; font-weight: bold; }
        pre { white-space: pre-wrap; font-family: inherit; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 AI Medicine Safety Analysis Report</h1>
        <p>Generated: ${formatDate()}</p>
    </div>
    <pre>${content}</pre>
    <div class="disclaimer">
        ⚠️ Important: This analysis is for informational purposes only. Always consult with qualified healthcare professionals before making any medical decisions.
    </div>
</body>
</html>
    `.trim()
  }

  const downloadHTMLFile = () => {
    const content = generateHTMLReport()
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medicine-${reportType}-report-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (exportFormat === 'txt') {
        downloadTextFile()
      } else if (exportFormat === 'html') {
        downloadHTMLFile()
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll create an HTML version and let the user print to PDF
        const content = generateHTMLReport()
        const newWindow = window.open('', '_blank')
        newWindow.document.write(content)
        newWindow.document.close()
        
        // Trigger print dialog after a short delay
        setTimeout(() => {
          newWindow.print()
        }, 500)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const content = generateTextReport()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Medicine ${reportType} Report`,
          text: content.substring(0, 200) + '...',
          url: window.location.href
        })
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(content)
      }
    } else {
      copyToClipboard(content)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Report copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard. Please try downloading instead.')
    }
  }

  if (!data) {
    return null
  }

  return (
    <div className="export-report-container">
      <div className="export-header">
        <h3>📄 Export Report</h3>
        <p className="export-description">
          Save or share your {reportType} report for your records or healthcare provider
        </p>
      </div>

      <div className="export-options">
        <div className="format-selection">
          <label className="export-label">
            <span>Export Format:</span>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className="export-select"
              aria-label="Select export format"
            >
              <option value="pdf">PDF (Print Dialog)</option>
              <option value="html">HTML File</option>
              <option value="txt">Text File</option>
            </select>
          </label>
        </div>

        <div className="export-actions">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="export-button btn-primary"
            aria-label={`Export report as ${exportFormat.toUpperCase()}`}
          >
            {isExporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <span>📥</span>
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </button>

          <button 
            onClick={handleShare}
            className="share-button btn-secondary"
            aria-label="Share report"
          >
            <span>📤</span>
            Share
          </button>

          <button 
            onClick={() => copyToClipboard(generateTextReport())}
            className="copy-button btn-secondary"
            aria-label="Copy report to clipboard"
          >
            <span>📋</span>
            Copy
          </button>
        </div>
      </div>

      <div className="export-info">
        <div className="info-item">
          <span className="info-icon">🕐</span>
          <span>Generated: {formatDate()}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⚠️</span>
          <span>For informational purposes only</span>
        </div>
      </div>
    </div>
  )
}

export default ExportReport
