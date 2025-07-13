'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Package,
  Sparkles
} from 'lucide-react';
import { Reminder } from '@/lib/activity-logger';
import { useAuth } from '@/hooks/use-auth';

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Error fetching reminders:', result.error);
        setReminders([]);
      } else {
        setReminders(result.reminders || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        console.error('Error updating reminder:', result.error);
        alert('Failed to update reminder');
      } else {
        // Update the reminder in the local state
        setReminders(reminders.map(reminder => 
          reminder.id === reminderId 
            ? { ...reminder, status: 'completed', completed_at: new Date().toISOString() }
            : reminder
        ));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders?id=${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        console.error('Error deleting reminder:', result.error);
        alert('Failed to delete reminder');
      } else {
        setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete reminder');
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || reminder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead_followup':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'expense_review':
        return <DollarSign className="h-4 w-4 text-red-500" />;
      case 'inventory_check':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDueDate = (dueDate: string, dueTime?: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${dueTime || ''}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${dueTime || ''}`;
    } else {
      return `${date.toLocaleDateString()} ${dueTime || ''}`;
    }
  };

  const isOverdue = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
                  <p className="text-sm text-gray-500">Manage your tasks and follow-ups</p>
                </div>
              </div>
            </div>
            <Link
              href="/reminders/new"
              className="btn btn-primary px-4 py-2 h-10 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input pl-10 pr-8 w-36"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input px-3 w-32"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredReminders.length} Reminder{filteredReminders.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {reminders.filter(r => r.status === 'pending').length} pending
                </span>
              </div>
            </div>
          </div>
          
          {filteredReminders.length === 0 ? (
            <div className="card-content">
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'Get started by adding your first reminder.'}
                </p>
                {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                  <Link
                    href="/reminders/new"
                    className="btn btn-primary px-6 py-3 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="card-content p-0">
              <div className="divide-y divide-gray-100">
                {filteredReminders.map((reminder) => (
                  <div key={reminder.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(reminder.reminder_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {reminder.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                                  {getPriorityIcon(reminder.priority)}
                                  <span className="ml-1 capitalize">{reminder.priority}</span>
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(reminder.status)}`}>
                                  {getStatusIcon(reminder.status)}
                                  <span className="ml-1 capitalize">{reminder.status}</span>
                                </span>
                              </div>
                            </div>
                            
                            {reminder.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {reminder.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className={`${reminder.due_date && isOverdue(reminder.due_date) && reminder.status === 'pending' ? 'text-red-600 font-medium' : ''}`}>
                                  {reminder.due_date ? formatDueDate(reminder.due_date, reminder.due_time) : 'No due date'}
                                  {reminder.due_date && isOverdue(reminder.due_date) && reminder.status === 'pending' && ' (Overdue)'}
                                </span>
                              </div>
                              {reminder.user_email && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{reminder.user_email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        {reminder.status === 'pending' && (
                          <button
                            onClick={() => markAsCompleted(reminder.id!)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Mark as completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit reminder"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id!)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete reminder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 