// API Configuration
// 개발 환경에서는 Next.js 프록시를 사용, 운영 환경에서는 직접 호출
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/api' // 개발 환경에서 직접 백엔드 호출
  : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const AI_API_BASE_URL = 'http://localhost:4000'; // AI 서버
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserSignupRequest {
  email: string;
  password: string;
  nickname: string;
}

// Business Card Types (정확히 백엔드 DTO와 일치)
export interface BusinessCard {
  businessCardId: string;
  name: string;
  email: string;
  company: string;
  position: string;
  skills: string[];
  createdAt?: string;
  updatedAt?: string;

  // 프론트엔드에서 추가로 필요한 필드들 (백엔드와 연결하지 않음)
  id?: string; // businessCardId의 별칭
  title?: string; // position의 별칭
  avatar?: string; // 프로필 이미지
  phone?: string;
  location?: string;
  github?: string;
  notion?: string;
  linkedin?: string;
  website?: string;
  interests?: string[];
  connectionType?: string;
  connectionMethod?: string;
  relationshipNote?: string;
  status?: string;
}

export interface BusinessCardRequest {
  name: string;
  email: string;
  company: string;
  position: string;
  skills: string[];
}

// Profile Types
export interface Profile {
  id: string;
  userId: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

// Network Types
export interface NetworkNodeDto {
  userId: string;
  name: string;
  email: string;
  company: string;
  position: string;
  skills: string[];
  connectionLevel: number;
}

export interface NetworkConnectionDto {
  fromUserId: string;
  toUserId: string;
  relationshipType: string;
}

export interface NetworkStatsDto {
  totalConnections: number;
  directFriends: number;
  mutualConnections: number;
}

export interface NetworkResponseDto {
  nodes: NetworkNodeDto[];
  connections: NetworkConnectionDto[];
  stats: NetworkStatsDto;
}

// Chat Types
export interface ChatRoom {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP';
  participants: User[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    nickname: string;
  };
  roomId: string;
  sentAt: string;
}

export interface ChatMessageRequest {
  content: string;
}

// Alarm Types
export interface Alarm {
  alarmId: string;
  title: string;
  content: string;
  alarmTime: string;
  isRead: boolean;
  alarmType: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlarmRequest {
  title: string;
  content: string;
  alarmTime: string;
  alarmType: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // HTTP 상태 코드를 사용자 친화적인 메시지로 변환
  private getUserFriendlyErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return '입력하신 정보가 올바르지 않습니다.';
      case 401:
        return '인증이 필요하거나 로그인 정보가 올바르지 않습니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청하신 정보를 찾을 수 없습니다.';
      case 409:
        return '이미 존재하는 정보입니다.';
      case 422:
        return '입력하신 데이터에 문제가 있습니다.';
      case 429:
        return '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 502:
      case 503:
      case 504:
        return '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }

  // JWT 토큰 관리
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const token = this.getToken();
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('API request failed:', {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        // HTTP 오류 상태에서도 JSON 응답을 파싱해서 에러 메시지 추출
        try {
          const responseText = await response.text();
          console.error('Error response text:', responseText);

          if (responseText) {
            const errorData = JSON.parse(responseText);
            console.error('Error response data:', errorData);
            if (errorData.message) {
              const customError = new Error(errorData.message);
              (customError as any).response = { data: errorData };
              throw customError;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // JSON 파싱에 실패하거나 빈 응답이면 사용자 친화적인 HTTP 오류 메시지 사용
        }
        throw new Error(this.getUserFriendlyErrorMessage(response.status));
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API request failed:', error);

      // 네트워크 오류나 타임아웃 등의 경우 사용자 친화적 메시지로 변환
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        throw new Error('인터넷 연결을 확인해주세요.');
      }

      throw error;
    }
  }

  // User APIs
  async signup(userData: UserSignupRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/v1/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: UserLoginRequest): Promise<ApiResponse<UserLoginResponse>> {
    const response = await this.request<UserLoginResponse>('/v1/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // 로그인 성공 시 토큰 저장
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response;
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      this.removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
    }
  }

  // 현재 로그인 상태 확인
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // OAuth2 로그인 URL 생성
  getGoogleLoginUrl(): string {
    return `${this.baseURL.replace('/api', '')}/oauth2/authorization/google`;
  }

  getGithubLoginUrl(): string {
    return `${this.baseURL.replace('/api', '')}/oauth2/authorization/github`;
  }

  // 토큰 저장 (OAuth 콜백에서 사용)
  saveOAuthTokens(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken && typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/v1/users');
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/v1/users/${userId}`);
  }

  // Business Card APIs
  async getMyBusinessCards(query?: string, company?: string): Promise<ApiResponse<BusinessCard[]>> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (company) params.append('company', company);
    const queryString = params.toString();
    return this.request<BusinessCard[]>(`/v1/business-cards${queryString ? `?${queryString}` : ''}`);
  }

  async getBusinessCard(businessCardId: string): Promise<ApiResponse<BusinessCard>> {
    return this.request<BusinessCard>(`/v1/business-cards/${businessCardId}`);
  }

  async createBusinessCard(businessCard: BusinessCardRequest): Promise<ApiResponse<BusinessCard>> {
    return this.request<BusinessCard>('/v1/business-cards', {
      method: 'POST',
      body: JSON.stringify(businessCard),
    });
  }

  async updateBusinessCard(businessCardId: string, businessCard: Partial<BusinessCardRequest>): Promise<ApiResponse<BusinessCard>> {
    return this.request<BusinessCard>(`/v1/business-cards/${businessCardId}`, {
      method: 'PUT',
      body: JSON.stringify(businessCard),
    });
  }

  async createShareableUrl(businessCardId: string): Promise<ApiResponse<{shareableUrl: string; expiresAt?: string}>> {
    return this.request<{shareableUrl: string; expiresAt?: string}>(`/v1/business-cards/${businessCardId}/share`, {
      method: 'POST',
    });
  }

  async deleteBusinessCard(businessCardId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/business-cards/${businessCardId}`, {
      method: 'DELETE',
    });
  }

  async acceptBusinessCardRequest(businessCardId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/business-cards/${businessCardId}/accept`, {
      method: 'POST',
    });
  }

  async rejectBusinessCardRequest(businessCardId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/business-cards/${businessCardId}/reject`, {
      method: 'POST',
    });
  }

