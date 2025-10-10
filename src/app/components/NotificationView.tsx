'use client';

import { useState, useEffect } from 'react';
import { useAlarms, useMarkAlarmAsRead, useMarkAllAlarmsAsRead, useDeleteAlarm, invalidateQueries, useAcceptBusinessCardRequest, useRejectBusinessCardRequest } from '../hooks/useApi';
import { Alarm, apiClient } from '../lib/api';

interface NotificationProps extends Alarm {
  time?: string;
  hasActions?: boolean;
  isClickable?: boolean;
}

export default function NotificationView() {
  const { data: alarmsResponse, loading, error, refetch, pollingStatus } = useAlarms(0, 50, { polling: true }); // 폴링 활성화
  const { markAsRead, loading: markingAsRead } = useMarkAlarmAsRead();
  const { markAllAsRead, loading: markingAllAsRead } = useMarkAllAlarmsAsRead();
  const { deleteAlarm, loading: deleting } = useDeleteAlarm();
  const { acceptRequest: acceptBusinessCard, loading: acceptingBusinessCard } = useAcceptBusinessCardRequest();
  const { rejectRequest: rejectBusinessCard, loading: rejectingBusinessCard } = useRejectBusinessCardRequest();

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  // 알람 데이터를 notification 형태로 변환
  useEffect(() => {
    if (alarmsResponse?.content) {
      console.log('받은 알림 데이터:', alarmsResponse.content);
      const convertedNotifications: NotificationProps[] = alarmsResponse.content.map(alarm => {
        // 요청 알림인지 확인 (요청을 받은 사람만 액션 버튼 필요)
        const isRequest = (alarm.relatedEntityType === 'BUSINESS_CARD_REQUEST' || alarm.alarmType === 'CONNECTION')
          && (alarm.content?.includes('등록하려고') || alarm.content?.includes('친구 요청') || alarm.content?.includes('연결 요청'));

        return {
          ...alarm,
          isRead: (alarm as any).read ?? alarm.isRead, // 백엔드의 'read' 필드를 'isRead'로 매핑
          time: formatTimeAgo(alarm.createdAt),
          hasActions: isRequest,
          isClickable: ['MESSAGE', 'MENTION', 'REPLY'].includes(alarm.alarmType)
        };
      });
      console.log('변환된 알림 데이터:', convertedNotifications);
      setNotifications(convertedNotifications);
    }
  }, [alarmsResponse]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}일 전`;
    }
  };

  const getNotificationType = (notification: NotificationProps): string => {
    // relatedEntityType을 우선 확인
    if (notification.relatedEntityType === 'BUSINESS_CARD_REQUEST') {
      return 'BUSINESS_CARD_REQUEST';
    }
    return notification.alarmType;
  };

  const getNotificationIcon = (notification: NotificationProps) => {
    const type = getNotificationType(notification);
    switch (type) {
      case 'CONNECTION':
        return 'ri-user-add-line';
      case 'BUSINESS_CARD_REQUEST':
        return 'ri-contacts-line';
      case 'MESSAGE':
        return 'ri-message-3-line';
      case 'MENTION':
        return 'ri-at-line';
      case 'SYSTEM':
        return 'ri-information-line';
      case 'REPLY':
        return 'ri-reply-line';
      case 'REMINDER':
        return 'ri-alarm-line';
      case 'NOTIFICATION':
        return 'ri-notification-3-line';
      default:
        return 'ri-notification-3-line';
    }
  };

  const getNotificationTypeLabel = (notification: NotificationProps) => {
    const type = getNotificationType(notification);
    switch (type) {
      case 'CONNECTION':
        return '연결 요청';
      case 'BUSINESS_CARD_REQUEST':
        return '명함 등록 요청';
      case 'MESSAGE':
        return '새 메시지';
      case 'MENTION':
        return '멘션';
      case 'SYSTEM':
        return '시스템 업데이트';
      case 'REPLY':
        return '답글';
      case 'REMINDER':
        return '리마인더';
      case 'NOTIFICATION':
        return '알림';
      default:
        return '알림';
    }
  };

  const handleAccept = async (notificationId: string) => {
    console.log('Accept 버튼 클릭:', notificationId);

    // 중복 클릭 방지
    if (processingRequests.has(notificationId)) {
      console.log('이미 처리 중인 요청입니다:', notificationId);
      return;
    }

    setProcessingRequests(prev => new Set(prev).add(notificationId));

    try {
      const notification = notifications.find(n => n.alarmId === notificationId);
      console.log('알림 데이터:', notification);
      console.log('알림 타입:', notification?.alarmType);
      console.log('relatedEntityId:', notification?.relatedEntityId);
      console.log('relatedEntityType:', notification?.relatedEntityType);

      // 먼저 알림을 읽음으로 표시
      const result = await markAsRead(notificationId);
      console.log('알림 읽음 처리 완료:', result);

      // relatedEntityType이 BUSINESS_CARD_REQUEST인 경우 명함 요청 수락 API 호출
      if (notification && notification.relatedEntityType === 'BUSINESS_CARD_REQUEST' && notification.relatedEntityId) {
        console.log('명함 요청 수락 API 호출:', notification.relatedEntityId);
        try {
          await acceptBusinessCard(notification.relatedEntityId);
          console.log('명함 요청 수락 성공');

          // 명함 및 연락처 목록 무효화
          invalidateQueries("contacts");
          invalidateQueries("business-cards");

        } catch (acceptError: any) {
          // "이미 처리됨" 에러는 성공으로 간주
          if (acceptError?.message?.includes('이미 처리된')) {
            console.log('이미 처리된 요청이지만 성공으로 간주합니다.');
            invalidateQueries("contacts");
            invalidateQueries("business-cards");
          } else {
            console.error('명함 요청 수락 실패:', acceptError);
            throw acceptError; // 다른 에러는 재발생
          }
        }
      }
      // CONNECTION 알림의 경우 친구 요청 수락 API 호출
      else if (notification && notification.alarmType === 'CONNECTION' && notification.relatedEntityId) {
        console.log('친구 요청 수락 API 호출:', notification.relatedEntityId);
        try {
          const acceptResult = await apiClient.acceptFriendRequest(notification.relatedEntityId);
          console.log('친구 요청 수락 성공:', acceptResult);

          // 명함 및 연락처 목록 무효화 (새로 생성된 데이터 반영을 위해)
          invalidateQueries("contacts");
          invalidateQueries("business-cards");

        } catch (acceptError: any) {
          // "이미 처리됨" 에러는 성공으로 간주
          if (acceptError?.message?.includes('이미 처리된')) {
            console.log('이미 처리된 요청이지만 성공으로 간주합니다.');
            invalidateQueries("contacts");
            invalidateQueries("business-cards");
          } else {
            console.error('친구 요청 수락 실패:', acceptError);
          }
        }
      }

      // 추가로 unread count 강제 업데이트
      invalidateQueries("unread-alarm-count");

      // 읽음 처리만 하고 삭제하지 않음
      setNotifications(prev =>
        prev.map(n =>
          n.alarmId === notificationId ? { ...n, isRead: true, hasActions: false } : n
        )
      );
    } catch (error) {
      console.error('Failed to accept notification:', error);
      console.error('Accept 에러 상세:', error);
    } finally {
      // 처리 완료 후 제거
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleDecline = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.alarmId === notificationId);

      // relatedEntityType이 BUSINESS_CARD_REQUEST인 경우 명함 요청 거절 API 호출
      if (notification && notification.relatedEntityType === 'BUSINESS_CARD_REQUEST' && notification.relatedEntityId) {
        console.log('명함 요청 거절 API 호출:', notification.relatedEntityId);
        try {
          await rejectBusinessCard(notification.relatedEntityId);
          console.log('명함 요청 거절 성공');

          // 명함 및 연락처 목록 무효화
          invalidateQueries("contacts");
          invalidateQueries("business-cards");

        } catch (rejectError) {
          console.error('명함 요청 거절 실패:', rejectError);
        }
      }

      // 알림 삭제
      await deleteAlarm(notificationId);
      invalidateQueries("unread-alarm-count");
      setNotifications(prev =>
        prev.filter(notification => notification.alarmId !== notificationId)
      );
    } catch (error) {
      console.error('Failed to decline notification:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    console.log('삭제 버튼 클릭:', notificationId);
    try {
      await deleteAlarm(notificationId);
      invalidateQueries("unread-alarm-count");
      setNotifications(prev =>
        prev.filter(n => n.alarmId !== notificationId)
      );
      console.log('알림 삭제 성공');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      console.error('삭제 에러 상세:', error);
    }
  };


  const handleNotificationClick = async (notification: NotificationProps) => {
    // 읽지 않은 알림이면 클릭 시 읽음 처리 (삭제하지 않음)
    if (!notification.isRead) {
      console.log('알림 읽음 처리 시작:', notification.alarmId);
      try {
        const result = await markAsRead(notification.alarmId);
        // 추가로 unread count 강제 업데이트
        invalidateQueries("unread-alarm-count");
        console.log('알림 읽음 처리 API 성공:', result);

        // 로컬 상태를 읽음으로 변경 (삭제하지 않음)
        setNotifications(prev =>
          prev.map(n =>
            n.alarmId === notification.alarmId ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        console.error('에러 상세:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // 추가로 unread count 강제 업데이트
      invalidateQueries("unread-alarm-count");
      // 모든 알림을 읽음 상태로 변경 (삭제하지 않음)
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };


  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600"></div>
          <span className="ml-2 text-slate-700 font-semibold">알림을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-300 shadow-lg">
            <i className="ri-error-warning-line w-8 h-8 text-red-600 flex items-center justify-center"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">알림을 불러올 수 없습니다</h3>
          <p className="text-slate-700 mb-4 font-medium">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border-2 border-slate-300 shadow-md">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-black text-slate-800">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-700 font-semibold">
            전체 알림 {notifications.length}개, 안 읽은 알림 {unreadCount}개
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              pollingStatus?.status === 'active' ? 'bg-green-500' :
              pollingStatus?.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-slate-600 font-medium">
              {pollingStatus?.status === 'active' ? '실시간 (10초)' :
               pollingStatus?.status === 'idle' ? '일반 (15초)' : '백그라운드 (60초)'}
            </span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-700 hover:text-cyan-700 underline font-semibold"
            >
              모두 읽음 처리
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.alarmId}
            onClick={() => handleNotificationClick(notification)}
            className={`group border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
              !notification.isRead ? 'bg-white border-blue-400 border-l-4 shadow-md' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <div className="flex items-start space-x-4 relative">
              {/* 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.alarmId);
                }}
                className="absolute top-0 right-0 w-6 h-6 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                title="알림 삭제"
              >
                <i className="ri-close-line text-xs text-gray-500 hover:text-red-600"></i>
              </button>

              {/* 아이콘 */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                getNotificationType(notification) === 'CONNECTION' ? 'bg-blue-50' :
                getNotificationType(notification) === 'BUSINESS_CARD_REQUEST' ? 'bg-teal-50' :
                getNotificationType(notification) === 'MESSAGE' ? 'bg-green-50' :
                getNotificationType(notification) === 'MENTION' ? 'bg-purple-50' :
                getNotificationType(notification) === 'SYSTEM' ? 'bg-orange-50' :
                getNotificationType(notification) === 'REPLY' ? 'bg-indigo-50' :
                getNotificationType(notification) === 'REMINDER' ? 'bg-yellow-50' : 'bg-gray-50'
              }`}>
                <i className={`${getNotificationIcon(notification)} w-5 h-5 flex items-center justify-center ${
                  getNotificationType(notification) === 'CONNECTION' ? 'text-blue-600' :
                  getNotificationType(notification) === 'BUSINESS_CARD_REQUEST' ? 'text-teal-600' :
                  getNotificationType(notification) === 'MESSAGE' ? 'text-green-600' :
                  getNotificationType(notification) === 'MENTION' ? 'text-purple-600' :
                  getNotificationType(notification) === 'SYSTEM' ? 'text-orange-600' :
                  getNotificationType(notification) === 'REPLY' ? 'text-indigo-600' :
                  getNotificationType(notification) === 'REMINDER' ? 'text-yellow-600' : 'text-gray-600'
                }`}></i>
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-sm font-medium ${
                    getNotificationType(notification) === 'CONNECTION' ? 'text-blue-600' :
                    getNotificationType(notification) === 'BUSINESS_CARD_REQUEST' ? 'text-teal-600' :
                    getNotificationType(notification) === 'MESSAGE' ? 'text-green-600' :
                    getNotificationType(notification) === 'MENTION' ? 'text-purple-600' :
                    getNotificationType(notification) === 'SYSTEM' ? 'text-orange-600' :
                    getNotificationType(notification) === 'REPLY' ? 'text-indigo-600' :
                    getNotificationType(notification) === 'REMINDER' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {getNotificationTypeLabel(notification)}
                  </span>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-[#34373b] rounded-full"></div>
                  )}
                  {notification.isRead && (
                    <span className="text-xs text-[#52616B] bg-gray-100 px-2 py-0.5 rounded-full">읽음</span>
                  )}
                </div>

                <h3 className={`font-bold mb-1 text-lg ${
                  notification.isRead ? 'text-slate-600' : 'text-slate-800'
                }`}>
                  {notification.title}
                </h3>

                <p className={`text-sm leading-relaxed mb-2 font-medium ${
                  notification.isRead ? 'text-slate-500' : 'text-slate-700'
                }`}>
                  {notification.content}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">
                    {notification.time}
                  </span>

                  {/* 액션 버튼들 */}
                  {notification.hasActions && (
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(notification.alarmId);
                        }}
                        disabled={processingRequests.has(notification.alarmId)}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
                      >
                        {processingRequests.has(notification.alarmId) ? '처리 중...' : 'Accept'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(notification.alarmId);
                        }}
                        disabled={processingRequests.has(notification.alarmId)}
                        className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-slate-400"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빈 상태 */}
      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-slate-400">
            <i className="ri-notification-off-line w-8 h-8 text-slate-600 flex items-center justify-center"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">알림이 없습니다</h3>
          <p className="text-slate-700 font-medium">새로운 알림이 도착하면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
