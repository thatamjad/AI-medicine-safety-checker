const aiServiceFactory = require('./aiServiceFactory');
const logger = require('../utils/logger');

class MedicineNameMapper {
  constructor() {
    // Common medicine brand names to generic mappings (Indian context)
    this.commonMedicineMap = {
      // Pain and fever
      'dolo': 'Paracetamol',
      'dolo 650': 'Paracetamol 650mg',
      'dolo dt': 'Paracetamol Dispersible Tablet',
      'crocin': 'Paracetamol',
      'calpol': 'Paracetamol',
      'combiflam': 'Ibuprofen + Paracetamol',
      'brufen': 'Ibuprofen',
      'volini': 'Diclofenac Topical',
      'voveran': 'Diclofenac',
      
      // Gastric/Antacids
      'pantop': 'Pantoprazole',
      'pantop d': 'Pantoprazole + Domperidone',
      'pan d': 'Pantoprazole + Domperidone',
      'omez': 'Omeprazole',
      'omez d': 'Omeprazole + Domperidone',
      'rantac': 'Ranitidine',
      'gelusil': 'Aluminium Hydroxide + Magnesium Hydroxide',
      'digene': 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
      'pudin hara': 'Pudina (Mint) Extract',
      
      // Antibiotics
      'augmentin': 'Amoxicillin + Clavulanic Acid',
      'azithral': 'Azithromycin',
      'cifran': 'Ciprofloxacin',
      'clavam': 'Amoxicillin + Clavulanic Acid',
      'zenflox': 'Ofloxacin',
      
      // Cold and Cough
      'sinarest': 'Paracetamol + Phenylephrine + Chlorpheniramine',
      'wikoryl': 'Paracetamol + Phenylephrine + Chlorpheniramine',
      'alex': 'Dextromethorphan + Phenylephrine + Chlorpheniramine',
      'ascoril': 'Levosalbutamol + Ambroxol + Guaifenesin',
      'benadryl': 'Diphenhydramine',
      'vicks action 500': 'Paracetamol + Phenylephrine + Chlorpheniramine',
      
      // Diabetes
      'glycomet': 'Metformin',
      'amaryl': 'Glimepiride',
      'glucobay': 'Acarbose',
      'januvia': 'Sitagliptin',
      
      // Heart/BP
      'telma': 'Telmisartan',
      'amlodac': 'Amlodipine',
      'stamlo': 'Amlodipine',
      'ecosprin': 'Aspirin Low Dose',
      'deplatt': 'Clopidogrel',
      
      // Supplements
      'shelcal': 'Calcium Carbonate + Vitamin D3',
      'calcirol': 'Cholecalciferol (Vitamin D3)',
      'becosules': 'Vitamin B Complex',
      'zincovit': 'Multivitamin + Zinc',
      'revital': 'Multivitamin + Minerals',
      
      // Women's Health
      'meftal spas': 'Mefenamic Acid + Dicyclomine',
      'cyclopam': 'Dicyclomine + Paracetamol',
      'mensovit': 'Tranexamic Acid + Mefenamic Acid',
      'folvite': 'Folic Acid',
      
      // Skin
      'panderm': 'Triamcinolone + Oxytetracycline + Nystatin',
      'betnovate': 'Betamethasone',
      'soframycin': 'Framycetin',
      'neosporin': 'Neomycin + Bacitracin + Polymyxin B',
      
      // Others
      'nice tablet': 'Nimesulide', // Note: Nimesulide has safety concerns
      'nice': 'Nimesulide',
      'nimesulide': 'Nimesulide',
      'confido': 'Herbal Supplement for Male Health',
      'liv 52': 'Herbal Liver Tonic',
      'himalaya septilin': 'Herbal Immune Booster'
    };
  }

