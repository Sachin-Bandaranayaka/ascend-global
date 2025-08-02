'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Save,
  FileText,
  User
} from 'lucide-react';

interface ReminderFormData {
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  priority: 'low' | 'medium' | 'high';
  type: 'task' | 'meeting' | 'follow_up' | 'deadline';
}

export default function NewReminderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    priority: 'medium',
    type: 'task'
  });

  const reminderTypes = [
    { value: 'task', label: 'Task', icon: FileText },
    { value: 'meeting', label: 'Meeting', icon: User },
    { value: 'follow_up', label: 'Follow Up', icon: Bell },
    { value: 'deadline', label: 'Deadline', icon: AlertTriangle }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'medium', label: 'Medium', color: 'text-warning bg-warning/10 border-warning/20' },
    { value: 'high', label: 'High', color: 'text-destructive bg-destructive/10 border-destructive/20' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll simulate the API call since the backend isn't implemented
      // In a real implementation, this would be:
      // const response = await fetch('/api/reminders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Reminder created successfully!');
      router.push('/reminders');
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = reminderTypes.find(t => t.value === type);
    const IconComponent = typeConfig?.icon || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/reminders" 
            className="p-2 rounded-xl bg-muted hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Reminder</h1>
            <p className="text-muted-foreground">Create a new reminder to stay on track</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground"
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background placeholder-muted-foreground resize-none"
                  placeholder="Add additional details about this reminder"
                />
              </div>
            </div>
          </div>

          {/* Type and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Type & Priority
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
                  required
                >
                  {reminderTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
                  required
                >
                  {priorityLevels.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-foreground mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
                  required
                />
              </div>

              <div>
                <label htmlFor="due_time" className="block text-sm font-medium text-foreground mb-2">
                  Due Time
                </label>
                <input
                  type="time"
                  id="due_time"
                  name="due_time"
                  value={formData.due_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground bg-background"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Preview</h3>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(formData.type)}
                    <h4 className="font-medium text-foreground">
                      {formData.title || 'Reminder Title'}
                    </h4>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mb-2">{formData.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">
                        {new Date(formData.due_date).toLocaleDateString()}
                      </span>
                      {formData.due_time && (
                        <span className="text-muted-foreground ml-1">{formData.due_time}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize ${priorityLevels.find(p => p.value === formData.priority)?.color}`}>
                    {formData.priority}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-muted text-muted-foreground capitalize">
                    {formData.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <Link 
              href="/reminders" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="btn btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Reminder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}