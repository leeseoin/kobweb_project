#!/usr/bin/env node

/**
 * 🎨 자동 스타일 추출 스크립트
 *
 * 코드베이스에서 모든 색상, 스타일, 패턴을 추출하여
 * Figma 디자인 시스템 생성을 위한 데이터를 만듭니다.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class StyleExtractor {
  constructor() {
    this.colors = new Set();
    this.classNames = new Set();
    this.inlineStyles = new Map();
    this.components = new Map();
    this.patterns = new Map();
  }

  // 색상 패턴 매칭
  extractColors(content) {
    // Hex colors
    const hexColors = content.match(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g) || [];
    hexColors.forEach(color => this.colors.add(color.toLowerCase()));

    // Tailwind bg classes
    const bgClasses = content.match(/bg-\[[^\]]+\]/g) || [];
    bgClasses.forEach(cls => {
      const colorMatch = cls.match(/bg-\[([^\]]+)\]/);
      if (colorMatch && colorMatch[1].startsWith('#')) {
        this.colors.add(colorMatch[1].toLowerCase());
      }
    });

    // Text color classes
    const textClasses = content.match(/text-\[[^\]]+\]/g) || [];
    textClasses.forEach(cls => {
      const colorMatch = cls.match(/text-\[([^\]]+)\]/);
      if (colorMatch && colorMatch[1].startsWith('#')) {
        this.colors.add(colorMatch[1].toLowerCase());
      }
    });
  }

  // 인라인 스타일 추출
  extractInlineStyles(content) {
    const styleMatches = content.match(/style=\{[^}]+\}/g) || [];
    styleMatches.forEach(style => {
      const properties = style.match(/(\w+):\s*['"`]([^'"`]+)['"`]/g) || [];
      properties.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim().replace(/['"`]/g, ''));
        if (!this.inlineStyles.has(key)) {
          this.inlineStyles.set(key, new Set());
        }
        this.inlineStyles.get(key).add(value);
      });
    });
  }

  // 클래스명 패턴 추출
  extractClassPatterns(content) {
    const classMatches = content.match(/className=["'][^"']*["']/g) || [];
    classMatches.forEach(match => {
      const classes = match.replace(/className=["']/, '').replace(/["']$/, '').split(/\s+/);
      classes.forEach(cls => {
        if (cls) this.classNames.add(cls);
      });
    });
  }

  // 컴포넌트 분석
  analyzeComponent(filePath, content) {
    const componentName = path.basename(filePath, '.tsx');
    const analysis = {
      file: filePath,
      colors: [],
      patterns: [],
      complexity: 0
    };

    // 색상 추출
    const componentColors = [...content.matchAll(/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/g)]
      .map(match => match[0].toLowerCase());
    analysis.colors = [...new Set(componentColors)];

    // 복잡도 계산 (클래스 수 기준)
    const classCount = (content.match(/className=/g) || []).length;
    analysis.complexity = classCount;

    // 패턴 식별
    if (content.includes('hover:')) analysis.patterns.push('hover-effects');
    if (content.includes('transition')) analysis.patterns.push('transitions');
    if (content.includes('rounded')) analysis.patterns.push('border-radius');
    if (content.includes('shadow')) analysis.patterns.push('shadows');
    if (content.includes('bg-gradient')) analysis.patterns.push('gradients');

    this.components.set(componentName, analysis);
  }

  // 파일 처리
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      this.extractColors(content);
      this.extractInlineStyles(content);
      this.extractClassPatterns(content);
      this.analyzeComponent(filePath, content);

      console.log(`✓ Processed: ${path.relative(process.cwd(), filePath)}`);
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }

  // 결과 분석
  analyzeResults() {
    // 색상 사용 빈도 분석
    const colorUsage = {};
    for (const [component, analysis] of this.components) {
      analysis.colors.forEach(color => {
        colorUsage[color] = (colorUsage[color] || 0) + 1;
      });
    }

    // 패턴 분석
    const patternUsage = {};
    for (const [component, analysis] of this.components) {
      analysis.patterns.forEach(pattern => {
        patternUsage[pattern] = (patternUsage[pattern] || 0) + 1;
      });
    }

    return {
      totalColors: this.colors.size,
      totalComponents: this.components.size,
      totalClasses: this.classNames.size,
      colorUsage,
      patternUsage,
      mostUsedColors: Object.entries(colorUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      mostUsedPatterns: Object.entries(patternUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }

  // Figma 변수 생성
  generateFigmaVariables() {
    const variables = {};
    let colorIndex = 1;

    // 색상을 카테고리별로 분류
    const categorizedColors = this.categorizeColors([...this.colors]);

    Object.entries(categorizedColors).forEach(([category, colors]) => {
      colors.forEach((color, index) => {
        const varName = `${category}/${index + 1}`;
        variables[varName] = {
          type: 'COLOR',
          value: color,
          description: `Auto-extracted color from codebase`
        };
      });
    });

    return variables;
  }

  // 색상 자동 분류
  categorizeColors(colors) {
    const categories = {
      'Gray Scale': [],
      'Blue Tones': [],
      'Status Colors': [],
      'Brand Colors': [],
      'Others': []
    };

    colors.forEach(color => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // 그레이스케일 판단
      if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
        categories['Gray Scale'].push(color);
      }
      // 블루 톤 판단
      else if (b > r && b > g && (b - Math.max(r, g)) > 30) {
        categories['Blue Tones'].push(color);
      }
      // 상태 색상 (빨강, 초록)
      else if (r > 200 && g < 100 && b < 100) {
        categories['Status Colors'].push(color);
      }
      else if (g > 200 && r < 100 && b < 100) {
        categories['Status Colors'].push(color);
      }
      // 기타
      else {
        categories['Others'].push(color);
      }
    });

    return categories;
  }

  // 보고서 생성
  generateReport() {
    const analysis = this.analyzeResults();
    const figmaVars = this.generateFigmaVariables();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.components.size,
        totalColors: analysis.totalColors,
        totalClasses: analysis.totalClasses,
        uniqueColors: [...this.colors].sort()
      },
      colorAnalysis: {
        usage: analysis.colorUsage,
        topColors: analysis.mostUsedColors,
        categorized: this.categorizeColors([...this.colors])
      },
      patternAnalysis: {
        usage: analysis.patternUsage,
        topPatterns: analysis.mostUsedPatterns
      },
      componentAnalysis: Object.fromEntries(this.components),
      figmaVariables: figmaVars,
      recommendations: this.generateRecommendations(analysis)
    };

    return report;
  }

  // 개선 권장사항 생성
  generateRecommendations(analysis) {
    const recommendations = [];

    // 색상 중복 체크
    if (analysis.totalColors > 20) {
      recommendations.push({
        type: 'warning',
        message: `${analysis.totalColors}개의 색상이 사용되고 있습니다. 디자인 시스템 통합을 고려해보세요.`
      });
    }

    // 인라인 스타일 체크
    if (this.inlineStyles.size > 0) {
      recommendations.push({
        type: 'info',
        message: `${this.inlineStyles.size}개의 인라인 스타일이 발견되었습니다. CSS 변수로 전환을 고려해보세요.`
      });
    }

    // 패턴 일관성 체크
    const inconsistentComponents = [...this.components.values()]
      .filter(comp => comp.patterns.length < 2);

    if (inconsistentComponents.length > 0) {
      recommendations.push({
        type: 'improvement',
        message: `${inconsistentComponents.length}개 컴포넌트에서 일관성 있는 패턴을 더 적용할 수 있습니다.`
      });
    }

    return recommendations;
  }

  // 실행
  async run() {
    console.log('🎨 스타일 추출 시작...\n');

    const sourceDir = path.join(process.cwd(), 'app', 'components');
    const patterns = [
      'app/**/*.tsx',
      'components/**/*.tsx',
      'pages/**/*.tsx'
    ];

    const files = [];
    patterns.forEach(pattern => {
      const found = glob.sync(pattern);
      files.push(...found);
    });

    console.log(`📁 ${files.length}개 파일을 발견했습니다.\n`);

    // 파일 처리
    files.forEach(file => this.processFile(file));

    // 보고서 생성
    const report = this.generateReport();

    // 결과 저장
    const outputDir = path.join(process.cwd(), 'design-system');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'style-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 분석 결과:');
    console.log(`- 총 컴포넌트: ${report.summary.totalFiles}개`);
    console.log(`- 고유 색상: ${report.summary.totalColors}개`);
    console.log(`- 사용된 클래스: ${report.summary.totalClasses}개`);
    console.log(`\n💾 보고서 저장됨: ${reportPath}`);

    // 권장사항 출력
    if (report.recommendations.length > 0) {
      console.log('\n💡 권장사항:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.message}`);
      });
    }

    return report;
  }
}

// 스크립트 실행
if (require.main === module) {
  const extractor = new StyleExtractor();
  extractor.run().catch(console.error);
}

module.exports = StyleExtractor;