  // Normalize medicine name for lookup
  normalizeName(name) {
    return name.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  // Get generic name from common name
  getGenericName(commonName) {
    const normalized = this.normalizeName(commonName);
    return this.commonMedicineMap[normalized] || null;
  }

  // Get suggestions based on partial input
  getSuggestions(partialName, limit = 10) {
    const normalized = this.normalizeName(partialName);
    const suggestions = [];
    
    for (const [commonName, genericName] of Object.entries(this.commonMedicineMap)) {
      if (commonName.includes(normalized) || normalized.includes(commonName)) {
        suggestions.push({
          commonName: this.capitalizeWords(commonName),
          genericName: genericName,
          match: commonName.indexOf(normalized) === 0 ? 'prefix' : 'contains'
        });
      }
    }
    
    // Sort by match type (prefix matches first) and length
    suggestions.sort((a, b) => {
      if (a.match !== b.match) {
        return a.match === 'prefix' ? -1 : 1;
      }
      return a.commonName.length - b.commonName.length;
    });
    
    return suggestions.slice(0, limit);
  }

  // Use AI to identify medicine from description
  async identifyMedicineFromDescription(description) {
    try {
      const prompt = `You are a medicine identification expert. Based on the following description, identify the most likely medicine name (both brand and generic if applicable). The user might describe:
- Common/brand names used in India
- Symptoms the medicine treats
- Physical description of the medicine
- Usage context

Description: "${description}"

Please respond in this exact JSON format:
{
  "identifiedMedicines": [
    {
      "commonName": "Brand/Common name",
      "genericName": "Generic name",
      "confidence": 0.95,
      "reasoning": "Why this medicine was identified"
    }
  ],
  "suggestions": [
    "Alternative medicine 1",
    "Alternative medicine 2"
  ]
}

Focus on commonly available medicines in India. If unsure, provide multiple options with confidence scores.`;

      const { text: response, serviceUsed } = await aiServiceFactory.generateContent(prompt);
      logger.info(`Medicine identification provided by ${serviceUsed} service`);
      
      try {
        // Try to parse JSON response
        const cleanResponse = response.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        
        return {
          identified: parsed.identifiedMedicines || [],
          suggestions: parsed.suggestions || [],
          rawResponse: response
        };
        
      } catch (parseError) {
        logger.warn('Failed to parse AI medicine identification response as JSON');
        
        // Fallback: extract medicine names from text response
        const medicineNames = this.extractMedicineNamesFromText(response);
        return {
          identified: medicineNames.map(name => ({
            commonName: name,
            genericName: this.getGenericName(name) || name,
            confidence: 0.7,
            reasoning: 'Extracted from AI text response'
          })),
          suggestions: [],
          rawResponse: response
        };
      }
      
    } catch (error) {
      logger.error('AI medicine identification failed:', error.message);
      throw new Error('Medicine identification failed');
    }
  }

  // Extract potential medicine names from text
  extractMedicineNamesFromText(text) {
    const words = text.toLowerCase().split(/[\s,.-]+/);
    const foundMedicines = [];
    
    for (const word of words) {
      const generic = this.getGenericName(word);
      if (generic) {
        foundMedicines.push(word);
      }
    }
    
    return [...new Set(foundMedicines)]; // Remove duplicates
  }

  // Helper function to capitalize words
  capitalizeWords(str) {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Enhanced search that combines exact mapping and AI identification
  async enhancedMedicineSearch(searchQuery) {
    const results = {
      exactMatch: null,
      suggestions: [],
      aiIdentified: [],
      searchQuery: searchQuery
    };

    // First, try exact mapping
    const genericName = this.getGenericName(searchQuery);
    if (genericName) {
      results.exactMatch = {
        commonName: this.capitalizeWords(searchQuery),
        genericName: genericName,
        source: 'exact_mapping'
      };
    }

    // Get suggestions from our database
    results.suggestions = this.getSuggestions(searchQuery, 5);

    // If no exact match and query is descriptive, use AI
    if (!results.exactMatch && searchQuery.length > 3) {
      try {
        const aiResult = await this.identifyMedicineFromDescription(searchQuery);
        results.aiIdentified = aiResult.identified;
        
        // Merge AI suggestions with our suggestions
        const aiSuggestionNames = aiResult.suggestions.map(name => ({
          commonName: name,
          genericName: this.getGenericName(name) || name,
          match: 'ai_suggested'
        }));
        
        results.suggestions = [...results.suggestions, ...aiSuggestionNames];
      } catch (error) {
        logger.warn('AI medicine identification failed, using only local mapping');
      }
    }

    return results;
  }
}

module.exports = new MedicineNameMapper();
