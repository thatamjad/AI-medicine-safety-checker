import { useState, useCallback } from 'react'

const STORAGE_KEY = 'medsafe_analysis_history'
const MAX_ENTRIES = 50

export function useAnalysisHistory() {
    const [history, setHistory] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    const saveAnalysis = useCallback((result) => {
        try {
            const entry = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                timestamp: new Date().toISOString(),
                medicineName: result.medicine || result.analysis?.medicineNames?.original || 'Unknown',
                riskLevel: result.analysis?.riskLevel || 'unknown',
                summary: result.analysis?.summary || result.analysis?.medicationOverview || '',
                patientInfo: result.patientInfo || {},
                analysisKeys: result.analysis ? Object.keys(result.analysis) : [],
                fullResult: result
            }

            setHistory(prev => {
                const updated = [entry, ...prev].slice(0, MAX_ENTRIES)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                return updated
            })

            return entry.id
        } catch (error) {
            console.error('Failed to save analysis to history:', error)
            return null
        }
    }, [])

    const deleteEntry = useCallback((id) => {
        setHistory(prev => {
            const updated = prev.filter(entry => entry.id !== id)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    const clearHistory = useCallback(() => {
        setHistory([])
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    const getEntry = useCallback((id) => {
        return history.find(entry => entry.id === id) || null
    }, [history])

    const getStats = useCallback(() => {
        if (history.length === 0) {
            return {
                totalAnalyses: 0,
                mostChecked: 'N/A',
                avgRiskLevel: 'N/A',
                lastAnalysis: 'Never'
            }
        }

        // Most checked medicine
        const medicineCounts = {}
        history.forEach(entry => {
            const name = entry.medicineName.toLowerCase()
            medicineCounts[name] = (medicineCounts[name] || 0) + 1
        })
        const mostChecked = Object.entries(medicineCounts)
            .sort((a, b) => b[1] - a[1])[0][0]

        // Risk level distribution
        const riskLevels = { high: 3, moderate: 2, 'low-moderate': 1.5, low: 1, unknown: 0 }
        const riskSum = history.reduce((sum, entry) => sum + (riskLevels[entry.riskLevel] || 0), 0)
        const avgRisk = riskSum / history.length
        let avgRiskLevel = 'low'
        if (avgRisk >= 2.5) avgRiskLevel = 'high'
        else if (avgRisk >= 1.5) avgRiskLevel = 'moderate'
        else if (avgRisk >= 0.5) avgRiskLevel = 'low'

        // Last analysis time
        const lastDate = new Date(history[0].timestamp)
        const now = new Date()
        const diffMs = now - lastDate
        const diffMins = Math.floor(diffMs / 60000)
        let lastAnalysis
        if (diffMins < 1) lastAnalysis = 'Just now'
        else if (diffMins < 60) lastAnalysis = `${diffMins}m ago`
        else if (diffMins < 1440) lastAnalysis = `${Math.floor(diffMins / 60)}h ago`
        else lastAnalysis = `${Math.floor(diffMins / 1440)}d ago`

        return {
            totalAnalyses: history.length,
            mostChecked: mostChecked.charAt(0).toUpperCase() + mostChecked.slice(1),
            avgRiskLevel,
            lastAnalysis
        }
    }, [history])

    return {
        history,
        saveAnalysis,
        deleteEntry,
        clearHistory,
        getEntry,
        getStats
    }
}
