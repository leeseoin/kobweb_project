'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// useInterval 훅: React에서 setInterval을 안전하게 사용
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // callback을 기억
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // interval 설정
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// 사용자 활동 감지 훅
export function useUserActivity() {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const updateActivity = () => {
      setLastActivity(Date.now());
      setIsActive(true);

      // 2분 후 비활성으로 처리
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsActive(false);
      }, 2 * 60 * 1000); // 2분
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 초기 타이머 설정
    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearTimeout(timeout);
    };
  }, []);

  return { isActive, lastActivity };
}

// 페이지 가시성 감지 훅
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true); // 기본값을 true로 설정

  useEffect(() => {
    // 클라이언트 사이드에서만 document 접근
    if (typeof window === 'undefined') return;

    // 초기 상태 설정
    setIsVisible(!document.hidden);

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// 스마트 폴링 훅: 사용자 활동과 페이지 가시성에 따라 폴링 간격 조절
export function useSmartPolling(callback: () => void, enabled: boolean = true) {
  const { isActive } = useUserActivity();
  const isVisible = usePageVisibility();

  // 폴링 간격 결정
  const getPollingInterval = useCallback(() => {
    if (!isVisible) {
      // 페이지가 백그라운드에 있으면 1분 간격
      return 60 * 1000;
    }

    if (isActive) {
      // 사용자가 활성 상태면 10초 간격
      return 10 * 1000;
    }

    // 기본 15초 간격
    return 15 * 1000;
  }, [isActive, isVisible]);

  const [currentInterval, setCurrentInterval] = useState(getPollingInterval());

  // 상태 변화 시 interval 업데이트
  useEffect(() => {
    const newInterval = getPollingInterval();
    if (newInterval !== currentInterval) {
      setCurrentInterval(newInterval);
      console.log(`🔄 폴링 간격 변경: ${newInterval / 1000}초 (활성: ${isActive}, 가시: ${isVisible})`);
    }
  }, [getPollingInterval, currentInterval, isActive, isVisible]);

  // window focus 시 즉시 callback 실행
  useEffect(() => {
    const handleFocus = () => {
      if (enabled) {
        console.log('🎯 창 포커스 - 즉시 데이터 갱신');
        callback();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [callback, enabled]);

  // interval 적용
  useInterval(
    enabled ? callback : () => {},
    enabled ? currentInterval : null
  );

  return {
    currentInterval,
    isActive,
    isVisible,
    status: !isVisible ? 'background' : isActive ? 'active' : 'idle'
  };
}