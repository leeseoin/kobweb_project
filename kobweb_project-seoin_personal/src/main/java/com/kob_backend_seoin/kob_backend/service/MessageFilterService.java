package com.kob_backend_seoin.kob_backend.service;

import com.kob_backend_seoin.kob_backend.exception.CustomException;
import com.kob_backend_seoin.kob_backend.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.logging.Logger;

@Service
public class MessageFilterService {

    private static final Logger log = Logger.getLogger(MessageFilterService.class.getName());

    // 설정값들
    private static final int MAX_MESSAGE_LENGTH = 1000;
    private static final int MAX_LINE_COUNT = 20;
    private static final int MAX_CONSECUTIVE_SAME_CHARS = 10;

    // 금지어 목록 (실제 운영에서는 DB나 외부 설정에서 관리)
    private static final List<String> PROHIBITED_WORDS = Arrays.asList(
            "스팸", "광고", "도박", "불법"
            // 실제 환경에서는 더 많은 금지어 추가
    );

    // 정규식 패턴들
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "\\b\\d{2,3}-\\d{3,4}-\\d{4}\\b|\\b\\d{10,11}\\b"
    );

    private static final Pattern URL_PATTERN = Pattern.compile(
            "https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?"
    );

    private static final Pattern REPEATED_CHARS_PATTERN = Pattern.compile(
            "([a-zA-Z가-힣])\\1{" + (MAX_CONSECUTIVE_SAME_CHARS - 1) + ",}"
    );

    /**
     * 메시지 유효성 검증 및 필터링
     */
    public String validateAndFilter(String content) {
        if (content == null) {
            throw new CustomException("메시지 내용이 null입니다", ErrorCode.INVALID_INPUT);
        }

        // 1. 기본 길이 검증
        if (content.trim().isEmpty()) {
            throw new CustomException("메시지 내용이 비어있습니다", ErrorCode.INVALID_INPUT);
        }

        if (content.length() > MAX_MESSAGE_LENGTH) {
            throw new CustomException("메시지가 너무 깁니다 (최대 " + MAX_MESSAGE_LENGTH + "자)", ErrorCode.INVALID_INPUT);
        }

        // 2. 줄 수 제한
        long lineCount = content.lines().count();
        if (lineCount > MAX_LINE_COUNT) {
            throw new CustomException("메시지 줄 수가 너무 많습니다 (최대 " + MAX_LINE_COUNT + "줄)", ErrorCode.INVALID_INPUT);
        }

        // 3. 연속된 같은 문자 검증
        if (REPEATED_CHARS_PATTERN.matcher(content).find()) {
            throw new CustomException("같은 문자를 " + MAX_CONSECUTIVE_SAME_CHARS + "번 이상 연속으로 사용할 수 없습니다", ErrorCode.INVALID_INPUT);
        }

        // 4. 금지어 검사
        checkProhibitedWords(content);

        // 5. 개인정보 패턴 검사 및 마스킹
        String filteredContent = maskSensitiveInfo(content);

        // 6. HTML/스크립트 태그 제거
        filteredContent = sanitizeHtml(filteredContent);

        log.info("메시지 필터링 완료: 원본 길이 " + content.length() + ", 필터링 후 길이 " + filteredContent.length());

        return filteredContent;
    }

    /**
     * 금지어 검사
     */
    private void checkProhibitedWords(String content) {
        String lowerContent = content.toLowerCase();

        for (String prohibitedWord : PROHIBITED_WORDS) {
            if (lowerContent.contains(prohibitedWord.toLowerCase())) {
                log.warning("금지어 감지: " + prohibitedWord);
                throw new CustomException("부적절한 내용이 포함되어 있습니다", ErrorCode.INVALID_INPUT);
            }
        }
    }

    /**
     * 개인정보 마스킹
     */
    private String maskSensitiveInfo(String content) {
        String result = content;

        // 이메일 마스킹
        result = EMAIL_PATTERN.matcher(result).replaceAll("[이메일 주소]");

        // 전화번호 마스킹
        result = PHONE_PATTERN.matcher(result).replaceAll("[전화번호]");

        // URL 마스킹 (선택적)
        if (shouldMaskUrls(content)) {
            result = URL_PATTERN.matcher(result).replaceAll("[링크]");
        }

        return result;
    }

    /**
     * URL 마스킹 여부 결정
     */
    private boolean shouldMaskUrls(String content) {
        // 신뢰할 수 있는 도메인은 허용
        List<String> trustedDomains = Arrays.asList(
                "youtube.com", "github.com", "stackoverflow.com"
        );

        for (String domain : trustedDomains) {
            if (content.contains(domain)) {
                return false;
            }
        }

        return true; // 기본적으로 URL 마스킹
    }

    /**
     * HTML 태그 및 스크립트 제거
     */
    private String sanitizeHtml(String content) {
        if (content == null) {
            return null;
        }

        // 기본적인 HTML 태그 제거
        String result = content.replaceAll("<[^>]*>", "");

        // 스크립트 관련 문자열 제거
        result = result.replaceAll("(?i)javascript:", "");
        result = result.replaceAll("(?i)vbscript:", "");
        result = result.replaceAll("(?i)onload", "");
        result = result.replaceAll("(?i)onerror", "");

        return result.trim();
    }

    /**
     * 메시지가 스팸인지 간단한 휴리스틱으로 판단
     */
    public boolean isSpamMessage(String content, String previousMessage) {
        if (content == null || previousMessage == null) {
            return false;
        }

        // 이전 메시지와 완전히 동일한 경우
        if (content.equals(previousMessage)) {
            return true;
        }

        // 유사도가 매우 높은 경우 (90% 이상)
        double similarity = calculateSimilarity(content, previousMessage);
        if (similarity > 0.9) {
            log.warning("스팸 의심 메시지 감지 (유사도: " + String.format("%.2f", similarity * 100) + "%)");
            return true;
        }

        return false;
    }

    /**
     * 두 문자열 간의 유사도 계산 (간단한 Levenshtein 거리 기반)
     */
    private double calculateSimilarity(String str1, String str2) {
        int maxLength = Math.max(str1.length(), str2.length());
        if (maxLength == 0) {
            return 1.0;
        }

        int distance = levenshteinDistance(str1, str2);
        return 1.0 - (double) distance / maxLength;
    }

    /**
     * Levenshtein 거리 계산
     */
    private int levenshteinDistance(String str1, String str2) {
        int[][] dp = new int[str1.length() + 1][str2.length() + 1];

        for (int i = 0; i <= str1.length(); i++) {
            dp[i][0] = i;
        }

        for (int j = 0; j <= str2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= str1.length(); i++) {
            for (int j = 1; j <= str2.length(); j++) {
                if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]) + 1;
                }
            }
        }

        return dp[str1.length()][str2.length()];
    }

    /**
     * 관리자용: 금지어 추가
     */
    public void addProhibitedWord(String word) {
        if (word != null && !word.trim().isEmpty()) {
            PROHIBITED_WORDS.add(word.toLowerCase().trim());
            log.info("금지어 추가: " + word);
        }
    }

    /**
     * 필터링 통계 조회
     */
    public FilterStats getFilterStats() {
        return new FilterStats(
                MAX_MESSAGE_LENGTH,
                MAX_LINE_COUNT,
                MAX_CONSECUTIVE_SAME_CHARS,
                PROHIBITED_WORDS.size()
        );
    }

    /**
     * 필터링 통계 DTO
     */
    public static class FilterStats {
        private final int maxMessageLength;
        private final int maxLineCount;
        private final int maxConsecutiveChars;
        private final int prohibitedWordsCount;

        public FilterStats(int maxMessageLength, int maxLineCount, int maxConsecutiveChars, int prohibitedWordsCount) {
            this.maxMessageLength = maxMessageLength;
            this.maxLineCount = maxLineCount;
            this.maxConsecutiveChars = maxConsecutiveChars;
            this.prohibitedWordsCount = prohibitedWordsCount;
        }

        public int getMaxMessageLength() { return maxMessageLength; }
        public int getMaxLineCount() { return maxLineCount; }
        public int getMaxConsecutiveChars() { return maxConsecutiveChars; }
        public int getProhibitedWordsCount() { return prohibitedWordsCount; }
    }
}