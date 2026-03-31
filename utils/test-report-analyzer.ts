/**
 * Test Report Analyzer
 * 
 * Analyzes Playwright test results and classifies errors by type:
 * - Code Errors: Issues in the generated test code
 * - Web Under Test Errors: Issues from the website being tested (DNS, external resources)
 * - Environment Errors: Infrastructure issues (network, browser)
 * 
 * Features:
 * - Interactive HTML report with Chart.js charts
 * - Error classification with root cause analysis
 * - Detailed recommendations with code examples
 * - Responsive design and modern UI
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export interface ErrorClassification {
  type: 'code' | 'webUnderTest' | 'environment' | 'unknown';
  category: string;
  description: string;
  isExternalResource: boolean;
  rootCause?: string;
  recommendation?: string;
  codeExample?: string;
  documentationLinks?: string[];
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface AnalyzedTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  errorClassification?: ErrorClassification;
  errorMessage?: string;
}

export interface ReportSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  codeErrors: AnalyzedTestResult[];
  webUnderTestErrors: AnalyzedTestResult[];
  environmentErrors: AnalyzedTestResult[];
  unknownErrors: AnalyzedTestResult[];
  passRate: string;
  generatedAt: string;
  projectName?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth?: number;
  }[];
}

export interface Recommendation {
  priority: number;
  title: string;
  description: string;
  actionItems: string[];
  codeExample?: string;
}

// Patterns for classifying errors
const WEB_UNDER_TEST_PATTERNS = [
  { pattern: /ERR_NAME_NOT_RESOLVED/i, category: 'DNS Resolution', description: 'External resource DNS could not be resolved' },
  { pattern: /ERR_CONNECTION_REFUSED/i, category: 'Connection', description: 'Connection refused by external server' },
  { pattern: /ERR_CONNECTION_RESET/i, category: 'Connection', description: 'Connection reset by external server' },
  { pattern: /ERR_TIMED_OUT/i, category: 'Timeout', description: 'External resource request timed out' },
  { pattern: /ERR_BLOCKED_BY_CLIENT/i, category: 'Blocked', description: 'Request blocked by client (ad blocker, etc.)' },
  { pattern: /ERR_CERT_/i, category: 'SSL/Certificate', description: 'SSL certificate error on external resource' },
  { pattern: /Failed to load resource.*net::/i, category: 'Network', description: 'Network error loading external resource' },
  { pattern: /Failed to load resource/i, category: 'Resource', description: 'Failed to load external resource' },
];

const ENVIRONMENT_PATTERNS = [
  { pattern: /browser.*closed/i, category: 'Browser', description: 'Browser was closed unexpectedly' },
  { pattern: /page\.goto.*timeout/i, category: 'Navigation', description: 'Page navigation timeout' },
  { pattern: /execution context was destroyed/i, category: 'Context', description: 'Execution context destroyed' },
];

const CODE_ERROR_PATTERNS = [
  { pattern: /TypeError:/i, category: 'Type Error', description: 'JavaScript type error in test code' },
  { pattern: /ReferenceError:/i, category: 'Reference Error', description: 'Reference to undefined variable' },
  { pattern: /SyntaxError:/i, category: 'Syntax Error', description: 'JavaScript syntax error' },
  { pattern: /AssertionError:/i, category: 'Assertion', description: 'Test assertion failed' },
  { pattern: /expect\(.*\)\.(toBe|toEqual|toContain|toHaveLength)/i, category: 'Assertion', description: 'Test assertion failed' },
  { pattern: /locator.*not found/i, category: 'Selector', description: 'Element selector not found' },
  { pattern: /waiting for locator/i, category: 'Selector', description: 'Timeout waiting for element' },
];

// Error recommendations database with root cause analysis and code examples
const ERROR_RECOMMENDATIONS: Record<string, {
  rootCause: string;
  recommendation: string;
  codeExample?: string;
  documentationLinks: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}> = {
  'Type Error': {
    rootCause: 'El código intenta acceder a una propiedad de un valor undefined/null o usar un tipo incorrecto',
    recommendation: 'Verificar que los selectores retornen elementos antes de interactuar con ellos',
    codeExample: `// Antes
await element.click();

// Después
const element = page.locator('selector');
await expect(element).toBeVisible();
await element.click();`,
    documentationLinks: [
      'https://playwright.dev/docs/api/class-locator',
      'https://playwright.dev/docs/test-assertions'
    ],
    severity: 'high'
  },
  'Reference Error': {
    rootCause: 'Se hace referencia a una variable o función que no está definida en el ámbito actual',
    recommendation: 'Verificar que todas las variables y funciones estén correctamente importadas y definidas',
    codeExample: `// Verificar imports
import { LoginPage } from './pages/login.page';

// Verificar que la variable existe antes de usarla
if (typeof myVariable !== 'undefined') {
  // usar myVariable
}`,
    documentationLinks: [
      'https://playwright.dev/docs/test-imports'
    ],
    severity: 'critical'
  },
  'Syntax Error': {
    rootCause: 'El código contiene errores de sintaxis JavaScript/TypeScript',
    recommendation: 'Revisar el código generado y corregir errores de sintaxis',
    severity: 'critical',
    documentationLinks: []
  },
  'Assertion': {
    rootCause: 'Una aserción en el test ha fallado - el resultado actual no coincide con el esperado',
    recommendation: 'Revisar el valor esperado vs el valor actual, y ajustar la aserción o el código bajo prueba',
    codeExample: `// Usar aserciones más específicas
await expect(page.locator('.status')).toHaveText('Success');

// O usar aserciones suaves para continuar incluso si fallan
await expect.soft(page.locator('.element')).toBeVisible();`,
    documentationLinks: [
      'https://playwright.dev/docs/test-assertions',
      'https://playwright.dev/docs/best-practices'
    ],
    severity: 'high'
  },
  'Selector': {
    rootCause: 'El selector usado no encuentra el elemento en la página',
    recommendation: 'Verificar que el selector sea correcto y que el elemento esté visible',
    codeExample: `// Usar selectores más específicos
const button = page.getByRole('button', { name: 'Submit' });

// O usar data-testid
const element = page.getByTestId('submit-button');

// Esperar a que el elemento esté listo
await expect(element).toBeVisible({ timeout: 10000 });`,
    documentationLinks: [
      'https://playwright.dev/docs/locators',
      'https://playwright.dev/docs/selectors'
    ],
    severity: 'high'
  },
  'DNS Resolution': {
    rootCause: 'La aplicación intenta cargar recursos externos que no pueden resolverse',
    recommendation: 'Configurar el test para ignorar errores de recursos externos no críticos',
    codeExample: `// playwright.config.ts
export default defineConfig({
  use: {
    ignoreHTTPSErrors: true,
  },
});

// En el test, ignorar errores de consola específicos
page.on('console', msg => {
  if (msg.type() === 'error' && msg.text().includes('ERR_NAME_NOT_RESOLVED')) {
    return; // Ignorar
  }
});`,
    documentationLinks: [
      'https://playwright.dev/docs/test-configuration'
    ],
    severity: 'low'
  },
  'Connection': {
    rootCause: 'Error de conexión a recursos externos (servidor no disponible, firewall, etc.)',
    recommendation: 'Verificar conectividad de red y configurar timeouts apropiados',
    codeExample: `// Aumentar timeout para recursos lentos
export default defineConfig({
  use: {
    navigationTimeout: 60000,
    actionTimeout: 30000,
  },
});`,
    documentationLinks: [
      'https://playwright.dev/docs/test-configuration#timeouts'
    ],
    severity: 'medium'
  },
  'Timeout': {
    rootCause: 'La operación tardó más tiempo del permitido',
    recommendation: 'Aumentar el timeout o optimizar la operación',
    codeExample: `// Aumentar timeout específico
await page.goto('https://example.com', { timeout: 60000 });

// O configurar globalmente
export default defineConfig({
  use: {
    navigationTimeout: 60000,
  },
});`,
    documentationLinks: [
      'https://playwright.dev/docs/test-configuration#timeouts'
    ],
    severity: 'medium'
  },
  'Blocked': {
    rootCause: 'Request bloqueado por el cliente (ad blocker, configuración del navegador)',
    recommendation: 'Considerar si el recurso es necesario o si se puede ignorar',
    severity: 'low',
    documentationLinks: []
  },
  'SSL/Certificate': {
    rootCause: 'Error de certificado SSL en recurso externo',
    recommendation: 'Configurar ignoreHTTPSErrors si es un entorno de desarrollo',
    codeExample: `// playwright.config.ts
export default defineConfig({
  use: {
    ignoreHTTPSErrors: true,
  },
});`,
    documentationLinks: [
      'https://playwright.dev/docs/test-configuration'
    ],
    severity: 'low'
  },
  'Network': {
    rootCause: 'Error de red al cargar recursos externos',
    recommendation: 'Verificar conectividad y considerar reintentos',
    severity: 'medium',
    documentationLinks: []
  },
  'Resource': {
    rootCause: 'Recurso externo no pudo ser cargado',
    recommendation: 'Verificar que el recurso exista y sea accesible',
    severity: 'low',
    documentationLinks: []
  },
  'Browser': {
    rootCause: 'El navegador se cerró inesperadamente durante la ejecución',
    recommendation: 'Verificar recursos del sistema y configuración del navegador',
    severity: 'high',
    documentationLinks: []
  },
  'Navigation': {
    rootCause: 'Timeout durante la navegación a una página',
    recommendation: 'Aumentar timeout de navegación o verificar que la URL sea correcta',
    codeExample: `// Aumentar timeout de navegación
await page.goto('https://example.com', { 
  timeout: 60000,
  waitUntil: 'domcontentloaded' 
});`,
    documentationLinks: [
      'https://playwright.dev/docs/api/class-page#page-goto'
    ],
    severity: 'medium'
  },
  'Context': {
    rootCause: 'El contexto de ejecución fue destruido (navegación durante operación)',
    recommendation: 'Evitar operaciones concurrentes que causen navegación',
    severity: 'medium',
    documentationLinks: []
  },
  'Unknown': {
    rootCause: 'No se pudo determinar la causa del error',
    recommendation: 'Revisar manualmente el mensaje de error completo',
    severity: 'medium',
    documentationLinks: []
  }
};

/**
 * Enhances error classification with recommendations
 */
