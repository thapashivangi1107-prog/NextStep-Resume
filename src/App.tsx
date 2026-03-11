/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight, 
  Loader2,
  ClipboardList,
  Target,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisResult {
  skills: string[];
  qualifications: string[];
  experience: string;
  suitabilityScore: number;
  scoreReasoning: string;
  suggestions: {
    skills: string[];
    content: string[];
    formatting: string[];
  };
}

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-1.5-flash"; // Using a stable model name

      const prompt = `
        You are an expert AI Resume Screening Assistant. 
        Analyze the following resume against the provided job description.
        
        Resume Text:
        ${resumeText}
        
        Job Description:
        ${jobDescription}
        
        Provide a detailed analysis in JSON format with the following structure:
        {
          "skills": ["list of key skills found in resume"],
          "qualifications": ["list of qualifications/education found"],
          "experience": "summary of relevant work experience",
          "suitabilityScore": 0-100 (integer),
          "scoreReasoning": "brief explanation for the score",
          "suggestions": {
            "skills": ["specific skills to add or highlight"],
            "content": ["how to improve experience descriptions"],
            "formatting": ["formatting or structural suggestions"]
          }
        }
        Return ONLY the JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (text) {
        const parsedResult = JSON.parse(text) as AnalysisResult;
        setResult(parsedResult);
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 text-slate-900 font-sans selection:bg-violet-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <Sparkles size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-violet-900">NextStep Resume</h1>
          </div>
          <div className="text-sm font-medium text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
            Beta Assistant
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <section className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">
              <div className="flex items-center gap-2 mb-4 text-violet-800">
                <FileText size={20} />
                <h2 className="font-semibold">Resume Content</h2>
              </div>
              <textarea
                placeholder="Paste the candidate's resume text here..."
                className="w-full h-64 p-4 rounded-2xl bg-violet-50/50 border border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none resize-none text-sm leading-relaxed"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">
              <div className="flex items-center gap-2 mb-4 text-violet-800">
                <Briefcase size={20} />
                <h2 className="font-semibold">Job Description</h2>
              </div>
              <textarea
                placeholder="Paste the target job description here..."
                className="w-full h-48 p-4 rounded-2xl bg-violet-50/50 border border-violet-100 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none resize-none text-sm leading-relaxed"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-white shadow-xl shadow-violet-200 transition-all flex items-center justify-center gap-2",
                isAnalyzing 
                  ? "bg-violet-400 cursor-not-allowed" 
                  : "bg-violet-600 hover:bg-violet-700 active:scale-[0.98]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing Candidate...
                </>
              ) : (
                <>
                  Analyze Suitability
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </section>

          {/* Results Section */}
          <section className="relative">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/40 rounded-3xl border-2 border-dashed border-violet-200"
                >
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-violet-400 mb-4">
                    <ClipboardList size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-violet-900">Ready for Analysis</h3>
                  <p className="text-violet-600/70 text-sm max-w-xs mt-2">
                    Enter the resume and job details to see suitability score and suggestions.
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-violet-100"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="text-violet-600 animate-pulse" size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-violet-900 mt-6">Screening Resume</h3>
                  <p className="text-violet-600/70 text-sm max-w-xs mt-2">
                    Our AI is evaluating skills, experience, and matching them with the job requirements...
                  </p>
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-violet-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -mr-16 -mt-16 z-0" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-violet-900">Suitability Score</h3>
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} />
                          Analysis Complete
                        </div>
                      </div>

                      <div className="flex items-end gap-4 mb-4">
                        <span className="text-6xl font-black text-violet-600 tabular-nums">
                          {result.suitabilityScore}
                        </span>
                        <span className="text-violet-300 text-2xl font-bold mb-2">/ 100</span>
                      </div>

                      <div className="w-full h-3 bg-violet-50 rounded-full overflow-hidden mb-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.suitabilityScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            result.suitabilityScore > 70 ? "bg-emerald-500" : 
                            result.suitabilityScore > 40 ? "bg-amber-500" : "bg-rose-500"
                          )}
                        />
                      </div>

                      <p className="text-sm text-violet-700/80 leading-relaxed italic">
                        "{result.scoreReasoning}"
                      </p>
                    </div>
                  </div>

                  {/* Skills & Qualifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">
                      <h4 className="text-sm font-bold text-violet-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-violet-600 rounded-full" />
                        Identified Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium border border-violet-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">
                      <h4 className="text-sm font-bold text-violet-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-violet-600 rounded-full" />
                        Qualifications
                      </h4>
                      <ul className="space-y-2">
                        {result.qualifications.map((qual, i) => (
                          <li key={i} className="text-xs text-violet-700 flex items-start gap-2">
                            <div className="mt-1 w-1 h-1 bg-violet-300 rounded-full shrink-0" />
                            {qual}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Experience Summary */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">
                    <h4 className="text-sm font-bold text-violet-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Briefcase size={16} className="text-violet-600" />
                      Experience Summary
                    </h4>
                    <p className="text-sm text-violet-700 leading-relaxed">
                      {result.experience}
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-violet-900 rounded-3xl p-8 text-white shadow-xl shadow-violet-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Lightbulb size={22} className="text-violet-300" />
                      </div>
                      <h3 className="text-lg font-bold">Improvement Suggestions</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h5 className="text-xs font-black text-violet-300 uppercase tracking-widest mb-3">Missing Skills to Add</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.suggestions.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-medium border border-white/5">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-black text-violet-300 uppercase tracking-widest mb-3">Content Tweaks</h5>
                          <ul className="space-y-3">
                            {result.suggestions.content.map((item, i) => (
                              <li key={i} className="text-xs text-violet-100 leading-relaxed flex items-start gap-2">
                                <ArrowRight size={12} className="mt-0.5 shrink-0 text-violet-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-violet-300 uppercase tracking-widest mb-3">Formatting</h5>
                          <ul className="space-y-3">
                            {result.suggestions.formatting.map((item, i) => (
                              <li key={i} className="text-xs text-violet-100 leading-relaxed flex items-start gap-2">
                                <ArrowRight size={12} className="mt-0.5 shrink-0 text-violet-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-violet-100 mt-12">
        <p className="text-center text-violet-400 text-xs font-medium">
          Powered by Google Gemini AI • Built for Professional Resume Analysis
        </p>
      </footer>
    </div>
  );
}
