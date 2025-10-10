
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState, useRef, useEffect } from 'react';
import './lib/aframe-mock';

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then(mod => mod.ForceGraph2D),
  { ssr: false }
);

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const graphRef = useRef<any>(null);

  // 20명의 더미 데이터 생성
  const dummyGraphData = useMemo(() => {
    const names = [
      '김민수', '이서연', '박지훈', '최유진', '정도현', '강서아', '조민재', '윤채원',
      '임서준', '한지우', '오승호', '신예은', '장현우', '권나연', '송태민', '배수빈',
      '홍지원', '노다은', '고준서', '문서영'
    ];

    const companies = ['삼성', '네이버', '카카오', '라인', '쿠팡', '배달의민족', 'SK', 'LG'];
    const positions = ['개발자', '디자이너', 'PM', '마케터', '데이터 분석가', '기획자'];

    // 하드코딩된 상세 정보
    const personDetails: { [key: string]: { skills: string[], projects: string[] } } = {
      '김민수': { skills: ['React', 'TypeScript', 'Node.js'], projects: ['모바일 앱 리뉴얼', 'AI 챗봇 개발'] },
      '이서연': { skills: ['Figma', 'Adobe XD', 'Sketch'], projects: ['디자인 시스템 구축', 'UI/UX 개선'] },
      '박지훈': { skills: ['Python', 'Django', 'AWS'], projects: ['백엔드 API 설계', '클라우드 마이그레이션'] },
      '최유진': { skills: ['SEO', 'Google Analytics', 'SNS'], projects: ['브랜드 캠페인', '퍼포먼스 마케팅'] },
      '정도현': { skills: ['React', 'Vue.js', 'CSS'], projects: ['웹 프론트엔드 개발', '반응형 UI 구현'] },
      '강서아': { skills: ['Tableau', 'SQL', 'R'], projects: ['데이터 대시보드', '매출 분석 리포트'] },
      '조민재': { skills: ['Java', 'Spring', 'MySQL'], projects: ['ERP 시스템 개발', '레거시 리팩토링'] },
      '윤채원': { skills: ['Photoshop', 'Illustrator', 'Blender'], projects: ['3D 모델링', '브랜드 아이덴티티'] },
      '임서준': { skills: ['Kubernetes', 'Docker', 'CI/CD'], projects: ['인프라 자동화', 'DevOps 구축'] },
      '한지우': { skills: ['Flutter', 'Dart', 'Firebase'], projects: ['크로스플랫폼 앱', '실시간 채팅 앱'] },
      '오승호': { skills: ['Product Strategy', 'Agile', 'Jira'], projects: ['제품 로드맵 수립', '스프린트 관리'] },
      '신예은': { skills: ['Pandas', 'Scikit-learn', 'TensorFlow'], projects: ['추천 시스템', '머신러닝 모델'] },
      '장현우': { skills: ['Go', 'gRPC', 'Redis'], projects: ['마이크로서비스 개발', 'API 게이트웨이'] },
      '권나연': { skills: ['After Effects', 'Premiere', 'Cinema 4D'], projects: ['모션 그래픽', '홍보 영상 제작'] },
      '송태민': { skills: ['Swift', 'iOS', 'SwiftUI'], projects: ['iOS 앱 개발', 'ARKit 프로젝트'] },
      '배수빈': { skills: ['Content Writing', 'Copywriting', 'Notion'], projects: ['블로그 운영', '콘텐츠 전략'] },
      '홍지원': { skills: ['JavaScript', 'Three.js', 'WebGL'], projects: ['3D 웹 시각화', '인터랙티브 UI'] },
      '노다은': { skills: ['BigQuery', 'Looker', 'ETL'], projects: ['데이터 파이프라인', 'BI 구축'] },
      '고준서': { skills: ['Kotlin', 'Android', 'Jetpack'], projects: ['안드로이드 앱', '모바일 성능 최적화'] },
      '문서영': { skills: ['UX Research', 'User Testing', 'Miro'], projects: ['사용자 조사', 'UX 개선 프로젝트'] }
    };

    const nodes = [
      { id: 'me', name: 'Me', group: 'center', val: 8 },
      ...names.map((name, i) => ({
        id: `person-${i}`,
        name,
        company: companies[Math.floor(Math.random() * companies.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        group: ['tech', 'design', 'product', 'data', 'other'][Math.floor(Math.random() * 5)],
        val: 5,
        details: personDetails[name]
      }))
    ];

    // 랜덤 친구 관계 생성
    const links: any[] = [];

    // 먼저 Me와 일부 사람들 연결 (50% 확률)
    names.forEach((_, i) => {
      if (Math.random() > 0.3) {
        links.push({
          source: 'me',
          target: `person-${i}`,
          type: Math.random() > 0.5 ? 'direct' : 'mutual'
        });
      }
    });

    // 사람들끼리 랜덤하게 연결 (각 사람당 2-5명과 연결)
    names.forEach((_, i) => {
      const numConnections = Math.floor(Math.random() * 4) + 2; // 2-5개 연결
      const possibleConnections = names
        .map((_, j) => j)
        .filter(j => j !== i);

      for (let c = 0; c < numConnections && possibleConnections.length > 0; c++) {
        const randomIndex = Math.floor(Math.random() * possibleConnections.length);
        const targetIndex = possibleConnections[randomIndex];
        possibleConnections.splice(randomIndex, 1);

        // 중복 링크 방지
        const linkExists = links.some(
          link =>
            (link.source === `person-${i}` && link.target === `person-${targetIndex}`) ||
            (link.source === `person-${targetIndex}` && link.target === `person-${i}`)
        );

        if (!linkExists) {
          links.push({
            source: `person-${i}`,
            target: `person-${targetIndex}`,
            type: Math.random() > 0.5 ? 'direct' : 'mutual'
          });
        }
      }
    });

    return { nodes, links };
  }, []);

  // Force 설정 적용
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-2000);
      graphRef.current.d3Force('link')?.distance(300);
      graphRef.current.d3Force('collide')?.radius(80);

      // 즉시 축소 적용 (애니메이션 없음)
      graphRef.current.zoom(0.4, 0);
    }
  }, [dummyGraphData]);

  const getGroupColor = (group: string) => {
    const colors = {
      'center': '#16a34a',
      'tech': '#2563eb',
      'product': '#7c3aed',
      'design': '#db2777',
      'data': '#ea580c',
      'other': '#475569'
    };
    return colors[group as keyof typeof colors] || '#475569';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100">
      {/* Header */}
      <header className="border-b-2 border-slate-400 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* <img src="/kobweb-logo2.png" alt="Kobweb" className="w-12 h-12 object-contain" /> */}
              {/* <h1 className="text-2xl font-bold text-slate-800">Kobweb</h1> */}
            </div>
            <nav className="hidden md:flex space-x-8">
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center mb-6">
            <img src="/kobweb-logo2.png" alt="Kobweb" className="w-24 h-24 object-contain mr-4 drop-shadow-2xl" />
            <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-montserrat">
              KobWeb
            </h1>
          </div>
          <p className="text-2xl mb-10 max-w-2xl mx-auto font-semibold text-slate-700">
            당신의 인맥을 스마트하게 관리하는 프로페셔널 네트워크
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="px-8 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all cursor-pointer whitespace-nowrap inline-block shadow-lg hover:shadow-xl transform hover:scale-105">
              시작하기
            </Link>
            <button className="border-2 border-slate-400 px-8 py-3 rounded-full text-lg font-bold text-slate-800 bg-white/80 hover:bg-white transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg">
              더 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-200 to-blue-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black tracking-tight mb-8 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-montserrat">
              Human Resource Networking
            </h2>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed text-slate-800 font-semibold mb-12">
              AI 기반 명함 인식 시스템으로 즉시 디지털화하고, 혁신적인 관계도 시각화로
              비즈니스 관계를 한눈에 파악하세요. 숨겨진 네트워킹 기회를 발견하고
              인텔리전트한 인사이트로 프로페셔널 네트워크를 강화하세요.
            </p>

            {/* 네트워크 그래프 시각화 */}
            <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-400 rounded-2xl p-8 shadow-2xl mb-12 relative">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">실시간 네트워크 관계도</h3>
              <div className="h-[700px] bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-xl border-2 border-blue-300 shadow-inner overflow-hidden relative">
                <ForceGraph2D
                  ref={graphRef}
                  graphData={dummyGraphData}
                  nodeLabel={(node: any) => node.id === 'me' ? 'Me' : `${node.name}\n클릭하여 상세보기`}
                  nodeRelSize={6}
                  nodeColor={(node: any) => getGroupColor(node.group)}
                  linkColor={(link: any) => link.type === 'direct' ? '#16a34a' : '#2563eb'}
                  linkWidth={(link: any) => 2}
                  linkDirectionalParticles={1}
                  linkDirectionalParticleWidth={2}
                  onNodeClick={(node: any) => {
                    if (node.id !== 'me') {
                      setSelectedNode(node);
                    }
                  }}
                  onNodeHover={(node: any) => {
                    setHoveredNode(node);
                  }}
                  onNodeDragEnd={(node: any) => {
                    node.fx = node.x;
                    node.fy = node.y;
                  }}
                  onEngineStop={() => {
                    if (graphRef.current) {
                      graphRef.current.d3Force('charge')?.strength(-1000);
                      graphRef.current.d3Force('link')?.distance(150);
                    }
                  }}
                  nodeCanvasObjectMode={() => 'after'}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    if (hoveredNode?.id === node.id && node.id !== 'me') {
                      const label = '...';
                      const fontSize = 20 / globalScale;
                      ctx.font = `bold ${fontSize}px Arial`;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = '#1e293b';
                      ctx.fillText(label, node.x, node.y);
                    }
                  }}
                  warmupTicks={200}
                  cooldownTicks={200}
                  d3AlphaDecay={0.01}
                  d3VelocityDecay={0.2}
                  enableNodeDrag={true}
                  enableZoomInteraction={true}
                  enablePanInteraction={true}
                  minZoom={0.3}
                  maxZoom={3}
                  backgroundColor="rgba(240, 249, 255, 0)"
                />

                {/* 상세 정보 팝업 */}
                {selectedNode && selectedNode.id !== 'me' && (
                  <div
                    className="absolute top-4 right-4 bg-white border-2 border-slate-400 rounded-xl p-4 shadow-2xl max-w-xs z-10"
                    style={{ maxHeight: '80%', overflowY: 'auto' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{selectedNode.name}</h4>
                        <p className="text-sm text-slate-600">{selectedNode.position}</p>
                        <p className="text-xs text-slate-500">{selectedNode.company}</p>
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className="text-slate-500 hover:text-slate-800 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-bold text-slate-700 mb-2">기술 스택</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.details?.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-700 mb-2">주요 프로젝트</h5>
                      <ul className="space-y-1">
                        {selectedNode.details?.projects.map((project: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 border-2 border-slate-400 rounded-xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-qr-scan-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">명함 스캔</h3>
              <p className="text-slate-700 font-medium">
                AI 기반 스캐닝 기술로 명함을 즉시 디지털화
              </p>
            </div>

            <div className="bg-white/90 border-2 border-slate-400 rounded-xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-share-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">네트워크 매핑</h3>
              <p className="text-slate-700 font-medium">
                프로페셔널 네트워크를 시각화하고 이해하기
              </p>
            </div>

            <div className="bg-white/90 border-2 border-slate-400 rounded-xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-lightbulb-line text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">스마트 인사이트</h3>
              <p className="text-slate-700 font-medium">
                네트워크 내 숨겨진 기회를 발견하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-slate-400 py-12 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/kobweb-logo2.png" alt="Kobweb" className="w-10 h-10 object-contain" />
                <h3 className="text-xl font-bold text-slate-800">Kobweb</h3>
              </div>
              <p className="text-sm text-slate-700 font-medium">
                혁신적인 디지털 솔루션으로 비즈니스 네트워킹을 혁신합니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-800">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">서비스 약관</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">개인정보 보호정책</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-800">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-300 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg flex items-center justify-center transition-all shadow-md">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-300 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg flex items-center justify-center transition-all shadow-md">
                  <i className="ri-linkedin-fill text-xl"></i>
                </a>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm mb-2 text-slate-600 font-semibold">© 2024 Kobweb. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