export function enhanceErrorClassification(classification: ErrorClassification): ErrorClassification {
  const recommendation = ERROR_RECOMMENDATIONS[classification.category];
  if (recommendation) {
    return {
      ...classification,
      rootCause: recommendation.rootCause,
      recommendation: recommendation.recommendation,
      codeExample: recommendation.codeExample,
      documentationLinks: recommendation.documentationLinks,
      severity: recommendation.severity
    };
  }
  return {
    ...classification,
    rootCause: 'Unknown root cause',
    recommendation: 'Review the error message and investigate manually',
    severity: 'medium'
  };
}

/**
 * Classifies an error message into a category
 */
export function classifyError(errorMessage: string): ErrorClassification {
  // Check for web under test errors
  for (const { pattern, category, description } of WEB_UNDER_TEST_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return enhanceErrorClassification({
        type: 'webUnderTest',
        category,
        description,
        isExternalResource: true
      });
    }
  }

  // Check for environment errors
  for (const { pattern, category, description } of ENVIRONMENT_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return enhanceErrorClassification({
        type: 'environment',
        category,
        description,
        isExternalResource: false
      });
    }
  }

  // Check for code errors
  for (const { pattern, category, description } of CODE_ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return enhanceErrorClassification({
        type: 'code',
        category,
        description,
        isExternalResource: false
      });
    }
  }

  // Default to unknown
  return enhanceErrorClassification({
    type: 'unknown',
    category: 'Unknown',
    description: 'Could not classify error',
    isExternalResource: false
  });
}

