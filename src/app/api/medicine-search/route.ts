import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';
import { db } from '@/lib/db';
import { extractStructuredData, determineSafetyLevel, formatResponse } from '@/lib/responseFormatter';

// Mock medicine database
const MEDICINE_DATABASE = {
  aspirin: {
    name: 'Aspirin',
    safetyRating: 'Generally Safe',
    safetyLevel: 'safe',
    warnings: ['May cause stomach irritation', 'Avoid if allergic to salicylates'],
    dosage: '325-650mg every 4-6 hours',
    interactions: ['Blood thinners', 'Some heart medications']
  },
  ibuprofen: {
    name: 'Ibuprofen',
    safetyRating: 'Generally Safe',
    safetyLevel: 'safe',
    warnings: ['May cause stomach upset', 'Avoid with kidney problems'],
    dosage: '200-400mg every 4-6 hours',
    interactions: ['Blood pressure medications', 'Blood thinners']
  },
  acetaminophen: {
    name: 'Acetaminophen',
    safetyRating: 'Generally Safe',
    safetyLevel: 'safe',
    warnings: ['Do not exceed 4000mg per day', 'Avoid with liver problems'],
    dosage: '500-1000mg every 4-6 hours',
    interactions: ['Alcohol', 'Warfarin']
  }
};

export async function POST(request: NextRequest) {
  try {
    const { medicine } = await request.json();
    
    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine name is required' },
        { status: 400 }
      );
    }

    const medicineName = medicine.toLowerCase().trim();
    
    // Check if medicine exists in our database
    const knownMedicine = MEDICINE_DATABASE[medicineName as keyof typeof MEDICINE_DATABASE];
    
    let medicineInfo;
    
    if (knownMedicine) {
      medicineInfo = knownMedicine;
    } else {
      // Use Gemini AI for unknown medicines
      try {
        const prompt = `Provide comprehensive safety information for the medicine "${medicine}". Structure your response with clear sections:

**1. Safety Rating**
Rate as: Generally Safe, Caution Required, or Prescription Only

**2. Common Warnings and Precautions**
* List key warnings
* Include special populations (pregnancy, elderly, children)
* Mention contraindications

**3. Side Effects**
* Common side effects
* Serious side effects
* When to seek medical attention

**4. Typical Dosage**
* Standard adult dosage
* Frequency of administration
* Maximum daily limits

**5. Known Drug Interactions**
* Major drug interactions
* Foods or substances to avoid
* Monitoring requirements

**6. Key Takeaways**
* Most important safety points
* When to consult a doctor
* Emergency signs to watch for

Please format with clear headings and bullet points. If this is not a recognized medicine, clearly state that and suggest consulting a healthcare professional.`;
        
        const geminiResponse = await generateWithGemini(prompt);
        const formattedResponse = formatResponse(geminiResponse);
        const extractedData = extractStructuredData(geminiResponse);
        const safetyLevel = determineSafetyLevel(geminiResponse, extractedData.safetyRating);
        
        medicineInfo = {
          name: medicine,
          safetyRating: extractedData.safetyRating || 'AI Generated',
          safetyLevel: safetyLevel,
          geminiResponse: geminiResponse,
          formattedResponse: formattedResponse,
          extractedData: extractedData,
          source: 'Gemini AI'
        };
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        
        // Fallback response
        medicineInfo = {
          name: medicine,
          safetyRating: 'Unknown',
          safetyLevel: 'caution',
          warnings: ['Medicine not found in database', 'Please consult a healthcare professional'],
          source: 'Database lookup failed'
        };
      }
    }

    // Cache the search in database
    /*
    try {
      await db.medicine.upsert({
        where: { name: medicineName },
        update: {
          // searchCount: { increment: 1 },
          lastSearched: new Date()
        },
        create: {
          name: medicineName,
          // searchCount: 1,
          lastSearched: new Date()
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without caching if DB fails
    }
    */

    return NextResponse.json({
      success: true,
      medicine: medicineInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Medicine search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Medicine Search API',
    usage: 'POST /api/medicine-search with {"medicine": "medicine_name"}',
    timestamp: new Date().toISOString()
  });
}