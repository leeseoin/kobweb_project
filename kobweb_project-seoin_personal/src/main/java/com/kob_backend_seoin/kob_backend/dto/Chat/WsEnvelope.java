package com.kob_backend_seoin.kob_backend.dto.Chat;

import java.util.UUID;

public class WsEnvelope<T> {
    private int v = 1;
    private String type;
    private String messageId;
    private long ts;
    private T payload;

    public WsEnvelope() {}

    public WsEnvelope(String type, String messageId, long ts, T payload) {
        this.type = type;
        this.messageId = messageId;
        this.ts = ts;
        this.payload = payload;
    }

    public static String newMessageId() {
        return UUID.randomUUID().toString();
    }

    public int getV() {
        return v;
    }

    public String getType() {
        return type;
    }

    public String getMessageId() {
        return messageId;
    }

    public long getTs() {
        return ts;
    }

    public T getPayload() {
        return payload;
    }

    public void setV(int v) {
        this.v = v;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public void setTs(long ts) {
        this.ts = ts;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }

    // Receipt payload
    public static class ReceiptPayload {
        private String clientMessageId;
        private String status; // ok | duplicate | error
        private String savedMessageId; // server-side message UUID

        public ReceiptPayload() {}

        public ReceiptPayload(String clientMessageId, String status, String savedMessageId) {
            this.clientMessageId = clientMessageId;
            this.status = status;
            this.savedMessageId = savedMessageId;
        }

        public String getClientMessageId() {
            return clientMessageId;
        }

        public String getStatus() {
            return status;
        }

        public String getSavedMessageId() {
            return savedMessageId;
        }

        public void setClientMessageId(String clientMessageId) {
            this.clientMessageId = clientMessageId;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setSavedMessageId(String savedMessageId) {
            this.savedMessageId = savedMessageId;
        }
    }

    // Error payload
    public static class ErrorPayload {
        private String code;
        private String reason;

        public ErrorPayload() {}

        public ErrorPayload(String code, String reason) {
            this.code = code;
            this.reason = reason;
        }

        public String getCode() {
            return code;
        }

        public String getReason() {
            return reason;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}