/**
 * Analyzes a Playwright results.json file
 */
export function analyzeResults(resultsPath: string): ReportSummary {
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  
  const analyzedResults: AnalyzedTestResult[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  function processSuite(suite: any, parentTitle: string = '') {
    const currentTitle = suite.title || '';
    const fullTitle = parentTitle ? `${parentTitle} > ${currentTitle}` : currentTitle;
    
    // Process specs at this level (these have tests)
    if (suite.specs && suite.specs.length > 0) {
      for (const spec of suite.specs) {
        if (spec.tests && spec.tests.length > 0) {
          for (const test of spec.tests) {
            // Get the latest result (after retries)
            const allResults = test.results || [];
            const latestResult = allResults[allResults.length - 1] || {};
            const status = latestResult.status || test.status || 'unknown';
            
            const analyzed: AnalyzedTestResult = {
              testName: spec.title || 'Unknown Test',
              status: status as 'passed' | 'failed' | 'skipped'
            };

            if (status === 'passed') {
              passed++;
            } else if (status === 'failed') {
              failed++;
              const errorMessage = latestResult?.error?.message || latestResult?.errors?.[0]?.message || '';
              analyzed.errorMessage = errorMessage;
              analyzed.errorClassification = classifyError(errorMessage);
            } else if (status === 'skipped') {
              skipped++;
            }

            analyzedResults.push(analyzed);
          }
        }
      }
    }
    
    // Recursively process nested suites
    if (suite.suites && suite.suites.length > 0) {
      for (const nestedSuite of suite.suites) {
        processSuite(nestedSuite, fullTitle);
      }
    }
  }

  // Process all top-level suites
  for (const suite of results.suites || []) {
    processSuite(suite);
  }

  // Categorize errors
  const codeErrors = analyzedResults.filter(r => r.errorClassification?.type === 'code');
  const webUnderTestErrors = analyzedResults.filter(r => r.errorClassification?.type === 'webUnderTest');
  const environmentErrors = analyzedResults.filter(r => r.errorClassification?.type === 'environment');
  const unknownErrors = analyzedResults.filter(r => r.errorClassification?.type === 'unknown');

  const totalTests = passed + failed + skipped;
  const passRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : '0.0';

  return {
    totalTests,
    passed,
    failed,
    skipped,
    codeErrors,
    webUnderTestErrors,
    environmentErrors,
    unknownErrors,
    passRate,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates chart data for Chart.js
 */
export function generateChartData(summary: ReportSummary): { resultsChart: ChartData; errorsChart: ChartData } {
  // Results distribution chart (doughnut)
  const resultsChart: ChartData = {
    labels: ['Passed', 'Failed', 'Skipped'],
    datasets: [{
      data: [summary.passed, summary.failed, summary.skipped],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderColor: ['#059669', '#DC2626', '#D97706'],
      borderWidth: 2
    }]
  };

  // Error types chart (bar)
  const errorsChart: ChartData = {
    labels: ['Code Errors', 'Web Under Test', 'Environment', 'Unknown'],
    datasets: [{
      data: [
        summary.codeErrors.length,
        summary.webUnderTestErrors.length,
        summary.environmentErrors.length,
        summary.unknownErrors.length
      ],
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#6B7280'],
      borderColor: ['#DC2626', '#D97706', '#2563EB', '#4B5563'],
      borderWidth: 1
    }]
  };

  return { resultsChart, errorsChart };
}

/**
 * Generates overall recommendations based on the analysis
 */
export function generateOverallRecommendations(summary: ReportSummary): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Code errors recommendations
  if (summary.codeErrors.length > 0) {
    const categories = [...new Set(summary.codeErrors.map(e => e.errorClassification?.category))];
    recommendations.push({
      priority: 1,
      title: 'Fix Code Errors',
      description: `${summary.codeErrors.length} code error(s) require attention. Categories: ${categories.join(', ')}`,
      actionItems: [
        'Review each code error and fix the underlying issue',
        'Ensure all selectors are valid and elements exist',
        'Check for proper async/await usage',
        'Verify all imports are correct'
      ],
      codeExample: `// Example: Fix selector issues
const element = page.getByTestId('my-element');
await expect(element).toBeVisible();
await element.click();`
    });
  }

  // Web under test errors recommendations
  if (summary.webUnderTestErrors.length > 0) {
    recommendations.push({
      priority: 2,
      title: 'Configure External Resource Handling',
      description: `${summary.webUnderTestErrors.length} external resource error(s) detected. These are typically not critical.`,
      actionItems: [
        'Consider ignoring external resource errors in test configuration',
        'Add console error filtering for known external issues',
        'Report issues to website maintainers if applicable'
      ],
      codeExample: `// playwright.config.ts
export default defineConfig({
  use: {
    ignoreHTTPSErrors: true,
  },
});

// Filter console errors in tests
page.on('console', msg => {
  if (msg.type() === 'error' && msg.text().includes('external-resource')) {
    return; // Ignore known external errors
  }
});`
    });
  }

  // Environment errors recommendations
  if (summary.environmentErrors.length > 0) {
    recommendations.push({
      priority: 2,
      title: 'Review Environment Configuration',
      description: `${summary.environmentErrors.length} environment error(s) detected.`,
      actionItems: [
        'Check network connectivity',
        'Verify browser installation',
        'Review timeout configurations',
        'Check system resources'
      ]
    });
  }

  // Pass rate recommendations
  const passRateNum = parseFloat(summary.passRate);
  if (passRateNum < 50) {
    recommendations.push({
      priority: 1,
      title: 'Critical: Low Pass Rate',
      description: `Pass rate is only ${summary.passRate}%. Immediate attention required.`,
      actionItems: [
        'Review all failed tests',
        'Check for environment issues',
        'Verify test data and fixtures',
        'Consider running tests in headed mode for debugging'
      ]
    });
  } else if (passRateNum < 80) {
    recommendations.push({
      priority: 2,
      title: 'Improve Pass Rate',
      description: `Pass rate is ${summary.passRate}%. Consider reviewing failed tests.`,
      actionItems: [
        'Review failed tests systematically',
        'Fix code errors first',
        'Then address environment issues'
      ]
    });
  } else if (passRateNum === 100) {
    recommendations.push({
      priority: 3,
      title: 'All Tests Passed!',
      description: 'Excellent! All tests are passing. Consider adding more test coverage.',
      actionItems: [
        'Review test coverage',
        'Add edge case tests',
        'Consider performance testing'
      ]
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Generates an interactive HTML report from the analysis
 */
export function generateHTMLReport(summary: ReportSummary): string {
  const { resultsChart, errorsChart } = generateChartData(summary);
  const recommendations = generateOverallRecommendations(summary);
  
  const escapeHtml = (str: string) => str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');

  const formatCode = (code: string | undefined) => {
    if (!code) return '';
    return `<pre class="code-example"><code>${escapeHtml(code)}</code></pre>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${summary.projectName || 'Project'}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e2e8f0;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 1px solid #334155;
            margin-bottom: 30px;
        }
        
        h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .metadata {
            color: #94a3b8;
            font-size: 0.9rem;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            border: 1px solid #334155;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .card-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .card-label {
            color: #94a3b8;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .card.total .card-value { color: #60a5fa; }
        .card.passed .card-value { color: #10b981; }
        .card.failed .card-value { color: #ef4444; }
        .card.skipped .card-value { color: #f59e0b; }
        .card.rate .card-value { color: #a78bfa; }
        
        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 12px;
            padding: 25px;
            border: 1px solid #334155;
        }
        
        .chart-container h3 {
            margin-bottom: 20px;
            color: #e2e8f0;
        }
        
        .chart-wrapper {
            position: relative;
            height: 300px;
        }
        
        .errors-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #334155;
        }
        
        .error-group {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid #334155;
            overflow: hidden;
        }
        
        .error-group-header {
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(51, 65, 85, 0.5);
            transition: background 0.2s;
        }
        
        .error-group-header:hover {
            background: rgba(51, 65, 85, 0.8);
        }
        
        .error-group-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .error-count {
            background: #ef4444;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
        }
        
        .error-group.web .error-count { background: #f59e0b; }
        .error-group.env .error-count { background: #3b82f6; }
        .error-group.unknown .error-count { background: #6b7280; }
        
        .error-group-content {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        
        .error-group-content.expanded {
            max-height: 2000px;
            padding: 20px;
        }
        
        .error-item {
            background: rgba(15, 23, 42, 0.5);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #ef4444;
        }
        
        .error-item.web { border-left-color: #f59e0b; }
        .error-item.env { border-left-color: #3b82f6; }
        .error-item.unknown { border-left-color: #6b7280; }
        
        .error-name {
            font-weight: bold;
            margin-bottom: 10px;
            color: #f8fafc;
        }
        
        .error-details {
            display: grid;
            gap: 8px;
            font-size: 0.9rem;
        }
        
        .error-detail {
            display: flex;
            gap: 10px;
        }
        
        .error-detail-label {
            color: #94a3b8;
            min-width: 100px;
        }
        
        .error-detail-value {
            color: #e2e8f0;
        }
        
        .error-message {
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.85rem;
            margin-top: 10px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }
        
        .code-example {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
            overflow-x: auto;
        }
        
        .code-example code {
            font-family: 'Fira Code', 'Consolas', monospace;
            font-size: 0.85rem;
            color: #a5f3fc;
        }
        
        .doc-links {
            margin-top: 10px;
        }
        
        .doc-links a {
            color: #60a5fa;
            text-decoration: none;
            margin-right: 15px;
            font-size: 0.85rem;
        }
        
        .doc-links a:hover {
            text-decoration: underline;
        }
        
        .recommendations-section {
            margin-bottom: 30px;
        }
        
        .recommendation-item {
            background: rgba(30, 41, 59, 0.8);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border: 1px solid #334155;
            border-left: 4px solid #60a5fa;
        }
        
        .recommendation-item.priority-1 {
            border-left-color: #ef4444;
        }
        
        .recommendation-item.priority-2 {
            border-left-color: #f59e0b;
        }
        
        .recommendation-item.priority-3 {
            border-left-color: #10b981;
        }
        
        .recommendation-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
        }
        
        .recommendation-description {
            color: #94a3b8;
            margin-bottom: 15px;
        }
        
        .action-items {
            list-style: none;
        }
        
        .action-items li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .action-items li::before {
            content: '\\2192';
            position: absolute;
            left: 0;
            color: #60a5fa;
        }
        
        .expand-icon {
            transition: transform 0.3s;
        }
        
        .expand-icon.rotated {
            transform: rotate(180deg);
        }
        
        .severity-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            text-transform: uppercase;
            margin-left: 10px;
        }
        
        .severity-critical { background: #ef4444; }
        .severity-high { background: #f59e0b; }
        .severity-medium { background: #3b82f6; }
        .severity-low { background: #6b7280; }
        
        .no-errors {
            text-align: center;
            padding: 40px;
            color: #10b981;
            font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
            
            .summary-cards {
                grid-template-columns: repeat(2, 1fr);
            }
            
            h1 {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>&#129514; Test Execution Report</h1>
            <div class="metadata">
                <strong>Generated:</strong> ${summary.generatedAt}<br>
                ${summary.projectName ? `<strong>Project:</strong> ${summary.projectName}` : ''}
            </div>
        </header>
        
        <section class="summary-cards">
            <div class="card total">
                <div class="card-value">${summary.totalTests}</div>
                <div class="card-label">Total Tests</div>
            </div>
            <div class="card passed">
                <div class="card-value">${summary.passed}</div>
                <div class="card-label">&#9989; Passed</div>
            </div>
            <div class="card failed">
                <div class="card-value">${summary.failed}</div>
                <div class="card-label">&#10060; Failed</div>
            </div>
            <div class="card skipped">
                <div class="card-value">${summary.skipped}</div>
                <div class="card-label">&#9197; Skipped</div>
            </div>
            <div class="card rate">
                <div class="card-value">${summary.passRate}%</div>
                <div class="card-label">Pass Rate</div>
            </div>
        </section>
        
        <section class="charts-section">
            <div class="chart-container">
                <h3>&#128202; Test Results Distribution</h3>
                <div class="chart-wrapper">
                    <canvas id="resultsChart"></canvas>
                </div>
            </div>
            <div class="chart-container">
                <h3>&#128200; Error Classification</h3>
                <div class="chart-wrapper">
                    <canvas id="errorsChart"></canvas>
                </div>
            </div>
        </section>
        
        <section class="errors-section">
            <h2 class="section-title">&#128269; Error Details</h2>
            
            ${summary.codeErrors.length > 0 ? `
            <div class="error-group">
                <div class="error-group-header" onclick="toggleGroup(this)">
                    <div class="error-group-title">
                        <span>&#10060; Code Errors</span>
                        <span class="error-count">${summary.codeErrors.length}</span>
                    </div>
                    <span class="expand-icon">&#9660;</span>
                </div>
                <div class="error-group-content">
                    ${summary.codeErrors.map(error => `
                        <div class="error-item">
                            <div class="error-name">${escapeHtml(error.testName)}</div>
                            <div class="error-details">
                                <div class="error-detail">
                                    <span class="error-detail-label">Category:</span>
                                    <span class="error-detail-value">${error.errorClassification?.category || 'Unknown'}</span>
                                    ${error.errorClassification?.severity ? `<span class="severity-badge severity-${error.errorClassification.severity}">${error.errorClassification.severity}</span>` : ''}
                                </div>
                                <div class="error-detail">
                                    <span class="error-detail-label">Root Cause:</span>
                                    <span class="error-detail-value">${error.errorClassification?.rootCause || 'Unknown'}</span>
                                </div>
                                <div class="error-detail">
                                    <span class="error-detail-label">Recommendation:</span>
                                    <span class="error-detail-value">${error.errorClassification?.recommendation || 'Review the error'}</span>
                                </div>
                            </div>
                            <div class="error-message">${escapeHtml(error.errorMessage?.substring(0, 500) || '')}</div>
                            ${error.errorClassification?.codeExample ? formatCode(error.errorClassification.codeExample) : ''}
                            ${error.errorClassification?.documentationLinks?.length ? `
                                <div class="doc-links">
                                    &#128218; ${error.errorClassification.documentationLinks.map(link => 
                                        `<a href="${link}" target="_blank">${link}</a>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${summary.webUnderTestErrors.length > 0 ? `
            <div class="error-group web">
                <div class="error-group-header" onclick="toggleGroup(this)">
                    <div class="error-group-title">
                        <span>&#9888; Web Under Test Errors</span>
                        <span class="error-count">${summary.webUnderTestErrors.length}</span>
                    </div>
                    <span class="expand-icon">&#9660;</span>
                </div>
                <div class="error-group-content">
                    ${summary.webUnderTestErrors.map(error => `
                        <div class="error-item web">
                            <div class="error-name">${escapeHtml(error.testName)}</div>
                            <div class="error-details">
                                <div class="error-detail">
                                    <span class="error-detail-label">Category:</span>
                                    <span class="error-detail-value">${error.errorClassification?.category || 'Unknown'}</span>
                                </div>
                                <div class="error-detail">
                                    <span class="error-detail-label">Description:</span>
                                    <span class="error-detail-value">${error.errorClassification?.description || 'External resource error'}</span>
                                </div>
                            </div>
                            <div class="error-message">${escapeHtml(error.errorMessage?.substring(0, 300) || '')}</div>
                        </div>
                    `).join('')}
                    <p style="color: #94a3b8; font-style: italic; margin-top: 15px;">
                        &#128161; These errors are typically caused by external resources (CDN, analytics, ads) that are not under your control.
                        Consider filtering these in your test configuration if they are not critical.
                    </p>
                </div>
            </div>
            ` : ''}
            
            ${summary.environmentErrors.length > 0 ? `
            <div class="error-group env">
                <div class="error-group-header" onclick="toggleGroup(this)">
                    <div class="error-group-title">
                        <span>&#127760; Environment Errors</span>
                        <span class="error-count">${summary.environmentErrors.length}</span>
                    </div>
                    <span class="expand-icon">&#9660;</span>
                </div>
                <div class="error-group-content">
                    ${summary.environmentErrors.map(error => `
                        <div class="error-item env">
                            <div class="error-name">${escapeHtml(error.testName)}</div>
                            <div class="error-details">
                                <div class="error-detail">
                                    <span class="error-detail-label">Category:</span>
                                    <span class="error-detail-value">${error.errorClassification?.category || 'Unknown'}</span>
                                </div>
                                <div class="error-detail">
                                    <span class="error-detail-label">Description:</span>
                                    <span class="error-detail-value">${error.errorClassification?.description || 'Environment error'}</span>
                                </div>
                            </div>
                            <div class="error-message">${escapeHtml(error.errorMessage?.substring(0, 300) || '')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${summary.unknownErrors.length > 0 ? `
            <div class="error-group unknown">
                <div class="error-group-header" onclick="toggleGroup(this)">
                    <div class="error-group-title">
                        <span>&#10067; Unclassified Errors</span>
                        <span class="error-count">${summary.unknownErrors.length}</span>
                    </div>
                    <span class="expand-icon">&#9660;</span>
                </div>
                <div class="error-group-content">
                    ${summary.unknownErrors.map(error => `
                        <div class="error-item unknown">
                            <div class="error-name">${escapeHtml(error.testName)}</div>
                            <div class="error-message">${escapeHtml(error.errorMessage?.substring(0, 500) || '')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${summary.failed === 0 ? `
            <div class="no-errors">
                &#9989; All tests passed! No errors to display.
            </div>
            ` : ''}
        </section>
        
        <section class="recommendations-section">
            <h2 class="section-title">&#128161; Recommendations</h2>
            ${recommendations.map(rec => `
                <div class="recommendation-item priority-${rec.priority}">
                    <div class="recommendation-title">
                        ${rec.priority === 1 ? '&#128308;' : rec.priority === 2 ? '&#128993;' : '&#128994;'} ${rec.title}
                    </div>
                    <div class="recommendation-description">${rec.description}</div>
                    <ul class="action-items">
                        ${rec.actionItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    ${rec.codeExample ? formatCode(rec.codeExample) : ''}
                </div>
            `).join('')}
        </section>
    </div>
    
    <script>
        // Chart.js configuration
        const chartColors = {
            passed: '#10B981',
            failed: '#EF4444',
            skipped: '#F59E0B',
            code: '#EF4444',
            webUnderTest: '#F59E0B',
            environment: '#3B82F6',
            unknown: '#6B7280'
        };
        
        // Results Chart (Doughnut)
        const resultsCtx = document.getElementById('resultsChart').getContext('2d');
        new Chart(resultsCtx, {
            type: 'doughnut',
            data: ${JSON.stringify(resultsChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 20
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        // Errors Chart (Bar)
        const errorsCtx = document.getElementById('errorsChart').getContext('2d');
        new Chart(errorsCtx, {
            type: 'bar',
            data: ${JSON.stringify(errorsChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 1
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Toggle error groups
        function toggleGroup(header) {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.expand-icon');
            
            content.classList.toggle('expanded');
            icon.classList.toggle('rotated');
        }
        
        // Expand all groups by default if there are few errors
        document.addEventListener('DOMContentLoaded', () => {
            const totalErrors = ${summary.failed};
            if (totalErrors <= 5) {
                document.querySelectorAll('.error-group-content').forEach(content => {
                    content.classList.add('expanded');
                });
                document.querySelectorAll('.expand-icon').forEach(icon => {
                    icon.classList.add('rotated');
                });
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generates a markdown report from the analysis
 */
export function generateMarkdownReport(summary: ReportSummary): string {
  const lines: string[] = [
    '# Test Execution Report',
    '',
    `**Generated:** ${summary.generatedAt}`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Tests | ${summary.totalTests} |`,
    `| &#9989; Passed | ${summary.passed} |`,
    `| &#10060; Failed | ${summary.failed} |`,
    `| &#9197; Skipped | ${summary.skipped} |`,
    `| Pass Rate | ${summary.passRate}% |`,
    ''
  ];

  // Code Errors Section
  if (summary.codeErrors.length > 0) {
    lines.push('## &#10060; Code Errors (Require Attention)', '');
    lines.push('These errors are in the generated test code and need to be fixed:');
    lines.push('');
    for (const error of summary.codeErrors) {
      lines.push(`### ${error.testName}`);
      lines.push('');
      lines.push(`- **Category:** ${error.errorClassification?.category}`);
      lines.push(`- **Description:** ${error.errorClassification?.description}`);
      lines.push(`- **Root Cause:** ${error.errorClassification?.rootCause || 'Unknown'}`);
      lines.push(`- **Recommendation:** ${error.errorClassification?.recommendation || 'Review the error'}`);
      lines.push(`- **Error:** \`${error.errorMessage?.substring(0, 200)}\``);
      lines.push('');
    }
  }

  // Web Under Test Errors Section
  if (summary.webUnderTestErrors.length > 0) {
    lines.push('## &#9888; Web Under Test Errors (External)', '');
    lines.push('These errors are caused by the website being tested, not by the test code:');
    lines.push('');
    for (const error of summary.webUnderTestErrors) {
      lines.push(`### ${error.testName}`);
      lines.push('');
      lines.push(`- **Category:** ${error.errorClassification?.category}`);
      lines.push(`- **Description:** ${error.errorClassification?.description}`);
      lines.push(`- **Error:** \`${error.errorMessage?.substring(0, 200)}\``);
      lines.push('');
    }
    lines.push('> **Note:** These errors are typically caused by external resources (CDN, analytics, ads) that are not under your control. Consider filtering these in your test configuration if they are not critical.');
    lines.push('');
  }

  // Environment Errors Section
  if (summary.environmentErrors.length > 0) {
    lines.push('## &#127760; Environment Errors', '');
    lines.push('These errors are related to the test environment infrastructure:');
    lines.push('');
    for (const error of summary.environmentErrors) {
      lines.push(`### ${error.testName}`);
      lines.push('');
      lines.push(`- **Category:** ${error.errorClassification?.category}`);
      lines.push(`- **Description:** ${error.errorClassification?.description}`);
      lines.push(`- **Error:** \`${error.errorMessage?.substring(0, 200)}\``);
      lines.push('');
    }
  }

  // Unknown Errors Section
  if (summary.unknownErrors.length > 0) {
    lines.push('## &#10067; Unclassified Errors', '');
    lines.push('These errors could not be automatically classified:');
    lines.push('');
    for (const error of summary.unknownErrors) {
      lines.push(`### ${error.testName}`);
      lines.push('');
      lines.push(`- **Error:** \`${error.errorMessage?.substring(0, 300)}\``);
      lines.push('');
    }
  }

  // Recommendations
  const recommendations = generateOverallRecommendations(summary);
  lines.push('## Recommendations', '');
  for (const rec of recommendations) {
    lines.push(`${rec.priority}. **${rec.title}**: ${rec.description}`);
    for (const item of rec.actionItems) {
      lines.push(`   - ${item}`);
    }
  }

  return lines.join('\n');
}

/**
 * Main function to run the analysis
 */
export function runAnalysis(resultsPath?: string, outputPath?: string): ReportSummary {
  const defaultResultsPath = path.join(process.cwd(), 'playwright-report', 'results.json');
  const reportsDir = path.join(process.cwd(), 'reports');
  const defaultOutputPath = path.join(reportsDir, 'test-report-summary.md');
  const defaultHtmlPath = path.join(reportsDir, 'test-report.html');

  const resultsFile = resultsPath || defaultResultsPath;
  const outputFile = outputPath || defaultOutputPath;

  if (!fs.existsSync(resultsFile)) {
    console.warn(`[test-report-analyzer] Results file not found: ${resultsFile}`);
    console.warn('Run your tests first to generate the results file.');
    return { totalTests: 0, passed: 0, failed: 0, skipped: 0, codeErrors: [], webUnderTestErrors: [], environmentErrors: [], unknownErrors: [], passRate: '0', generatedAt: new Date().toISOString() };
  }

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  console.log('Analyzing test results...');
  const summary = analyzeResults(resultsFile);

  // Generate Markdown report
  const markdown = generateMarkdownReport(summary);
  fs.writeFileSync(outputFile, markdown, 'utf-8');

  // Generate HTML report
  const html = generateHTMLReport(summary);
  fs.writeFileSync(defaultHtmlPath, html, 'utf-8');

  console.log('\n=== Test Report Summary ===');
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Pass Rate: ${summary.passRate}%`);
  console.log(`\nCode Errors: ${summary.codeErrors.length}`);
  console.log(`Web Under Test Errors: ${summary.webUnderTestErrors.length}`);
  console.log(`Environment Errors: ${summary.environmentErrors.length}`);
  console.log(`\nMarkdown Report: ${outputFile}`);
  console.log(`HTML Report: ${defaultHtmlPath}`);
  console.log('===========================\n');

  return summary;
}

// Run if executed directly (not imported as a module)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAnalysis();
}
