// Safety level determination based on keywords and context
export const determineSafetyLevel = (response: string, safetyRating: string): 'safe' | 'caution' | 'unsafe' => {
  const responseText = response.toLowerCase();
  const rating = safetyRating.toLowerCase();
  
  // High risk indicators
  const highRiskKeywords = [
    'prescription only',
    'dangerous',
    'severe side effects',
    'respiratory depression',
    'death',
    'overdose',
    'contraindicated',
    'black box warning',
    'serious adverse',
    'life-threatening',
    'avoid',
    'do not use',
    'emergency'
  ];
  
  // Medium risk indicators
  const mediumRiskKeywords = [
    'caution',
    'monitor',
    'consult doctor',
    'side effects',
    'interaction',
    'warning',
    'pregnant',
    'elderly',
    'kidney',
    'liver',
    'heart condition',
    'blood pressure'
  ];
  
  // Safe indicators
  const safeKeywords = [
    'generally safe',
    'well tolerated',
    'low risk',
    'minimal side effects',
    'over-the-counter',
    'safe for most people'
  ];
  
  // Count occurrences
  const highRiskCount = highRiskKeywords.filter(keyword => responseText.includes(keyword)).length;
  const mediumRiskCount = mediumRiskKeywords.filter(keyword => responseText.includes(keyword)).length;
  const safeCount = safeKeywords.filter(keyword => responseText.includes(keyword)).length;
  
  // Determine safety level based on rating and content analysis
  if (rating.includes('prescription only') || highRiskCount >= 2) {
    return 'unsafe';
  } else if (rating.includes('caution') || mediumRiskCount >= 3 || highRiskCount >= 1) {
    return 'caution';
  } else if (rating.includes('generally safe') || safeCount >= 1) {
    return 'safe';
  }
  
  // Default to caution for unknown medicines or unclear ratings
  return 'caution';
};

// Get safety color classes based on safety level
export const getSafetyColorClasses = (safetyLevel: 'safe' | 'caution' | 'unsafe') => {
  switch (safetyLevel) {
    case 'safe':
      return {
        gradient: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    case 'caution':
      return {
        gradient: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'unsafe':
      return {
        gradient: 'from-red-500 to-red-600',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    default:
      return {
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200'
      };
  }
};

// Structured data extraction from AI response
export interface ExtractedMedicineData {
  safetyRating: string;
  warnings: string[];
  dosage: string;
  interactions: string[];
  keyTakeaways: string[];
  sideEffects: string[];
  contraindications: string[];
  emergencySignsraw?: string;
}

export const extractStructuredData = (response: string): ExtractedMedicineData => {
  const sections = response.split(/\*\*\d+\.\s*|\*\*/);
  const data: ExtractedMedicineData = {
    safetyRating: '',
    warnings: [],
    dosage: '',
    interactions: [],
    keyTakeaways: [],
    sideEffects: [],
    contraindications: []
  };
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    const cleanSection = section.trim();
    
    if (lowerSection.includes('safety rating')) {
      // Extract safety rating
      const lines = cleanSection.split('\n');
      for (const line of lines) {
        if (line.includes('Rate as:') || line.includes('rating:')) {
          data.safetyRating = line.replace(/Rate as:|rating:/i, '').trim();
          break;
        }
      }
    }
    
    if (lowerSection.includes('warnings') || lowerSection.includes('precautions')) {
      data.warnings = extractBulletPoints(cleanSection);
    }
    
    if (lowerSection.includes('dosage')) {
      const dosageLines = cleanSection.split('\n').filter(line => line.trim());
      data.dosage = dosageLines.slice(1, 3).join(' ').trim();
    }
    
    if (lowerSection.includes('interactions')) {
      data.interactions = extractBulletPoints(cleanSection);
    }
    
    if (lowerSection.includes('key takeaways') || lowerSection.includes('important')) {
      data.keyTakeaways = extractBulletPoints(cleanSection);
    }
    
    if (lowerSection.includes('side effects')) {
      data.sideEffects = extractBulletPoints(cleanSection);
    }
    
    if (lowerSection.includes('contraindication')) {
      data.contraindications = extractBulletPoints(cleanSection);
    }
  }
  
  return data;
};

// Extract bullet points from text
const extractBulletPoints = (text: string): string[] => {
  const lines = text.split('\n');
  const bulletPoints = lines
    .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
    .map(line => line.replace(/^\s*[\*\-]\s*/, '').trim())
    .filter(line => line.length > 0);
  
  return bulletPoints;
};

// Format response for better display
export const formatResponse = (response: string): string => {
  // Convert markdown-style formatting to HTML
  let formatted = response;
  
  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert bullet points to proper list items
  formatted = formatted.replace(/^\s*[\*\-]\s+(.+)$/gm, '• $1');
  
  // Add proper line breaks for sections
  formatted = formatted.replace(/(\d+\.\s+[^\n]+)/g, '\n$1');
  
  // Clean up excessive whitespace
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
};

// Generate safety rating badge text
export const getSafetyRatingText = (safetyLevel: 'safe' | 'caution' | 'unsafe'): string => {
  switch (safetyLevel) {
    case 'safe':
      return 'Generally Safe';
    case 'caution':
      return 'Use with Caution';
    case 'unsafe':
      return 'High Risk - Prescription Only';
    default:
      return 'Unknown';
  }
};
