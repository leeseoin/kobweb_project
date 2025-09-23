'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useContacts } from '../hooks/useApi';
import * as d3 from 'd3';

export default function NetworkView() {
  const { data: contacts, loading } = useContacts();
  const [selectedPerson, setSelectedPerson] = useState('me');
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // D3.js 관련 refs
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  const [simulationNodes, setSimulationNodes] = useState<any[]>([]);

  // 동적으로 네트워크 데이터 생성
  const networkData = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      // Fallback 데이터
      return [
        { id: 'sarah', name: 'Sarah Chen', role: 'Frontend Developer', connection: 'direct', group: 'tech', company: 'Tech Company' },
        { id: 'michael', name: 'Michael Chang', role: 'Backend Developer', connection: 'mutual', group: 'tech', company: 'Tech Company' },
        { id: 'james', name: 'James Wilson', role: 'Product Manager', connection: 'mutual', group: 'product', company: 'Startup' },
        { id: 'emily', name: 'Emily Rodriguez', role: 'UX Researcher', connection: 'direct', group: 'design', company: 'Design Agency' },
        { id: 'alex', name: 'Alex Kim', role: 'UI Designer', connection: 'direct', group: 'design', company: 'Design Agency' },
        { id: 'lisa', name: 'Lisa Park', role: 'Data Scientist', connection: 'mutual', group: 'data', company: 'Tech Company' },
        { id: 'david', name: 'David Lee', role: 'DevOps Engineer', connection: 'direct', group: 'tech', company: 'Tech Company' },
        { id: 'anna', name: 'Anna Zhang', role: 'Product Designer', connection: 'mutual', group: 'design', company: 'Design Agency' }
      ];
    }

    // 실제 명함 데이터를 네트워크 데이터로 변환
    const result: any[] = [];

    contacts.forEach((contact) => {
      // 직책 기반으로 그룹 분류
      const getGroup = (title: string | undefined) => {
        if (!title) return 'other';
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) return 'tech';
        if (lowerTitle.includes('designer') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) return 'design';
        if (lowerTitle.includes('manager') || lowerTitle.includes('product')) return 'product';
        if (lowerTitle.includes('data') || lowerTitle.includes('analyst')) return 'data';
        return 'other';
      };

      // 랜덤하게 연결 타입 할당 (실제로는 API에서 받아와야 함)
      const connectionTypes = ['direct', 'mutual'];
      const randomConnection = connectionTypes[Math.floor(Math.random() * 2)];

      result.push({
        id: contact.businessCardId || contact.id,
        name: contact.name,
        role: contact.position || contact.title || '직책 미등록',
        connection: randomConnection,
        group: getGroup(contact.position || contact.title),
        company: contact.company || 'Unknown Company'
      });
    });

    return result;
  }, [contacts]);

  // D3.js Force Simulation을 위한 링크 데이터 생성
  const linkData = useMemo(() => {
    return networkData.map(person => ({
      source: 'me',
      target: person.id,
      type: person.connection
    }));
  }, [networkData]);

  // D3.js Force Simulation 설정
  useEffect(() => {
    if (networkData.length === 0) return;

    // 고정된 컨테이너 크기 설정 (1200x1200)
    const width = 1200;
    const height = 1200;
    const centerX = width / 2;
    const centerY = height / 2;

    // Me 노드를 중심에 고정하고 다른 노드들을 추가
    const nodes = [
      { id: 'me', name: 'Me', role: 'Center', group: 'center', connection: 'center', x: centerX, y: centerY, fx: centerX, fy: centerY },
      ...networkData.map(person => ({
        ...person,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100
      }))
    ];

    // 기존 시뮬레이션 정리
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // 그룹별 클러스터 중심점 계산 - 더 체계적인 배치
    const groupCenters: Record<string, {x: number, y: number}> = {};
    const groups = [...new Set(networkData.map(d => d.group))];

    // 각 그룹을 균등한 원형으로 배치 - 개별 노드 분산 고려
    groups.forEach((group, index) => {
      const totalGroups = groups.length;
      // 모든 그룹을 하나의 큰 원형으로 균등 배치
      const angle = (index * 2 * Math.PI) / totalGroups;
      const radius = 250; // 충분한 간격을 위한 반경

      groupCenters[group] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Force simulation 설정 - 더 정교하고 체계적인 배치
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(linkData)
        .id((d: any) => d.id)
        .distance((d: any) => {
          // 연결 타입과 그룹에 따른 거리 조정
          const baseDistance = d.type === 'direct' ? 160 : 180;
          return baseDistance;
        })
        .strength(0.8) // 연결 강도 조정
      )
      .force("charge", d3.forceManyBody()
        .strength((d: any) => {
          if (d.id === 'me') return -1500; // 중심 노드 더 강한 반발력
          return -400; // 다른 노드들 강한 반발력으로 겹침 방지
        })
      )
      .force("center", d3.forceCenter(centerX, centerY))
      .force("collision", d3.forceCollide()
        .radius((d: any) => d.id === 'me' ? 40 : 35) // 충돌 반경 대폭 증가
        .strength(1.2) // 충돌 강도 증가
      )
      // 매우 약한 그룹별 클러스터링 (주로 방향성만 제공)
      .force("group", (alpha: number) => {
        nodes.forEach(node => {
          if (node.id !== 'me' && groupCenters[node.group]) {
            const groupCenter = groupCenters[node.group];
            const dx = groupCenter.x - (node.x || centerX);
            const dy = groupCenter.y - (node.y || centerY);
            // 매우 약한 클러스터링 힘 (방향성만 제공)
            node.vx = (node.vx || 0) + dx * alpha * 0.02;
            node.vy = (node.vy || 0) + dy * alpha * 0.02;
          }
        });
      })
      // 개별 노드 분산 강화
      .force("individualize", (alpha: number) => {
        // 같은 그룹 내 노드들이 너무 가까이 있으면 밀어내기
        const groupNodes: Record<string, any[]> = {};
        nodes.forEach(node => {
          if (node.id !== 'me') {
            if (!groupNodes[node.group]) groupNodes[node.group] = [];
            groupNodes[node.group].push(node);
          }
        });

        Object.values(groupNodes).forEach(groupNodeList => {
          if (groupNodeList.length > 1) {
            for (let i = 0; i < groupNodeList.length; i++) {
              for (let j = i + 1; j < groupNodeList.length; j++) {
                const nodeA = groupNodeList[i];
                const nodeB = groupNodeList[j];
                const dx = (nodeB.x || centerX) - (nodeA.x || centerX);
                const dy = (nodeB.y || centerY) - (nodeA.y || centerY);
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 최소 거리 유지 (70px)
                if (distance < 70 && distance > 0) {
                  const force = (70 - distance) * alpha * 0.1;
                  const fx = (dx / distance) * force;
                  const fy = (dy / distance) * force;

                  nodeA.vx = (nodeA.vx || 0) - fx;
                  nodeA.vy = (nodeA.vy || 0) - fy;
                  nodeB.vx = (nodeB.vx || 0) + fx;
                  nodeB.vy = (nodeB.vy || 0) + fy;
                }
              }
            }
          }
        });
      })
      // 각도 기반 분산 힘
      .force("angularSpread", (alpha: number) => {
        nodes.forEach((node, index) => {
          if (node.id !== 'me') {
            // 각 노드를 이상적인 각도 위치로 유도
            const idealAngle = ((index - 1) * 2 * Math.PI) / (nodes.length - 1);
            const idealRadius = 220;
            const idealX = centerX + idealRadius * Math.cos(idealAngle);
            const idealY = centerY + idealRadius * Math.sin(idealAngle);

            const dx = idealX - (node.x || centerX);
            const dy = idealY - (node.y || centerY);

            // 약한 각도 분산 힘
            node.vx = (node.vx || 0) + dx * alpha * 0.03;
            node.vy = (node.vy || 0) + dy * alpha * 0.03;
          }
        });
      })
      // 경계 제한 (더 타이트하게)
      .force("boundary", () => {
        nodes.forEach(node => {
          if (node.id !== 'me') {
            node.x = Math.max(150, Math.min(width - 150, node.x || centerX));
            node.y = Math.max(150, Math.min(height - 150, node.y || centerY));
          }
        });
      })
      // 최종 균등 분산 정리
      .force("finalSpread", (alpha: number) => {
        if (alpha < 0.03) { // 시뮬레이션 후반부에만 적용
          nodes.forEach(node => {
            if (node.id !== 'me') {
              // 모든 다른 노드와의 최소 거리 확보
              nodes.forEach(otherNode => {
                if (otherNode.id !== 'me' && otherNode.id !== node.id) {
                  const dx = (otherNode.x || centerX) - (node.x || centerX);
                  const dy = (otherNode.y || centerY) - (node.y || centerY);
                  const distance = Math.sqrt(dx * dx + dy * dy);

                  // 최소 거리 80px 확보
                  if (distance < 80 && distance > 0) {
                    const pushForce = (80 - distance) * 0.1;
                    const fx = (dx / distance) * pushForce;
                    const fy = (dy / distance) * pushForce;

                    node.vx = (node.vx || 0) - fx;
                    node.vy = (node.vy || 0) - fy;
                  }
                }
              });
            }
          });
        }
      });

    simulationRef.current = simulation;

    // 시뮬레이션 업데이트
    simulation.on("tick", () => {
      setSimulationNodes([...nodes]);
    });

    // 시뮬레이션 실행
    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [networkData, linkData]);

  const filteredData = (simulationNodes.length > 0 ? simulationNodes.filter(node => node.id !== 'me') : networkData).filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonClick = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const getConnectionColor = (connection: string) => {
    return connection === 'direct' ? '#22c55e' : '#3b82f6';
  };

  const getGroupColor = (group: string) => {
    const colors = {
      'tech': '#1E2022',
      'product': '#52616B',
      'design': '#788189',
      'data': '#34373b',
      'other': '#6b7280'
    };
    return colors[group as keyof typeof colors] || '#52616B';
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleCenter = () => {
    setZoomLevel(1);
    setCenterOffset({ x: 0, y: 0 });
    setSelectedPerson('me');
    setSearchTerm('');
  };

  const handleResetLayout = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // 노드를 클릭한 경우 드래그하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('.network-node')) return;

    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setDragStart({ x: e.clientX - centerOffset.x, y: e.clientY - centerOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setCenterOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 전역 마우스 이벤트 처리를 위한 effect
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setCenterOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastMousePos]);

  // 로딩 상태
  if (loading) {
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
        <div className="w-80 flex flex-col flex-shrink-0">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in network..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white border border-[#bfc7d1] rounded-lg px-4 py-2 text-[#1E2022] placeholder-[#52616B] focus:border-[#34373b] focus:outline-none text-sm"
              />
              <i className="ri-search-line absolute right-3 top-2.5 text-[#52616B] w-4 h-4 flex items-center justify-center"></i>
            </div>
          </div>

          <div className="bg-[#e1e4e6] border border-[#bfc7d1] rounded-lg p-4 mb-4">
            <h3 className="text-[#1E2022] font-medium mb-3">Connection Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#52616B]">Direct</span>
                <span className="text-[#1E2022] font-medium">{networkData.filter(p => p.connection === 'direct').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52616B]">Mutual</span>
                <span className="text-[#1E2022] font-medium">{networkData.filter(p => p.connection === 'mutual').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52616B]">Total Network</span>
                <span className="text-[#1E2022] font-medium">{networkData.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#e1e4e6] border border-[#bfc7d1] rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[#1E2022] font-medium mb-3">Connections ({filteredData.length})</h3>
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              {filteredData.map((person) => (
                <div
                  key={person.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPerson === person.id
                      ? 'bg-[#34373b] text-[#F0F5F9] shadow-md'
                      : 'hover:bg-[#bfc7d1] hover:shadow-sm'
                  }`}
                  onClick={() => handlePersonClick(person.id)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedPerson === person.id ? 'bg-[#F0F5F9]' : 'bg-white'
                  }`}>
                    <span className={`text-sm font-medium ${
                      selectedPerson === person.id ? 'text-[#1E2022]' : 'text-[#1E2022]'
                    }`}>
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedPerson === person.id ? 'text-[#F0F5F9]' : 'text-[#1E2022]'
                    }`}>{person.name}</p>
                    <p className={`text-xs truncate ${
                      selectedPerson === person.id ? 'text-[#e1e4e6]' : 'text-[#52616B]'
                    }`}>{person.role}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      person.connection === 'direct' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <span className={`text-xs font-medium ${
                      selectedPerson === person.id ? 'text-[#e1e4e6]' : 'text-[#52616B]'
                    }`}>
                      {person.connection === 'direct' ? '직접' : '상호'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex-1 bg-[#e1e4e6] border border-[#bfc7d1] rounded-lg relative overflow-hidden min-w-0"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <div
            className="h-full flex items-center justify-center relative"
            style={{
              transform: `scale(${zoomLevel}) translate(${centerOffset.x}px, ${centerOffset.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div className="relative w-[1200px] h-[1200px]">
            <svg width="1200" height="1200" className="absolute inset-0" viewBox="0 0 1200 1200" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="directArrow" markerWidth="6" markerHeight="6"
                  refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                  <polygon points="0 1, 5 3, 0 5" fill="#4ade80" />
                </marker>
                <marker id="mutualArrowStart" markerWidth="6" markerHeight="6"
                  refX="1" refY="3" orient="auto" markerUnits="strokeWidth">
                  <polygon points="5 1, 0 3, 5 5" fill="#60a5fa" />
                </marker>
                <marker id="mutualArrowEnd" markerWidth="6" markerHeight="6"
                  refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                  <polygon points="0 1, 5 3, 0 5" fill="#60a5fa" />
                </marker>
              </defs>

              {filteredData.map((person, index) => {
                const isSelected = selectedPerson === person.id;
                const isFiltered = searchTerm && !person.name.toLowerCase().includes(searchTerm.toLowerCase()) && !person.role.toLowerCase().includes(searchTerm.toLowerCase());
                const meNode = simulationNodes.find(node => node.id === 'me') || { x: 600, y: 600 };

                // 시뮬레이션 노드에서 실제 위치 가져오기
                const targetNode = simulationNodes.find(node => node.id === person.id) || person;

                return (
                  <g key={`connection-${person.id}`}>
                    {/* 메인 연결선 */}
                    <line
                      x1={meNode.x || 600}
                      y1={meNode.y || 600}
                      x2={targetNode.x || 600}
                      y2={targetNode.y || 600}
                      stroke={person.connection === 'direct' ? "#22c55e" : "#3b82f6"}
                      strokeWidth={isSelected ? "3" : "2"}
                      markerStart={person.connection === 'mutual' ? "url(#mutualArrowStart)" : ""}
                      markerEnd={person.connection === 'direct' ? "url(#directArrow)" : "url(#mutualArrowEnd)"}
                      opacity={isFiltered ? 0.3 : 0.9}
                      className="transition-all duration-300"
                      style={{
                        strokeDasharray: person.connection === 'mutual' ? "8,4" : "none",
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {(() => {
              const meNode = simulationNodes.find(node => node.id === 'me') || { x: 600, y: 600 };
              return (
                <div className="absolute network-node" style={{ left: `${meNode.x || 600}px`, top: `${meNode.y || 600}px`, transform: 'translate(-50%, -50%)' }}>
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => handlePersonClick('me')}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-300 border-2 ${
                      selectedPerson === 'me'
                        ? 'bg-gradient-to-br from-[#1E2022] to-[#34373b] ring-3 ring-[#22c55e] shadow-xl scale-110 border-white'
                        : 'bg-gradient-to-br from-[#34373b] to-[#52616B] group-hover:from-[#1E2022] group-hover:to-[#34373b] group-hover:shadow-lg group-hover:scale-105 border-white/80'
                    }`} style={{
                      boxShadow: selectedPerson === 'me' ? '0 0 20px #22c55e40, 0 4px 16px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.15)'
                    }}>
                      <span className="text-[#F0F5F9] font-bold text-sm">Me</span>
                    </div>
                    <span className="text-[#1E2022] text-xs font-semibold bg-white/90 px-2 py-0.5 rounded-full">Me</span>
                  </div>
                </div>
              );
            })()}

            {filteredData.map((person) => {
              const isFiltered = searchTerm && !person.name.toLowerCase().includes(searchTerm.toLowerCase()) && !person.role.toLowerCase().includes(searchTerm.toLowerCase());
              // 시뮬레이션 노드에서 실제 위치 가져오기
              const targetNode = simulationNodes.find(node => node.id === person.id) || person;

              return (
                <div
                  key={person.id}
                  className={`absolute network-node transition-all duration-200 ${isFiltered ? 'opacity-20' : 'opacity-100'}`}
                  style={{
                    left: `${targetNode.x || 600}px`,
                    top: `${targetNode.y || 600}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => handlePersonClick(person.id)}
                    onMouseEnter={() => setHoveredPerson(person.id)}
                    onMouseLeave={() => setHoveredPerson(null)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 relative transition-all duration-300 border-2 ${
                      selectedPerson === person.id
                        ? 'ring-3 ring-[#22c55e] shadow-xl scale-125 border-white'
                        : hoveredPerson === person.id
                        ? 'shadow-lg scale-110 border-white'
                        : 'shadow-sm border-white/50 group-hover:shadow-md group-hover:scale-105 group-hover:border-white'
                    }`} style={{
                      backgroundColor: getGroupColor(person.group),
                      boxShadow: selectedPerson === person.id ? `0 0 15px ${getGroupColor(person.group)}40` : undefined
                    }}>
                      <span className="text-[#F0F5F9] font-semibold text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white shadow-sm ${
                        person.connection === 'direct' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                    </div>

                    <div className={`text-center transition-all duration-200 ${
                      selectedPerson === person.id ? 'scale-105' : ''
                    }`}>
                      <span className="text-[#1E2022] text-xs font-semibold bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm">
                        {person.name.split(' ')[0]}
                      </span>
                    </div>

                    {hoveredPerson === person.id && (
                      <div className="absolute top-full mt-4 bg-[#1E2022] text-[#F0F5F9] px-4 py-3 rounded-lg text-sm whitespace-nowrap z-30 shadow-xl border border-[#34373b]">
                        <div className="font-semibold text-center">{person.name}</div>
                        <div className="text-xs text-[#e1e4e6] text-center mt-1">{person.role}</div>
                        <div className="text-xs text-center mt-2 flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            person.connection === 'direct' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <span>
                            {person.connection === 'direct' ? '직접 연결' : '상호 연결'}
                          </span>
                        </div>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#1E2022]"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {searchTerm && filteredData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                  <i className="ri-search-line text-4xl text-[#52616B] mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-[#1E2022] font-semibold text-lg mb-2">검색 결과가 없습니다</h3>
                  <p className="text-[#52616B] text-sm">'{searchTerm}'와 일치하는 연락처가 없습니다</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    검색 초기화
                  </button>
                </div>
              </div>
            )}

            {!searchTerm && networkData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                  <i className="ri-team-line text-4xl text-[#52616B] mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                  <h3 className="text-[#1E2022] font-semibold text-lg mb-2">네트워크가 비어있습니다</h3>
                  <p className="text-[#52616B] text-sm">명함을 추가하여 관계도를 구성해보세요</p>
                  <button
                    onClick={() => window.location.href = '/add-contact'}
                    className="mt-4 bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    명함 추가하기
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>

          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm border border-[#bfc7d1] rounded-lg p-4 shadow-lg max-w-48">
            <h4 className="text-[#1E2022] font-semibold text-sm mb-3">네트워크 정보</h4>

            {/* 연결 유형 */}
            <div className="mb-4">
              <h5 className="text-xs text-[#52616B] font-medium mb-2">연결 유형</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-xs text-[#52616B]">직접 연결</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-xs text-[#52616B]">상호 연결</span>
                </div>
              </div>
            </div>

            {/* 그룹별 분류 */}
            <div className="mb-4">
              <h5 className="text-xs text-[#52616B] font-medium mb-2">분야별 분류</h5>
              <div className="space-y-1">
                {Object.entries(
                  networkData.reduce((acc, person) => {
                    acc[person.group] = (acc[person.group] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getGroupColor(group) }}></div>
                      <span className="text-xs text-[#52616B] capitalize">
                        {group === 'tech' ? '기술' :
                         group === 'design' ? '디자인' :
                         group === 'product' ? '기획' :
                         group === 'data' ? '데이터' : '기타'}
                      </span>
                    </div>
                    <span className="text-xs text-[#1E2022] font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#bfc7d1]">
              <div className="text-xs text-[#52616B] font-medium">
                총 {networkData.length}개 연결
              </div>
            </div>
          </div>

          {selectedPerson !== 'me' && selectedPerson && (
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm border border-[#bfc7d1] rounded-lg p-4 shadow-lg max-w-xs">
              {(() => {
                const person = networkData.find(p => p.id === selectedPerson);
                return person ? (
                  <div>
                    <h4 className="text-[#1E2022] font-semibold text-base">{person.name}</h4>
                    <p className="text-[#52616B] text-sm font-medium mt-1">{person.role}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${
                        person.connection === 'direct' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <p className="text-[#52616B] text-xs">
                        {person.connection === 'direct' ? '직접 연결' : '지인을 통한 상호 연결'}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="absolute bottom-6 right-6 flex space-x-2">
            <button
              onClick={handleZoomIn}
              className="bg-white hover:bg-[#bfc7d1] text-[#1E2022] px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-[#bfc7d1] shadow-sm hover:shadow-md"
            >
              <i className="ri-zoom-in-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-white hover:bg-[#bfc7d1] text-[#1E2022] px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-[#bfc7d1] shadow-sm hover:shadow-md"
            >
              <i className="ri-zoom-out-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            <button
              onClick={handleResetLayout}
              className="bg-white hover:bg-[#bfc7d1] text-[#1E2022] px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border border-[#bfc7d1] shadow-sm hover:shadow-md"
            >
              <i className="ri-refresh-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            <button
              onClick={handleCenter}
              className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md"
            >
              Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
