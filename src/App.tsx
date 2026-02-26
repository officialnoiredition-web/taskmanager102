import { useState, useMemo, useEffect } from 'react';
import { 
  Star, Trash2, X, Plus, Clock, AlignLeft, CheckSquare, Square, Check, 
  CalendarDays, ListTodo, LayoutDashboard, Settings, ChevronLeft, 
  ChevronRight, GalleryHorizontalEnd, Calendar as CalendarIcon, ChevronsLeft, 
  ChevronsRight, AlertTriangle, Play, CalendarPlus, Repeat, Activity, Pause, RotateCcw,
  Timer, Target
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface SubTodo {
  id: string;
  text: string;
  done: boolean;
}

interface Task {
  id: string;
  title: string;
  time: string;
  details: string;
  starred: boolean;
  todos: SubTodo[];
}

type TasksMap = Record<string, Task[]>;

interface InboxTodo {
  id: string;
  text: string;
  done: boolean;
  starred: boolean;
}

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const formatDateKey = (dateObj: Date): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Reusable Custom Confirmation Modal ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 text-red-500 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title || "Delete Task?"}</h3>
        </div>
        <p className="text-gray-500 mb-8 font-medium">{message || "This action is permanent and cannot be undone."}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// --- Feature 2: Context-Aware Zen Mode Tab ---
interface ZenModeScreenProps {
  tasksMap: TasksMap;
  setTasksMap: React.Dispatch<React.SetStateAction<TasksMap>>;
}