  // Profile APIs
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    return this.request<Profile>(`/v1/profiles/${userId}`);
  }

  async updateMyProfile(profile: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return this.request<Profile>('/v1/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getResumes(): Promise<ApiResponse<Profile[]>> {
    return this.request<Profile[]>('/v1/resumes');
  }

  // Chat APIs
  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    return this.request<ChatRoom[]>('/chat/rooms');
  }

  async getChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return this.request<ChatRoom>(`/chat/rooms/${roomId}`);
  }

  async getChatMessages(roomId: string, lastMessageId?: string, size: number = 30): Promise<ApiResponse<ChatMessage[]>> {
    const params = new URLSearchParams();
    params.append('size', size.toString());
    if (lastMessageId) params.append('lastMessageId', lastMessageId);
    return this.request<ChatMessage[]>(`/chat/rooms/${roomId}/messages?${params.toString()}`);
  }

  async sendMessage(roomId: string, message: ChatMessageRequest): Promise<ApiResponse<ChatMessage>> {
    console.log('🔗 API Client sendMessage 호출:', {
      roomId,
      message,
      endpoint: `/chat/rooms/${roomId}/messages`,
      baseURL: this.baseURL
    });

    const response = await this.request<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });

    console.log('🔗 API Client sendMessage 응답:', response);
    return response;
  }

  async createDirectChatRoom(participantId: string): Promise<ApiResponse<ChatRoom>> {
    console.log('🔗 API Client createDirectChatRoom 호출:', {
      participantId,
      endpoint: `/chat/rooms?participantId=${participantId}`,
      baseURL: this.baseURL
    });

    const response = await this.request<ChatRoom>(`/chat/rooms?participantId=${participantId}`, {
      method: 'POST',
    });

    console.log('🔗 API Client createDirectChatRoom 응답:', response);
    return response;
  }

  async createChatRoomByBusinessCard(businessCardId: string): Promise<ApiResponse<ChatRoom>> {
    console.log('🔗 API Client createChatRoomByBusinessCard 호출:', {
      businessCardId,
      endpoint: `/chat/rooms/business-card?businessCardId=${businessCardId}`,
      baseURL: this.baseURL
    });

    const response = await this.request<ChatRoom>(`/chat/rooms/business-card?businessCardId=${businessCardId}`, {
      method: 'POST',
    });

    console.log('🔗 API Client createChatRoomByBusinessCard 응답:', response);
    return response;
  }

  async createGroupChatRoom(roomName: string, userIds: string[]): Promise<ApiResponse<ChatRoom>> {
    return this.request<ChatRoom>(`/chat/rooms/group?roomName=${encodeURIComponent(roomName)}`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  // Alarm APIs
  async getAlarms(page: number = 0, size: number = 10): Promise<ApiResponse<{
    content: Alarm[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>> {
    return this.request(`/alarms?page=${page}&size=${size}`);
  }

  async getUnreadAlarms(): Promise<ApiResponse<Alarm[]>> {
    return this.request<Alarm[]>('/alarms/unread');
  }

  async getUnreadAlarmCount(): Promise<ApiResponse<number>> {
    return this.request<number>('/alarms/unread/count');
  }

  async getAlarm(alarmId: string): Promise<ApiResponse<Alarm>> {
    return this.request<Alarm>(`/alarms/${alarmId}`);
  }

  async createAlarm(alarmData: AlarmRequest): Promise<ApiResponse<Alarm>> {
    return this.request<Alarm>('/alarms', {
      method: 'POST',
      body: JSON.stringify(alarmData),
    });
  }

  async markAlarmAsRead(alarmId: string): Promise<ApiResponse<Alarm>> {
    return this.request<Alarm>(`/alarms/${alarmId}/read`, {
      method: 'PUT',
    });
  }

  async markAllAlarmsAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>('/alarms/read-all', {
      method: 'PUT',
    });
  }

  async deleteAlarm(alarmId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/alarms/${alarmId}`, {
      method: 'DELETE',
    });
  }

  async getAlarmsByType(alarmType: string, page: number = 0, size: number = 10): Promise<ApiResponse<{
    content: Alarm[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>> {
    return this.request(`/alarms/type/${alarmType}?page=${page}&size=${size}`);
  }

  async searchAlarmsByTitle(keyword: string, page: number = 0, size: number = 10): Promise<ApiResponse<{
    content: Alarm[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>> {
    return this.request(`/alarms/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  // Health Check API
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }

  // API 연결 상태 확인
  async checkConnection(): Promise<{
    isConnected: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { isConnected: true, latency };
      } else {
        return {
          isConnected: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // OAuth 상태 확인
  async getOAuthStatus(): Promise<ApiResponse<{
    providers: string[];
    message: string;
  }>> {
    return this.request<{
      providers: string[];
      message: string;
    }>('/auth/oauth/status');
  }

  // Friend Request APIs
  async acceptFriendRequest(requestId: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/friend-requests/${requestId}/accept`, {
      method: 'POST'
    });
  }

  async rejectFriendRequest(requestId: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/friend-requests/${requestId}/reject`, {
      method: 'POST'
    });
  }

  async cancelFriendRequest(requestId: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/friend-requests/${requestId}/cancel`, {
      method: 'POST'
    });
  }

  async getReceivedFriendRequests(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/friend-requests/received');
  }

  async getSentFriendRequests(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/friend-requests/sent');
  }

  // Network APIs
  async getNetwork(): Promise<ApiResponse<NetworkResponseDto>> {
    return this.request<NetworkResponseDto>('/v1/network');
  }

  async getRecommendedConnections(): Promise<ApiResponse<NetworkNodeDto[]>> {
    return this.request<NetworkNodeDto[]>('/v1/network/recommendations');
  }

  async addFriend(friendUserId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/network/friends/${friendUserId}`, {
      method: 'POST'
    });
  }

  async removeFriend(friendUserId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/network/friends/${friendUserId}`, {
      method: 'DELETE'
    });
  }

  // AI Chat API (4000번 포트)
  async sendAIMessage(message: string): Promise<{ response: string }> {
    try {
      console.log('AI 서버 요청:', {
        url: `${AI_API_BASE_URL}/search`,
        query: message
      });

      const response = await fetch(`${AI_API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message }),
      });

      console.log('AI 서버 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI 서버 에러 응답:', errorText);
        throw new Error(`AI 서버 응답 오류 (${response.status}): ${errorText}`);
      }

      // 응답은 JSON 객체 { answer: "..." } 형태
      const data = await response.json();
      console.log('AI 서버 응답 데이터:', data);

      // { answer: "..." }를 { response: "..." }로 변환
      return { response: data.answer };
    } catch (err) {
      console.error('AI 서버 요청 실패:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);
