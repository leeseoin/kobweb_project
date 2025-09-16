package com.kob_backend_seoin.kob_backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatRoomType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "chat_room_participants",
        joinColumns = @JoinColumn(name = "chat_room_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();

    @Column(nullable = false)
    private long nextSequence = 1L; // 방 단위 순차 번호 발행기

    // 채팅방 타입 enum
    public enum ChatRoomType {
        ONE_TO_ONE,    // 1:1 채팅방
        GROUP          // 그룹 채팅방
    }

    // 기본 생성자
    public ChatRoom() {}

    public ChatRoom(String name, User creator) {
        this.name = name;
        this.creator = creator;
        this.createdAt = LocalDateTime.now();
        this.type = ChatRoomType.ONE_TO_ONE; // 기본값은 1:1
        this.participants.add(creator);
    }

    public ChatRoom(String name, User creator, ChatRoomType type) {
        this.name = name;
        this.creator = creator;
        this.createdAt = LocalDateTime.now();
        this.type = type;
        this.participants.add(creator);
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public User getCreator() {
        return creator;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<User> getParticipants() {
        return participants;
    }

    public long getNextSequence() {
        return nextSequence;
    }

    public ChatRoomType getType() {
        return type;
    }

    public void setType(ChatRoomType type) {
        this.type = type;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setParticipants(Set<User> participants) {
        this.participants = participants;
    }

    public void addParticipant(User user) {
        this.participants.add(user);
        // 참여자가 2명을 초과하면 그룹 채팅방으로 변경
        if (this.type == ChatRoomType.ONE_TO_ONE && this.participants.size() > 2) {
            this.type = ChatRoomType.GROUP;
        }
    }

    public void removeParticipant(User user) {
        this.participants.remove(user);
        // 참여자가 2명 이하가 되면 1:1 채팅방으로 변경
        if (this.participants.size() <= 2) {
            this.type = ChatRoomType.ONE_TO_ONE;
        }
    }

    // 그룹 채팅방으로 전환
    public void convertToGroupChat() {
        this.type = ChatRoomType.GROUP;
    }

    // 1:1 채팅방으로 전환
    public void convertToOneToOneChat() {
        this.type = ChatRoomType.ONE_TO_ONE;
    }

    public long issueSequence() {
        long current = this.nextSequence;
        this.nextSequence = this.nextSequence + 1;
        return current;
    }

    public void setNextSequence(long nextSequence) {
        this.nextSequence = nextSequence;
    }
} 