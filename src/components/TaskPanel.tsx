import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Square, GripVertical } from 'lucide-react';
import type { Task } from '@/stores/pomodoroStore';

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

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddTask(newName.trim(), 1, '', '');
    setNewName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel p-5 w-[380px] max-h-[400px] flex flex-col"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-sm">📋</span>
        </div>
        <h3 className="font-semibold text-white text-base">Tasks</h3>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 mb-3">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => !task.completed && onSetActive(task.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all ${
                task.id === activeTaskId ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
              } ${task.completed ? 'opacity-40' : ''}`}
            >
              <GripVertical size={14} className="text-white/20 flex-shrink-0" />
              <button
                onClick={e => { e.stopPropagation(); onToggleTask(task.id); }}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-primary" />
                ) : (
                  <Square size={18} className="text-white/30 rounded" />
                )}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>
                {task.emoji && <span className="mr-1">{task.emoji}</span>}
                {task.name}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onRemoveTask(task.id); }}
                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-all flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline add */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
        <Square size={18} className="text-white/20 flex-shrink-0" />
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Type your priority"
          className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/30 outline-none"
        />
      </div>

      <button
        onClick={handleAdd}
        className="mt-3 w-full text-center text-sm font-semibold text-white/80 hover:text-white py-2 transition-all"
      >
        + Add Task
      </button>
    </motion.div>
  );
}
