const aiServiceFactory = require('./aiServiceFactory');
const prompts = require('../utils/prompts');
const medicineNameMapper = require('./medicineNameMapper');
const logger = require('../utils/logger');

class MedicineAnalysisService {
  
  async analyzeMedicine(medicineName, patientInfo = {}) {
    try {
      // First, try to resolve the medicine name to its generic equivalent
      let resolvedMedicineName = medicineName;
      const genericName = medicineNameMapper.getGenericName(medicineName);
      
      if (genericName) {
        logger.info(`Resolved ${medicineName} to generic name: ${genericName}`);
        resolvedMedicineName = genericName;
      }
      
      const analysisPrompt = prompts.createAnalysisPrompt(resolvedMedicineName, patientInfo);
      
      logger.info(`Analyzing medicine: ${resolvedMedicineName} (original: ${medicineName}) for patient profile:`, patientInfo);
      
      const response = await aiServiceFactory.generateStructuredContent(analysisPrompt);
      logger.info(`Medicine analysis provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        // For enhanced mock, the response already contains structured data
        content = response;
      } else {
        // For real AI services, extract content field
        content = response.content;
      }
      
      // Enhanced parsing with specialized analysis
      const analysis = await this.parseAdvancedAnalysisResponse(content, resolvedMedicineName, patientInfo);
      
      // Add original and resolved names to the response
      analysis.medicineNames = {
        original: medicineName,
        resolved: resolvedMedicineName,
        wasResolved: genericName !== null
      };

      // Get additional specialized analyses
      if (patientInfo.gender === 'female' || patientInfo.isPregnant) {
        analysis.specializedWomensHealth = await this.getWomensHealthAnalysis(resolvedMedicineName, patientInfo);
      }
      
      if (patientInfo.isChild || (patientInfo.age && patientInfo.age < 18)) {
        analysis.specializedPediatric = await this.getPediatricAnalysis(resolvedMedicineName, patientInfo.age);
      }
      
      if (patientInfo.isPregnant) {
        analysis.specializedPregnancy = await this.getPregnancyAnalysis(resolvedMedicineName);
      }
      
      // Get alternative medications (with error handling)
      try {
        analysis.alternatives = await this.getAlternatives(resolvedMedicineName);
      } catch (error) {
        logger.warn(`Failed to get alternatives for ${resolvedMedicineName}:`, error.message);
        analysis.alternatives = {
          byPopulation: { womenReproductiveAge: [], pregnant: [], pediatric: [], elderly: [] },
          byMechanism: [],
          safetyComparisons: 'Alternative medication analysis unavailable.',
          transitionStrategies: 'Consult your healthcare provider for medication alternatives.',
          evidenceLevel: 'insufficient',
          recommendations: ['Discuss alternative options with your healthcare provider.']
        };
      }
      
      return analysis;
      
    } catch (error) {
      logger.error(`Medicine analysis failed for ${medicineName}:`, error.message);
      throw error;
    }
  }

  async getWomensHealthAnalysis(medicineName, patientInfo) {
    try {
      const womensPrompt = prompts.createWomensHealthPrompt(medicineName, patientInfo);
      const response = await aiServiceFactory.generateStructuredContent(womensPrompt);
      logger.info(`Women's health analysis provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        content = response;
      } else {
        content = response.content;
      }
      
      return {
        analysis: typeof content === 'string' ? content : content.content || JSON.stringify(content),
        focus: 'women_health',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.warn(`Women's health analysis failed for ${medicineName}:`, error.message);
      return {
        analysis: 'Specialized women\'s health analysis unavailable. Please consult your healthcare provider.',
        focus: 'women_health',
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPediatricAnalysis(medicineName, age) {
    try {
      const pediatricPrompt = prompts.createPediatricPrompt(medicineName, age);
      const response = await aiServiceFactory.generateStructuredContent(pediatricPrompt);
      logger.info(`Pediatric analysis provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        content = response;
      } else {
        content = response.content;
      }
      
      return {
        analysis: typeof content === 'string' ? content : content.content || JSON.stringify(content),
        focus: 'pediatric',
        ageGroup: this.getAgeGroup(age),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.warn(`Pediatric analysis failed for ${medicineName}:`, error.message);
      return {
        analysis: 'Specialized pediatric analysis unavailable. Please consult a pediatrician.',
        focus: 'pediatric',
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPregnancyAnalysis(medicineName) {
    try {
      const pregnancyPrompt = prompts.createPregnancyPrompt(medicineName);
      const response = await aiServiceFactory.generateStructuredContent(pregnancyPrompt);
      logger.info(`Pregnancy analysis provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        content = response;
      } else {
        content = response.content;
      }
      
      return {
        analysis: typeof content === 'string' ? content : content.content || JSON.stringify(content),
        focus: 'pregnancy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.warn(`Pregnancy analysis failed for ${medicineName}:`, error.message);
      return {
        analysis: 'Specialized pregnancy analysis unavailable. Please consult your obstetrician.',
        focus: 'pregnancy',
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getAlternatives(medicineName, condition = '') {
    try {
      const alternativesPrompt = prompts.createAlternativesPrompt(medicineName, condition);
      
      logger.info(`Getting alternatives for: ${medicineName}, condition: ${condition}`);
      
      const response = await aiServiceFactory.generateStructuredContent(alternativesPrompt);
      logger.info(`Alternatives provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        // For enhanced mock, the response already contains structured data
        content = response;
      } else {
        // For real AI services, extract content field
        content = response.content;
      }
      
      // Enhanced parsing for alternatives
      const alternatives = this.parseAdvancedAlternativesResponse(content);
      
      return alternatives;
      
    } catch (error) {
      logger.error(`Failed to get alternatives for ${medicineName}:`, error.message);
      return {
        byPopulation: {
          womenReproductiveAge: [],
          pregnant: [],
          pediatric: [],
          elderly: []
        },
        byMechanism: [],
        safetyComparisons: 'Safety comparison data not available.',
        transitionStrategies: 'Transition guidance not available.',
        evidenceLevel: 'insufficient',
        recommendations: ['Consult your healthcare provider for alternative medication options.'],
        error: 'Unable to retrieve alternative medications at this time.'
      };
    }
  }

  async checkInteractions(medicines) {
    try {
      const interactionPrompt = prompts.createInteractionPrompt(medicines);
      
      logger.info(`Checking interactions for: ${medicines.join(', ')}`);
      
      const response = await aiServiceFactory.generateStructuredContent(interactionPrompt);
      logger.info(`Interaction check provided by ${response.serviceUsed} service`);
      
      // Extract content properly based on response type
      let content;
      if (response.serviceUsed === 'enhanced_mock_service') {
        content = response;
      } else {
        content = response.content;
      }
      
      // Enhanced interaction parsing
      const interactions = this.parseAdvancedInteractionsResponse(content, medicines);
      
      return interactions;
      
    } catch (error) {
      logger.error(`Interaction check failed for ${medicines.join(', ')}:`, error.message);
      // Return a fallback response instead of throwing
      return {
        medicines,
        pharmacokineticInteractions: 'Pharmacokinetic interaction data not available.',
        pharmacodynamicInteractions: 'Pharmacodynamic interaction data not available.',
        populationSpecific: {
          women: null,
          pediatric: null,
          pregnancy: null
        },
        severityAssessment: 'unknown',
        managementStrategies: 'Consult your healthcare provider for interaction management.',
        monitoringRequirements: 'Monitoring requirements should be discussed with your healthcare provider.',
        riskLevel: 'unknown',
        checkedAt: new Date().toISOString(),
        error: 'Unable to retrieve interaction data at this time. Please consult your healthcare provider.'
      };
    }
  }

  async parseAdvancedAnalysisResponse(response, medicineName, patientInfo) {
    try {
      // Debug logging
      logger.info('parseAdvancedAnalysisResponse received:', { 
        responseType: typeof response, 
        hasContent: response && response.content !== undefined,
        hasMedicationOverview: response && response.medicationOverview !== undefined,
        hasServiceUsed: response && response.serviceUsed !== undefined,
        allKeys: response && typeof response === 'object' ? Object.keys(response) : 'not-object',
        sampleData: response && typeof response === 'object' ? JSON.stringify(response).substring(0, 200) : (typeof response === 'string' ? response.substring(0, 200) : 'not-string-or-object')
      });
      
      // Handle structured response (object) vs text response
      let content;
      
      // Direct structured response from mock service (no content wrapper)
      if (typeof response === 'object' && response.medicationOverview) {
        logger.info('Processing direct structured mock response');
        return {
          ...response,
          lastUpdated: new Date().toISOString(),
          riskLevel: response.riskLevel || 'low',
          confidenceLevel: response.confidenceLevel || 'moderate',
          evidenceQuality: response.evidenceQuality || 'moderate',
          specialPopulations: response.specialPopulations || {
            renalImpairment: null,
            hepaticImpairment: null,
            elderly: null,
            pediatric: null
          }
        };
      }
      // Handle nested content object from AI
      else if (typeof response === 'object') {
        if (response.content && typeof response.content === 'object') {
          // Direct structured response from AI
          return {
            ...response.content,
            lastUpdated: new Date().toISOString(),
            riskLevel: response.content.riskLevel || this.assessAdvancedRiskLevel(response.content, patientInfo),
            confidenceLevel: response.content.confidenceLevel || 'moderate',
            evidenceQuality: response.content.evidenceQuality || 'moderate',
            sideEffects: response.content.sideEffects || this.parseSideEffects(JSON.stringify(response.content)),
            specialPopulations: response.content.specialPopulations || this.extractSpecialPopulations(JSON.stringify(response.content))
          };
        } else {
          // Handle JSON content as string
          content = response.content || JSON.stringify(response);
        }
      } else {
        // Handle plain text response from Gemini
        content = response;
        logger.info('Processing plain text response from AI service, length:', content ? content.length : 0);
        logger.info('Content sample (first 200 chars):', content ? content.substring(0, 200) : 'empty');
      }
      
      // If content is still not a string, something went wrong
      if (typeof content !== 'string') {
        logger.warn('Content is not a string, converting:', typeof content);
        content = JSON.stringify(content);
      }
      
      // Enhanced structure with more detailed parsing
      const analysis = {
        medicationOverview: this.extractAdvancedSection(content, 'medication overview|overview|general information|drug class|mechanism', 'Medication information not available.'),
        generalSafety: this.extractAdvancedSection(content, 'general safety|safety profile|safety concern', 'General safety information not available.'),
        womensSafety: this.extractAdvancedSection(content, 'women.*health|female.*health|gender.*specific|hormonal|estrogen|progesterone', 'Women-specific safety information not available.'),
        pediatricSafety: this.extractAdvancedSection(content, 'pediatric|children|child|adolescent|infant', 'Pediatric safety information not available.'),
        pregnancySafety: this.extractAdvancedSection(content, 'pregnancy|pregnant|lactation|breastfeeding|fetus|fetal', 'Pregnancy safety information not available.'),
        clinicalTrials: this.extractAdvancedSection(content, 'clinical trial|studies|research|evidence|analysis', 'Clinical trial information not available.'),
        sideEffects: this.parseSideEffects(content),
        contraindications: this.extractAdvancedSection(content, 'contraindication|avoid|warning|caution', 'Contraindication information not available.'),
        dosing: this.extractAdvancedSection(content, 'dosing|dose|dosage|administration|recommended', 'Dosing information not available.'),
        interactions: this.extractAdvancedSection(content, 'interaction|drug.*drug|medication.*interaction', 'Drug interaction information not available.'),
        monitoring: this.extractAdvancedSection(content, 'monitoring|surveillance|follow.*up|test|check', 'Monitoring recommendations not available.'),
        summary: this.extractAdvancedSummary(content) || `Analysis for ${medicineName} with limited details available.`,
        riskLevel: this.assessAdvancedRiskLevel(content, patientInfo),
        confidenceLevel: this.assessConfidenceLevel(content),
        evidenceQuality: this.assessEvidenceQuality(content),
        blackBoxWarnings: this.extractBlackBoxWarnings(content),
        specialPopulations: this.extractSpecialPopulations(content),
        lastUpdated: new Date().toISOString()
      };
      
      logger.info('Parsed analysis structure:', {
        hasOverview: !!analysis.medicationOverview,
        hasSafety: !!analysis.generalSafety,
        hasSideEffects: !!analysis.sideEffects,
        riskLevel: analysis.riskLevel,
        contentLength: content ? content.length : 0,
        sampleContent: content ? content.substring(0, 300) : 'no-content'
      });
      
      // If all sections are default fallbacks, use the raw content as general safety
      const hasAnyRealContent = [
        analysis.medicationOverview,
        analysis.generalSafety,
        analysis.womensSafety,
        analysis.pediatricSafety,
        analysis.pregnancySafety
      ].some(section => !section.includes('not available'));
      
      if (!hasAnyRealContent && content && content.length > 50) {
        logger.info('No structured sections found, using raw content as general information');
        analysis.medicationOverview = `Comprehensive analysis for ${medicineName}`;
        analysis.generalSafety = content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
        analysis.summary = `AI analysis of ${medicineName}. ` + content.substring(0, 200) + (content.length > 200 ? '...' : '');
      }
      
      return analysis;
      
    } catch (error) {
      logger.warn('Failed to parse advanced analysis response:', error.message);
      
      // Enhanced fallback with better structure
      return this.createFallbackAnalysis(response, medicineName, patientInfo);
    }
  }

  parseSideEffects(content) {
    try {
      // If content is an object with sideEffects already structured
      if (typeof content === 'object' && content.sideEffects) {
        return {
          ...content.sideEffects,
          summary: content.sideEffects.summary || 'Side effects vary by individual.'
        };
      }

      // Handle string content
      let contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Try to extract a complete side effect section
      const sideEffectSection = this.extractAdvancedSection(contentStr, 'side effect|adverse|reaction|adverse event', '');
      
      // If we find a formatted side effects section with bullets or lists
      const hasList = /[-•*]\s.*?[\n\r]/.test(sideEffectSection);
      
      const result = {
        common: this.extractListFromText(sideEffectSection, 'common|frequent|≥.*%|>.*%|most'),
        serious: this.extractListFromText(sideEffectSection, 'serious|severe|life.*threatening|danger'),
        rare: this.extractListFromText(sideEffectSection, 'rare|uncommon|<.*%|infre'),
        genderSpecific: this.extractListFromText(contentStr, 'women|female|gender|estrogen|menstr'),
        ageSpecific: this.extractListFromText(contentStr, 'children|pediatric|elderly|geriatric|age'),
        summary: sideEffectSection || 'Side effect information not available.'
      };
      
      // If no lists were found but we have content, create a default entry
      if (result.common.length === 0 && result.serious.length === 0 && result.rare.length === 0 && sideEffectSection) {
        const sideEffectParagraphs = sideEffectSection.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 20);
        if (sideEffectParagraphs.length > 0) {
          result.common = [sideEffectParagraphs[0]];
        }
      }
      
      return result;
    } catch (error) {
      logger.warn('Error parsing side effects:', error.message);
      return {
        summary: 'Side effect information available in medication package insert or consult a healthcare professional.',
        common: [],
        serious: [],
        rare: [],
        genderSpecific: [],
        ageSpecific: []
      };
    }
  }

  parseAdvancedAlternativesResponse(response) {
    let content = response.content || response;
    
    // Ensure content is a string for processing
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    
    const alternatives = {
      byPopulation: {
        womenReproductiveAge: this.extractAlternativesByPopulation(content, 'women.*reproductive|reproductive.*age'),
        pregnant: this.extractAlternativesByPopulation(content, 'pregnant|pregnancy'),
        pediatric: this.extractAlternativesByPopulation(content, 'pediatric|children|child'),
        elderly: this.extractAlternativesByPopulation(content, 'elderly|geriatric')
      },
      byMechanism: this.extractAlternativesByMechanism(content),
      safetyComparisons: this.extractSafetyComparisons(content),
      transitionStrategies: this.extractTransitionStrategies(content),
      evidenceLevel: this.assessAlternativeEvidence(content),
      recommendations: this.extractRecommendations(content)
    };
    
    return alternatives;
  }

  parseAdvancedInteractionsResponse(response, medicines) {
    const content = response.content || response;
    
    return {
      medicines,
      pharmacokineticInteractions: this.extractPharmacokineticInteractions(content),
      pharmacodynamicInteractions: this.extractPharmacodynamicInteractions(content),
      populationSpecific: {
        women: this.extractPopulationInteractions(content, 'women|female'),
        pediatric: this.extractPopulationInteractions(content, 'pediatric|children'),
        pregnancy: this.extractPopulationInteractions(content, 'pregnancy|pregnant')
      },
      severityAssessment: this.assessInteractionSeverity(content),
      managementStrategies: this.extractManagementStrategies(content),
      monitoringRequirements: this.extractMonitoringRequirements(content),
      riskLevel: this.assessInteractionRisk(content),
      checkedAt: new Date().toISOString()
    };
  }

  // Enhanced utility methods
  extractAdvancedSection(content, keywords, defaultText) {
    // Safely handle undefined or null content
    if (!content || typeof content !== 'string') {
      return defaultText;
    }
    
    try {
      // First try to find markdown-style headers
      const markdownHeaderRegex = new RegExp(`^#+\\s*(${keywords})[\\s\\*]*:?.*?\\n([\\s\\S]*?)(?=\\n#+|$)`, 'im');
      const markdownMatch = content.match(markdownHeaderRegex);
      
      if (markdownMatch && markdownMatch[2]) {
        let extracted = markdownMatch[2].trim();
        extracted = extracted.replace(/^\*+\s*/, '').replace(/\*+$/, '');
        if (extracted.length > 0) return extracted;
      }
      
      // Look for the section with more flexible patterns (original logic)
      const sectionRegex = new RegExp(`(${keywords})[\\s\\*]*:?[\\s\\*]*(.*?)(?=\\n\\*\\*[^\\*]|\\n##|\\n\\d+\\.|$)`, 'is');
      const match = content.match(sectionRegex);
      
      if (match && match[2]) {
        // Clean up the extracted text
        let extracted = match[2].trim();
        // Remove leading asterisks and spaces
        extracted = extracted.replace(/^\*+\s*/, '');
        // Remove trailing asterisks
        extracted = extracted.replace(/\*+$/, '');
        return extracted || defaultText;
      }
      
      // Fallback: look for content after the keyword
      const simpleRegex = new RegExp(`${keywords}[\\s\\*]*:?[\\s\\*]*([^\\n].*?)(?=\\n\\n|$)`, 'is');
      const simpleMatch = content.match(simpleRegex);
      
      if (simpleMatch && simpleMatch[1]) {
        let extracted = simpleMatch[1].trim();
        extracted = extracted.replace(/^\*+\s*/, '').replace(/\*+$/, '');
        return extracted || defaultText;
      }
      
      return defaultText;
    } catch (error) {
      logger.warn('Error in extractAdvancedSection regex:', error.message);
      return defaultText;
    }
  }

  extractAdvancedSummary(content) {
    // Look for executive summary or key points
    const summaryRegex = /(summary|key points|executive summary|conclusion).*?(?=\n\n|##)/is;
    const match = content.match(summaryRegex);
    
    if (match) {
      return match[0].trim();
    }
    
    // Fallback to first few sentences
    const sentences = content.split('.').slice(0, 4);
    return sentences.join('.') + (sentences.length === 4 ? '.' : '');
  }

  assessAdvancedRiskLevel(content, patientInfo) {
    // Ensure content is a string
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const lowerContent = contentStr.toLowerCase();
    let riskScore = 0;
    
    // Base risk assessment
    if (lowerContent.includes('contraindicated') || lowerContent.includes('black box')) riskScore += 3;
    if (lowerContent.includes('avoid') || lowerContent.includes('not recommended')) riskScore += 2;
    if (lowerContent.includes('caution') || lowerContent.includes('monitor')) riskScore += 1;
    
    // Population-specific risk adjustments
    if (patientInfo.isPregnant) {
      if (lowerContent.includes('category d') || lowerContent.includes('category x')) riskScore += 2;
      if (lowerContent.includes('teratogenic')) riskScore += 2;
    }
    
    if (patientInfo.isChild) {
      if (lowerContent.includes('pediatric.*contraindicated')) riskScore += 2;
      if (lowerContent.includes('not.*approved.*children')) riskScore += 1;
    }
    
    if (riskScore >= 3) return 'high';
    if (riskScore >= 2) return 'moderate';
    if (riskScore >= 1) return 'low-moderate';
    return 'low';
  }

  assessConfidenceLevel(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const lowerContent = contentStr.toLowerCase();
    
    if (lowerContent.includes('well.*established') || lowerContent.includes('extensive.*data')) return 'high';
    if (lowerContent.includes('limited.*data') || lowerContent.includes('case.*reports')) return 'low';
    return 'moderate';
  }

  assessEvidenceQuality(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const lowerContent = contentStr.toLowerCase();
    
    const evidenceMarkers = {
      high: ['randomized.*controlled.*trial', 'meta.*analysis', 'systematic.*review'],
      moderate: ['cohort.*study', 'case.*control', 'observational'],
      low: ['case.*report', 'expert.*opinion', 'theoretical']
    };
    
    for (const [level, markers] of Object.entries(evidenceMarkers)) {
      for (const marker of markers) {
        if (new RegExp(marker).test(lowerContent)) return level;
      }
    }
    
    return 'moderate';
  }

  extractBlackBoxWarnings(content) {
    const blackBoxRegex = /black.*box.*warning|boxed.*warning|fda.*warning/is;
    const match = content.match(blackBoxRegex);
    return match ? match[0].trim() : null;
  }

  extractSpecialPopulations(content) {
    return {
      renalImpairment: this.extractAdvancedSection(content, 'renal|kidney|creatinine', null),
      hepaticImpairment: this.extractAdvancedSection(content, 'hepatic|liver|ast|alt', null),
      elderly: this.extractAdvancedSection(content, 'elderly|geriatric|age.*65', null),
      pediatric: this.extractAdvancedSection(content, 'pediatric|children|infant', null)
    };
  }

  // Additional helper methods for advanced parsing
  extractListFromText(text, pattern) {
    const regex = new RegExp(`(${pattern}).*?(?=\\n|\\.|;)`, 'gi');
    const matches = text.match(regex) || [];
    return matches.map(match => match.trim()).filter(item => item.length > 0);
  }

  extractAlternativesByPopulation(content, populationPattern) {
    const section = this.extractAdvancedSection(content, populationPattern, '');
    return this.extractMedicationNames(section);
  }

  extractAlternativesByMechanism(content) {
    const mechanismSection = this.extractAdvancedSection(content, 'mechanism.*based|same.*class|different.*mechanism', '');
    return this.extractMedicationNames(mechanismSection);
  }

  extractMedicationNames(text) {
    // Enhanced medication name extraction
    const medicationPattern = /([A-Z][a-z]+(?:in|ol|ide|ine|ate|pam|zole|cin|xin|mab|nib))/g;
    const matches = text.match(medicationPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  extractSafetyComparisons(content) {
    return this.extractAdvancedSection(content, 'safety.*comparison|efficacy.*comparison|versus', 'Safety comparison data not available.');
  }

  extractTransitionStrategies(content) {
    return this.extractAdvancedSection(content, 'transition|switching|taper|cross.*taper', 'Transition guidance not available.');
  }

  extractPharmacokineticInteractions(content) {
    return this.extractAdvancedSection(content, 'pharmacokinetic|cyp|absorption|metabolism|elimination', 'Pharmacokinetic interaction data not available.');
  }

  extractPharmacodynamicInteractions(content) {
    return this.extractAdvancedSection(content, 'pharmacodynamic|synergistic|antagonistic|additive', 'Pharmacodynamic interaction data not available.');
  }

  extractPopulationInteractions(content, populationPattern) {
    return this.extractAdvancedSection(content, populationPattern, null);
  }

  extractManagementStrategies(content) {
    return this.extractAdvancedSection(content, 'management|strategy|prevention|mitigation', 'Management strategies not available.');
  }

  extractMonitoringRequirements(content) {
    return this.extractAdvancedSection(content, 'monitoring|surveillance|laboratory|clinical.*assessment', 'Monitoring requirements not available.');
  }

  assessAlternativeEvidence(content) {
    return this.assessEvidenceQuality(content);
  }

  assessInteractionSeverity(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const lowerContent = contentStr.toLowerCase();
    
    if (lowerContent.includes('severe') || lowerContent.includes('life.*threatening')) return 'severe';
    if (lowerContent.includes('moderate') || lowerContent.includes('significant')) return 'moderate';
    return 'mild';
  }

  getAgeGroup(age) {
    if (age < 1) return 'neonate';
    if (age < 2) return 'infant';
    if (age < 12) return 'child';
    if (age < 18) return 'adolescent';
    return 'adult';
  }

  createFallbackAnalysis(response, medicineName, patientInfo) {
    // Safely handle undefined or null response
    const responseContent = response && typeof response === 'object' ? 
      (response.content || JSON.stringify(response)) : 
      (response || 'Analysis data not available');
    
    return {
      medicationOverview: `Analysis for ${medicineName}`,
      generalSafety: responseContent,
      womensSafety: 'Please consult healthcare provider for women-specific information.',
      pediatricSafety: 'Please consult healthcare provider for pediatric information.',
      pregnancySafety: 'Please consult healthcare provider for pregnancy safety information.',
      clinicalTrials: 'Clinical trial information not available.',
      sideEffects: {
        summary: 'Please refer to medication packaging for side effects.',
        common: [],
        serious: [],
        rare: [],
        genderSpecific: [],
        ageSpecific: []
      },
      contraindications: 'Please refer to medication packaging for contraindications.',
      dosing: 'Please follow healthcare provider instructions for dosing.',
      interactions: 'Please consult healthcare provider for drug interactions.',
      monitoring: 'Please follow healthcare provider monitoring recommendations.',
      summary: 'Consult your healthcare provider for comprehensive medication information.',
      riskLevel: 'unknown',
      confidenceLevel: 'low',
      evidenceQuality: 'insufficient',
      blackBoxWarnings: null,
      specialPopulations: {},
      lastUpdated: new Date().toISOString()
    };
  }

  extractRecommendations(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const recommendations = [];
    const lines = contentStr.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.includes('recommend') || trimmed.includes('should') || trimmed.includes('consider') || trimmed.includes('consult')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations.length > 0 ? recommendations : [
      'Consult your healthcare provider for personalized recommendations.'
    ];
  }

  assessInteractionRisk(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const lowerContent = contentStr.toLowerCase();
    
    if (lowerContent.includes('severe') || lowerContent.includes('major') || lowerContent.includes('contraindicated')) {
      return 'high';
    }
    
    if (lowerContent.includes('moderate') || lowerContent.includes('caution') || lowerContent.includes('monitor')) {
      return 'medium';
    }
    
    return 'low';
  }
}

module.exports = new MedicineAnalysisService();
