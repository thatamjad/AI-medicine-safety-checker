'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageCircle, Bot, Heart, Shield } from 'lucide-react';

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
                        <Badge 
                          variant={medicineResult.medicine?.safetyRating === 'Generally Safe' ? 'default' : 'secondary'}
                        >
                          {medicineResult.medicine?.safetyRating}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {medicineResult.medicine?.geminiResponse ? (
                        <div className="space-y-4">
                          <Alert>
                            <Bot className="h-4 w-4" />
                            <AlertDescription>
                              AI-Generated Safety Information from Gemini 2.5 Flash
                            </AlertDescription>
                          </Alert>
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                              {medicineResult.medicine.geminiResponse}
                            </pre>
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
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-blue-50 p-4 rounded-lg">
                          {chatResult.response}
                        </pre>
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
