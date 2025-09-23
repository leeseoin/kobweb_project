import { useState, useEffect, useCallback } from 'react';
import { apiClient, BusinessCard, Profile, ChatMessage, Alarm, ApiResponse } from '../lib/api';
import { useSmartPolling } from './usePolling';

// Type aliases for backward compatibility
type Contact = BusinessCard & {
  company?: string;
  phone?: string;
};
type Resume = Profile;
type Message = ChatMessage;

// Global invalidation registry for cross-hook invalidation
const invalidationRegistry = new Map<string, Set<() => void>>();

export function registerInvalidation(key: string, invalidateFn: () => void) {
  if (!invalidationRegistry.has(key)) {
    invalidationRegistry.set(key, new Set());
  }
  invalidationRegistry.get(key)!.add(invalidateFn);
  
  // Return cleanup function
  return () => {
    const handlers = invalidationRegistry.get(key);
    if (handlers) {
      handlers.delete(invalidateFn);
      if (handlers.size === 0) {
        invalidationRegistry.delete(key);
      }
    }
  };
}

export function invalidateQueries(key: string) {
  const handlers = invalidationRegistry.get(key);
  if (handlers) {
    handlers.forEach(handler => handler());
  }
}

// Generic API Hook with Invalidation Support
export function useApi<T>(
  apiCall: (() => Promise<ApiResponse<T>>) | null,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!apiCall) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [...dependencies, refreshTrigger]);

  const invalidate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, invalidate };
}
// Resume Hooks

// Resume Hooks  
export function useResumes() {
  const result = useApi(() => apiClient.getResumes());
  
  useEffect(() => {
    const cleanup = registerInvalidation('resumes', result.invalidate);
    return cleanup;
  }, [result.invalidate]);
  
  return result;
}

export function useResume(id: string) {
  const result = useApi(() => apiClient.getProfile(id), [id]);
  
  useEffect(() => {
    const cleanup = registerInvalidation(`resume-${id}`, result.invalidate);
    return cleanup;
  }, [id, result.invalidate]);
  
  return result;
}

export function useCreateResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResume = async (resume: Omit<Resume, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateMyProfile(resume);
      
      // Invalidate resumes list after successful creation/update
      invalidateQueries('resumes');
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createResume, loading, error };
}
// Contact Hooks
// Enhanced Contact Hooks with Invalidation
export function useContacts() {
  const result = useApi(() => apiClient.getMyBusinessCards());
  
  useEffect(() => {
    const cleanup = registerInvalidation('contacts', result.invalidate);
    return cleanup;
  }, [result.invalidate]);
  
  return result;
}

export function useContact(id: string) {
  const result = useApi(() => apiClient.getBusinessCard(id), [id]);
  
  useEffect(() => {
    const cleanup = registerInvalidation(`contact-${id}`, result.invalidate);
    return cleanup;
  }, [id, result.invalidate]);
  
  return result;
}

export function useCreateContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContact = async (contact: Omit<Contact, 'businessCardId'>) => {
    try {
      setLoading(true);
      setError(null);
      const businessCardData = {
        name: contact.name,
        email: contact.email,
        company: contact.company || '',
        position: contact.position || contact.title || '',
        skills: contact.skills || []
      };
      const response = await apiClient.createBusinessCard(businessCardData);

      // Invalidate contacts list after successful creation
      invalidateQueries('contacts');

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createContact, loading, error };
}

export function useUpdateContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    try {
      setLoading(true);
      setError(null);
      const businessCardData = {
        ...(contact.name && { name: contact.name }),
        ...(contact.email && { email: contact.email }),
        ...(contact.company && { company: contact.company }),
        ...(contact.position && { position: contact.position }),
        ...(contact.title && { position: contact.title }),
        ...(contact.skills && { skills: contact.skills })
      };
      const response = await apiClient.updateBusinessCard(id, businessCardData);

      // Invalidate both contacts list and specific contact after successful update
      invalidateQueries('contacts');
      invalidateQueries(`contact-${id}`);

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateContact, loading, error };
}

