'use client';

import { useChatWebSocket } from '../hooks/useWebSocket';

export default function WebSocketTest() {
  const webSocket = useChatWebSocket();

  const testConnection = () => {
    console.log('Testing WebSocket connection...');
    console.log('Connection Status:', webSocket.connectionStatus);
    console.log('Is Connected:', webSocket.isConnected);
    console.log('Subscriptions:', webSocket.subscriptions);

    if (webSocket.isConnected) {
      // 테스트 메시지 전송
      webSocket.sendMessage('/app/test', { message: 'Hello WebSocket!' });
    } else {
      console.log('WebSocket not connected. Attempting to connect...');
      webSocket.connect();
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">WebSocket 연결 테스트</h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">연결 상태:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            webSocket.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            webSocket.connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            webSocket.connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {webSocket.connectionStatus === 'connected' ? '연결됨' :
             webSocket.connectionStatus === 'connecting' ? '연결 중' :
             webSocket.connectionStatus === 'error' ? '연결 실패' : '연결 안됨'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">연결 여부:</span>
          <span className={webSocket.isConnected ? 'text-green-600' : 'text-red-600'}>
            {webSocket.isConnected ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">구독 중인 채널:</span>
          <span className="text-gray-600">
            {webSocket.subscriptions.length > 0 ? webSocket.subscriptions.join(', ') : '없음'}
          </span>
        </div>
      </div>

      <button
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        연결 테스트
      </button>
    </div>
  );
}