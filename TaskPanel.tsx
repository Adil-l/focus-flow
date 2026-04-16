import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Square, ChevronDown, ChevronRight, Tag, Copy, BarChart } from 'lucide-react';
import type { Task } from '@/stores/pomodoroStore';
import { DEFAULT_TEMPLATES } from '@/data/taskTemplates';

const TAG_COLORS = [
  { id: 'work', label: 'Work', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'study', label: 'Study', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'personal', label: 'Personal', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'health', label: 'Health', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'creative', label: 'Creative', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

interface TaskPanelProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (name: string, est: number, colorTag: string, emoji: string) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onSetActive: (id: string | null) => void;
}

export default function TaskPanel({
  tasks, activeTaskId, onAddTask, onToggleTask, onRemoveTask, onSetActive,
}: TaskPanelProps) {
  const [newName, setNewName] = useState('');
  const [newEst, setNewEst] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddTask(newName.trim(), newEst, newTag, '');
    setNewName('');
    setNewEst(1);
    setNewTag('');
    setShowAddForm(false);
  };

  const applyTemplate = (templateId: string) => {
    const t = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!t) return;
    t.tasks.forEach(task => onAddTask(task.name, task.estPomodoros, '', t.emoji));
    setShowTemplates(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-8 w-[900px] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <span className="text-sm">📋</span>
          </div>
          <h3 className="font-semibold text-white text-base">Tasks</h3>
          {tasks.length > 0 && (
            <span className="text-xs text-white/30">{completedCount}/{tasks.length}</span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            title="Templates">
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Templates dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3">
            <div className="bg-white/[0.04] rounded-xl p-3 space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
              <p className="text-xs text-white/40 mb-2 sticky top-0 bg-white/[0.04] py-1">Quick Templates</p>
              {DEFAULT_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] text-left transition-all">
                  <span>{t.emoji}</span>
                  <span className="text-sm text-white/70">{t.name}</span>
                  <span className="text-xs text-white/30 ml-auto">{t.tasks.length} tasks</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 mb-3">
        <AnimatePresence>
          {tasks.map(task => {
            const tagInfo = TAG_COLORS.find(t => t.id === task.colorTag);
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => !task.completed && onSetActive(task.id === activeTaskId ? null : task.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer group transition-all ${
                  task.id === activeTaskId ? 'bg-white/[0.08] ring-1 ring-white/10' : 'hover:bg-white/[0.04]'
                } ${task.completed ? 'opacity-40' : ''}`}
              >
                <button onClick={e => { e.stopPropagation(); onToggleTask(task.id); }} className="flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <Square size={16} className="text-white/25 rounded" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {task.emoji && <span className="text-xs">{task.emoji}</span>}
                    <span className={`text-sm truncate ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {tagInfo && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${tagInfo.color}`}>
                        {tagInfo.label}
                      </span>
                    )}
                    <span className="text-[10px] text-white/25">
                      {task.pomodorosDone}/{task.estPomodoros} 🍅
                    </span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onRemoveTask(task.id); }}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400/70 transition-all flex-shrink-0">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Quick add */}
      {!showAddForm ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
          <Square size={16} className="text-white/15 flex-shrink-0" />
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            onFocus={() => setShowAddForm(true)}
            placeholder="Type a task and press Enter"
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none" />
        </div>
      ) : (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04]">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAddForm(false); }}
              placeholder="Task name" autoFocus
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              {TAG_COLORS.map(t => (
                <button key={t.id} onClick={() => setNewTag(newTag === t.id ? '' : t.id)}
                  className={`text-[10px] px-2 py-1 rounded border transition-all ${
                    newTag === t.id ? t.color : 'border-white/10 text-white/30 hover:text-white/50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/30">Est:</span>
              <input type="number" min={1} max={20} value={newEst} onChange={e => setNewEst(parseInt(e.target.value) || 1)}
                className="w-10 bg-white/[0.06] rounded px-1.5 py-0.5 text-xs text-white text-center outline-none" />
              <span className="text-xs">🍅</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="flex-1 py-2 rounded-lg bg-white/[0.08] text-sm font-medium text-white/80 hover:bg-white/[0.12] transition-all">
              Add Task
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
