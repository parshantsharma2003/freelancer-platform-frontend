import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, Trash2, Briefcase, FileText, DollarSign, MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';

const NotificationsPage = () => {
  const { accessToken, isAuthResolved } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery('notifications', () =>
    notificationAPI.getNotifications(),
    { 
      enabled: isAuthResolved && !!accessToken,
      select: (response) => response?.data?.data?.notifications || []
    }
  );

  const markAsReadMutation = useMutation(
    (notificationId) => notificationAPI.markAsRead(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      },
    }
  );

  const markAllAsReadMutation = useMutation(
    () => notificationAPI.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      },
    }
  );

  const deleteMutation = useMutation(
    (notificationId) => notificationAPI.deleteNotification(notificationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      },
    }
  );

  const getIcon = (type) => {
    switch (type) {
      case 'job_posted':
      case 'job_updated':
        return <Briefcase className="w-5 h-5" />;
      case 'proposal_received':
      case 'proposal_accepted':
      case 'proposal_rejected':
        return <FileText className="w-5 h-5" />;
      case 'payment_received':
      case 'payment_released':
        return <DollarSign className="w-5 h-5" />;
      case 'new_message':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconBgColor = (type) => {
    if (type.includes('job')) return 'bg-blue-100 text-blue-600';
    if (type.includes('proposal')) return 'bg-purple-100 text-purple-600';
    if (type.includes('payment')) return 'bg-green-100 text-green-600';
    if (type.includes('message')) return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-8 h-8 text-primary-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isLoading}
                className="btn-outline flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {!notifications || notifications.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`card hover:shadow-md transition cursor-pointer ${
                  !notification.isRead ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
                onClick={() => !notification.isRead && markAsReadMutation.mutate(notification._id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{notification.title}</p>
                        <p className="text-gray-700 text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notification._id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
