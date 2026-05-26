import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  MonitorSmartphone, Settings, LogOut, Power, User, Users, 
  LayoutDashboard, Server, Download, ShieldCheck, 
  Filter, Grid, List, Plus, ChevronRight, ChevronLeft, X, Upload, ChevronDown,
  Calendar, CalendarDays, Kanban
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, writeBatch, updateDoc, addDoc, deleteDoc, getDoc, setDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATKKSrUm6NKATdZdJeDxhQ5Dj2Q32ujh0",
  authDomain: "q-base-dev.firebaseapp.com",
  projectId: "q-base-dev",
  storageBucket: "q-base-dev.firebasestorage.app",
  messagingSenderId: "756427289812",
  appId: "1:756427289812:web:217c6ebb1bfbd1d931f741"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_DEVICES = [
  { name: 'Galaxy Z Fold 5', type: 'Fold', os: 'Android', status: '보관중', renter: '', manufacturer: 'Samsung', serial: 'SM-F946N' },
  { name: 'iPhone 15 Pro', type: 'Bar', os: 'iOS', status: '사용중', renter: '홍길동', manufacturer: 'Apple', serial: 'A3102' },
  { name: 'Galaxy S24 Ultra', type: 'Bar', os: 'Android', status: '대여중', renter: '김철수', manufacturer: 'Samsung', serial: 'SM-S928N' },
  { name: 'Galaxy Z Flip 4', type: 'Flip', os: 'Android', status: '보관중', renter: '', manufacturer: 'Samsung', serial: 'SM-F721N' },
  { name: 'iPhone 13 Mini', type: 'Bar', os: 'iOS', status: '보관중', renter: '', manufacturer: 'Apple', serial: 'A2628' },
];

const INITIAL_SCHEDULES = [
  { name: 'v1.0 기능 QA', startDate: '2026-05-01', endDate: '2026-05-15', assignee: '홍길동', department: 'QA 1팀', description: '주요 릴리즈 QA 및 결함 확인', status: '완료' },
  { name: '결제 모듈 테스트', startDate: '2026-05-20', endDate: '2026-05-28', assignee: '김철수', department: 'QA 2팀', description: 'PG사 연동 및 예외 처리 테스트', status: '진행중' },
  { name: 'UI/UX 개편 검증', startDate: '2026-05-25', endDate: '2026-06-05', assignee: '이영희', department: 'QA 1팀', description: '디자인 개편에 따른 크로스 브라우징', status: '예정' },
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700&display=swap');

  body {
    font-family: 'Pretendard', sans-serif;
    background-color: #f8f9fa;
    color: #1f2937;
    overflow: hidden;
  }

  @keyframes cinematicFadeIn {
    0% { opacity: 0; transform: translateY(15px); }
    100% { opacity: 1; transform: none; }
  }
  .animate-fade-in { animation: cinematicFadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

  @keyframes fastFadeIn {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: none; }
  }
  .animate-fast-fade { animation: fastFadeIn 0.2s ease-out forwards; }

  @keyframes simpleFade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .animate-simple-fade { animation: simpleFade 0.5s ease-in-out forwards; }

  @keyframes breathing {
    0% { box-shadow: 0 0 0px rgba(156, 163, 175, 0); border-color: transparent; }
    50% { box-shadow: 0 0 15px rgba(156, 163, 175, 0.4); border-color: rgba(209, 213, 219, 0.8); }
    100% { box-shadow: 0 0 0px rgba(156, 163, 175, 0); border-color: transparent; }
  }
  .hover-breath { transition: all 0.3s ease; }
  .hover-breath:hover { animation: breathing 2.5s infinite ease-in-out; transform: translateY(-2px); }

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .bg-cinematic {
    background: linear-gradient(-45deg, #f8f9fa, #e9ecef, #dee2e6, #f8f9fa);
    background-size: 400% 400%;
    animation: gradientBG 10s ease infinite;
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const AppLogo = ({ className }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return <MonitorSmartphone className={`text-gray-800 ${className}`} strokeWidth={1.5} />;
  }
  return (
    <img 
      src="/icon-192x192.png" 
      alt="QA Base" 
      className={`object-contain ${className}`} 
      onError={() => setImgError(true)} 
    />
  );
};

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center space-x-3">
      <ShieldCheck className="w-5 h-5 text-gray-700" />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </div>
  );
};

