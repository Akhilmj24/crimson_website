import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Plus, Edit, Trash2, X, Loader2, Calendar, CheckSquare, Square, Filter } from 'lucide-react';

export default function CrmTasks() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  } = useCrm();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedUser: '',
    priority: 'Medium',
    status: 'Pending'
  });

  useEffect(() => {
    fetchTasks({ status: statusFilter, priority: priorityFilter });
  }, [statusFilter, priorityFilter]);

  const handleOpenCreate = () => {
    setCurrentTask(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assignedUser: '',
      priority: 'Medium',
      status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedUser: task.assignedUser || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Task Title is required');
      return;
    }

    const payload = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null
    };

    try {
      if (currentTask) {
        await updateTask(currentTask._id, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        alert(err.message || 'Error deleting task');
      }
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateTask(task._id, {
        ...task,
        status: newStatus
      });
    } catch (err) {
      alert(err.message || 'Error updating task status');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>CRM Task Board</h1>
        </div>
        <button className="btn-add-item-row" onClick={handleOpenCreate} style={{ marginTop: 0, width: 'auto' }}>
          <Plus size={16} />
          Create Task
        </button>
      </header>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '13px' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '13px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      {isLoading && tasks.length === 0 ? (
        <div className="empty-state">
          <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
          <p>Loading task board...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={32} style={{ color: 'var(--success)' }} />
          <h3>All Cleared!</h3>
          <p>No pending tasks found. Create a new task to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(task => {
            const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
            const isCompleted = task.status === 'Completed';

            let priorityColor = 'var(--text-muted)';
            if (task.priority === 'High') priorityColor = 'var(--error)';
            if (task.priority === 'Medium') priorityColor = 'var(--warning)';

            return (
              <div
                key={task._id}
                className="card"
                style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${isCompleted ? 'var(--success)' : priorityColor}` }}
              >
                {/* Status Toggle Box */}
                <button
                  onClick={() => toggleTaskStatus(task)}
                  style={{ background: 'transparent', border: 'none', color: isCompleted ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                >
                  {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                <div style={{ flexGrow: 1, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{task.description}</div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {dueDateText && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Due: {dueDateText}</span>
                    )}
                    {task.assignedUser && (
                      <span>Assignee: <strong>{task.assignedUser}</strong></span>
                    )}
                    <span>Priority: <strong style={{ color: priorityColor }}>{task.priority}</strong></span>
                  </div>
                </div>

                {/* Edit / Delete Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenEdit(task)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(task._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>{currentTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Call Client Compay regarding pricing"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="invoice-form-item-input"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of what needs to be done..."
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="invoice-form-item-input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned User</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.assignedUser}
                  onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                  placeholder="e.g. Akhil"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '8px 24px' }}>
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