export function useDeleteContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteContact = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteBusinessCard(id);
      
      // Invalidate contacts list after successful deletion
      invalidateQueries('contacts');
      invalidateQueries(`contact-${id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteContact, loading, error };
}


// Message Hooks
export function useMessages(roomId: string) {
  const shouldFetch = roomId && roomId.trim() !== '';
  const result = useApi(
    shouldFetch ? () => apiClient.getChatMessages(roomId) : null,
    [roomId, shouldFetch]
  );
  
  useEffect(() => {
    if (shouldFetch) {
      const cleanup = registerInvalidation(`messages-${roomId}`, result.invalidate);
      return cleanup;
    }
  }, [roomId, shouldFetch, result.invalidate]);
  
  return result;
}

export function useChatRooms() {
  const result = useApi(() => apiClient.getChatRooms());
  
  useEffect(() => {
    const cleanup = registerInvalidation('chat-rooms', result.invalidate);
    return cleanup;
  }, [result.invalidate]);
  
  return result;
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (roomId: string, message: { content: string }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 API 메시지 전송 시작:', { roomId, content: message.content });

      const response = await apiClient.sendMessage(roomId, message);

      console.log('📡 API 메시지 전송 성공:', response);

      // Invalidate messages for this room and chat rooms list after successful send
      invalidateQueries(`messages-${roomId}`);
      invalidateQueries('chat-rooms');

      return response.data;
    } catch (err) {
      console.error('📡 API 메시지 전송 실패:', {
        roomId,
        content: message.content,
        error: err
      });
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}

export function useCreateChatRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDirectChatRoom = async (participantId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏠 1:1 채팅방 생성 시작:', { participantId });

      const response = await apiClient.createDirectChatRoom(participantId);

      console.log('🏠 1:1 채팅방 생성 성공:', response);

      // Invalidate chat rooms list after successful creation
      invalidateQueries('chat-rooms');

      return response.data;
    } catch (err) {
      console.error('🏠 1:1 채팅방 생성 실패:', {
        participantId,
        error: err
      });
      setError(err instanceof Error ? err.message : 'Failed to create chat room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createGroupChatRoom = async (roomName: string, userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createGroupChatRoom(roomName, userIds);
      
      // Invalidate chat rooms list after successful creation
      invalidateQueries('chat-rooms');
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group chat room');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createChatRoomByBusinessCard = async (businessCardId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏠 명함 기반 채팅방 생성 시작:', { businessCardId });

      const response = await apiClient.createChatRoomByBusinessCard(businessCardId);

      console.log('🏠 명함 기반 채팅방 생성 성공:', response);

      // Invalidate chat rooms list after successful creation
      invalidateQueries('chat-rooms');

      return response.data;
    } catch (err) {
      console.error('🏠 명함 기반 채팅방 생성 실패:', {
        businessCardId,
        error: err
      });
      setError(err instanceof Error ? err.message : 'Failed to create chat room by business card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDirectChatRoom, createGroupChatRoom, createChatRoomByBusinessCard, loading, error };
}

// Alarm Hooks
export function useAlarms(page: number = 0, size: number = 10, options?: { polling?: boolean }) {
  const result = useApi(() => apiClient.getAlarms(page, size), [page, size]);

  useEffect(() => {
    const cleanup = registerInvalidation(`alarms-${page}-${size}`, result.invalidate);
    return cleanup;
  }, [page, size, result.invalidate]);

  // 스마트 폴링 적용 (옵션이 활성화된 경우)
  const pollingStatus = useSmartPolling(
    () => {
      console.log('🔄 알림 목록 자동 갱신');
      result.refetch();
    },
    options?.polling ?? false
  );

  return {
    ...result,
    pollingStatus
  };
}

export function useUnreadAlarms() {
  const result = useApi(() => apiClient.getUnreadAlarms());
  
  useEffect(() => {
    const cleanup = registerInvalidation('unread-alarms', result.invalidate);
    return cleanup;
  }, [result.invalidate]);
  
  return result;
}

export function useUnreadAlarmCount(options?: { polling?: boolean }) {
  const result = useApi(() => apiClient.getUnreadAlarmCount());

  useEffect(() => {
    const cleanup = registerInvalidation('unread-alarm-count', result.invalidate);
    console.log("📝 Registering invalidation for unread-alarm-count");
    return cleanup;
  }, [result.invalidate]);

  // 스마트 폴링 적용 (옵션이 활성화된 경우)
  const pollingStatus = useSmartPolling(
    () => {
      console.log('🔄 미읽음 알림 개수 자동 갱신');
      result.refetch();
    },
    options?.polling ?? false
  );

  return {
    ...result,
    pollingStatus
  };
}

export function useCreateAlarm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAlarm = async (alarm: {
    title: string;
    content: string;
    alarmTime: string;
    alarmType: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createAlarm(alarm);
      
      // Invalidate relevant alarm queries after successful creation
      invalidateQueries('alarms-0-10'); // Default page
      invalidateQueries('unread-alarms');
      invalidateQueries('unread-alarm-count');
      console.log("🔄 Invalidating unread-alarm-count");
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alarm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createAlarm, loading, error };
}

export function useMarkAlarmAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = async (alarmId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.markAlarmAsRead(alarmId);
      
      // Invalidate relevant alarm queries after marking as read
      invalidateQueries('alarms-0-10'); // Default page  
      invalidateQueries('unread-alarms');
      invalidateQueries('unread-alarm-count');
      console.log("🔄 Invalidating unread-alarm-count");
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark alarm as read');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markAsRead, loading, error };
}

export function useMarkAllAlarmsAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.markAllAlarmsAsRead();
      
      // Invalidate all alarm queries after marking all as read
      invalidateQueries('alarms-0-10'); // Default page
      invalidateQueries('unread-alarms');
      invalidateQueries('unread-alarm-count');
      console.log("🔄 Invalidating unread-alarm-count");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all alarms as read');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markAllAsRead, loading, error };
}

export function useDeleteAlarm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAlarm = async (alarmId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteAlarm(alarmId);
      
      // Invalidate relevant alarm queries after successful deletion
      invalidateQueries('alarms-0-10'); // Default page
      invalidateQueries('unread-alarms');
      invalidateQueries('unread-alarm-count');
      console.log("🔄 Invalidating unread-alarm-count");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alarm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAlarm, loading, error };
}
