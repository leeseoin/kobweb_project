package com.kob_backend_seoin.kob_backend.dto.Network;

public class NetworkConnectionDto {
    private String fromUserId;
    private String toUserId;
    private String relationshipType;

    public NetworkConnectionDto() {}

    public NetworkConnectionDto(String fromUserId, String toUserId, String relationshipType) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.relationshipType = relationshipType;
    }

    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }

    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }

    public String getRelationshipType() { return relationshipType; }
    public void setRelationshipType(String relationshipType) { this.relationshipType = relationshipType; }
}