function ZenModeScreen({ tasksMap, setTasksMap }: ZenModeScreenProps) {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');

  const todayKey = formatDateKey(new Date());
  const todayTasks = tasksMap[todayKey] || [];
  const activeTask = todayTasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };
  
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTodoToggle = (todoId: string) => {
    if (!activeTask) return;
    setTasksMap(prev => ({
      ...prev, [todayKey]: prev[todayKey].map(t => t.id === activeTask.id ? { 
        ...t, todos: t.todos.map(td => td.id === todoId ? { ...td, done: !td.done } : td) 
      } : t)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 pb-32">
      <div className="absolute top-12 text-center opacity-50">
        <span className="text-xl font-bold tracking-widest uppercase text-gray-400">Zen Mode</span>
      </div>

      <div className="flex flex-col items-center w-full max-w-2xl mt-12">
        
        {/* Task Selector */}
        <div className="mb-12 w-full flex flex-col items-center">
          <div className="flex items-center gap-3 bg-gray-800/80 p-3 pl-5 rounded-2xl border border-gray-700 backdrop-blur-md w-full max-w-sm focus-within:ring-2 focus-within:ring-red-500/50 transition-all">
            <Target className="text-red-400" size={20} />
            <select 
              value={selectedTaskId} 
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="flex-1 bg-transparent text-white border-none outline-none font-medium cursor-pointer appearance-none"
            >
              <option value="none" className="bg-gray-800">General Focus (No Task)</option>
              {todayTasks.map(t => (
                <option key={t.id} value={t.id} className="bg-gray-800">{t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer */}
        <div className={`text-[6rem] sm:text-[10rem] md:text-[12rem] font-black tabular-nums tracking-tighter leading-none transition-colors duration-1000 ${isActive ? 'text-red-400' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-6 mt-12 mb-16">
          <button onClick={toggleTimer} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-gray-800 text-red-400 hover:bg-gray-700' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 hover:scale-105'}`}>
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>
          <button onClick={resetTimer} className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
            <RotateCcw size={32} />
          </button>
        </div>

        {/* Task Details (If selected) */}
        {activeTask && (
          <div className="w-full bg-gray-800/40 p-8 rounded-3xl border border-gray-700/50 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-2">{activeTask.title}</h2>
            {activeTask.details && <p className="text-gray-400 mb-6 leading-relaxed">{activeTask.details}</p>}
            
            {activeTask.todos && activeTask.todos.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Checklist</h4>
                {activeTask.todos.map(todo => (
                  <div key={todo.id} onClick={() => handleTodoToggle(todo.id)} className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-0.5 rounded-md transition-colors ${todo.done ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      {todo.done ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <span className={`text-lg transition-all ${todo.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{todo.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Extracted Manage Day Workspace ---
interface ManageDayPaneProps {
  dayName: string;
  dateString: string;
  dateKey: string;
  tasks: Task[];
  setTasksMap: React.Dispatch<React.SetStateAction<TasksMap>>;
  onClose: (e?: React.MouseEvent) => void;
  onRequestDelete: (dateKey: string, taskId: string, e?: React.MouseEvent) => void;
}

interface NewTaskState {
  title: string;
  time: string;
  details: string;
  todos: string[];
  repeat: string;
}

function ManageDayPane({ dayName, dateString, dateKey, tasks, setTasksMap, onClose, onRequestDelete }: ManageDayPaneProps) {
  const [newTask, setNewTask] = useState<NewTaskState>({ title: '', time: '', details: '', todos: [''], repeat: 'none' });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    setTasksMap(prev => {
      const newState = { ...prev };
      const baseTask = {
        title: newTask.title,
        time: newTask.time,
        details: newTask.details,
        starred: false,
        todos: newTask.todos.filter(t => t.trim() !== '').map(text => ({ id: generateId(), text, done: false }))
      };

      const datesToPopulate: string[] = [dateKey];
      if (newTask.repeat !== 'none') {
        const [year, month, day] = dateKey.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        
        let iterations = newTask.repeat === 'daily' ? 14 : newTask.repeat === 'weekly' ? 12 : 0;
        
        for (let i = 1; i <= iterations; i++) {
          const nextDate = new Date(baseDate);
          if (newTask.repeat === 'daily') nextDate.setDate(baseDate.getDate() + i);
          if (newTask.repeat === 'weekly') nextDate.setDate(baseDate.getDate() + (i * 7));
          datesToPopulate.push(formatDateKey(nextDate));
        }
      }

      datesToPopulate.forEach(dKey => {
        const currentTasks = newState[dKey] || [];
        newState[dKey] = [...currentTasks, { ...baseTask, id: generateId() }];
      });

      return newState;
    });
    setNewTask({ title: '', time: '', details: '', todos: [''], repeat: 'none' });
  };

  const updateNewTodo = (index: number, value: string) => {
    const newTodos = [...newTask.todos];
    newTodos[index] = value;
    if (index === newTodos.length - 1 && value.trim() !== '') newTodos.push('');
    setNewTask({ ...newTask, todos: newTodos });
  };

  const toggleStar = (taskId: string) => {
    setTasksMap(prev => ({
      ...prev, [dateKey]: (prev[dateKey]||[]).map(t => t.id === taskId ? { ...t, starred: !t.starred } : t)
    }));
  };

  const toggleTodoDone = (taskId: string, todoId: string) => {
    setTasksMap(prev => ({
      ...prev, [dateKey]: (prev[dateKey]||[]).map(t => t.id === taskId ? { ...t, todos: t.todos.map(td => td.id === todoId ? { ...td, done: !td.done } : td) } : t)
    }));
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full animate-in fade-in zoom-in-95 duration-500 bg-white">
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50">
        <button onClick={onClose} className="p-3 bg-white border border-gray-100 shadow-lg rounded-full hover:bg-red-50 hover:text-red-500 hover:scale-110 transition-all"><X size={24} /></button>
      </div>

      <div className="flex-1 w-full md:w-1/2 p-8 md:p-16 lg:p-24 overflow-y-auto bg-white border-r border-gray-100 relative">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 mb-2">{dayName}</h2>
        <p className="text-red-400 font-semibold text-lg mb-12">{dateString}</p>

        <div className="space-y-8">
          {tasks.map(task => (
            <div key={task.id} className="group p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-red-100 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => toggleStar(task.id)} className="p-1"><Star size={20} className={task.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-gray-400"} /></button>
                  <button onClick={(e) => onRequestDelete(dateKey, task.id, e)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"><Trash2 size={20} /></button>
                </div>
              </div>
              {task.time && <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-3"><Clock size={14} /> {task.time}</div>}
              {task.details && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{task.details}</p>}
              {task.todos && task.todos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {task.todos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-3 group/todo cursor-pointer" onClick={() => toggleTodoDone(task.id, todo.id)}>
                      <div className={`mt-0.5 rounded-md flex items-center justify-center transition-colors ${todo.done ? 'text-red-500' : 'text-gray-300 group-hover/todo:text-gray-400'}`}>
                        {todo.done ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <span className={`text-sm transition-all ${todo.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{todo.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {tasks.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl"><p className="text-lg font-medium">Your day is entirely clear.</p></div>}
        </div>
      </div>

      <div className="flex-1 w-full md:w-1/2 p-8 md:p-16 lg:p-24 overflow-y-auto bg-[#FDFBF7]">
        <h3 className="text-2xl font-bold text-gray-800 mb-8">Add New Task</h3>
        <div className="space-y-6">
          <input type="text" placeholder="What needs to be done?" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full text-2xl lg:text-3xl font-bold text-gray-800 placeholder-gray-300 bg-transparent border-b-2 border-gray-200 focus:border-red-400 outline-none pb-3 transition-colors"/>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-red-400/30">
              <Clock className="text-gray-400" size={20} />
              <input type="text" placeholder="Time (e.g., 2:00 PM)" value={newTask.time} onChange={(e) => setNewTask({...newTask, time: e.target.value})} className="w-full text-base bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"/>
            </div>
            <div className="w-1/3 flex items-center gap-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-red-400/30">
              <Repeat className="text-gray-400 flex-shrink-0" size={20} />
              <select value={newTask.repeat} onChange={(e) => setNewTask({...newTask, repeat: e.target.value})} className="w-full bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer">
                <option value="none">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-red-400/30">
            <AlignLeft className="text-gray-400 mt-1" size={20} />
            <textarea placeholder="Additional details or notes..." rows={3} value={newTask.details} onChange={(e) => setNewTask({...newTask, details: e.target.value})} className="flex-1 text-base bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 resize-none"/>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sub-Tasks / Checklist</h4>
            {newTask.todos.map((todo, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Square className="text-gray-300" size={18} />
                <input type="text" placeholder={idx === newTask.todos.length - 1 ? "Add a checklist item..." : ""} value={todo} onChange={(e) => updateNewTodo(idx, e.target.value)} className="flex-1 text-sm bg-transparent border-b border-gray-100 focus:border-red-300 outline-none pb-1 text-gray-700 placeholder-gray-400"/>
              </div>
            ))}
          </div>
          <button onClick={handleAddTask} disabled={!newTask.title.trim()} className="w-full mt-4 py-4 rounded-xl bg-red-500 text-white font-bold text-lg hover:bg-red-600 active:scale-[0.98] disabled:bg-gray-300 disabled:active:scale-100 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
            <Check size={20} /> Save to Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Schedule Screen Engine ---
interface ScheduleScreenProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  tasksMap: TasksMap;
  setTasksMap: React.Dispatch<React.SetStateAction<TasksMap>>;
}

interface MonthExpandedState {
  dateObj: Date;
  dateKey: string;
  tasks: Task[];
}

function ScheduleScreen({ isExpanded, setIsExpanded, tasksMap, setTasksMap }: ScheduleScreenProps) {
  const [viewMode, setViewMode] = useState<'carousel'|'month'>('carousel'); 
  const [deleteTarget, setDeleteTarget] = useState<{dateKey: string, taskId: string} | null>(null); 
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [monthExpandedDate, setMonthExpandedDate] = useState<MonthExpandedState | null>(null);

  const carouselDays = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = -1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateKey = formatDateKey(d);
      data.push({ id: dateKey, dayName: d.toLocaleDateString('en-US', { weekday: 'long' }), dateString: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isToday: i === 0, dateObj: d, tasks: tasksMap[dateKey] || [] });
    }
    return data;
  }, [tasksMap]);

  const requestDelete = (dateKey: string, taskId: string, e?: React.MouseEvent) => { if (e) e.stopPropagation(); setDeleteTarget({ dateKey, taskId }); };
  const executeDelete = () => {
    if (!deleteTarget) return;
    setTasksMap(prev => ({ ...prev, [deleteTarget.dateKey]: (prev[deleteTarget.dateKey] || []).filter(t => t.id !== deleteTarget.taskId) }));
    setDeleteTarget(null);
  };

  const handleQuickStar = (dateKey: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasksMap(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).map(t => t.id === taskId ? { ...t, starred: !t.starred } : t) }));
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const handlePrevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  return (
    <div className="fixed inset-0 bg-[#FDFBF7] flex flex-col items-center justify-start font-sans overflow-hidden">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={executeDelete} />

      <div className={`mt-8 md:mt-12 flex flex-col items-center transition-all duration-500 z-10 w-full max-w-4xl px-6 ${isExpanded ? 'opacity-0 -translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center justify-between w-full mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Schedule</h1>
          <div className="flex bg-gray-200/50 p-1 rounded-xl">
            <button onClick={() => setViewMode('carousel')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'carousel' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}><GalleryHorizontalEnd size={16} /> Weekly</button>
            <button onClick={() => setViewMode('month')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}><CalendarIcon size={16} /> Monthly</button>
          </div>
        </div>
      </div>

      {viewMode === 'carousel' && activeIndex !== 1 && !isExpanded && (
        <button onClick={() => setActiveIndex(1)} className={`absolute top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-md text-red-600 rounded-2xl font-bold shadow-xl border border-red-100 hover:bg-red-50 hover:scale-105 transition-all animate-in fade-in duration-300 ${activeIndex > 1 ? 'left-4 md:left-8 slide-in-from-left-8' : 'right-4 md:right-8 slide-in-from-right-8'}`}>
          {activeIndex > 1 && <ChevronsLeft size={20} />} Today {activeIndex < 1 && <ChevronsRight size={20} />}
        </button>
      )}

      {viewMode === 'carousel' && (
        <div style={{ perspective: '1400px' }} className="relative flex items-center justify-center h-[28rem] mt-10 w-full">
          {carouselDays.map((day, index) => {
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const absOffset = Math.abs(offset);
            const activeAndExpanded = isActive && isExpanded;

            const translateX = offset * 115; 
            const rotateY = Math.max(-45, Math.min(45, offset * -15)); 
            const scale = activeAndExpanded ? 1 : Math.max(0.5, 1 - (absOffset * 0.12)); 
            const zIndex = activeAndExpanded ? 50 : 20 - absOffset; 
            const opacity = activeAndExpanded ? 1 : Math.max(0, 1 - (absOffset * 0.35));
            const isClickable = absOffset <= 2;

            return (
              <div key={day.id} onClick={() => isClickable && !activeAndExpanded && setActiveIndex(index)} style={{ transform: activeAndExpanded ? 'translate3d(0,0,0) scale(1) rotateY(0deg)' : `translate3d(${translateX}%, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`, zIndex: zIndex, opacity: opacity, pointerEvents: activeAndExpanded || isClickable ? 'auto' : 'none' }} className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col bg-white overflow-hidden ${activeAndExpanded ? 'fixed inset-0 w-full h-full rounded-none shadow-none mt-0' : `w-72 sm:w-80 h-[26rem] sm:h-[28rem] rounded-3xl cursor-pointer ${isActive ? 'shadow-[0_20px_50px_-12px_rgba(255,107,107,0.4)] ring-2 ring-red-400/40' : 'shadow-xl hover:opacity-60 blur-[1px] hover:blur-none'}`}`}>
                
                <div className={`flex flex-col h-full w-full p-6 sm:p-8 transition-opacity duration-300 ${activeAndExpanded ? 'hidden opacity-0' : 'flex opacity-100'}`}>
                  <div className="mb-6 flex flex-col">
                    <h2 className={`text-2xl sm:text-3xl font-bold transition-all duration-300 ${isActive ? 'text-red-500' : 'text-gray-700'}`}>{day.dayName}</h2>
                    <span className={`text-sm font-semibold mt-1 transition-colors duration-300 ${isActive ? 'text-red-300' : 'text-gray-400'}`}>{day.dateString} {day.isToday && ' (Today)'}</span>
                  </div>
                  
                  <div className={`flex-1 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-20'} overflow-y-auto pr-1`}>
                    <ul className="space-y-4 pb-4">
                      {day.tasks.map((task) => (
                        <li key={task.id} className="group relative flex items-start text-gray-600 font-medium">
                          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 mr-3 ${isActive ? 'bg-red-400' : 'bg-gray-400'}`} />
                          <div className="flex flex-col flex-1 pb-1">
                            <span className="leading-snug break-words pr-2">{task.title}</span>
                            {task.time && <span className="text-xs text-gray-400 mt-0.5">{task.time}</span>}
                          </div>
                          {isActive && (
                            <div className="absolute right-0 top-0 h-full flex items-start justify-end pl-8 pb-2 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1 bg-white">
                                <button onClick={(e) => handleQuickStar(day.id, task.id, e)} className="p-1.5 hover:bg-gray-100 rounded">
                                  <Star size={16} className={task.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} />
                                </button>
                                <button onClick={(e) => requestDelete(day.id, task.id, e)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                      {day.tasks.length === 0 && <p className="text-gray-400 italic text-sm mt-2">No tasks scheduled.</p>}
                    </ul>
                  </div>

                  {isActive && (
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="mt-auto w-full py-3 rounded-xl bg-gray-50 text-gray-600 font-semibold border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2 group">
                      <Plus size={18} className="transition-transform group-hover:rotate-90" /> Manage Day
                    </button>
                  )}
                </div>

                {activeAndExpanded && (
                  <ManageDayPane dayName={day.dayName} dateString={day.dateString} dateKey={day.id} tasks={day.tasks} setTasksMap={setTasksMap} onClose={(e) => { e?.stopPropagation(); setIsExpanded(false); }} onRequestDelete={requestDelete} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="w-full max-w-4xl px-6 flex flex-col items-center animate-in fade-in duration-500 h-[32rem]">
          <div className="w-full flex justify-between items-center mb-6">
            <button onClick={handlePrevMonth} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
            <h2 className="text-2xl font-bold text-gray-800">{currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={handleNextMonth} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-100"><ChevronRight size={20} className="text-gray-600" /></button>
          </div>
          <div className="w-full grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-xs font-extrabold text-gray-400 uppercase tracking-wider">{d}</div>)}
          </div>
          <div className="w-full grid grid-cols-7 gap-2 sm:gap-4 auto-rows-fr">
            {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-gray-100/30" />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateKey = formatDateKey(dateObj);
              const dayTasks = tasksMap[dateKey] || [];
              const isToday = formatDateKey(new Date()) === dateKey;

              return (
                <div key={dayNum} onClick={() => { setMonthExpandedDate({ dateObj, dateKey, tasks: dayTasks }); setIsExpanded(true); }} className={`aspect-square rounded-2xl p-2 sm:p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 ${isToday ? 'bg-red-50 border-2 border-red-400 shadow-sm' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-red-200'}`}>
                  <span className={`text-sm sm:text-base font-bold ${isToday ? 'text-red-600' : 'text-gray-700'}`}>{dayNum}</span>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {dayTasks.slice(0, 3).map((t, idx) => <div key={idx} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${t.starred ? 'bg-yellow-400' : 'bg-red-400'}`} />)}
                    {dayTasks.length > 3 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300" />}
                  </div>
                </div>
              );
            })}
          </div>

          {isExpanded && monthExpandedDate && (
            <div className="fixed inset-0 z-50">
               <ManageDayPane dayName={monthExpandedDate.dateObj.toLocaleDateString('en-US', { weekday: 'long' })} dateString={monthExpandedDate.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} dateKey={monthExpandedDate.dateKey} tasks={tasksMap[monthExpandedDate.dateKey] || []} setTasksMap={setTasksMap} onClose={() => { setIsExpanded(false); setTimeout(() => setMonthExpandedDate(null), 300); }} onRequestDelete={requestDelete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Feature 1: The Inbox Component with the Bridge ---
interface TodoScreenProps {
  todos: InboxTodo[];
  setTodos: React.Dispatch<React.SetStateAction<InboxTodo[]>>;
  setTasksMap: React.Dispatch<React.SetStateAction<TasksMap>>;
  onNavigateToSchedule: () => void;
}

function TodoScreen({ todos, setTodos, setTasksMap, onNavigateToSchedule }: TodoScreenProps) {
  const [newTodo, setNewTodo] = useState<string>('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim()) {
      setTodos([{ id: generateId(), text: newTodo, done: false, starred: false }, ...todos]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleStar = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setTodos(todos.map(t => t.id === id ? { ...t, starred: !t.starred } : t)); };
  const requestDelete = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setTaskToDelete(id); };
  
  const executeDelete = () => {
    if (!taskToDelete) return;
    setTodos(todos.filter(t => t.id !== taskToDelete));
    setTaskToDelete(null);
  };

  const assignToDate = (todo: InboxTodo, dateString: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!dateString) return;
    setTasksMap(prev => {
      const existing = prev[dateString] || [];
      return {
        ...prev,
        [dateString]: [...existing, { id: generateId(), title: todo.text, time: '', details: 'Migrated from Inbox', starred: todo.starred, todos: [] }]
      };
    });
    setTodos(todos.filter(t => t.id !== todo.id));
    onNavigateToSchedule();
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 sm:p-16 max-w-3xl mx-auto w-full pb-32 animate-in fade-in duration-500">
      <ConfirmModal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={executeDelete} />
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">Master Inbox</h1>
      <p className="text-gray-500 font-medium mb-12">Unscheduled tasks & ideas</p>
      
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 mb-8 focus-within:ring-2 focus-within:ring-red-400/30 transition-shadow">
        <input type="text" placeholder="What's on your mind? (Press Enter)" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={addTodo} className="w-full text-xl bg-transparent border-none outline-none text-gray-800 placeholder-gray-300" />
      </div>

      <div className="space-y-4">
        {sortedTodos.map(todo => (
          <div key={todo.id} onClick={() => toggleTodo(todo.id)} className={`group relative flex items-center justify-between gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${todo.done ? 'bg-transparent border border-gray-200 opacity-60' : 'bg-white shadow-md shadow-gray-200/30 border border-gray-100 hover:shadow-lg'}`}>
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <div className={`flex items-center justify-center rounded-lg transition-colors duration-300 ${todo.done ? 'text-red-400' : 'text-gray-300'}`}>
                {todo.done ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <span className={`text-lg font-medium truncate transition-all duration-300 ${todo.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{todo.text}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative overflow-hidden rounded-lg hover:bg-gray-100 transition-colors" title="Assign to Date" onClick={(e) => e.stopPropagation()}>
                <CalendarPlus size={20} className="text-gray-400 m-2 absolute pointer-events-none" />
                <input type="date" className="opacity-0 w-9 h-9 cursor-pointer" onChange={(e) => assignToDate(todo, e.target.value, e)} />
              </div>
              <button onClick={(e) => toggleStar(todo.id, e)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Star size={20} className={todo.starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} /></button>
              <button onClick={(e) => requestDelete(todo.id, e)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
        {todos.length === 0 && <div className="text-center py-12"><p className="text-gray-400 italic">Inbox is empty. All caught up.</p></div>}
      </div>
    </div>
  );
}

// --- Feature 3: Velocity Dashboard ---
interface DashboardScreenProps {
  tasksMap: TasksMap;
}

function DashboardScreen({ tasksMap }: DashboardScreenProps) {
  const stats = useMemo(() => {
    let total = 0; let totalSubTodos = 0; let completedSubTodos = 0; let totalStarred = 0;
    Object.values(tasksMap).forEach((dayTasks: Task[]) => {
      total += dayTasks.length;
      dayTasks.forEach(task => {
        if (task.starred) totalStarred++;
        if (task.todos) { totalSubTodos += task.todos.length; completedSubTodos += task.todos.filter(t => t.done).length; }
      });
    });
    const completionRate = totalSubTodos === 0 ? 0 : Math.round((completedSubTodos / totalSubTodos) * 100);
    return { total, completionRate, totalStarred };
  }, [tasksMap]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 sm:p-16 max-w-4xl mx-auto w-full pb-32 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Activity className="text-red-500" size={32} />
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Velocity</h1>
      </div>
      <p className="text-gray-500 font-medium mb-12">Your productivity analytics</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col justify-center items-center">
          <span className="text-5xl font-black text-gray-800 mb-2">{stats.total}</span>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total Tasks</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col justify-center items-center">
          <span className="text-5xl font-black text-red-500 mb-2">{stats.completionRate}%</span>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Todo Success</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col justify-center items-center">
          <span className="text-5xl font-black text-yellow-400 mb-2">{stats.totalStarred}</span>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">High Priority</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity Heatmap</h3>
        <div className="flex gap-2 flex-wrap">
          {Array(30).fill(null).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            const count = (tasksMap[formatDateKey(d)] || []).length;
            let color = 'bg-gray-100'; 
            if (count > 0 && count <= 2) color = 'bg-red-200';
            if (count > 2 && count <= 4) color = 'bg-red-400';
            if (count > 4) color = 'bg-red-600';
            
            return <div key={i} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md ${color} transition-all hover:scale-110 hover:shadow-md cursor-help`} title={`${d.toLocaleDateString()}: ${count} tasks`} />;
          })}
        </div>
        <div className="flex items-center gap-2 mt-6 text-sm font-semibold text-gray-400">
          <span>Less</span><div className="w-4 h-4 rounded bg-gray-100" /><div className="w-4 h-4 rounded bg-red-200" /><div className="w-4 h-4 rounded bg-red-400" /><div className="w-4 h-4 rounded bg-red-600" /><span>More</span>
        </div>
      </div>
    </div>
  );
}

// --- App Root ---
export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState<boolean>(false);
  const [isTaskBarVisible, setIsTaskBarVisible] = useState<boolean>(false);

  // --- GLOBAL STATE WITH LOCALSTORAGE PERSISTENCE ---
  const [tasksMap, setTasksMap] = useState<TasksMap>(() => {
    try {
      const savedTasks = localStorage.getItem('schedule_tasksMap');
      if (savedTasks) return JSON.parse(savedTasks);
    } catch (e) {
      console.error('Failed to load tasks from local storage:', e);
    }
    
    // Default fallback for first-time users
    const map: TasksMap = {};
    const today = new Date();
    map[formatDateKey(today)] = [
      { id: generateId(), title: 'Deep Work Session', time: '10:00 AM', details: 'Head to the Zen tab to focus on this task.', starred: true, todos: [{ id: generateId(), text: 'Close all tabs', done: true }, { id: generateId(), text: 'Finish report', done: false }] },
    ];
    return map;
  });

  const [inboxTodos, setInboxTodos] = useState<InboxTodo[]>(() => {
    try {
      const savedInbox = localStorage.getItem('schedule_inboxTodos');
      if (savedInbox) return JSON.parse(savedInbox);
    } catch (e) {
      console.error('Failed to load inbox from local storage:', e);
    }

    // Default fallback for first-time users
    return [
      { id: generateId(), text: 'Buy groceries', done: false, starred: false },
      { id: generateId(), text: 'Click the calendar icon to schedule this ->', done: false, starred: true },
    ];
  });

  // Auto-save mechanisms
  useEffect(() => {
    localStorage.setItem('schedule_tasksMap', JSON.stringify(tasksMap));
  }, [tasksMap]);

  useEffect(() => {
    localStorage.setItem('schedule_inboxTodos', JSON.stringify(inboxTodos));
  }, [inboxTodos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 120) setIsTaskBarVisible(true);
      else setIsTaskBarVisible(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const tabs = [
    { id: 'schedule', icon: CalendarDays },
    { id: 'todo', icon: ListTodo },       
    { id: 'dash', icon: LayoutDashboard }, 
    { id: 'zen', icon: Timer },           
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] overflow-hidden">
      
      {/* Screen Router */}
      {activeTab === 0 && <ScheduleScreen isExpanded={isScheduleExpanded} setIsExpanded={setIsScheduleExpanded} tasksMap={tasksMap} setTasksMap={setTasksMap} />}
      {activeTab === 1 && <TodoScreen todos={inboxTodos} setTodos={setInboxTodos} setTasksMap={setTasksMap} onNavigateToSchedule={() => setActiveTab(0)} />}
      {activeTab === 2 && <DashboardScreen tasksMap={tasksMap} />}
      {activeTab === 3 && <ZenModeScreen tasksMap={tasksMap} setTasksMap={setTasksMap} />}
      
      {(activeTab > 3) && (
        <div className="flex items-center justify-center h-screen animate-in fade-in duration-500">
          <p className="text-gray-400 text-xl font-medium">Feature coming soon.</p>
        </div>
      )}

      {/* Global Navigation */}
      <div className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isScheduleExpanded ? 'translate-y-32 opacity-0' : isTaskBarVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="flex relative p-2 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="absolute top-2 bottom-2 left-2 w-14 bg-red-100/80 rounded-[1.5rem] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" style={{ transform: `translateX(${activeTab * 3.5}rem)` }} />
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button key={tab.id} onClick={() => setActiveTab(i)} className="w-14 h-14 relative z-10 flex items-center justify-center group outline-none">
                <Icon size={24} className={`transition-all duration-300 ${isActive ? 'text-red-500 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
