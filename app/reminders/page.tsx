'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  RefreshCw,
  User,
  FileText
} from 'lucide-react';
import PageHeader from '@/components/page-header';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  type: 'task' | 'meeting' | 'follow_up' | 'deadline';
  created_at: string;
  updated_at: string;
}

export default function RemindersPage() {
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
      // Mock data for demonstration
      setReminders([
        {
          id: '1',
          title: 'Follow up with lead John Smith',
          description: 'Call regarding premium package inquiry',
          due_date: '2024-01-16',
          due_time: '10:00',
          priority: 'high',
          status: 'pending',
          type: 'follow_up',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Quarterly business review meeting',
          description: 'Review Q1 performance with team',
          due_date: '2024-01-18',
          due_time: '14:00',
          priority: 'medium',
          status: 'pending',
          type: 'meeting',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          title: 'Update product inventory',
          description: 'Check stock levels and reorder items',
          due_date: '2024-01-15',
          due_time: '16:00',
          priority: 'medium',
          status: 'completed',
          type: 'task',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-15T16:30:00Z'
        },
        {
          id: '4',
          title: 'Submit tax documents',
          description: 'Deadline for quarterly tax submission',
          due_date: '2024-01-14',
          due_time: '17:00',
          priority: 'high',
          status: 'overdue',
          type: 'deadline',
          created_at: '2024-01-12T16:45:00Z',
          updated_at: '2024-01-12T16:45:00Z'
        },
        {
          id: '5',
          title: 'Team standup meeting',
          description: 'Daily team sync and updates',
          due_date: '2024-01-16',
          due_time: '09:00',
          priority: 'low',
          status: 'pending',
          type: 'meeting',
          created_at: '2024-01-11T11:30:00Z',
          updated_at: '2024-01-11T11:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const toggleReminderStatus = async (reminderId: string) => {
    try {
      setReminders(reminders.map(reminder => 
        reminder.id === reminderId 
          ? { 
              ...reminder, 
              status: reminder.status === 'completed' ? 'pending' : 'completed',
              updated_at: new Date().toISOString()
            }
          : reminder
      ));
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || reminder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'completed': return 'text-success bg-success/10 border-success/20';
      case 'overdue': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <FileText className="h-4 w-4" />;
      case 'meeting': return <User className="h-4 w-4" />;
      case 'follow_up': return <Bell className="h-4 w-4" />;
      case 'deadline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const totalReminders = reminders.length;
  const pendingReminders = reminders.filter(r => r.status === 'pending').length;
  const overdueReminders = reminders.filter(r => r.status === 'overdue').length;
  const completedReminders = reminders.filter(r => r.status === 'completed').length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Reminders" 
        description="Stay on top of important tasks and deadlines"
      >
        <button className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/reminders/new" className="btn btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reminders</p>
              <p className="text-2xl font-bold text-foreground">{totalReminders}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bell className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingReminders}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-foreground">{overdueReminders}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedReminders}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Reminder</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-foreground">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{reminder.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(reminder.type)}
                      <span className="text-sm capitalize">{reminder.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">
                        {new Date(reminder.due_date).toLocaleDateString()}
                      </span>
                      {reminder.due_time && (
                        <span className="text-muted-foreground ml-1">{reminder.due_time}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleReminderStatus(reminder.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(reminder.status)} hover:opacity-80 transition-opacity`}
                    >
                      {getStatusIcon(reminder.status)}
                      {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1 rounded-md hover:bg-muted transition-colors text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reminders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first reminder"}
            </p>
            <Link href="/reminders/new" className="btn btn-primary px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 