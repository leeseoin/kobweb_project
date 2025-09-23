package com.kob_backend_seoin.kob_backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kob_backend_seoin.kob_backend.domain.ChatRoom;
import com.kob_backend_seoin.kob_backend.domain.User;
import com.kob_backend_seoin.kob_backend.repository.ChatRoomRepository;
import com.kob_backend_seoin.kob_backend.repository.UserRepository;
import com.kob_backend_seoin.kob_backend.dto.Chat.WebSocketMessageDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;
import org.springframework.web.socket.sockjs.client.Transport;

import java.lang.reflect.Type;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebSocketChatControllerTest {

    @LocalServerPort
    private int port;

    private BlockingQueue<WebSocketMessageDto.ChatMessageResponse> messages;
    private BlockingQueue<String> authResponses;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        messages = new LinkedBlockingDeque<>();
        authResponses = new LinkedBlockingDeque<>();
    }

    @DisplayName("웹소켓 연결 후 메시지 전송 테스트")
    @Test
    void testWebSocketMessageSending() throws InterruptedException, ExecutionException, TimeoutException {
        // 테스트용 사용자와 채팅방 생성
        User testUser = createTestUser();
        ChatRoom testRoom = createTestChatRoom(testUser);
        
        // WebSocket STOMP 클라이언트 설정
        WebSocketStompClient stompClient = createWebSocketStompClient();
        
        // 연결
        StompSession session = connectToWebSocket(stompClient);
        
        // 인증 메시지 전송
        sendAuthMessage(session, testUser.getId());
        
        // 채팅방 구독
        subscribeToChatRoom(session, testRoom.getId());
        
        // 메시지 전송
        WebSocketMessageDto.SendMessageRequest messageRequest = new WebSocketMessageDto.SendMessageRequest();
        messageRequest.setRoomId(testRoom.getId());
        messageRequest.setContent("테스트 메시지입니다.");
        messageRequest.setClientMessageId("test-msg-" + System.currentTimeMillis());
        
        session.send("/app/sendMessage", messageRequest);
        
        // 메시지 수신 대기 (5초)
        WebSocketMessageDto.ChatMessageResponse receivedMessage = messages.poll(5, TimeUnit.SECONDS);
        
        // 검증
        assertThat(receivedMessage).isNotNull();
        assertThat(receivedMessage.getContent()).isEqualTo("테스트 메시지입니다.");
        assertThat(receivedMessage.getSenderId()).isEqualTo(testUser.getId());
    }

    @DisplayName("인증 없이 메시지 전송 시도 테스트")
    @Test
    void testMessageSendingWithoutAuth() throws InterruptedException, ExecutionException, TimeoutException {
        // 테스트용 사용자와 채팅방 생성
        User testUser = createTestUser();
        ChatRoom testRoom = createTestChatRoom(testUser);
        
        // WebSocket STOMP 클라이언트 설정
        WebSocketStompClient stompClient = createWebSocketStompClient();
        
        // 연결 (인증 없이)
        StompSession session = connectToWebSocket(stompClient);
        
        // 채팅방 구독
        subscribeToChatRoom(session, testRoom.getId());
        
        // 메시지 전송 시도
        WebSocketMessageDto.SendMessageRequest messageRequest = new WebSocketMessageDto.SendMessageRequest();
        messageRequest.setRoomId(testRoom.getId());
        messageRequest.setContent("인증 없는 메시지");
        messageRequest.setClientMessageId("unauth-msg-" + System.currentTimeMillis());
        
        session.send("/app/sendMessage", messageRequest);
        
        // 메시지 수신 대기 (3초)
        WebSocketMessageDto.ChatMessageResponse receivedMessage = messages.poll(3, TimeUnit.SECONDS);
        
        // 인증 없이는 메시지가 전송되지 않아야 함
        assertThat(receivedMessage).isNull();
    }

    private WebSocketStompClient createWebSocketStompClient() {
        StandardWebSocketClient standardWebSocketClient = new StandardWebSocketClient();
        WebSocketTransport webSocketTransport = new WebSocketTransport(standardWebSocketClient);
        List<Transport> transports = Collections.singletonList(webSocketTransport);
        SockJsClient sockJsClient = new SockJsClient(transports);
        
        WebSocketStompClient stompClient = new WebSocketStompClient(sockJsClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        
        return stompClient;
    }

    private StompSession connectToWebSocket(WebSocketStompClient stompClient) throws InterruptedException, ExecutionException, TimeoutException {
        return stompClient.connect("ws://localhost:" + port + "/ws/chat", new StompSessionHandlerAdapter() {})
                .get(10, TimeUnit.SECONDS);
    }

    private void sendAuthMessage(StompSession session, UUID userId) {
        // 인증 메시지 전송
        WebSocketMessageDto.AuthRequest authRequest = new WebSocketMessageDto.AuthRequest();
        authRequest.setUserId(userId.toString());
        authRequest.setToken("test-token-" + userId);
        
        session.send("/app/auth", authRequest);
        
        // 인증 응답 구독
        session.subscribe("/user/" + userId + "/queue/auth", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }
            
            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                authResponses.offer((String) payload);
            }
        });
    }

    private void subscribeToChatRoom(StompSession session, UUID roomId) {
        // 채팅방 메시지 구독
        session.subscribe("/topic/chat/" + roomId, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return WebSocketMessageDto.ChatMessageResponse.class;
            }
            
            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messages.offer((WebSocketMessageDto.ChatMessageResponse) payload);
            }
        });
    }

    private User createTestUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@test.com");
        user.setNickname("테스트사용자");
        user.setPassword("password");
        return userRepository.save(user);
    }

    private ChatRoom createTestChatRoom(User creator) {
        ChatRoom room = new ChatRoom();
        room.setId(UUID.randomUUID());
        room.setName("테스트 채팅방");
        room.setCreator(creator);
        room.setNextSequence(1L);
        return chatRoomRepository.save(room);
    }
}
