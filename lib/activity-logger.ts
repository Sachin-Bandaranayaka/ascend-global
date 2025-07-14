import { supabase } from './supabase';

export interface ActivityLog {
  id?: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: any;
  created_at?: string;
}

export interface Reminder {
  id?: string;
  title: string;
  description?: string;
  reminder_type: 'lead_followup' | 'expense_review' | 'inventory_check' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  due_date?: string;
  due_time?: string;
  user_id?: string;
  user_email?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface Notification {
  id?: string;
  user_id?: string;
  user_email?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'order' | 'lead' | 'system' | 'reminder' | 'general';
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  created_at?: string;
  read_at?: string;
}

export interface UserSession {
  id?: string;
  user_id?: string;
  user_email: string;
  user_name?: string;
  user_role: 'admin' | 'manager' | 'user' | 'staff';
  session_token?: string;
  ip_address?: string;
  user_agent?: string;
  last_activity?: string;
  status: 'active' | 'idle' | 'offline';
  created_at?: string;
  expires_at?: string;
}

export class ActivityLogger {
  private static logQueue: Array<Omit<ActivityLog, 'id' | 'created_at'>> = [];
  private static isProcessing = false;
  private static batchSize = 10;
  private static flushInterval = 5000; // 5 seconds

  static {
    // Start the background processing
    this.startBackgroundProcessing();
  }

  static async logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>) {
    // Add to queue for async processing
    this.logQueue.push(activity);
    
    // If queue is getting large, process immediately
    if (this.logQueue.length >= this.batchSize) {
      this.processQueue();
    }
  }

  private static startBackgroundProcessing() {
    setInterval(() => {
      if (this.logQueue.length > 0) {
        this.processQueue();
      }
    }, this.flushInterval);
  }

  private static async processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const batch = this.logQueue.splice(0, this.batchSize);
      
      const { error } = await supabase
        .from('activity_logs')
        .insert(batch);

      if (error) {
        console.error('Error logging activities batch:', error);
        // Re-add failed items to queue for retry
        this.logQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error processing activity log queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  static async getRecentActivities(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  static async createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  }

  static async getUpcomingReminders(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async getNotifications(userEmail: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async getUnreadNotificationCount(userEmail: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', userEmail)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async updateUserSession(session: Omit<UserSession, 'id' | 'created_at'>) {
    try {
      // First try to update existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_email', session.user_email)
        .single();

      if (existingSession) {
        const { data, error } = await supabase
          .from('user_sessions')
          .update({
            ...session,
            last_activity: new Date().toISOString()
          })
          .eq('user_email', session.user_email)
          .select()
          .single();

        if (error) {
          console.error('Error updating user session:', error);
          return null;
        }

        return data;
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('user_sessions')
          .insert([{
            ...session,
            last_activity: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating user session:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error updating user session:', error);
      return null;
    }
  }

  static async getActiveUsers(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .in('status', ['active', 'idle'])
        .order('last_activity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching active users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active users:', error);
      return [];
    }
  }

  // Helper methods for common activities
  static async logOrderCreated(orderData: any, userEmail?: string) {
    return this.logActivity({
      user_email: userEmail,
      action: 'create',
      entity_type: 'order',
      entity_id: orderData.id,
      entity_name: orderData.order_number,
      description: `New order ${orderData.order_number} created for ${orderData.customer_name || 'customer'}`,
      metadata: { total_amount: orderData.total_amount }
    });
  }

  static async logLeadConverted(leadData: any, userEmail?: string) {
    return this.logActivity({
      user_email: userEmail,
      action: 'convert',
      entity_type: 'lead',
      entity_id: leadData.id,
      entity_name: leadData.lead_name,
      description: `Lead ${leadData.lead_name} converted to customer`,
      metadata: { lead_source: leadData.source }
    });
  }

  static async logExpenseAdded(expenseData: any, userEmail?: string) {
    return this.logActivity({
      user_email: userEmail,
      action: 'create',
      entity_type: 'expense',
      entity_id: expenseData.id,
      entity_name: expenseData.description,
      description: `New ${expenseData.category} expense added: ${expenseData.description}`,
      metadata: { amount: expenseData.amount, category: expenseData.category }
    });
  }

  static async logReturnProcessed(returnData: any, userEmail?: string) {
    return this.logActivity({
      user_email: userEmail,
      action: 'create',
      entity_type: 'return',
      entity_id: returnData.id,
      entity_name: returnData.return_number,
      description: `Return ${returnData.return_number} processed`,
      metadata: { reason: returnData.reason, refund_amount: returnData.refund_amount }
    });
  }
} 