package com.kob_backend_seoin.kob_backend.dto.Chat;

import java.util.List;
import java.util.UUID;

public class InviteUserRequestDto {
    private List<UUID> userIds;

    // 기본 생성자
    public InviteUserRequestDto() {}

    public InviteUserRequestDto(List<UUID> userIds) {
        this.userIds = userIds;
    }

    public List<UUID> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<UUID> userIds) {
        this.userIds = userIds;
    }
}
