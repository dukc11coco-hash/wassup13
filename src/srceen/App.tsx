/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Info, X, ExternalLink, Sparkles, Bookmark, LayoutGrid, BookmarkCheck, ChevronRight, Check, Filter, ArrowLeftRight, Trash2, User } from 'lucide-react';
import { Tool, FilterType, TabType, RecommendationWizardState } from './types';
import { allTools, TOOL_COUNT } from './constants';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('bookmark');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  
  // Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // Comparison State
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Recommendation Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardState, setWizardState] = useState<RecommendationWizardState>({
    purpose: null,
    price: null,
    koreanOnly: false
  });
  const [recommendedTools, setRecommendedTools] = useState<Tool[]>([]);
  const toolCount = allTools.length;

  useEffect(() => {
    localStorage.setItem('bookmark', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filteredTools = useMemo(() => {
    let result = allTools;

    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    if (currentTab === 'collection') {
      result = result.filter(tool => bookmarks.includes(tool.id));
    }
    
    if (currentFilter !== 'all') {
      result = result.filter(tool => tool.filterTags.includes(currentFilter));
    }
    if (searchQuery.trim()) {
      const keyword = searchQuery;
      result = result.filter(tool => 
        tool.name.includes(keyword) || 
        tool.description.includes(keyword) ||
        tool.tags.join(" ").includes(keyword)
      );
    }
    return result;
  }, [currentTab, currentFilter, selectedCategory, bookmarks, searchQuery]);

  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        // Replace the second one or just don't add? 
        // Let's limit to 2 and show a message or just replace.
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const visitWebsite = (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!url) {
      setNotification("공식 웹사이트 정보가 아직 없습니다.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    window.open(url, "_blank");
  };

  const handleRunWizard = () => {
    let result = [...allTools];
    
    // Filter by purpose
    if (wizardState.purpose) {
      const purposeMap: Record<string, string> = {
        writing: '글쓰기',
        research: '리서치',
        image: '이미지 생성',
        coding: '코딩',
        automation: '업무 자동화'
      };
      const p = purposeMap[wizardState.purpose];
      // Use the new recommendFor field
      result = result.filter(t => t.recommendFor.includes(p) || t.filterTags.includes(wizardState.purpose!));
    }

    // Filter by price
    if (wizardState.price === 'free') {
      result = result.filter(t => t.priceType === 'free');
    }

    // Filter by Korean
    if (wizardState.koreanOnly) {
      result = result.filter(t => t.filterTags.includes('korean'));
    }

    setRecommendedTools(result.slice(0, 3));
    setWizardStep(4);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardState({ purpose: null, price: null, koreanOnly: false });
    setRecommendedTools([]);
    setIsWizardOpen(false);
  };

  const renderTools = (toolsToRender: Tool[]) => {
    return (
      <AnimatePresence mode="popLayout">
        {toolsToRender.map((tool) => (
          <motion.div
            key={tool.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col gap-4 group relative overflow-hidden"
          >
            <div className="flex flex-col gap-4 relative z-10">
              {/* card-top */}
              <div className="flex justify-between items-start">
                {/* tool-main */}
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate max-w-[100px]">{tool.name}</h3>
                    <p className="text-gray-400 text-[10px] font-semibold">{tool.language}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => toggleBookmark(tool.id, e)}
                  className={`p-2 rounded-lg transition-all ${bookmarks.includes(tool.id) ? 'text-red-500 bg-red-50' : 'text-gray-200 hover:text-gray-400'}`}
                >
                  <Heart className={`w-5 h-5 ${bookmarks.includes(tool.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* desc */}
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                {tool.description}
              </p>

              {/* tags */}
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>

              {/* card-actions */}
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedTool(tool)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0f172a] text-white text-xs font-bold hover:-translate-y-[1px] transition-all active:scale-[0.98]"
                  >
                    상세보기
                  </button>
                  <button 
                    onClick={(e) => toggleCompare(tool.id, e)}
                    className={`w-10 py-2 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center ${compareIds.includes(tool.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                    title="비교하기"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={(e) => visitWebsite(tool.website, e)}
                  className="w-full py-2 px-3 rounded-xl bg-[#f3f4f6] text-[#111827] text-xs font-bold hover:-translate-y-[1px] transition-all active:scale-[0.98]"
                >
                  웹사이트 방문
                </button>
              </div>
            </div>
            
            {/* Subtle background glow on hover */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/0 group-hover:bg-indigo-50/30 rounded-full blur-3xl transition-colors duration-500" />
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f6f7f9] text-[#111] font-sans">
      {/* 상단 히어로 섹션 */}
      <header className="relative py-8 bg-[#0f172a] text-white">
        {/* max-w-7xl과 mx-auto를 사용하여 하단 카드 그리드와 시작점을 일치시킵니다 */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* 헤더 상단바: 로고와 내 컬렉션 버튼 배치 */}
          <div className="w-full flex justify-between items-center mb-6">
            {/* 왼쪽 로고 버튼 */}
            <button 
              onClick={() => {setCurrentTab('home'); setSelectedCategory(null); setCurrentFilter('all'); setSearchQuery('');}}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold hover:bg-white/10 transition-all"
            >
              ✦ AI Pick
            </button>

            {/* 오른쪽 내 컬렉션 버튼 */}
            <button 
              onClick={() => setCurrentTab('collection')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold tracking-tight">내 컬렉션</span>
              {bookmarks.length > 0 && (
                <span className="flex items-center justify-center w-4 h-4 bg-indigo-600 rounded-full text-[9px] font-black">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>

          {/* 기존 타이틀 및 검색창 영역 */}
          <div className="flex flex-col items-center">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black mb-1 tracking-tighter">AI Pick</h1>
              <p className="text-[11px] text-gray-500">당신에게 꼭 맞는 AI 도구를 찾아보세요.</p>
            </div>
            
            {/* 검색창 영역 */}
            <div className="w-full max-w-md relative group">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                <Search className="w-4 h-4 text-gray-500 ml-2" />
                <input
                  type="text"
                  placeholder="검색어 입력..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-xs py-1.5 px-2 text-white placeholder:text-gray-600"
                />
                <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 hover:bg-indigo-500 transition-all">
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Quick Recommendation Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter font-display">분야별 베스트 AI</h2>
            </div>
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              AI 추천 시작하기
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'writing', label: 'Writing', icon: '✍️', color: 'indigo' },
              { id: 'image', label: 'Design', icon: '🎨', color: 'emerald' },
              { id: 'coding', label: 'Coding', icon: '💻', color: 'blue' },
              { id: 'automation', label: 'Automation', icon: '⚙️', color: 'orange' },
            ].map(category => {
              const bestTool = allTools.find(t => t.filterTags.includes(category.id));
              if (!bestTool) return null;
              return (
                <motion.div 
                  key={category.id}
                  whileHover={{ y: -8 }}
                  onClick={() => {
                    setSelectedCategory(bestTool.category);
                    const searchSection = document.getElementById('search-section');
                    if (searchSection) {
                      searchSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="p-8 rounded-[40px] bg-white border border-gray-100 shadow-2xl shadow-black/[0.02] cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${category.color}-50/50 rounded-full blur-3xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{bestTool.icon}</div>
                      <div className={`px-4 py-1.5 rounded-full bg-${category.color}-50 text-${category.color}-700 text-[10px] font-black uppercase tracking-widest border border-${category.color}-100/50`}>
                        {category.label}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black mb-3 tracking-tight font-display">{bestTool.name}</h3>
                    <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                      {bestTool.reason}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
                      상세 정보 보기 <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* All AI Tools Header */}
        <section className="text-center mb-8">
          <h2 className="text-2xl font-black mb-1 text-gray-900">모든 AI 도구</h2>
          <p className="text-xs text-gray-400">총 {toolCount}개의 도구가 준비되어 있습니다.</p>
        </section>

        {/* Search & Filters */}
        <div id="search-section" className="space-y-10 mb-16">
          {selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Category</span>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all group"
              >
                {selectedCategory}
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            </motion.div>
          )}
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-3 text-gray-400">
                <LayoutGrid className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {currentTab === 'home' ? 'Recommended' : 'Your Collection'}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-gray-200 hidden lg:block" />
              <span className="text-gray-900 font-black text-xl bg-white px-6 py-3 rounded-3xl shadow-sm border border-gray-50 font-display">
                {filteredTools.length} <span className="text-gray-400 text-sm font-bold ml-1 uppercase tracking-widest">TOOLS</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: 'all', label: '전체' },
              { id: 'writing', label: '글쓰기' },
              { id: 'research', label: '리서치' },
              { id: 'image', label: '이미지' },
              { id: 'coding', label: '코딩' },
              { id: 'automation', label: '자동화' },
              { id: 'free', label: '무료/프리' },
              { id: 'korean', label: '한국어 지원' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCurrentFilter(filter.id as FilterType)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${currentFilter === filter.id ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:text-gray-900'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderTools(filteredTools)}
        </div>

        {filteredTools.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-20 text-center shadow-2xl shadow-black/[0.03] border border-white"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              {currentTab === 'collection' ? (
                <Bookmark className="w-12 h-12 text-gray-300" />
              ) : (
                <Search className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {currentTab === 'collection' 
                ? '아직 저장된 도구가 없습니다' 
                : '검색 결과가 없습니다'}
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed mb-10">
              {currentTab === 'collection' 
                ? '마음에 드는 AI 도구를 발견하면 하트 버튼을 눌러 나만의 컬렉션에 담아보세요.' 
                : '다른 키워드로 검색하거나 필터를 변경해보세요.'}
            </p>
            {currentTab === 'collection' && (
              <button 
                onClick={() => setCurrentTab('home')}
                className="px-10 py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-[0.98]"
              >
                AI 도구 탐색하러 가기
              </button>
            )}
          </motion.div>
        )}

        <footer className="mt-24 pt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm">✦</div>
            <span className="text-gray-900 font-bold">AI Pick</span>
            <span className="mx-2">·</span>
            <span>The Best AI Discovery Platform</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <p>© 2026 AI Pick. All rights reserved.</p>
        </footer>
      </main>

      {/* Recommendation Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetWizard}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-[740px] max-w-[92vw] bg-white rounded-[28px] shadow-2xl overflow-hidden border border-white ai-guide-modal"
            >
              <div className="p-[28px]">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter font-display">AI 추천 가이드</h2>
                  </div>
                  <button 
                    onClick={resetWizard}
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all hover:rotate-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Step 1: Purpose */}
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Step 01 / 03</p>
                    <h2 className="text-[34px] font-bold mb-[18px] leading-[1.25] font-display tracking-[-0.02em] modal-title">
                      AI를 어떤 목적으로 사용하시나요?
                    </h2>
                    <div className="grid grid-cols-2 gap-4 option-grid">
                      {[
                        { id: 'writing', label: '글쓰기/번역', icon: '✍️' },
                        { id: 'research', label: '리서치/검색', icon: '🔎' },
                        { id: 'image', label: '이미지 생성', icon: '🎨' },
                        { id: 'coding', label: '코딩/개발', icon: '💻' },
                        { id: 'automation', label: '업무 자동화', icon: '⚙️' },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setWizardState(prev => ({ ...prev, purpose: item.id as any }));
                            setWizardStep(2);
                          }}
                          className="p-[18px] rounded-[18px] min-h-[116px] border-2 border-gray-50 bg-gray-50 hover:border-indigo-600 hover:bg-white transition-all text-left group shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 option-card"
                        >
                          <div className="text-3xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">{item.icon}</div>
                          <div className="font-black text-lg tracking-tight">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Price */}
                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Step 02 / 03</p>
                    <h3 className="text-[34px] font-bold mb-[18px] leading-[1.25] font-display tracking-[-0.02em] modal-title">선호하는 <br /> 가격 정책이 있나요?</h3>
                    <div className="grid grid-cols-2 gap-4 option-grid">
                      {[
                        { id: 'free', label: '무료 도구 우선', desc: '무료 플랜이 있는 도구만 추천합니다.', icon: '🎁' },
                        { id: 'any', label: '상관 없음', desc: '유료 도구를 포함하여 추천합니다.', icon: '💎' },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setWizardState(prev => ({ ...prev, price: item.id as any }));
                            setWizardStep(3);
                          }}
                          className="p-[18px] rounded-[18px] min-h-[116px] border-2 border-gray-50 bg-gray-50 hover:border-indigo-600 hover:bg-white transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 option-card"
                        >
                          <div>
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <div className="font-black text-xl mb-1 tracking-tight">{item.label}</div>
                            <div className="text-gray-500 text-xs font-medium leading-tight">{item.desc}</div>
                          </div>
                          <div className="w-full flex justify-end">
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setWizardStep(1)} className="mt-8 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors">이전으로</button>
                  </motion.div>
                )}

                {/* Step 3: Language */}
                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Step 03 / 03</p>
                    <h3 className="text-[34px] font-bold mb-[18px] leading-[1.25] font-display tracking-[-0.02em] modal-title">한국어 지원이 <br /> 필수인가요?</h3>
                    <div className="grid grid-cols-2 gap-4 mb-10 option-grid">
                      <button
                        onClick={() => setWizardState(prev => ({ ...prev, koreanOnly: true }))}
                        className={`p-[18px] rounded-[18px] min-h-[116px] border-2 transition-all text-left flex flex-col justify-between shadow-sm option-card ${wizardState.koreanOnly ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                      >
                        <div>
                          <div className="text-3xl mb-3">🇰🇷</div>
                          <div className="font-black text-lg tracking-tight leading-tight">네, 한국어 지원 도구만 볼게요</div>
                        </div>
                        <div className="w-full flex justify-end">
                          {wizardState.koreanOnly && <Check className="w-6 h-6 text-indigo-600" />}
                        </div>
                      </button>
                      <button
                        onClick={() => setWizardState(prev => ({ ...prev, koreanOnly: false }))}
                        className={`p-[18px] rounded-[18px] min-h-[116px] border-2 transition-all text-left flex flex-col justify-between shadow-sm option-card ${!wizardState.koreanOnly ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                      >
                        <div>
                          <div className="text-3xl mb-3">🌐</div>
                          <div className="font-black text-lg tracking-tight leading-tight">아니요, 영어 도구도 괜찮아요</div>
                        </div>
                        <div className="w-full flex justify-end">
                          {!wizardState.koreanOnly && <Check className="w-6 h-6 text-indigo-600" />}
                        </div>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setWizardStep(2)} className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-900 font-black tracking-widest uppercase text-xs">이전으로</button>
                      <button onClick={handleRunWizard} className="flex-[2] py-4 rounded-xl bg-gray-900 text-white font-black shadow-xl shadow-black/20 tracking-widest uppercase text-xs">추천 결과 보기</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Results */}
                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <h3 className="text-[34px] font-bold mb-[18px] leading-[1.25] font-display tracking-[-0.02em] modal-title">당신을 위한 추천!</h3>
                    <p className="text-gray-500 text-base font-medium mb-8">선택하신 조건에 가장 잘 맞는 도구들입니다.</p>
                    
                    <div className="space-y-[14px] mb-10">
                      {recommendedTools.length > 0 ? recommendedTools.map((tool, index) => (
                        <div 
                          key={tool.id} 
                          onClick={() => {setSelectedTool(tool); resetWizard();}}
                          className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-all cursor-pointer flex items-center gap-4 group border border-transparent hover:border-indigo-100"
                        >
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform duration-500">
                            {tool.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="font-black text-base tracking-tight">{tool.name}</div>
                              {index === 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest">Best</span>
                              )}
                            </div>
                            <div className="text-indigo-600 text-xs font-bold mb-0.5">추천 이유: {tool.reason}</div>
                            <div className="text-gray-400 text-[10px] font-medium line-clamp-1">{tool.description}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      )) : (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-400 font-bold text-sm">조건에 맞는 추천 도구가 없습니다.</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-indigo-50 rounded-xl p-6 mb-8 border border-indigo-100">
                      <p className="text-indigo-900 text-sm leading-relaxed flex gap-3">
                        <span className="text-xl">💡</span>
                        <span className="font-medium">
                          <strong className="font-black">AI Pick의 조언:</strong> {wizardState.purpose === 'writing' ? '글쓰기에는 문맥 파악이 뛰어난 Claude나 범용성이 좋은 ChatGPT를 추천합니다.' : wizardState.purpose === 'image' ? '고품질 예술 작업에는 Midjourney가, 접근성 좋은 작업에는 DALL-E 3가 좋습니다.' : wizardState.purpose === 'coding' ? '전문적인 개발 환경에는 Cursor나 GitHub Copilot이 최고의 생산성을 보장합니다.' : wizardState.purpose === 'automation' ? '업무 자동화에는 Zapier Central이나 Make를 활용해 에이전트를 구축해보세요.' : '리서치에는 출처 인용이 확실한 Perplexity가 가장 효율적입니다.'}
                        </span>
                      </p>
                    </div>

                    <button onClick={resetWizard} className="w-full py-4 rounded-xl bg-gray-900 text-white font-black tracking-widest uppercase text-xs">닫기</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white"
            >
              <div className="p-10 md:p-16 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start mb-16">
                  <div className="flex gap-10 items-center">
                    <div className="w-32 h-32 rounded-[40px] bg-gray-50 flex items-center justify-center text-6xl shadow-inner">
                      {selectedTool.icon}
                    </div>
                    <div>
                      <h2 className="text-5xl font-black tracking-tighter mb-4 font-display">{selectedTool.name}</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">{selectedTool.language}</span>
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">{selectedTool.category}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTool(null)}
                    className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all hover:rotate-90"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="space-y-16">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6">Description</h4>
                    <p className="text-gray-600 text-2xl leading-relaxed font-medium text-balance">
                      {selectedTool.description}
                    </p>
                  </section>

                  <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                      { label: 'Category', value: selectedTool.category },
                      { label: 'Level', value: selectedTool.level },
                      { label: 'Price', value: selectedTool.price },
                      { label: 'Language', value: selectedTool.language.split(' ')[0] },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100/50">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                        <p className="font-black text-xl text-gray-900 tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                  </section>

                  <section className="bg-indigo-50 rounded-[40px] p-10 relative overflow-hidden border border-indigo-100">
                    <div className="relative z-10">
                      <h4 className="flex items-center gap-3 font-black text-indigo-900 text-xl mb-6 font-display tracking-tight">
                        <Sparkles className="w-7 h-7" />
                        추천 이유
                      </h4>
                      <p className="text-indigo-800/70 text-xl leading-relaxed font-bold mb-10 text-balance">
                        {selectedTool.reason}
                      </p>
                      
                      <div className="space-y-5">
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">이런 분들께 추천해요</h5>
                        <div className="flex flex-wrap gap-3">
                          {selectedTool.recommendFor.map((fit, idx) => (
                            <span key={idx} className="px-6 py-3 rounded-2xl bg-white/80 text-indigo-700 text-sm font-black border border-indigo-200/50 shadow-sm">
                              {fit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/40 rounded-full blur-[80px]" />
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-8">Similar Tools</h4>
                    <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                      {allTools.filter(t => 
                        t.id !== selectedTool.id && 
                        (t.category === selectedTool.category || t.tags.some(tag => selectedTool.tags.includes(tag)))
                      ).slice(0, 3).map(similar => (
                        <button
                          key={similar.id}
                          onClick={() => setSelectedTool(similar)}
                          className="flex-shrink-0 w-64 bg-white rounded-[40px] p-8 text-left hover:shadow-2xl hover:shadow-black/5 hover:translate-y-[-8px] transition-all border border-gray-100 group"
                        >
                          <div className="text-5xl mb-6 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500">{similar.icon}</div>
                          <div className="font-black text-xl text-gray-900 mb-2 truncate tracking-tight font-display">{similar.name}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{similar.level}</div>
                        </button>
                      ))}
                      {allTools.filter(t => 
                        t.id !== selectedTool.id && 
                        (t.category === selectedTool.category || t.tags.some(tag => selectedTool.tags.includes(tag)))
                      ).length === 0 && (
                        <div className="w-full py-16 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                          <p className="text-gray-400 text-base font-bold italic">추천할 비슷한 도구가 아직 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="flex gap-6 mt-16">
                  <button 
                    onClick={() => visitWebsite(selectedTool.website)}
                    className="flex-[2] py-6 rounded-[24px] bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 tracking-widest uppercase shadow-xl shadow-indigo-500/20"
                  >
                    <ExternalLink className="w-7 h-7" />
                    공식 웹사이트 방문
                  </button>
                  <button 
                    onClick={() => toggleBookmark(selectedTool.id)}
                    className={`flex-1 py-6 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-4 tracking-widest uppercase ${bookmarks.includes(selectedTool.id) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-900 text-white shadow-2xl shadow-black/20'}`}
                  >
                    {bookmarks.includes(selectedTool.id) ? (
                      <>
                        <BookmarkCheck className="w-7 h-7" />
                        컬렉션에서 제거
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-7 h-7" />
                        북마크 저장
                      </>
                    )}
                  </button>
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText(`${selectedTool.name}: ${selectedTool.description}\n\nAI Pick에서 확인해보세요!`);
                      const btn = e.currentTarget;
                      const originalText = btn.innerHTML;
                      btn.innerText = '복사 완료!';
                      btn.classList.add('bg-emerald-50', 'text-emerald-600');
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-emerald-50', 'text-emerald-600');
                      }, 2000);
                    }}
                    className="flex-1 py-6 rounded-[24px] bg-gray-100 text-gray-900 font-black text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-4 tracking-widest uppercase"
                  >
                    <Sparkles className="w-7 h-7" />
                    정보 공유
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comparison Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-5"
          >
            <div className="bg-gray-900 rounded-[32px] p-4 shadow-2xl shadow-black/40 flex items-center justify-between border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4 ml-4">
                <div className="flex -space-x-3">
                  {compareIds.map(id => {
                    const tool = allTools.find(t => t.id === id);
                    return (
                      <div key={id} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl border-4 border-gray-900 shadow-lg">
                        {tool?.icon}
                      </div>
                    );
                  })}
                  {compareIds.length < 2 && (
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-gray-500 border-dashed">
                      +
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <p className="text-sm font-black tracking-tight">{compareIds.length}개 도구 선택됨</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {compareIds.length === 1 ? '비교할 도구를 하나 더 선택하세요' : '비교 준비 완료!'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCompareIds([])}
                  className="p-4 rounded-2xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
                <button 
                  disabled={compareIds.length < 2}
                  onClick={() => setIsCompareModalOpen(true)}
                  className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${compareIds.length === 2 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                >
                  비교하기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white"
            >
              <div className="p-10 md:p-16 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-16">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                      <ArrowLeftRight className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter font-display">AI 도구 비교</h2>
                  </div>
                  <button 
                    onClick={() => setIsCompareModalOpen(false)}
                    className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all hover:rotate-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Labels Column */}
                  <div className="space-y-12 pt-40">
                    <div className="h-20 flex items-center text-gray-400 text-xs font-black uppercase tracking-[0.3em] border-b border-gray-100">Category</div>
                    <div className="h-20 flex items-center text-gray-400 text-xs font-black uppercase tracking-[0.3em] border-b border-gray-100">Price</div>
                    <div className="h-20 flex items-center text-gray-400 text-xs font-black uppercase tracking-[0.3em] border-b border-gray-100">Language</div>
                    <div className="h-20 flex items-center text-gray-400 text-xs font-black uppercase tracking-[0.3em] border-b border-gray-100">Level</div>
                    <div className="h-32 flex items-center text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Best Use Case</div>
                  </div>

                  {/* Tools Columns */}
                  {compareIds.map(id => {
                    const tool = allTools.find(t => t.id === id);
                    if (!tool) return null;
                    return (
                      <div key={id} className="space-y-12 text-center">
                        <div className="flex flex-col items-center gap-6 mb-12">
                          <div className="w-32 h-32 rounded-[40px] bg-gray-50 flex items-center justify-center text-6xl shadow-inner">
                            {tool.icon}
                          </div>
                          <h3 className="text-3xl font-black tracking-tight font-display">{tool.name}</h3>
                        </div>
                        
                        <div className="h-20 flex items-center justify-center font-bold text-xl text-gray-900 border-b border-gray-100">{tool.category}</div>
                        <div className="h-20 flex items-center justify-center font-bold text-xl text-gray-900 border-b border-gray-100">{tool.price}</div>
                        <div className="h-20 flex items-center justify-center font-bold text-xl text-gray-900 border-b border-gray-100">{tool.language}</div>
                        <div className="h-20 flex items-center justify-center font-bold text-xl text-gray-900 border-b border-gray-100">{tool.level}</div>
                        <div className="h-32 flex items-center justify-center font-bold text-lg text-gray-600 leading-relaxed px-4">
                          {tool.recommendFor[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-12 py-5 rounded-[24px] bg-gray-900 text-white font-black text-lg shadow-xl shadow-black/20 hover:bg-gray-800 transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-white/10"
          >
            <Info className="w-5 h-5 text-indigo-400" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
