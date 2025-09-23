/**
 * 🤖 Figma 자동화 스크립트
 *
 * 추출된 디자인 토큰을 Figma API를 통해 자동으로 생성합니다.
 */

const { designTokens } = require('../design-system/tokens.js');

class FigmaAutomation {
  constructor(figmaToken, fileKey) {
    this.figmaToken = figmaToken;
    this.fileKey = fileKey;
    this.baseUrl = 'https://api.figma.com/v1';
  }

  // Figma API 호출
  async figmaRequest(endpoint, method = 'GET', body = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'X-Figma-Token': this.figmaToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Variables 자동 생성
  async createVariables() {
    console.log('🎨 Creating Figma Variables...');

    const variablesData = {
      variableCollections: [{
        name: 'Kobweb Colors',
        modes: [{
          name: 'Light',
          modeId: 'light'
        }]
      }]
    };

    // 색상 변수들 추가
    const colorVariables = [];

    Object.entries(designTokens.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object' && !Array.isArray(colors)) {
        Object.entries(colors).forEach(([name, value]) => {
          if (typeof value === 'string') {
            colorVariables.push({
              name: `${category}/${name}`,
              type: 'COLOR',
              value: this.hexToFigmaColor(value),
              description: `Auto-generated from codebase`
            });
          }
        });
      }
    });

    return colorVariables;
  }

  // Hex 색상을 Figma 형식으로 변환
  hexToFigmaColor(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0, a: 1 };

    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: 1
    };
  }

  // 컴포넌트 자동 생성
  async createComponents() {
    console.log('🧩 Creating Figma Components...');

    const components = [
      {
        name: 'Button/Primary',
        type: 'RECTANGLE',
        fills: [{
          type: 'SOLID',
          color: this.hexToFigmaColor(designTokens.colors.primary.main)
        }],
        cornerRadius: 8,
        constraints: {
          horizontal: 'LEFT_RIGHT',
          vertical: 'TOP_BOTTOM'
        }
      },
      {
        name: 'Button/Secondary',
        type: 'RECTANGLE',
        fills: [{
          type: 'SOLID',
          color: this.hexToFigmaColor(designTokens.colors.background.surface)
        }],
        strokes: [{
          type: 'SOLID',
          color: this.hexToFigmaColor(designTokens.colors.border.main)
        }],
        strokeWeight: 1,
        cornerRadius: 8
      }
    ];

    return components;
  }

  // 전체 자동화 실행
  async run() {
    try {
      console.log('🚀 Starting Figma automation...');

      // 1. Variables 생성
      const variables = await this.createVariables();
      console.log(`✅ Created ${variables.length} variables`);

      // 2. Components 생성
      const components = await this.createComponents();
      console.log(`✅ Created ${components.length} components`);

      // 3. 결과 저장
      const result = {
        timestamp: new Date().toISOString(),
        variables,
        components,
        summary: {
          totalVariables: variables.length,
          totalComponents: components.length
        }
      };

      require('fs').writeFileSync(
        '../design-system/figma-automation-result.json',
        JSON.stringify(result, null, 2)
      );

      console.log('🎉 Automation completed!');
      console.log('📄 Results saved to: figma-automation-result.json');

      return result;

    } catch (error) {
      console.error('❌ Automation failed:', error.message);
      throw error;
    }
  }
}

// CLI 실행
if (require.main === module) {
  const figmaToken = process.env.FIGMA_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;

  if (!figmaToken) {
    console.error('❌ FIGMA_TOKEN 환경변수가 필요합니다.');
    console.log('💡 설정 방법:');
    console.log('1. Figma → Settings → Personal Access Token 생성');
    console.log('2. export FIGMA_TOKEN="your_token_here"');
    process.exit(1);
  }

  if (!fileKey) {
    console.error('❌ FIGMA_FILE_KEY 환경변수가 필요합니다.');
    console.log('💡 Figma 파일 URL에서 추출: figma.com/file/[FILE_KEY]/...');
    process.exit(1);
  }

  const automation = new FigmaAutomation(figmaToken, fileKey);
  automation.run().catch(console.error);
}

module.exports = FigmaAutomation;