'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useContacts } from '../hooks/useApi';
import dynamic from 'next/dynamic';
import '../lib/aframe-mock';

// react-force-graph는 클라이언트 사이드에서만 동작
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then(mod => mod.ForceGraph2D),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34373b] mx-auto mb-4"></div>
          <p className="text-[#52616B]">2D 그래프를 로드하는 중...</p>
        </div>
      </div>
    )
  }
);

const ForceGraph3D = dynamic(
  () => import('react-force-graph').then(mod => mod.ForceGraph3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34373b] mx-auto mb-4"></div>
          <p className="text-[#52616B]">3D 그래프를 로드하는 중...</p>
        </div>
      </div>
    )
  }
);

interface Node {
  id: string;
  name: string;
  role: string;
  group: string;
  connection?: string;
  company?: string;
  val?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
}

export default function NetworkView() {
  const { data: contacts, loading } = useContacts();
  const [selectedPerson, setSelectedPerson] = useState<string | null>('me');
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const graphRef = useRef<any>(null);

  // 클라이언트 사이드에서만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  // 네트워크 데이터 생성
  const graphData = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      return { nodes: [], links: [] };
    }

    const nodes: Node[] = [
      {
        id: 'me',
        name: 'Me',
        role: 'Center',
        group: 'center',
        connection: 'center',
        val: 8
      }
    ];

    const links: Link[] = [];

    contacts.forEach((contact) => {
      const getGroup = (title: string | undefined) => {
        if (!title) return 'other';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) return 'tech';
        if (lowerTitle.includes('designer') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) return 'design';
        if (lowerTitle.includes('manager') || lowerTitle.includes('product')) return 'product';
        if (lowerTitle.includes('data') || lowerTitle.includes('analyst')) return 'data';
        return 'other';
      };

      const connectionTypes = ['direct', 'mutual'];
      const randomConnection = connectionTypes[Math.floor(Math.random() * 2)];

      const nodeId = contact.businessCardId || contact.id || `contact-${Math.random()}`;

      nodes.push({
        id: nodeId,
        name: contact.name,
        role: contact.position || contact.title || '직책 미등록',
        group: getGroup(contact.position || contact.title),
        connection: randomConnection,
        company: contact.company || 'Unknown Company',
        val: 5
      });

      links.push({
        source: 'me',
        target: nodeId,
        type: randomConnection
      });
    });

    return { nodes, links };
  }, [contacts]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return graphData;

    const filteredNodes = graphData.nodes.filter(node =>
      node.id === 'me' ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link =>
      filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchTerm]);

  // Force 설정 적용
  useEffect(() => {
    if (graphRef.current && mounted) {
      graphRef.current.d3Force('charge')?.strength(-300);
      graphRef.current.d3Force('link')?.distance(100);
    }
  }, [filteredData, is3D, mounted]);

  const getGroupColor = (group: string) => {
    const colors = {
      'center': '#16a34a',      // 더 진한 녹색
      'tech': '#2563eb',        // 더 진한 파란색
      'product': '#7c3aed',     // 더 진한 보라색
      'design': '#db2777',      // 더 진한 핑크색
      'data': '#ea580c',        // 더 진한 주황색
      'other': '#475569'        // 더 진한 회색
    };
    return colors[group as keyof typeof colors] || '#475569';
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedPerson(node.id);
    // 노드로 카메라 포커스
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // 노드 좌표가 유효하지 않으면 렌더링하지 않음
    if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) {
      return;
    }

    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeSize = node.val || 10;
    const isSelected = selectedPerson === node.id;
    const isHovered = hoveredPerson === node.id;
    const isCenterNode = node.id === 'me';

    // 노드 그림자 (더 강하게)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = isSelected ? 25 : isHovered ? 20 : 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;

    // 선택/호버 시 외곽 링 (더 선명하게)
    if (isSelected || isHovered) {
      const ringSize = nodeSize + (isSelected ? 8 : 6);
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, ringSize);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.7, isSelected ? 'rgba(22, 163, 74, 0.7)' : 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(node.x, node.y, ringSize, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 유광 효과를 위한 메인 그라디언트 (더 입체적으로)
    const color = getGroupColor(node.group);
    const mainGradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      nodeSize
    );

    mainGradient.addColorStop(0, darkenColor(color, 10));
    mainGradient.addColorStop(0.6, color);
    mainGradient.addColorStop(1, darkenColor(color, 30));

    // 노드 그리기
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize * (isSelected ? 1.3 : isHovered ? 1.2 : 1), 0, 2 * Math.PI);
    ctx.fillStyle = mainGradient;
    ctx.fill();

    // 광택 하이라이트 추가
    const highlightGradient = ctx.createRadialGradient(
      node.x - nodeSize * 0.3,
      node.y - nodeSize * 0.3,
      0,
      node.x - nodeSize * 0.3,
      node.y - nodeSize * 0.3,
      nodeSize * 0.6
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize * (isSelected ? 1.3 : isHovered ? 1.2 : 1), 0, 2 * Math.PI);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // 노드 테두리 (더 강하게)
    ctx.strokeStyle = isSelected ? '#16a34a' : 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = isSelected ? 3.5 : 2.5;
    ctx.stroke();

    // 그림자 제거 (텍스트용)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 연결 타입 인디케이터 (Me 노드 제외)
    if (!isCenterNode && node.connection) {
      const indicatorSize = 4;
      const indicatorColor = node.connection === 'direct' ? '#22c55e' : '#3b82f6';

      ctx.beginPath();
      ctx.arc(node.x + nodeSize * 0.6, node.y + nodeSize * 0.6, indicatorSize, 0, 2 * Math.PI);
      ctx.fillStyle = indicatorColor;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 라벨 배경
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth + 8, fontSize + 6];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const borderRadius = 6;
    const x = node.x - bckgDimensions[0] / 2;
    const y = node.y + nodeSize + 8;

    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + bckgDimensions[0] - borderRadius, y);
    ctx.quadraticCurveTo(x + bckgDimensions[0], y, x + bckgDimensions[0], y + borderRadius);
    ctx.lineTo(x + bckgDimensions[0], y + bckgDimensions[1] - borderRadius);
    ctx.quadraticCurveTo(x + bckgDimensions[0], y + bckgDimensions[1], x + bckgDimensions[0] - borderRadius, y + bckgDimensions[1]);
    ctx.lineTo(x + borderRadius, y + bckgDimensions[1]);
    ctx.quadraticCurveTo(x, y + bckgDimensions[1], x, y + bckgDimensions[1] - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.fill();

    // 라벨 텍스트
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E2022';
    ctx.fillText(label, node.x, y + bckgDimensions[1] / 2);
  }, [selectedPerson, hoveredPerson, getGroupColor]);

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;

    // 링크 좌표가 유효하지 않으면 렌더링하지 않음
    if (!start.x || !start.y || !end.x || !end.y ||
        !isFinite(start.x) || !isFinite(start.y) || !isFinite(end.x) || !isFinite(end.y)) {
      return;
    }

    const isSelected = selectedPerson === start.id || selectedPerson === end.id;
    const isHovered = hoveredPerson === start.id || hoveredPerson === end.id;

    // 링크 색상
    const linkColor = link.type === 'direct' ? '#22c55e' : '#3b82f6';

    ctx.save();
    ctx.globalAlpha = isSelected || isHovered ? 0.9 : 0.4;

    // 그림자
    ctx.shadowColor = linkColor;
    ctx.shadowBlur = isSelected ? 8 : isHovered ? 6 : 0;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.strokeStyle = linkColor;
    ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;
    ctx.stroke();

    ctx.restore();
  }, [selectedPerson, hoveredPerson]);

  // 헬퍼 함수
  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0))
      .toString(16).slice(1);
  };

  if (loading || !mounted) {
    return (
      <div className="h-full bg-white border border-[#bfc7d1] rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34373b] mx-auto mb-4"></div>
          <p className="text-[#52616B]">네트워크 데이터를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border border-[#bfc7d1] rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2022] mb-2">Network Map</h2>
        <p className="text-[#52616B]">Visualize your network connections</p>
      </div>

      <div className="flex space-x-6 h-[calc(100%-120px)]">
        {/* 사이드바 */}
        <div className="w-80 flex flex-col flex-shrink-0">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in network..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none text-sm"
              />
              <i className="ri-search-line absolute right-3 top-2.5 text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
            </div>
          </div>

          <div className="bg-slate-300 border-2 border-slate-400 rounded-lg p-4 mb-4 shadow-md">
            <h3 className="text-[#1E2022] font-semibold mb-3">Connection Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#52616B]">Direct</span>
                <span className="text-[#1E2022] font-medium">
                  {graphData.links.filter((l: Link) => l.type === 'direct').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52616B]">Mutual</span>
                <span className="text-[#1E2022] font-medium">
                  {graphData.links.filter((l: Link) => l.type === 'mutual').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52616B]">Total Network</span>
                <span className="text-[#1E2022] font-medium">{graphData.nodes.length - 1}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-300 border-2 border-slate-400 rounded-lg p-4 flex-1 flex flex-col overflow-hidden shadow-md">
            <h3 className="text-[#1E2022] font-semibold mb-3">Connections ({filteredData.nodes.length - 1})</h3>
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              {filteredData.nodes.filter(node => node.id !== 'me').map((node) => (
                <div
                  key={node.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPerson === node.id
                      ? 'bg-[#34373b] text-[#F0F5F9] shadow-md'
                      : 'hover:bg-[#bfc7d1] hover:shadow-sm'
                  }`}
                  onClick={() => {
                    setSelectedPerson(node.id);
                    const graphNode = graphRef.current?.graphData().nodes.find((n: any) => n.id === node.id);
                    if (graphNode && graphRef.current) {
                      graphRef.current.centerAt(graphNode.x, graphNode.y, 1000);
                      graphRef.current.zoom(2, 1000);
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors`}
                    style={{
                      backgroundColor: selectedPerson === node.id ? '#F0F5F9' : getGroupColor(node.group)
                    }}
                  >
                    <span className={`text-sm font-medium ${
                      selectedPerson === node.id ? 'text-[#1E2022]' : 'text-white'
                    }`}>
                      {node.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedPerson === node.id ? 'text-[#F0F5F9]' : 'text-[#1E2022]'
                    }`}>{node.name}</p>
                    <p className={`text-xs truncate ${
                      selectedPerson === node.id ? 'text-[#e1e4e6]' : 'text-[#52616B]'
                    }`}>{node.role}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      node.connection === 'direct' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 그래프 영역 */}
        <div className="flex-1 bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100 border border-blue-300 rounded-lg relative overflow-hidden min-w-0">
          {mounted && !is3D && <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            nodeLabel="name"
            nodeRelSize={4}
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={(link: any) =>
              selectedPerson === link.source.id || selectedPerson === link.target.id ? 3 : 0
            }
            onNodeClick={handleNodeClick}
            onNodeHover={(node) => setHoveredPerson(node ? (node.id as string) : null)}
            onBackgroundClick={handleBackgroundClick}
            onNodeDragEnd={(node: any) => {
              // 드래그 종료 시 fx, fy를 설정하여 위치 고정
              node.fx = node.x;
              node.fy = node.y;
            }}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            minZoom={0.5}
            maxZoom={4}
            backgroundColor="rgba(240, 249, 255, 0)"
          />}

          {mounted && is3D && <ForceGraph3D
            ref={graphRef}
            graphData={filteredData}
            nodeLabel="name"
            nodeRelSize={4}
            nodeColor={(node: any) => getGroupColor(node.group)}
            nodeOpacity={0.9}
            linkColor={(link: any) => link.type === 'direct' ? '#22c55e' : '#3b82f6'}
            linkWidth={(link: any) => {
              const isSelected = selectedPerson === (link.source as any).id || selectedPerson === (link.target as any).id;
              return isSelected ? 3 : 1.5;
            }}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={(link: any) =>
              selectedPerson === (link.source as any).id || selectedPerson === (link.target as any).id ? 3 : 0
            }
            onNodeClick={handleNodeClick}
            onNodeHover={(node) => setHoveredPerson(node ? (node.id as string) : null)}
            onBackgroundClick={handleBackgroundClick}
            onNodeDragEnd={(node: any) => {
              // 드래그 종료 시 fx, fy, fz를 설정하여 위치 고정
              node.fx = node.x;
              node.fy = node.y;
              node.fz = node.z;
            }}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            enableNodeDrag={true}
            enableNavigationControls={true}
            showNavInfo={false}
            backgroundColor="rgba(240, 249, 255, 0)"
          />}

          {/* 범례 */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border-2 border-slate-400 rounded-lg p-4 shadow-xl max-w-48">
            <h4 className="text-[#1E2022] font-bold text-sm mb-3">Connection</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded-full shadow-md border border-green-700"></div>
                <span className="text-xs text-slate-700 font-semibold">직접 연결</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-md border border-blue-700"></div>
                <span className="text-xs text-slate-700 font-semibold">상호 연결</span>
              </div>
            </div>
          </div>

          {/* 선택된 노드 정보 */}
          {selectedPerson && selectedPerson !== 'me' && (
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm border-2 border-slate-400 rounded-lg p-4 shadow-xl max-w-xs">
              {(() => {
                const node = graphData.nodes.find(n => n.id === selectedPerson);
                return node ? (
                  <div>
                    <h4 className="text-[#1E2022] font-semibold text-base">{node.name}</h4>
                    <p className="text-[#52616B] text-sm font-medium mt-1">{node.role}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getGroupColor(node.group) }}
                      ></div>
                      <p className="text-[#52616B] text-xs capitalize">{node.group}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="absolute bottom-6 right-6 flex space-x-2">
            <button
              onClick={() => setIs3D(!is3D)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i className={`${is3D ? 'ri-layout-2-line' : 'ri-box-3-line'} mr-2`}></i>
              {is3D ? '2D View' : '3D View'}
            </button>
            <button
              onClick={() => graphRef.current?.zoomToFit(400)}
              className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <i className="ri-focus-3-line mr-2"></i>
              Fit View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
