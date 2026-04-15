import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, GripVertical } from 'lucide-react';
import type { Task } from '@/stores/pomodoroStore';

interface TaskPanelProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (name: string, est: number, colorTag: string, emoji: string) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onSetActive: (id: string | null) => void;
}

const COLOR_OPTIONS = ['', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const EMOJI_OPTIONS = ['', '📚', '💻', '🎨', '📝', '🏋️', '🧘', '🎯'];

export default function TaskPanel({
  tasks, activeTaskId, onAddTask, onToggleTask, onRemoveTask, onSetActive,
}: TaskPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEst, setNewEst] = useState(1);
  const [newColor, setNewColor] = useState('');
  const [newEmoji, setNewEmoji] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalEst = tasks.reduce((a, t) => a + t.estPomodoros, 0);
  const doneEst = tasks.reduce((a, t) => a + t.pomodorosDone, 0);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddTask(newName.trim(), newEst, newColor, newEmoji);
    setNewName('');
    setNewEst(1);
    setNewColor('');
    setNewEmoji('');
    setShowAdd(false);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Tarefas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount}/{tasks.length} concluídas · {doneEst}/{totalEst} pomodoros
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="O que vais fazer?"
                className="w-full bg-transparent text-foreground border-b border-border pb-2 text-lg outline-none focus:border-primary transition-colors"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Pomodoros:</span>
                  {[1, 2, 3, 4, 6, 8].map(n => (
                    <button
                      key={n}
                      onClick={() => setNewEst(n)}
                      className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                        newEst === n ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c || 'none'}
                      onClick={() => setNewColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        newColor === c ? 'border-foreground scale-125' : 'border-transparent'
                      }`}
                      style={{ background: c || 'hsl(var(--muted))' }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e || 'none'}
                      onClick={() => setNewEmoji(e)}
                      className={`w-7 h-7 rounded text-sm transition-all ${
                        newEmoji === e ? 'bg-secondary ring-1 ring-primary' : ''
                      }`}
                    >
                      {e || '−'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">
                  Cancelar
                </button>
                <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground font-medium">
                  Adicionar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => !task.completed && onSetActive(task.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                task.id === activeTaskId
                  ? 'bg-primary/10 ring-1 ring-primary/30'
                  : 'bg-secondary/30 hover:bg-secondary/50'
              } ${task.completed ? 'opacity-50' : ''}`}
            >
              {task.colorTag && (
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: task.colorTag }} />
              )}
              <button
                onClick={e => { e.stopPropagation(); onToggleTask(task.id); }}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-success" />
                ) : (
                  <Circle size={20} className="text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.emoji && <span className="mr-1">{task.emoji}</span>}
                  {task.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {task.pomodorosDone}/{task.estPomodoros}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onRemoveTask(task.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Adiciona uma tarefa para começar 🎯
        </p>
      )}
    </div>
  );
}
