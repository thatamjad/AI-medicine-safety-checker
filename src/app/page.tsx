'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageCircle, Bot, Heart, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSafetyColorClasses, getSafetyRatingText } from '@/lib/responseFormatter';

export default function Home() {
  const [medicineQuery, setMedicineQuery] = useState('');
  const [medicineResult, setMedicineResult] = useState<any>(null);
  const [medicineLoading, setMedicineLoading] = useState(false);
  
  const [chatQuery, setChatQuery] = useState('');
  const [chatResult, setChatResult] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const searchMedicine = async () => {
    if (!medicineQuery.trim()) return;
    
    setMedicineLoading(true);
    try {
      const response = await fetch('/api/medicine-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine: medicineQuery })
      });
      const data = await response.json();
      setMedicineResult(data);
    } catch (error) {
      console.error('Medicine search error:', error);
    } finally {
      setMedicineLoading(false);
    }
  };

  const chatWithGemini = async () => {
    if (!chatQuery.trim()) return;
    
    setChatLoading(true);
    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatQuery })
      });
      const data = await response.json();
      setChatResult(data);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Health AI Assistant</h1>
            <Bot className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-lg text-gray-600">Powered by Gemini 2.5 Flash</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50">
              <Shield className="h-3 w-3 mr-1" />
              AI-Powered Medicine Safety
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              <MessageCircle className="h-3 w-3 mr-1" />
              Intelligent Health Chat
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="medicine" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="medicine">Medicine Safety Search</TabsTrigger>
            <TabsTrigger value="chat">Health AI Chat</TabsTrigger>
          </TabsList>

          {/* Medicine Search Tab */}
          <TabsContent value="medicine">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Medicine Safety Information
                </CardTitle>
                <CardDescription>
                  Search for medicine safety information using our AI-powered database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter medicine name (e.g., aspirin, ramipril, lisinopril)"
                    value={medicineQuery}
                    onChange={(e) => setMedicineQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchMedicine()}
                  />
                  <Button onClick={searchMedicine} disabled={medicineLoading}>
                    {medicineLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {medicineResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {medicineResult.medicine?.name}
                        {medicineResult.medicine?.safetyLevel && (
                          <Badge 
                            className={`${getSafetyColorClasses(medicineResult.medicine.safetyLevel).bgColor} ${getSafetyColorClasses(medicineResult.medicine.safetyLevel).textColor}`}
                          >
                            {getSafetyRatingText(medicineResult.medicine.safetyLevel)}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {medicineResult.medicine?.geminiResponse || medicineResult.medicine?.warnings ? (
                        <div className="space-y-6">
                          <Alert className="border-green-200 bg-green-50">
                            <Bot className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              ✨ {medicineResult.medicine?.source === 'Gemini AI' ? 'AI-Generated Safety Information from Gemini 2.5 Flash' : 'Database Safety Information'}
                            </AlertDescription>
                          </Alert>
                          
                          {/* Main Content with Beautiful Cards */}
                          <div className="space-y-4">
                            {/* Safety Rating Card */}
                            <div className={`bg-gradient-to-r ${getSafetyColorClasses(medicineResult.medicine?.safetyLevel || 'caution').gradient} text-white p-6 rounded-xl shadow-lg`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                  {medicineResult.medicine?.safetyLevel === 'safe' ? (
                                    <CheckCircle className="h-6 w-6" />
                                  ) : medicineResult.medicine?.safetyLevel === 'unsafe' ? (
                                    <AlertTriangle className="h-6 w-6" />
                                  ) : (
                                    <Shield className="h-6 w-6" />
                                  )}
                                </div>
                                <h3 className="text-xl font-bold">
                                  {medicineResult.medicine?.safetyLevel === 'safe' ? '✅' : 
                                   medicineResult.medicine?.safetyLevel === 'unsafe' ? '⚠️' : '🛡️'} Safety Rating
                                </h3>
                              </div>
                              <div className="bg-white/10 p-4 rounded-lg">
                                <div className="text-lg font-semibold">
                                  {getSafetyRatingText(medicineResult.medicine?.safetyLevel || 'caution')}
                                </div>
                                <div className="text-sm opacity-90">Medicine: {medicineResult.medicine.name}</div>
                              </div>
                            </div>

                            {/* Content Sections */}
                            <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Bot className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-800">📋 Detailed Information</h3>
                              </div>
                              
                              {/* Structured Information Display */}
                              {medicineResult.medicine?.extractedData ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  {/* Warnings */}
                                  {medicineResult.medicine.extractedData.warnings.length > 0 && (
                                    <div className={`p-4 rounded-lg border ${getSafetyColorClasses(medicineResult.medicine?.safetyLevel || 'caution').borderColor} ${getSafetyColorClasses(medicineResult.medicine?.safetyLevel || 'caution').bgColor}`}>
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">⚠️ Warnings</h4>
                                      <ul className="space-y-1">
                                        {medicineResult.medicine.extractedData.warnings.slice(0, 3).map((warning: string, index: number) => (
                                          <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="text-orange-500">•</span>
                                            <span>{warning}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Dosage */}
                                  {medicineResult.medicine.extractedData.dosage && (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">💊 Dosage</h4>
                                      <p className="text-sm text-green-800">{medicineResult.medicine.extractedData.dosage}</p>
                                    </div>
                                  )}
                                  
                                  {/* Interactions */}
                                  {medicineResult.medicine.extractedData.interactions.length > 0 && (
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">🔗 Interactions</h4>
                                      <ul className="space-y-1">
                                        {medicineResult.medicine.extractedData.interactions.slice(0, 2).map((interaction: string, index: number) => (
                                          <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="text-purple-500">•</span>
                                            <span>{interaction}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Key Takeaways */}
                                  {medicineResult.medicine.extractedData.keyTakeaways.length > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">🎯 Key Takeaways</h4>
                                      <ul className="space-y-1">
                                        {medicineResult.medicine.extractedData.keyTakeaways.slice(0, 2).map((takeaway: string, index: number) => (
                                          <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span>{takeaway}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : medicineResult.medicine?.warnings && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  {/* Database Warnings */}
                                  <div className={`p-4 rounded-lg border ${getSafetyColorClasses(medicineResult.medicine?.safetyLevel || 'safe').borderColor} ${getSafetyColorClasses(medicineResult.medicine?.safetyLevel || 'safe').bgColor}`}>
                                    <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">⚠️ Warnings</h4>
                                    <ul className="space-y-1">
                                      {medicineResult.medicine.warnings.map((warning: string, index: number) => (
                                        <li key={index} className="text-sm flex items-start gap-2">
                                          <span className="text-orange-500">•</span>
                                          <span>{warning}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  {/* Database Dosage */}
                                  {medicineResult.medicine.dosage && (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">💊 Dosage</h4>
                                      <p className="text-sm text-green-800">{medicineResult.medicine.dosage}</p>
                                    </div>
                                  )}
                                  
                                  {/* Database Interactions */}
                                  {medicineResult.medicine.interactions && (
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">🔗 Interactions</h4>
                                      <ul className="space-y-1">
                                        {medicineResult.medicine.interactions.map((interaction: string, index: number) => (
                                          <li key={index} className="text-sm flex items-start gap-2">
                                            <span className="text-purple-500">•</span>
                                            <span>{interaction}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Formatted Response */}
                              {medicineResult.medicine?.geminiResponse && (
                                <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                  {medicineResult.medicine?.formattedResponse ? (
                                    <div 
                                      className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed"
                                      dangerouslySetInnerHTML={{ 
                                        __html: medicineResult.medicine.formattedResponse.replace(/\n/g, '<br/>') 
                                      }}
                                    />
                                  ) : (
                                    <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                                      {medicineResult.medicine.geminiResponse}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Summary Card */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/20 rounded-full">
                                    <Heart className="h-6 w-6" />
                                  </div>
                                  <h3 className="text-xl font-bold">✨ Quick Summary</h3>
                                </div>
                                <div className="text-3xl">🤖</div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white/10 p-3 rounded-lg">
                                  <div className="text-sm opacity-80">Medicine Name</div>
                                  <div className="font-bold text-lg">{medicineResult.medicine.name}</div>
                                </div>
                                <div className="bg-white/10 p-3 rounded-lg">
                                  <div className="text-sm opacity-80">AI Source</div>
                                  <div className="font-bold text-lg">Gemini 2.5 Flash</div>
                                </div>
                              </div>
                              
                              <div className="bg-yellow-400/20 border border-yellow-300/30 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">⚠️</span>
                                  <div>
                                    <div className="font-bold mb-2">Important Medical Disclaimer</div>
                                    <div className="text-sm opacity-90">
                                      This AI-generated information is for educational purposes only. 
                                      Always consult qualified healthcare professionals for medical advice, 
                                      diagnosis, and treatment decisions.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {medicineResult.medicine?.warnings && (
                            <div>
                              <h4 className="font-semibold">Warnings:</h4>
                              <ul className="list-disc list-inside text-sm">
                                {medicineResult.medicine.warnings.map((warning: string, index: number) => (
                                  <li key={index}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {medicineResult.medicine?.dosage && (
                            <div>
                              <h4 className="font-semibold">Typical Dosage:</h4>
                              <p className="text-sm">{medicineResult.medicine.dosage}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Health AI Chat
                </CardTitle>
                <CardDescription>
                  Ask health-related questions to our Gemini AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ask a health question (e.g., What are the benefits of drinking water?)"
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={chatWithGemini} disabled={chatLoading} className="w-full">
                    {chatLoading ? 'Thinking...' : 'Ask Gemini AI'}
                  </Button>
                </div>

                {chatResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        Gemini AI Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <div className="space-y-4">
                          <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-white/50 rounded-lg">
                            <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                              {chatResult.response}
                            </pre>
                          </div>
                          
                          {/* Beautiful Response Footer */}
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-xl mt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                  <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-lg">AI Response Complete</div>
                                  <div className="text-sm opacity-90">Generated by Gemini 2.5 Flash</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl mb-1">🤖</div>
                                <div className="text-xs opacity-80">Powered by AI</div>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                              <div className="flex items-start gap-2">
                                <span className="text-yellow-300 text-lg">💡</span>
                                <div className="text-sm">
                                  <div className="font-medium mb-1">Remember</div>
                                  <div className="opacity-90">
                                    This AI-generated response is for informational purposes. 
                                    For health concerns, always consult qualified healthcare professionals.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Gemini 2.5 Flash AI • Next.js 15 • Tailwind CSS • shadcn/ui</p>
          <p className="mt-1">⚠️ This is for informational purposes only. Always consult healthcare professionals.</p>
        </div>
      </div>
    </div>
  );
}
