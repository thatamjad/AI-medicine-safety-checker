const createAnalysisPrompt = (medicineName, patientInfo = {}) => {
  const { age, gender, isPregnant, isChild } = patientInfo;
  
  // Simplified prompt for faster response
  let prompt = `Analyze the medication "${medicineName}" for safety. Provide a concise analysis covering:

1. **Medication Overview**: Generic name, drug class, primary uses
2. **General Safety**: Common side effects, contraindications
3. **Special Populations**: 
   - Women's health considerations
   - Pediatric safety (if age < 18)
   - Pregnancy safety (if applicable)
4. **Key Warnings**: Important safety alerts or black box warnings
5. **Dosing Guidelines**: Standard dosing information

Patient Info: Age ${age || 'not specified'}, Gender ${gender || 'not specified'}${isPregnant ? ', Pregnant' : ''}${isChild ? ', Child' : ''}

Keep the response concise but medically accurate. Focus on practical safety information.`;

  return prompt;
};

const createWomensHealthPrompt = (medicineName, patientInfo = {}) => {
  return `Provide women's health analysis for ${medicineName}. Focus on:
- Hormonal interactions
- Reproductive health effects
- Pregnancy safety
- Menstrual cycle impacts
Keep response brief and practical.`;
};

const createPediatricPrompt = (medicineName, age) => {
  return `Analyze ${medicineName} for pediatric safety (age: ${age}). Include:
- Age-appropriate dosing
- Developmental considerations
- Safety concerns for children
- Contraindications
Keep response brief and practical.`;
};

const createPregnancyPrompt = (medicineName) => {
  return `Analyze ${medicineName} for pregnancy safety. Include:
- Pregnancy category/classification
- Trimester-specific risks
- Breastfeeding safety
- Alternative options
Keep response brief and practical.`;
};

const createAlternativesPrompt = (medicineName, condition = '') => {
  return `Suggest safer alternatives to ${medicineName}${condition ? ` for ${condition}` : ''}. Include:
- Similar efficacy medications
- Lower risk options
- Non-pharmaceutical alternatives
- Population-specific recommendations
Keep response brief and practical.`;
};

const createInteractionPrompt = (medicines) => {
  return `Check drug interactions between: ${medicines.join(', ')}. Include:
- Pharmacokinetic interactions
- Pharmacodynamic interactions
- Severity levels
- Management recommendations
Keep response brief and practical.`;
};

module.exports = {
  createAnalysisPrompt,
  createWomensHealthPrompt,
  createPediatricPrompt,
  createPregnancyPrompt,
  createAlternativesPrompt,
  createInteractionPrompt
};