const CustomSelect = ({ value, onChange, options, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <div
        className={`flex items-center justify-between cursor-pointer select-none ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find(o => o.value === value)?.label || value}</span>
        <ChevronDown className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-1.5 animate-fast-fade overflow-hidden left-0 min-w-max">
          {options.map(opt => (
            <div
              key={opt.value}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange, disabled, alignRight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

  return (
    <div className="relative" ref={selectRef}>
      <div 
        className={`flex items-center justify-between cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-800'} text-sm rounded-lg px-3 py-2 shadow-sm transition-colors`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{value || '날짜 선택'}</span>
        <CalendarDays className="w-4 h-4 text-gray-400" />
      </div>
      {isOpen && !disabled && (
        <div className={`absolute z-[70] mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-3 animate-fast-fade w-64 ${alignRight ? 'right-0' : 'left-0'}`}>
          <div className="flex justify-between items-center mb-2">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft className="w-4 h-4"/></button>
            <span className="text-sm font-bold text-gray-700">{year}년 {month + 1}월</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
            {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={i} type="button"
                  onClick={() => { onChange(dateStr); setIsOpen(false); }}
                  className={`h-8 w-full rounded-md text-xs font-medium transition-colors ${isSelected ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-screen h-screen bg-cinematic flex flex-col items-center justify-center animate-simple-fade">
      <div className="animate-fade-in flex flex-col items-center">
        <AppLogo className="w-32 h-32 mb-6 relative z-10" />
        <h1 className="text-4xl font-light tracking-widest text-gray-800 mb-2">QA BASE</h1>
        <p className="text-sm text-gray-500 tracking-wider">Quality Assurance Command Center</p>
        <div className="w-48 h-1 bg-gray-200 rounded-full mt-12 overflow-hidden">
          <div className="h-full bg-gray-600 rounded-full w-full origin-left animate-[scaleX_3s_ease-in-out]"></div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, onInstallApp }) => {
  const [tab, setTab] = useState('login');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('qaBaseId');
    const savedPw = localStorage.getItem('qaBasePw');
    if (savedId && savedPw) {
      setId(savedId);
      setPw(savedPw);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!id.trim() || !pw.trim()) return;

    if (remember) {
      localStorage.setItem('qaBaseId', id);
      localStorage.setItem('qaBasePw', pw);
    } else {
      localStorage.removeItem('qaBaseId');
      localStorage.removeItem('qaBasePw');
    }

    let userRole = 'user';
    let userName = name || id;

    if (id.trim() === 'wow1324332' && pw === 'djslzja1!') {
      userRole = 'admin';
      userName = 'ADMIN';
    }

    try {
      const userRef = doc(db, 'users', id.trim());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.name) userName = userData.name;
        if (userData.role) userRole = userData.role;
        if (id.trim() === 'wow1324332' && pw === 'djslzja1!') userRole = 'admin';
        onLogin({ id: id.trim(), name: userName, role: userRole, profileImage: userData.profileImage || null });
        return;
      } else if (tab === 'create') {
         userRole = 'viewer';
         await setDoc(userRef, { name: userName, role: userRole, status: 'pending' });
      }
    } catch (error) {
      console.error("Error fetching user", error);
    }
    onLogin({ id: id.trim(), name: userName, role: userRole, profileImage: null });
  };

  const handleGuest = () => {
    onLogin({ id: 'guest', name: 'Guest', role: 'viewer', profileImage: null });
  };

  return (
    <div className="w-screen h-screen bg-[#f0f2f5] flex items-center justify-center relative animate-simple-fade">
      <button 
        onClick={onInstallApp}
        className="absolute top-8 right-8 flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur hover-breath shadow-sm border border-gray-100"
      >
        <Download className="w-4 h-4" />
        <span className="text-xs font-medium tracking-wide">앱 설치</span>
      </button>

      <div className="w-full max-w-[380px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white p-8 animate-fade-in relative z-10">
        <div className="flex justify-center mb-8">
          <AppLogo className="w-20 h-20" />
        </div>

        <div className="flex w-full mb-8 relative border-b border-gray-200">
          <button 
            type="button"
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'login' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button 
            type="button"
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'create' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setTab('create')}
          >
            Create
          </button>
          <div className={`absolute bottom-0 h-[2px] bg-gray-800 w-1/2 transition-transform duration-300 ease-out ${tab === 'login' ? 'translate-x-0' : 'translate-x-full'}`}></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="ID" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          
          {tab === 'create' && (
            <div className="animate-fade-in">
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
          )}

          {tab === 'login' && (
            <div className="flex items-center space-x-2 pt-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="w-4 h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-800 accent-gray-800 cursor-pointer shadow-sm"
              />
              <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">로그인 기억하기</label>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button 
              type="submit" 
              className="w-full bg-gray-800 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-300"
            >
              {tab === 'login' ? '로그인' : '계정 생성'}
            </button>
            <button 
              type="button" 
              onClick={handleGuest}
              className="w-full bg-white text-gray-600 border border-gray-200 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              게스트로 시작 (Viewer)
            </button>
          </div>
        </form>
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s'}}></div>
    </div>
  );
};

const TransitionLoading = ({ title, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-screen h-screen bg-[#f8f9fa] flex flex-col items-center justify-center animate-simple-fade absolute inset-0 z-50">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full shadow-inner"></div>
        <div className="absolute inset-0 border-2 border-gray-800 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-sm text-gray-500 tracking-widest uppercase animate-pulse">{title} 로딩중...</p>
    </div>
  );
};

const FunctionalBoard = ({ user, onNavigate, onLogout, onShowProfileModal, onShowAdminModal }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const onlineUsersCount = 1;

  return (
    <div className="w-screen h-screen bg-[#f8f9fa] flex flex-col animate-simple-fade">
      <header className="h-20 px-8 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <AppLogo className="w-8 h-8" />
          <span className="text-xl font-medium tracking-wider text-gray-800">QA BASE</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-md hover-breath cursor-default">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">{onlineUsersCount}명 접속중</span>
          </div>

          {user.role === 'admin' && (
            <button 
              onClick={onShowAdminModal}
              className="p-2 text-gray-400 hover:text-gray-800 transition-colors hover-breath rounded-full bg-white shadow-sm border border-gray-100"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover-breath p-1 pr-3 bg-white rounded-full border border-gray-200 shadow-md"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                {user.profileImage ? <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-2 animate-fast-fade z-50">
                <button 
                  onClick={() => { setShowProfileMenu(false); onShowProfileModal(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <User className="w-4 h-4 mr-3" /> 프로필 수정
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-3" /> 로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <h2 className="text-3xl font-light text-gray-800 mb-2">Functional Board</h2>
          <p className="text-sm text-gray-500 mb-10">원하는 업무 기지를 선택하세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => onNavigate('dashboard')}
              className="bg-white rounded-3xl p-8 cursor-pointer border border-gray-200 shadow-md hover-breath group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors duration-500 shadow-sm border border-gray-100">
                <Server className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Devices</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                QA 검증용 시료(단말기) 현황을 조회하고<br/>상태 및 대여 현황을 관리합니다.
              </p>
            </div>
            
            <div 
              onClick={() => onNavigate('schedule')}
              className="bg-white rounded-3xl p-8 cursor-pointer border border-gray-200 shadow-md hover-breath group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors duration-500 shadow-sm border border-gray-100">
                <Calendar className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Schedule</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                프로젝트별 QA 일정을 캘린더로 확인하고<br/>칸반 보드로 진행 현황을 관리합니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ProfileModal = ({ user, onClose, onUpdateProfile }) => {
  const [imagePreview, setImagePreview] = useState(user.profileImage);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    onUpdateProfile(imagePreview);
    try {
       const userRef = doc(db, 'users', user.id);
       await updateDoc(userRef, { profileImage: imagePreview }, { merge: true });
    } catch(err) {
       await setDoc(doc(db, 'users', user.id), { profileImage: imagePreview, name: user.name, role: user.role });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] border border-gray-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-gray-600"/> 프로필 수정</h3>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden border border-gray-200 shadow-inner">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-gray-400 font-medium">{user.name.charAt(0)}</span>
            )}
          </div>
          <label className="cursor-pointer bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm flex items-center">
            <Upload className="w-4 h-4 mr-2" /> 이미지 선택
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        <button onClick={handleSave} className="w-full bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-900 transition-colors shadow-md">저장하기</button>
      </div>
    </div>
  );
};

const AdminModal = ({ onClose }) => {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingUsers(users);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: 'user', status: 'approved' });
    } catch(err) {
      console.error("Error approving user", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] border border-gray-100 relative flex flex-col max-h-[80vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center shrink-0"><ShieldCheck className="w-5 h-5 mr-2 text-gray-600"/> 가입 신청 승인</h3>
        <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-gray-500">현재 대기 중인 가입 신청이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-gray-800 truncate max-w-[120px]" title={u.name}>{u.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]" title={u.id}>{u.id}</div>
                  </div>
                  <button onClick={() => handleApprove(u.id)} className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors shadow-sm">승인</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full bg-gray-100 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm shrink-0">닫기</button>
      </div>
    </div>
  );
};

const DeviceAddModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] border border-gray-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center"><Plus className="w-5 h-5 mr-2 text-gray-600"/> 디바이스 추가</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">디바이스명</label><input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">제조사</label><input required value={formData.manufacturer} onChange={e=>setFormData({...formData, manufacturer: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">OS</label>
              <CustomSelect 
                value={formData.os} onChange={val=>setFormData({...formData, os: val})} 
                options={[{value:'Android', label:'Android'}, {value:'iOS', label:'iOS'}]}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">형태</label>
              <CustomSelect 
                value={formData.type} onChange={val=>setFormData({...formData, type: val})} 
                options={[{value:'Bar', label:'Bar'}, {value:'Fold', label:'Fold'}, {value:'Flip', label:'Flip'}]}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">상태</label>
              <CustomSelect 
                value={formData.status} 
                onChange={val=>{
                  if(val === '보관중') setFormData({...formData, status: val, renter: ''});
                  else setFormData({...formData, status: val});
                }} 
                options={[{value:'보관중', label:'보관중'}, {value:'사용중', label:'사용중'}, {value:'대여중', label:'대여중'}]}
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300"
              />
            </div>
          </div>
          <div><label className="text-xs font-medium text-gray-500 mb-1 block">시리얼 번호</label><input required value={formData.serial} onChange={e=>setFormData({...formData, serial: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">사용/대여자</label>
            <input 
              value={formData.renter} onChange={e=>setFormData({...formData, renter: e.target.value})} 
              disabled={formData.status === '보관중'}
              placeholder={formData.status === '보관중' ? '보관중에는 입력할 수 없습니다' : '이름을 입력하세요'} 
              className={`w-full text-sm rounded-lg px-3 py-2 outline-none transition-colors shadow-sm ${formData.status === '보관중' ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border border-gray-200 focus:border-gray-400 text-gray-800'}`} 
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-900 transition-colors mt-2 shadow-md">저장하기</button>
        </form>
      </div>
    </div>
  );
};

const DeviceDetailModal = ({ device, onClose, onUpdate, onDelete, user }) => {
  if (!device) return null;
  const isViewer = user.role === 'viewer';
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({...device});

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setEditMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] border border-gray-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <h3 className="text-lg font-medium text-gray-800 mb-4">디바이스 상세 정보</h3>
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
             <div><label className="text-xs font-medium text-gray-500 mb-1 block">디바이스명</label><input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-medium text-gray-500 mb-1 block">제조사</label><input required value={formData.manufacturer} onChange={e=>setFormData({...formData, manufacturer: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
               <div>
                 <label className="text-xs font-medium text-gray-500 mb-1 block">OS</label>
                 <CustomSelect value={formData.os} onChange={val=>setFormData({...formData, os: val})} options={[{value:'Android', label:'Android'}, {value:'iOS', label:'iOS'}]} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-medium text-gray-500 mb-1 block">형태</label>
                 <CustomSelect value={formData.type} onChange={val=>setFormData({...formData, type: val})} options={[{value:'Bar', label:'Bar'}, {value:'Fold', label:'Fold'}, {value:'Flip', label:'Flip'}]} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300" />
               </div>
               <div>
                 <label className="text-xs font-medium text-gray-500 mb-1 block">상태</label>
                 <CustomSelect 
                    value={formData.status} 
                    onChange={val=>{ if(val === '보관중') setFormData({...formData, status: val, renter: ''}); else setFormData({...formData, status: val}); }} 
                    options={[{value:'보관중', label:'보관중'}, {value:'사용중', label:'사용중'}, {value:'대여중', label:'대여중'}]}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-gray-300"
                 />
               </div>
             </div>
             <div><label className="text-xs font-medium text-gray-500 mb-1 block">시리얼 번호</label><input required value={formData.serial || ''} onChange={e=>setFormData({...formData, serial: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm transition-colors" /></div>
             <div>
               <label className="text-xs font-medium text-gray-500 mb-1 block">사용/대여자</label>
               <input 
                  value={formData.renter} onChange={e=>setFormData({...formData, renter: e.target.value})} 
                  disabled={formData.status === '보관중'}
                  placeholder={formData.status === '보관중' ? '보관중에는 입력할 수 없습니다' : '이름을 입력하세요'}
                  className={`w-full text-sm rounded-lg px-3 py-2 outline-none transition-colors shadow-sm ${formData.status === '보관중' ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border border-gray-200 focus:border-gray-400 text-gray-800'}`} 
               />
             </div>
             <div className="flex space-x-2 mt-4">
               <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm font-medium py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors">취소</button>
               <button type="submit" className="flex-1 bg-gray-800 text-white text-sm font-medium py-2 rounded-xl shadow-md hover:bg-gray-900 transition-colors">저장</button>
             </div>
          </form>
        ) : (
          <div className="space-y-4">
             <div><span className="text-xs text-gray-400 block mb-1">디바이스명</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.name}>{device.name}</div></div>
             <div className="grid grid-cols-2 gap-4">
               <div><span className="text-xs text-gray-400 block mb-1">제조사</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.manufacturer}>{device.manufacturer}</div></div>
               <div><span className="text-xs text-gray-400 block mb-1">OS</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.os}>{device.os}</div></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><span className="text-xs text-gray-400 block mb-1">상태</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.status}>{device.status}</div></div>
               <div><span className="text-xs text-gray-400 block mb-1">대여자</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.renter || '-'}>{device.renter || '-'}</div></div>
             </div>
             <div><span className="text-xs text-gray-400 block mb-1">시리얼 번호</span><div className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm truncate" title={device.serial || '-'}>{device.serial || '-'}</div></div>
             {!isViewer && (
               <div className="flex space-x-2 pt-4 border-t border-gray-100">
                 <button onClick={() => setEditMode(true)} className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm">수정하기</button>
                 <button onClick={() => { onDelete(device.id); onClose(); }} className="flex-1 bg-red-50 text-red-600 text-sm font-medium py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-100 shadow-sm">삭제하기</button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ devices, user, onStatusChange, onShowDetails }) => {
  const columns = [{ id: '보관중', title: '보관중' }, { id: '사용중', title: '사용중' }, { id: '대여중', title: '대여중' }];

  const handleDragStart = (e, deviceId) => e.dataTransfer.setData('deviceId', deviceId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (user.role === 'viewer') return;
    const deviceId = e.dataTransfer.getData('deviceId');
    onStatusChange(deviceId, targetStatus);
  };

  const calculateDDay = (dateString) => {
    if (!dateString) return '';
    const start = new Date(dateString);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'D-Day' : `D+${diffDays}`;
  };

  return (
    <div className="flex h-full gap-6 w-full animate-fade-in pb-4 overflow-x-auto no-scrollbar">
      {columns.map(col => (
        <div key={col.id} className="flex-1 min-w-[300px] bg-gray-100/80 rounded-2xl p-4 flex flex-col border border-gray-200 shadow-md" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-medium text-gray-700">{col.title}</h3>
            <span className="bg-white text-xs px-2 py-1 rounded-full shadow-sm text-gray-600 border border-gray-200 font-semibold">{devices.filter(d => d.status === col.id).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-2">
            {devices.filter(d => d.status === col.id).map(device => (
              <div key={device.id} draggable={user.role !== 'viewer'} onDragStart={(e) => handleDragStart(e, device.id)} onClick={() => onShowDetails(device)} className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 ${user.role !== 'viewer' ? 'cursor-grab active:cursor-grabbing hover-breath' : ''} group`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-400 tracking-wider truncate max-w-[100px]" title={device.manufacturer}>{device.manufacturer}</span>
                  <div className="flex items-center space-x-1.5">
                    {device.status !== '보관중' && device.statusUpdatedAt && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-bold shadow-sm whitespace-nowrap">
                        {calculateDDay(device.statusUpdatedAt)}
                      </span>
                    )}
                    <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100 font-medium truncate" title={device.type}>{device.type}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 truncate" title={device.name}>{device.name}</h4>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="font-medium text-gray-600 truncate max-w-[80px]" title={device.os}>{device.os}</span>
                  {device.renter ? (
                    <span className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium border border-blue-100 shadow-sm truncate max-w-[140px]" title={device.renter}><User className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">{device.renter}</span></span>
                  ) : <span className="text-gray-400 italic">미할당</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ListView = ({ devices, onShowDetails }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden animate-fade-in">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100/80 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider w-24">상태</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">디바이스명</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">제조사</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">OS</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">형태</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">시리얼 번호</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">사용/대여자</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(device => (
            <tr key={device.id} onClick={() => onShowDetails(device)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
              <td className="px-6 py-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm whitespace-nowrap ${device.status === '보관중' ? 'bg-gray-100 text-gray-600 border border-gray-200' : device.status === '사용중' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>{device.status}</span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-800"><div className="truncate max-w-[160px]" title={device.name}>{device.name}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[120px]" title={device.manufacturer}>{device.manufacturer}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[100px]" title={device.os}>{device.os}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[100px]" title={device.type}>{device.type}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[120px]" title={device.serial || '-'}>{device.serial || '-'}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[120px]" title={device.renter || '-'}>{device.renter || '-'}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DevicesDashboard = ({ user, onNavigate, onLogout, onQuit }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [viewType, setViewType] = useState('kanban'); 
  const [devices, setDevices] = useState([]);
  
  const [rentModal, setRentModal] = useState({ isOpen: false, deviceId: null, targetStatus: '' });
  const [renterName, setRenterName] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Bar', os: 'Android', status: '보관중', serial: '', manufacturer: '', renter: '' });
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [osFilter, setOsFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchRenter, setSearchRenter] = useState('');
  const [searchManufacturer, setSearchManufacturer] = useState('');

  useEffect(() => {
    const devicesRef = collection(db, 'devices');
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      if (snapshot.empty) {
        const seedData = async () => {
          const batch = writeBatch(db);
          INITIAL_DEVICES.forEach(device => batch.set(doc(devicesRef), device));
          await batch.commit();
        };
        seedData();
      } else {
        setDevices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const deviceToSave = { ...formData, statusUpdatedAt: formData.status === '보관중' ? null : new Date().toISOString() };
      await addDoc(collection(db, 'devices'), deviceToSave);
      setShowAddModal(false);
      setFormData({ name: '', type: 'Bar', os: 'Android', status: '보관중', serial: '', manufacturer: '', renter: '' });
    } catch(err) { console.error("Error adding device", err); }
  };

  const handleUpdateDevice = async (updatedData) => {
    try {
      const { id, ...dataToSave } = updatedData;
      const originalDevice = devices.find(d => d.id === id);
      if (originalDevice && originalDevice.status !== dataToSave.status) {
        dataToSave.statusUpdatedAt = dataToSave.status === '보관중' ? null : new Date().toISOString();
      }
      await updateDoc(doc(db, 'devices', id), dataToSave);
    } catch(err) { console.error("Error updating device", err); }
  };

  const handleDeleteDevice = async (id) => {
    try { await deleteDoc(doc(db, 'devices', id)); } catch(err) { console.error("Error deleting device", err); }
  };

  const handleStatusChangeRequest = (deviceId, targetStatus) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device || device.status === targetStatus) return;
    if (targetStatus === '보관중') {
      updateDoc(doc(db, 'devices', deviceId), { status: targetStatus, renter: '', statusUpdatedAt: null }).catch(console.error);
    } else {
      setRentModal({ isOpen: true, deviceId, targetStatus });
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!renterName.trim()) return;
    try { await updateDoc(doc(db, 'devices', rentModal.deviceId), { status: rentModal.targetStatus, renter: renterName }); } catch (err) { console.error("Error updating rent", err); }
    setRentModal({ isOpen: false, deviceId: null, targetStatus: '' });
    setRenterName('');
  };

  const filteredDevices = devices.filter(d => {
    if (activeMenu === 'android' && d.os !== 'Android') return false;
    if (activeMenu === 'ios' && d.os !== 'iOS') return false;
    
    if (activeMenu === 'dashboard' && osFilter !== 'All' && d.os !== osFilter) return false;
    if (typeFilter !== 'All' && d.type !== typeFilter) return false;
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (searchRenter && !d.renter?.toLowerCase().includes(searchRenter.toLowerCase())) return false;
    if (searchManufacturer && !d.manufacturer?.toLowerCase().includes(searchManufacturer.toLowerCase())) return false;
    
    return true;
  });

  const summary = {
    total: filteredDevices.length,
    storage: filteredDevices.filter(d => d.status === '보관중').length,
    inUse: filteredDevices.filter(d => d.status === '사용중').length,
    rented: filteredDevices.filter(d => d.status === '대여중').length,
  };

  return (
    <div className="w-screen h-screen bg-[#f8f9fa] flex flex-col overflow-hidden animate-simple-fade">
      <header className="h-16 px-6 flex justify-between items-center bg-white border-b border-gray-100 z-20 shrink-0 shadow-sm relative">
        <div className="flex items-center space-x-3">
          <AppLogo className="w-6 h-6" />
          <span className="text-lg font-medium tracking-wide text-gray-800">QA BASE</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-4 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm cursor-default">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">1명 접속중</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover-breath cursor-default">
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px] font-medium overflow-hidden">
              {user.profileImage ? <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700">{user.name}</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <button onClick={onLogout} className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 hover-breath rounded-md"><LogOut className="w-4 h-4" /></button>
          <button onClick={onQuit} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover-breath rounded-md"><Power className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col z-10 overflow-hidden whitespace-nowrap ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}>
          <div className="p-4 space-y-1 w-64">
            <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 px-3 mt-2">MENU</div>
            <button onClick={() => onNavigate('board')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"><LayoutDashboard className="w-4 h-4" /><span className="text-sm font-medium">기능 보드 이동</span></button>
            <div className="h-px bg-gray-100 my-2 mx-3"></div>
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'dashboard' ? 'bg-gray-50 text-gray-900 font-medium border border-gray-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><Server className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-gray-700' : ''}`} /><span className="text-sm">대시보드 (Devices)</span></button>
            <button onClick={() => { setActiveMenu('android'); if(!sidebarOpen) setSidebarOpen(true); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'android' ? 'bg-green-50/50 text-green-700 font-medium border border-green-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><div className="flex items-center space-x-3"><div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm"></div><span className="text-sm">Android</span></div></button>
            <button onClick={() => { setActiveMenu('ios'); if(!sidebarOpen) setSidebarOpen(true); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'ios' ? 'bg-blue-50/50 text-blue-700 font-medium border border-blue-100 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><div className="flex items-center space-x-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm"></div><span className="text-sm">iOS</span></div></button>
          </div>
        </aside>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`absolute top-6 z-20 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-600 hover:text-gray-900 transition-all duration-300 ${sidebarOpen ? 'left-[244px]' : 'left-4'}`}>
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <main className={`flex-1 overflow-hidden flex flex-col p-8 transition-all duration-300 ${!sidebarOpen ? 'ml-12' : ''}`}>
          <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{activeMenu === 'android' ? 'Android 디바이스' : activeMenu === 'ios' ? 'iOS 디바이스' : (osFilter === 'All' ? '전체 디바이스' : osFilter)}</h1>
                {user.role === 'viewer' && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded border border-gray-200 font-semibold uppercase tracking-wider shadow-sm">Read Only</span>}
              </div>
              <p className="text-sm text-gray-500 font-medium">테스트 단말기의 상태를 모니터링하고 관리합니다.</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeMenu === 'dashboard' && (
                <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
                  <button onClick={() => setViewType('kanban')} className={`p-1.5 rounded-md transition-colors ${viewType === 'kanban' ? 'bg-gray-100 text-gray-800 shadow-sm font-semibold' : 'text-gray-400 hover:text-gray-600'}`}><Grid className="w-4 h-4" /></button>
                  <button onClick={() => setViewType('list')} className={`p-1.5 rounded-md transition-colors ${viewType === 'list' ? 'bg-gray-100 text-gray-800 shadow-sm font-semibold' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
                </div>
              )}
              {user.role !== 'viewer' && (
                <button onClick={() => { const presetOs = activeMenu === 'android' ? 'Android' : activeMenu === 'ios' ? 'iOS' : 'Android'; setFormData({ name: '', type: 'Bar', os: presetOs, status: '보관중', serial: '', manufacturer: '', renter: '' }); setShowAddModal(true); }} className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-md hover-breath flex items-center">
                  <Plus className="w-4 h-4 mr-1.5" /> 추가
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 shrink-0 animate-fade-in relative z-30">
            <div className="flex justify-between items-center">
              <div className="flex space-x-8">
                <div className="flex flex-col"><span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total</span><span className="text-xl font-bold text-gray-800">{summary.total}</span></div><div className="w-px bg-gray-200 my-1"></div>
                <div className="flex flex-col"><span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">사용중</span><span className="text-xl font-bold text-green-600">{summary.inUse}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">대여중</span><span className="text-xl font-bold text-blue-600">{summary.rented}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">보관중</span><span className="text-xl font-bold text-gray-600">{summary.storage}</span></div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm mr-1">
                <Filter className="w-4 h-4 text-gray-400 ml-2" />
                <CustomSelect value={statusFilter} onChange={setStatusFilter} options={[{value:'All', label:'상태 전체'}, {value:'보관중', label:'보관중'}, {value:'사용중', label:'사용중'}, {value:'대여중', label:'대여중'}]} className="bg-transparent text-xs font-medium text-gray-700 py-1 px-2 outline-none w-24 hover:bg-gray-100 rounded-md transition-colors" />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                {activeMenu === 'dashboard' && (
                  <>
                    <CustomSelect value={osFilter} onChange={setOsFilter} options={[{value:'All', label:'OS 전체'}, {value:'Android', label:'Android'}, {value:'iOS', label:'iOS'}]} className="bg-transparent text-xs font-medium text-gray-700 py-1 px-2 outline-none w-24 hover:bg-gray-100 rounded-md transition-colors" />
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  </>
                )}
                <CustomSelect value={typeFilter} onChange={setTypeFilter} options={[{value:'All', label:'형태 전체'}, {value:'Fold', label:'폴드'}, {value:'Flip', label:'플립'}, {value:'Bar', label:'바'}]} className="bg-transparent text-xs font-medium text-gray-700 py-1 px-2 outline-none w-24 hover:bg-gray-100 rounded-md transition-colors" />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
              <input type="text" placeholder="제조사 검색..." value={searchManufacturer} onChange={e=>setSearchManufacturer(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-gray-400 transition-colors w-32 placeholder:text-gray-400" />
              <input type="text" placeholder="사용/대여자 검색..." value={searchRenter} onChange={e=>setSearchRenter(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-gray-400 transition-colors w-32 placeholder:text-gray-400" />
              {(statusFilter !== 'All' || osFilter !== 'All' || typeFilter !== 'All' || searchManufacturer || searchRenter) && (
                <button onClick={() => { setStatusFilter('All'); setOsFilter('All'); setTypeFilter('All'); setSearchManufacturer(''); setSearchRenter(''); }} className="text-[10px] text-gray-500 hover:text-gray-800 underline ml-2 font-medium">초기화</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
             {(viewType === 'kanban' && activeMenu === 'dashboard') ? <KanbanBoard devices={filteredDevices} user={user} onStatusChange={handleStatusChangeRequest} onShowDetails={setSelectedDevice} /> : <div className="h-full overflow-auto no-scrollbar"><ListView devices={filteredDevices} onShowDetails={setSelectedDevice} /></div>}
          </div>
        </main>
      </div>

      {rentModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[320px] transform transition-all border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-2">{rentModal.targetStatus === '사용중' ? '사용자 정보 입력' : '대여자 정보 입력'}</h3>
            <p className="text-xs text-gray-500 mb-5">상태를 변경하려면 이름을 입력해주세요.</p>
            <form onSubmit={handleRentSubmit}>
              <input autoFocus type="text" placeholder="이름 (예: 홍길동)" value={renterName} onChange={(e) => setRenterName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all mb-6 shadow-sm" />
              <div className="flex space-x-3">
                <button type="button" onClick={() => setRentModal({ isOpen: false, deviceId: null, targetStatus: '' })} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm">취소</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-md">확인</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeviceAddModal isOpen={showAddModal} onClose={()=>setShowAddModal(false)} formData={formData} setFormData={setFormData} onSubmit={handleAddSubmit} />
      <DeviceDetailModal device={selectedDevice} onClose={()=>setSelectedDevice(null)} onUpdate={handleUpdateDevice} onDelete={handleDeleteDevice} user={user} />
    </div>
  );
};

const ProjectModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isViewer, isEdit, onDelete }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fast-fade">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[450px] border border-gray-100 relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center shrink-0">
          <CalendarDays className="w-5 h-5 mr-2 text-gray-600"/> 
          {isEdit ? '프로젝트 상세 정보' : '새 프로젝트 등록'}
        </h3>
        <div className="overflow-visible flex-1 pb-2">
          <form id="projectForm" onSubmit={(e) => { e.preventDefault(); if(!isViewer) onSubmit(formData); }} className="space-y-4 relative">
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">프로젝트명</label><input required disabled={isViewer} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm disabled:bg-gray-100 disabled:text-gray-500" /></div>
            <div className="grid grid-cols-2 gap-4 relative z-50">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">시작일</label>
                <CustomDatePicker disabled={isViewer} value={formData.startDate} onChange={val=>setFormData({...formData, startDate: val})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">종료일</label>
                <CustomDatePicker disabled={isViewer} value={formData.endDate} onChange={val=>setFormData({...formData, endDate: val})} alignRight />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-40">
              <div><label className="text-xs font-medium text-gray-500 mb-1 block">담당자</label><input required disabled={isViewer} value={formData.assignee} onChange={e=>setFormData({...formData, assignee: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm disabled:bg-gray-100 disabled:text-gray-500" /></div>
              <div><label className="text-xs font-medium text-gray-500 mb-1 block">유관부서</label><input required disabled={isViewer} value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm disabled:bg-gray-100 disabled:text-gray-500" /></div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">상태</label>
                {isViewer ? (
                  <div className="w-full bg-gray-100 border border-gray-200 text-sm rounded-lg px-3 py-2 text-gray-500 truncate" title={formData.status}>{formData.status}</div>
                ) : (
                  <CustomSelect 
                    value={formData.status} onChange={val=>setFormData({...formData, status: val})} 
                    options={[{value:'예정', label:'예정'}, {value:'진행중', label:'진행중'}, {value:'HOLD', label:'HOLD'}, {value:'완료', label:'완료'}]}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm"
                  />
                )}
              </div>
            </div>
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">프로젝트 설명</label><textarea required disabled={isViewer} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-gray-400 shadow-sm resize-none disabled:bg-gray-100 disabled:text-gray-500" /></div>
          </form>
        </div>
        {!isViewer && (
          <div className="flex space-x-2 pt-4 border-t border-gray-100 shrink-0 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 text-sm font-medium py-2.5 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors">취소</button>
            {isEdit && (
              <button type="button" onClick={() => onDelete(formData.id)} className="flex-1 bg-red-50 text-red-600 text-sm font-medium py-2.5 rounded-xl border border-red-100 shadow-sm hover:bg-red-100 transition-colors">삭제</button>
            )}
            <button type="submit" form="projectForm" className="flex-1 bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl shadow-md hover:bg-gray-900 transition-colors">저장</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ScheduleCalendar = ({ schedules, onShowDetails, user, onUpdateEndDate, onUpdateStartDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); 
  const [showWeekend, setShowWeekend] = useState(true);
  
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [tooltipInfo, setTooltipInfo] = useState({ visible: false, x: 0, y: 0, text: '', assignee: '' });
  const calendarRef = useRef(null);

  const uniqueAssignees = Array.from(new Set(schedules.map(s => s.assignee).filter(Boolean)));
  const assigneeOptions = [{ value: 'All', label: '담당자 전체' }, ...uniqueAssignees.map(a => ({ value: a, label: a }))];

  const filteredSchedules = assigneeFilter === 'All' ? schedules : schedules.filter(s => s.assignee === assigneeFilter);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDaysArray = (y, m) => {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    let days = [];
    
    // Prev month filling
    const prevMonthDays = new Date(y, m, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(y, m - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(y, m, i), isCurrentMonth: true });
    }
    
    // Next month filling to complete the grid (usually 42 cells total for 6 rows)
    const totalCellsNeeded = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCellsNeeded) {
      days.push({ date: new Date(y, m + 1, nextMonthDay++), isCurrentMonth: false });
    }
    return days;
  };

  const getProjectSlots = (scheds, y, m) => {
    const sorted = [...scheds].sort((a, b) => new Date(a.startDate) - new Date(b.startDate) || new Date(b.endDate) - new Date(a.endDate));
    const slots = []; 
    const scheduleToSlot = {};

    sorted.forEach(s => {
      let assignedSlot = 0;
      while (true) {
        if (!slots[assignedSlot]) {
          slots[assignedSlot] = [];
          slots[assignedSlot].push(s);
          scheduleToSlot[s.id] = assignedSlot;
          break;
        }
        const overlaps = slots[assignedSlot].some(existing => (s.startDate <= existing.endDate && s.endDate >= existing.startDate));
        if (!overlaps) {
          slots[assignedSlot].push(s);
          scheduleToSlot[s.id] = assignedSlot;
          break;
        }
        assignedSlot++;
      }
    });
    return { scheduleToSlot, maxSlot: slots.length };
  };

  const renderMonthGrid = (y, m) => {
    const daysArray = getDaysArray(y, m);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const filteredDayNames = showWeekend ? dayNames : dayNames.slice(1, 6);
    const { scheduleToSlot, maxSlot } = getProjectSlots(filteredSchedules, y, m);

    return (
      <div 
        className="flex-1 rounded-2xl border border-gray-200 bg-gray-200 flex flex-col relative z-0" 
        style={{ overflow: 'hidden', isolation: 'isolate', maskImage: 'radial-gradient(white, black)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
      >
        <div className={`grid ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'} bg-gray-100 border-b border-gray-200 shrink-0`}>
          {filteredDayNames.map((day, i) => (
            <div key={i} className="py-3 text-center text-xs font-extrabold text-gray-700 tracking-widest uppercase">{day}</div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div 
            className={`grid ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'} gap-[1px] bg-gray-200`}
            style={{ gridAutoRows: 'minmax(120px, max-content)' }}
          >
            {daysArray.map((dayObj, idx) => {
              const { date, isCurrentMonth } = dayObj;
              if (!showWeekend && (date.getDay() === 0 || date.getDay() === 6)) return null;
              
              const isToday = date.toDateString() === new Date().toDateString();
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              
              const dayProjects = [];
              for (let i = 0; i < maxSlot; i++) {
                const proj = filteredSchedules.find(s => s.startDate <= dateStr && s.endDate >= dateStr && scheduleToSlot[s.id] === i);
                dayProjects.push(proj || null);
              }

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col bg-white h-full ${!isCurrentMonth ? 'bg-gray-50/80' : 'hover:bg-gray-50/50 transition-colors duration-300'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const resizeProjectId = e.dataTransfer.getData('resizeProjectId');
                    if (resizeProjectId && onUpdateEndDate) {
                      onUpdateEndDate(resizeProjectId, dateStr);
                    }
                    const resizeStartProjectId = e.dataTransfer.getData('resizeStartProjectId');
                    if (resizeStartProjectId && onUpdateStartDate) {
                      onUpdateStartDate(resizeStartProjectId, dateStr);
                    }
                  }}
                >
                  <div className="h-8 pt-2 px-2 flex justify-start shrink-0">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-gray-900 text-white shadow-lg' : (isCurrentMonth ? 'text-gray-800' : 'text-gray-300')}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-[2px] py-1 pb-2 flex-1">
                    {dayProjects.map((s, sIdx) => {
                      if (!s) return <div key={`empty-${sIdx}`} className="h-[24px] shrink-0"></div>;
                      
                      const isStart = s.startDate === dateStr || date.getDay() === (showWeekend ? 0 : 1);
                      const isEnd = s.endDate === dateStr || date.getDay() === (showWeekend ? 6 : 5);
                      const isActualStart = s.startDate === dateStr;
                      const isActualEnd = s.endDate === dateStr;
                      
                      const colorMap = { 
                        '예정': 'bg-gray-600 text-white shadow-sm', 
                        '진행중': 'bg-blue-600 text-white shadow-sm', 
                        'HOLD': 'bg-orange-500 text-white shadow-sm', 
                        '완료': 'bg-emerald-600 text-white shadow-sm' 
                      };
                      
                      const bandClasses = `h-[24px] shrink-0 text-[11px] font-bold flex items-center cursor-pointer transition-all hover:brightness-110 relative ` +
                        colorMap[s.status] + ' ' +
                        (isStart ? 'rounded-l-md ml-1 pl-2 ' : 'ml-0 pl-2 ') +
                        (isEnd ? 'rounded-r-md mr-1 pr-2 ' : 'w-[calc(100%+1px)] -mr-[1px] pr-1 z-10 ');

                      return (
                        <div 
                          key={s.id} 
                          onClick={(e) => { e.stopPropagation(); onShowDetails(s); }}
                          onMouseEnter={(e) => {
                            setTooltipInfo({ visible: true, x: e.clientX, y: e.clientY, text: s.name, assignee: s.assignee });
                          }}
                          onMouseMove={(e) => {
                            setTooltipInfo({ visible: true, x: e.clientX, y: e.clientY, text: s.name, assignee: s.assignee });
                          }}
                          onMouseLeave={() => setTooltipInfo({ visible: false, x: 0, y: 0, text: '', assignee: '' })}
                          className={bandClasses}
                        >
                          {isActualStart && user?.role !== 'viewer' && (
                            <div 
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('resizeStartProjectId', s.id);
                              }}
                              className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 z-30 rounded-l-md transition-colors"
                              title="드래그하여 시작일 변경"
                            />
                          )}

                          <span className="truncate w-full leading-none mt-0.5 drop-shadow-sm flex items-center pr-1">
                            {isStart ? (
                              <span className="truncate">{s.name}</span>
                            ) : '\u00A0'}
                          </span>
                          
                          {isActualEnd && user?.role !== 'viewer' && (
                            <div 
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('resizeProjectId', s.id);
                              }}
                              className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 z-30 rounded-r-md transition-colors"
                              title="드래그하여 종료일 변경"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    if (!tooltipInfo.visible) return null;
    let x = tooltipInfo.x + 15;
    let y = tooltipInfo.y + 15;
    
    // 브라우저 뷰포트 크기를 벗어나지 않도록 방어 로직
    if (x + 160 > window.innerWidth) x = tooltipInfo.x - 160;
    if (y + 60 > window.innerHeight) y = tooltipInfo.y - 60;
    
    // React Portal을 사용하여 모든 레이아웃 간섭을 피하고 최상위에 툴팁 렌더링
    return createPortal(
      <div 
        className="fixed z-[99999] px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-none animate-fast-fade border border-gray-700/50 flex flex-col gap-1 whitespace-nowrap"
        style={{ left: x, top: y }}
      >
        <span className="text-xs font-bold">{tooltipInfo.text}</span>
        {tooltipInfo.assignee && (
          <div className="flex items-center text-[10px] text-gray-300 font-medium">
            <User className="w-3 h-3 mr-1" /> {tooltipInfo.assignee}
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div ref={calendarRef} className="h-full flex flex-col bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden animate-fade-in p-5 isolate relative">
      <div className="flex justify-between items-center mb-5 px-2 shrink-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{year}년 {month + 1}월</h2>
          <div className="flex space-x-1">
            <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
            <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <CustomSelect 
            value={assigneeFilter} 
            onChange={setAssigneeFilter} 
            options={assigneeOptions}
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 py-1.5 px-3 rounded-xl shadow-sm hover:bg-gray-100 transition-colors min-w-[110px]"
          />
          <button onClick={() => setShowWeekend(!showWeekend)} className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all shadow-sm ${showWeekend ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            주말 포함
          </button>
        </div>
      </div>
      {renderMonthGrid(year, month)}
      {renderTooltip()}
    </div>
  );
};

const ProjectKanban = ({ projects, user, onStatusChange, onShowDetails }) => {
  const columns = [{ id: '예정', title: '예정' }, { id: '진행중', title: '진행중' }, { id: 'HOLD', title: 'HOLD' }, { id: '완료', title: '완료' }];

  const handleDragStart = (e, projectId) => e.dataTransfer.setData('projectId', projectId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (user.role === 'viewer') return;
    const projectId = e.dataTransfer.getData('projectId');
    onStatusChange(projectId, targetStatus);
  };

  return (
    <div className="flex h-full gap-6 w-full animate-fade-in pb-4 overflow-x-auto no-scrollbar">
      {columns.map(col => (
        <div key={col.id} className="flex-1 min-w-[280px] bg-gray-100/80 rounded-2xl p-4 flex flex-col border border-gray-200 shadow-md" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-medium text-gray-700">{col.title}</h3>
            <span className="bg-white text-xs px-2 py-1 rounded-full shadow-sm text-gray-600 border border-gray-200 font-semibold">{projects.filter(p => p.status === col.id).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-2">
            {projects.filter(p => p.status === col.id).map(project => (
              <div key={project.id} draggable={user.role !== 'viewer'} onDragStart={(e) => handleDragStart(e, project.id)} onClick={() => onShowDetails(project)} className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 ${user.role !== 'viewer' ? 'cursor-grab active:cursor-grabbing hover-breath' : ''} group`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-400 tracking-wider truncate max-w-[120px]" title={project.department}>{project.department}</span>
                  <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100 font-medium whitespace-nowrap shrink-0">{project.startDate.slice(5)} ~ {project.endDate.slice(5)}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 truncate" title={project.name}>{project.name}</h4>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="flex items-center bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-medium border border-gray-100 shadow-sm truncate max-w-[150px]" title={project.assignee}><User className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">{project.assignee}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ProjectList = ({ projects, onShowDetails }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden animate-fade-in">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100/80 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider w-24">상태</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">프로젝트명</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">기간</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">담당자</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider">유관부서</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const colorMap = { '예정': 'bg-gray-100 text-gray-600 border-gray-200', '진행중': 'bg-blue-50 text-blue-600 border-blue-200', 'HOLD': 'bg-orange-50 text-orange-600 border-orange-200', '완료': 'bg-green-50 text-green-600 border-green-200' };
            return (
            <tr key={project.id} onClick={() => onShowDetails(project)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
              <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm border whitespace-nowrap ${colorMap[project.status]}`}>{project.status}</span></td>
              <td className="px-6 py-4 text-sm font-bold text-gray-800"><div className="truncate max-w-[280px]" title={project.name}>{project.name}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">{project.startDate} ~ {project.endDate}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[150px]" title={project.assignee}>{project.assignee}</div></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600"><div className="truncate max-w-[150px]" title={project.department}>{project.department}</div></td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

const ScheduleDashboard = ({ user, onNavigate, onLogout, onQuit }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('calendar'); 
  const [schedules, setSchedules] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', assignee: '', department: '', description: '', status: '예정' });

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    const schedulesRef = collection(db, 'schedules');
    const unsubscribe = onSnapshot(schedulesRef, (snapshot) => {
      if (snapshot.empty) {
        const seedData = async () => {
          const batch = writeBatch(db);
          INITIAL_SCHEDULES.forEach(s => batch.set(doc(schedulesRef), s));
          await batch.commit();
        };
        seedData();
      } else {
        setSchedules(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSubmit = async (dataToSave) => {
    try {
      if (isEditMode) {
        const { id, ...updateData } = dataToSave;
        await updateDoc(doc(db, 'schedules', id), updateData);
      } else {
        await addDoc(collection(db, 'schedules'), dataToSave);
      }
      setShowModal(false);
    } catch(err) { console.error("Error saving schedule", err); }
  };

  const handleStatusChange = async (id, targetStatus) => {
    try { await updateDoc(doc(db, 'schedules', id), { status: targetStatus }); } 
    catch(err) { console.error("Error updating schedule status", err); }
  };

  const handleUpdateEndDate = async (id, newEndDate) => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (schedule && newEndDate >= schedule.startDate) {
        await updateDoc(doc(db, 'schedules', id), { endDate: newEndDate });
      }
    } catch(err) { console.error("Error updating end date", err); }
  };

  const handleUpdateStartDate = async (id, newStartDate) => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (schedule && newStartDate <= schedule.endDate) {
        await updateDoc(doc(db, 'schedules', id), { startDate: newStartDate });
      }
    } catch(err) { console.error("Error updating start date", err); }
  };

  const handleDeleteSchedule = async (id) => {
    try { await deleteDoc(doc(db, 'schedules', id)); setShowModal(false); }
    catch(err) { console.error("Error deleting schedule", err); }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', startDate: '', endDate: '', assignee: '', department: '', description: '', status: '예정' });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setIsEditMode(true);
    setFormData({...project});
    setShowModal(true);
  };

  return (
    <div className="w-screen h-screen bg-[#f8f9fa] flex flex-col overflow-hidden animate-simple-fade">
      <header className="h-16 px-6 flex justify-between items-center bg-white border-b border-gray-100 z-20 shrink-0 shadow-sm relative">
        <div className="flex items-center space-x-3">
          <AppLogo className="w-6 h-6" />
          <span className="text-lg font-medium tracking-wide text-gray-800">QA BASE</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-4 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm cursor-default">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">1명 접속중</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover-breath cursor-default">
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px] font-medium overflow-hidden">
              {user.profileImage ? <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700">{user.name}</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <button onClick={onLogout} className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 hover-breath rounded-md"><LogOut className="w-4 h-4" /></button>
          <button onClick={onQuit} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover-breath rounded-md"><Power className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col z-10 overflow-hidden whitespace-nowrap ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}>
          <div className="p-4 space-y-1 w-64">
            <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 px-3 mt-2">MENU</div>
            <button onClick={() => onNavigate('board')} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"><LayoutDashboard className="w-4 h-4" /><span className="text-sm font-medium">기능 보드 이동</span></button>
            <div className="h-px bg-gray-100 my-2 mx-3"></div>
            <button onClick={() => setActiveMenu('calendar')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'calendar' ? 'bg-gray-50 text-gray-900 font-medium border border-gray-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><CalendarDays className={`w-4 h-4 ${activeMenu === 'calendar' ? 'text-gray-700' : ''}`} /><span className="text-sm">캘린더 (Schedule)</span></button>
            <button onClick={() => setActiveMenu('list')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'list' ? 'bg-gray-50 text-gray-900 font-medium border border-gray-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><List className={`w-4 h-4 ${activeMenu === 'list' ? 'text-gray-700' : ''}`} /><span className="text-sm">프로젝트 목록</span></button>
            <button onClick={() => setActiveMenu('kanban')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${activeMenu === 'kanban' ? 'bg-gray-50 text-gray-900 font-medium border border-gray-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}><Kanban className={`w-4 h-4 ${activeMenu === 'kanban' ? 'text-gray-700' : ''}`} /><span className="text-sm">프로젝트 현황 (보드)</span></button>
          </div>
        </aside>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`absolute top-6 z-20 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-600 hover:text-gray-900 transition-all duration-300 ${sidebarOpen ? 'left-[244px]' : 'left-4'}`}>
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <main className={`flex-1 overflow-hidden flex flex-col p-8 transition-all duration-300 ${!sidebarOpen ? 'ml-12' : ''}`}>
          <div className="flex justify-between items-end mb-8 shrink-0">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeMenu === 'calendar' ? 'QA 스케쥴 캘린더' : activeMenu === 'list' ? '프로젝트 목록' : '프로젝트 현황 보드'}
                </h1>
                {user.role === 'viewer' && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded border border-gray-200 font-semibold uppercase tracking-wider shadow-sm">Read Only</span>}
              </div>
              <p className="text-sm text-gray-500 font-medium">프로젝트 일정 및 진행 상태를 통합 관리합니다.</p>
            </div>
            <div className="flex items-center space-x-4">
              {user.role !== 'viewer' && (
                <button onClick={openAddModal} className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-md hover-breath flex items-center">
                  <Plus className="w-4 h-4 mr-1.5" /> 프로젝트 추가
                </button>
              )}
            </div>
          </div>

          {activeMenu === 'list' && (
            <div className="flex items-center space-x-3 bg-white p-3 px-5 rounded-2xl shadow-sm border border-gray-100 mb-6 shrink-0 animate-fade-in relative z-30">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <CustomSelect 
                value={filterStatus} onChange={setFilterStatus} 
                options={[{value:'All', label:'상태 전체'}, {value:'예정', label:'예정'}, {value:'진행중', label:'진행중'}, {value:'HOLD', label:'HOLD'}, {value:'완료', label:'완료'}]}
                className="bg-transparent text-xs font-medium text-gray-700 py-1 px-2 outline-none w-28 hover:bg-gray-50 rounded-md transition-colors"
              />
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <input 
                type="text" placeholder="담당자 검색..." value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-gray-400 transition-colors w-32 placeholder:text-gray-400"
              />
              <input 
                type="text" placeholder="유관부서 검색..." value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-gray-400 transition-colors w-32 placeholder:text-gray-400"
              />
              {(filterStatus !== 'All' || filterAssignee || filterDept) && (
                <button onClick={() => { setFilterStatus('All'); setFilterAssignee(''); setFilterDept(''); }} className="text-[10px] text-gray-500 hover:text-gray-800 underline ml-2 font-medium">초기화</button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
             {activeMenu === 'calendar' && (
               <div className="w-full max-w-5xl mx-auto h-full overflow-hidden">
                 <ScheduleCalendar schedules={schedules} onShowDetails={openEditModal} user={user} onUpdateEndDate={handleUpdateEndDate} onUpdateStartDate={handleUpdateStartDate} />
               </div>
             )}
             {activeMenu === 'kanban' && <ProjectKanban projects={schedules} user={user} onStatusChange={handleStatusChange} onShowDetails={openEditModal} />}
             {activeMenu === 'list' && (
               <div className="h-full overflow-auto no-scrollbar">
                 <ProjectList 
                   projects={schedules.filter(p => {
                     if (filterStatus !== 'All' && p.status !== filterStatus) return false;
                     if (filterAssignee && !p.assignee.toLowerCase().includes(filterAssignee.toLowerCase())) return false;
                     if (filterDept && !p.department.toLowerCase().includes(filterDept.toLowerCase())) return false;
                     return true;
                   })} 
                   onShowDetails={openEditModal} 
                 />
               </div>
             )}
          </div>
        </main>
      </div>

      <ProjectModal isOpen={showModal} onClose={()=>setShowModal(false)} formData={formData} setFormData={setFormData} onSubmit={handleSaveSubmit} isViewer={user.role === 'viewer'} isEdit={isEditMode} onDelete={handleDeleteSchedule} />
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('loadingBoard');
  };

  const showToast = (msg) => setToastMessage(msg);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      showToast('기기가 PWA 설치를 지원하지 않거나 이미 설치되어 있습니다.');
    }
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      {screen === 'splash' && <SplashScreen onComplete={() => setScreen('login')} />}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} onInstallApp={handleInstallApp} />}
      {screen === 'loadingBoard' && <TransitionLoading title="Functional Board" onComplete={() => setScreen('board')} />}
      {screen === 'board' && <FunctionalBoard user={user} onNavigate={(target) => setScreen(`loading_${target}`)} onLogout={() => { setUser(null); setScreen('login'); }} onShowProfileModal={() => setShowProfileModal(true)} onShowAdminModal={() => setShowAdminModal(true)} />}
      
      {screen === 'loading_dashboard' && <TransitionLoading title="Devices Dashboard" onComplete={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <DevicesDashboard user={user} onNavigate={(target) => setScreen(target === 'board' ? 'loadingBoard' : target)} onLogout={() => { setUser(null); setScreen('login'); }} onQuit={() => { setUser(null); setScreen('splash'); }} />}
      
      {screen === 'loading_schedule' && <TransitionLoading title="Schedule Manager" onComplete={() => setScreen('schedule')} />}
      {screen === 'schedule' && <ScheduleDashboard user={user} onNavigate={(target) => setScreen(target === 'board' ? 'loadingBoard' : target)} onLogout={() => { setUser(null); setScreen('login'); }} onQuit={() => { setUser(null); setScreen('splash'); }} />}

      {showProfileModal && user && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} onUpdateProfile={(image) => setUser({...user, profileImage: image})} />}
      {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} />}
    </>
  );
}
