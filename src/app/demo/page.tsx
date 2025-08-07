'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Medicine Safety Checker
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Powered by Google Gemini 2.5 Flash ⚡
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Gemini AI Active</span>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Medicine Search Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                🔍
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Medicine Search</h2>
                <p className="text-gray-600">AI-powered safety analysis</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Medicine Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Tylenol, Ibuprofen, Aspirin"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Search with Gemini AI
              </button>
            </div>
          </div>

          {/* Chat Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                💬
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">AI Chat</h2>
                <p className="text-gray-600">Ask medical questions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ask about medication safety
                </label>
                <textarea 
                  placeholder="e.g., Is it safe to take Tylenol during pregnancy?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Chat with Gemini
              </button>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">/api/medicine-search</div>
                <div className="text-sm text-green-600">Medicine safety analysis</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">/api/gemini-chat</div>
                <div className="text-sm text-green-600">AI chat interface</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">/api/health</div>
                <div className="text-sm text-green-600">Health check</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gemini Configuration</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">API Settings</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Model: Gemini 2.5 Flash</li>
                <li>• API Key: Configured ✅</li>
                <li>• Environment: Development</li>
                <li>• Database: SQLite</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Medicine safety analysis</li>
                <li>• Real-time chat responses</li>
                <li>• Data caching with Prisma</li>
                <li>• WebSocket support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test the Integration</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => fetch('/api/health').then(r => r.json()).then(console.log)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Test Health API
            </button>
            <button 
              onClick={() => fetch('/api/gemini-chat').then(r => r.json()).then(console.log)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Gemini API
            </button>
            <button 
              onClick={() => fetch('/api/medicine-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineName: 'Tylenol' })
              }).then(r => r.json()).then(console.log)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Medicine Search
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Check browser console for API responses
          </p>
        </div>
      </div>
    </div>
  );
}
