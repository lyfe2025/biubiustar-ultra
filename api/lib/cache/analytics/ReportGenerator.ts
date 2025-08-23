/**
 * 缓存报告生成器
 * 负责生成各种格式的缓存分析报告
 */

import { EventEmitter } from 'events';
import { 
  TimeRange, 
  StatisticsSummary, 
  AnomalyDetection, 
  PerformanceTrend,
  CacheEfficiencyAnalysis,
  ComparisonAnalysis
} from './types';
import { CacheInstanceType } from '../../../config/cache';

export interface ReportConfig {
  format: 'json' | 'html' | 'csv' | 'markdown';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
  timeRange: TimeRange;
}

export interface ReportData {
  summary: StatisticsSummary;
  anomalies: AnomalyDetection[];
  trends: PerformanceTrend[];
  efficiency?: CacheEfficiencyAnalysis;
  comparisons?: ComparisonAnalysis[];
  metadata: {
    generatedAt: Date;
    instanceType: CacheInstanceType;
    reportId: string;
  };
}

export class ReportGenerator extends EventEmitter {
  private reportCounter: number = 0;

  constructor() {
    super();
  }

  /**
   * 生成综合报告
   */
  public async generateReport(
    data: ReportData,
    config: ReportConfig
  ): Promise<string> {
    const reportId = this.generateReportId();
    data.metadata.reportId = reportId;
    data.metadata.generatedAt = new Date();

    let report: string;

    switch (config.format) {
      case 'json':
        report = this.generateJsonReport(data, config);
        break;
      case 'html':
        report = this.generateHtmlReport(data, config);
        break;
      case 'csv':
        report = this.generateCsvReport(data, config);
        break;
      case 'markdown':
        report = this.generateMarkdownReport(data, config);
        break;
      default:
        throw new Error(`Unsupported report format: ${config.format}`);
    }

    this.emit('reportGenerated', {
      reportId,
      format: config.format,
      size: report.length,
      instanceType: data.metadata.instanceType
    });

    return report;
  }

  /**
   * 生成JSON格式报告
   */
  private generateJsonReport(data: ReportData, config: ReportConfig): string {
    const reportData = {
      ...data,
      config: {
        format: config.format,
        includeCharts: config.includeCharts,
        includeRecommendations: config.includeRecommendations,
        includeRawData: config.includeRawData,
        timeRange: config.timeRange
      }
    };

    if (!config.includeRawData) {
      // 移除原始数据以减少报告大小
      // 移除原始数据以减少文件大小
      // TODO: 如果需要原始数据，可以在这里处理
    }

    return JSON.stringify(reportData, null, 2);
  }

  /**
   * 生成HTML格式报告
   */
  private generateHtmlReport(data: ReportData, config: ReportConfig): string {
    const { summary, anomalies, trends, efficiency, metadata } = data;
    
    let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>缓存分析报告 - ${metadata.instanceType}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #007bff; margin: 0; }
        .subtitle { color: #666; margin: 5px 0 0 0; }
        .section { margin-bottom: 30px; }
        .section-title { color: #333; border-left: 4px solid #007bff; padding-left: 10px; margin-bottom: 15px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }
        .metric-label { font-weight: bold; color: #666; font-size: 14px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; margin: 5px 0; }
        .metric-trend { font-size: 12px; color: #666; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-stable { color: #6c757d; }
        .anomaly-item { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .anomaly-high { border-left: 4px solid #dc3545; }
        .anomaly-medium { border-left: 4px solid #ffc107; }
        .anomaly-low { border-left: 4px solid #17a2b8; }
        .recommendation { background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .timestamp { color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .chart-placeholder { background: #e9ecef; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 4px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">缓存分析报告</h1>
            <p class="subtitle">实例类型: ${metadata.instanceType} | 报告ID: ${metadata.reportId}</p>
            <p class="timestamp">生成时间: ${metadata.generatedAt.toLocaleString('zh-CN')}</p>
        </div>
`;

    // 概览部分
    html += `
        <div class="section">
            <h2 class="section-title">性能概览</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">命中率</div>
                    <div class="metric-value">${(summary.metrics.hitRate.current * 100).toFixed(1)}%</div>
                     <div class="metric-trend trend-${this.getTrendClass(summary.metrics.hitRate.trend)}">趋势: ${this.getTrendText(summary.metrics.hitRate.trend)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">平均延迟</div>
                    <div class="metric-value">${summary.metrics.latency.average.toFixed(2)}ms</div>
                     <div class="metric-trend trend-stable">趋势: 稳定</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">吞吐量</div>
                    <div class="metric-value">${summary.metrics.throughput.current.toFixed(0)} ops/s</div>
                     <div class="metric-trend trend-${this.getTrendClass(summary.metrics.throughput.trend)}">趋势: ${this.getTrendText(summary.metrics.throughput.trend)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">内存使用率</div>
                    <div class="metric-value">${(summary.metrics.memoryUsage.current * 100).toFixed(1)}%</div>
                    <div class="metric-trend trend-${this.getTrendClass(summary.metrics.memoryUsage.trend)}">趋势: ${this.getTrendText(summary.metrics.memoryUsage.trend)}</div>
                </div>
            </div>
        </div>
`;

    // 异常检测部分
    if (anomalies.length > 0) {
      html += `
        <div class="section">
            <h2 class="section-title">异常检测</h2>
`;
      anomalies.forEach(anomaly => {
        html += `
            <div class="anomaly-item anomaly-${anomaly.severity}">
                <strong>${anomaly.metric}</strong> - ${anomaly.severity.toUpperCase()}
                <p>检测到${anomaly.metric}异常</p>
                <p><strong>检测时间:</strong> ${anomaly.timestamp.toLocaleString('zh-CN')}</p>
                <p><strong>当前值:</strong> ${anomaly.value} | <strong>期望范围:</strong> ${anomaly.expectedRange.min} - ${anomaly.expectedRange.max}</p>
            </div>
`;
      });
      html += `        </div>
`;
    }

    // 性能趋势部分
    if (trends.length > 0) {
      html += `
        <div class="section">
            <h2 class="section-title">性能趋势</h2>
            <table>
                <thead>
                    <tr>
                        <th>指标</th>
                        <th>趋势方向</th>
                        <th>变化率</th>
                        <th>预测值</th>
                        <th>置信度</th>
                    </tr>
                </thead>
                <tbody>
`;
      trends.forEach(trend => {
        html += `
                    <tr>
                        <td>${trend.metric}</td>
                        <td class="trend-${this.getTrendClass(trend.direction)}">${this.getTrendText(trend.direction)}</td>
                        <td>${(trend.changeRate * 100).toFixed(2)}%</td>
                        <td>${trend.prediction?.nextHour?.toFixed(2) || 'N/A'}</td>
                        <td>${(trend.confidence * 100).toFixed(1)}%</td>
                    </tr>
`;
      });
      html += `
                </tbody>
            </table>
        </div>
`;
    }

    // 效率分析部分
    if (efficiency && config.includeRecommendations) {
      html += `
        <div class="section">
            <h2 class="section-title">效率分析</h2>
            <p><strong>时间范围:</strong> ${efficiency.timeRange}</p>
            
            <h3>命中率分析</h3>
            <p>平均命中率: ${(efficiency.hitRateAnalysis.average * 100).toFixed(1)}%</p>
            <p>潜在改进空间: ${(efficiency.hitRateAnalysis.potentialImprovement * 100).toFixed(1)}%</p>
            
            <h3>内存效率</h3>
            <p>内存利用率: ${(efficiency.memoryEfficiency.utilization * 100).toFixed(1)}%</p>
            <p>浪费空间: ${(efficiency.memoryEfficiency.wastedSpace * 100).toFixed(1)}%</p>
            
            <h3>优化建议</h3>
`;
      efficiency.recommendations.forEach(rec => {
        html += `            <div class="recommendation">${rec}</div>
`;
      });
      html += `        </div>
`;
    }

    // 图表占位符
    if (config.includeCharts) {
      html += `
        <div class="section">
            <h2 class="section-title">性能图表</h2>
            <div class="chart-placeholder">
                图表功能需要JavaScript支持，请在实际实现中集成图表库
            </div>
        </div>
`;
    }

    html += `
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * 生成CSV格式报告
   */
  private generateCsvReport(data: ReportData, config: ReportConfig): string {
    const { summary, anomalies, trends } = data;
    
    let csv = 'Report Type,Metric,Value,Trend,Timestamp\n';
    
    // 基本指标
    csv += `Summary,Hit Rate,${(summary.metrics.hitRate.current * 100).toFixed(2)}%,${summary.metrics.hitRate.trend},${data.metadata.generatedAt.toISOString()}\n`;
    csv += `Summary,Average Latency,${summary.metrics.latency.average.toFixed(2)}ms,stable,${data.metadata.generatedAt.toISOString()}\n`;
    csv += `Summary,Throughput,${summary.metrics.throughput.current.toFixed(0)} ops/s,${summary.metrics.throughput.trend},${data.metadata.generatedAt.toISOString()}\n`;
    csv += `Summary,Memory Usage,${(summary.metrics.memoryUsage.current * 100).toFixed(2)}%,${summary.metrics.memoryUsage.trend},${data.metadata.generatedAt.toISOString()}\n`;
    
    // 异常数据
    anomalies.forEach(anomaly => {
      csv += `Anomaly,${anomaly.metric},${anomaly.value},${anomaly.severity},${anomaly.timestamp.toISOString()}\n`;
    });
    
    // 趋势数据
    trends.forEach(trend => {
      csv += `Trend,${trend.metric},${(trend.changeRate * 100).toFixed(2)}%,${trend.direction},${data.metadata.generatedAt.toISOString()}\n`;
    });
    
    return csv;
  }

  /**
   * 生成Markdown格式报告
   */
  private generateMarkdownReport(data: ReportData, config: ReportConfig): string {
    const { summary, anomalies, trends, efficiency, metadata } = data;
    
    let md = `# 缓存分析报告\n\n`;
    md += `**实例类型:** ${metadata.instanceType}\n`;
    md += `**报告ID:** ${metadata.reportId}\n`;
    md += `**生成时间:** ${metadata.generatedAt.toLocaleString('zh-CN')}\n\n`;
    
    // 性能概览
    md += `## 性能概览\n\n`;
    md += `| 指标 | 值 | 趋势 |\n`;
    md += `|------|----|----- |\n`;
    md += `| 命中率 | ${(summary.metrics.hitRate.current * 100).toFixed(1)}% | ${this.getTrendEmoji(summary.metrics.hitRate.trend)} ${this.getTrendText(summary.metrics.hitRate.trend)} |\n`;
    md += `| 平均延迟 | ${summary.metrics.latency.average.toFixed(2)}ms | ${this.getTrendEmoji('stable')} ${this.getTrendText('stable')} |\n`;
    md += `| 吞吐量 | ${summary.metrics.throughput.current.toFixed(0)} ops/s | ${this.getTrendEmoji(summary.metrics.throughput.trend)} ${this.getTrendText(summary.metrics.throughput.trend)} |\n`;
    md += `| 内存使用率 | ${(summary.metrics.memoryUsage.current * 100).toFixed(1)}% | ${this.getTrendEmoji(summary.metrics.memoryUsage.trend)} ${this.getTrendText(summary.metrics.memoryUsage.trend)} |\n\n`;
    
    // 异常检测
    if (anomalies.length > 0) {
      md += `## 异常检测\n\n`;
      anomalies.forEach(anomaly => {
        const severityEmoji = anomaly.severity === 'high' ? '🔴' : anomaly.severity === 'medium' ? '🟡' : '🔵';
        md += `### ${severityEmoji} ${anomaly.metric} - ${anomaly.severity.toUpperCase()}\n\n`;
        md += `检测到${anomaly.metric}异常\n\n`;
        md += `- **检测时间:** ${anomaly.timestamp.toLocaleString('zh-CN')}\n`;
        md += `- **当前值:** ${anomaly.value}\n`;
        md += `- **期望范围:** ${anomaly.expectedRange.min} - ${anomaly.expectedRange.max}\n\n`;
      });
    }
    
    // 性能趋势
    if (trends.length > 0) {
      md += `## 性能趋势\n\n`;
      md += `| 指标 | 趋势方向 | 变化率 | 预测值 | 置信度 |\n`;
      md += `|------|----------|--------|--------|--------|\n`;
      trends.forEach(trend => {
        md += `| ${trend.metric} | ${this.getTrendEmoji(trend.direction)} ${this.getTrendText(trend.direction)} | ${(trend.changeRate * 100).toFixed(2)}% | ${trend.prediction?.nextHour?.toFixed(2) || 'N/A'} | ${(trend.confidence * 100).toFixed(1)}% |\n`;
      });
      md += `\n`;
    }
    
    // 效率分析和建议
    if (efficiency && config.includeRecommendations) {
      md += `## 效率分析\n\n`;
      md += `**时间范围:** ${efficiency.timeRange}\n\n`;
      
      md += `### 命中率分析\n`;
      md += `- 平均命中率: ${(efficiency.hitRateAnalysis.average * 100).toFixed(1)}%\n`;
      md += `- 潜在改进空间: ${(efficiency.hitRateAnalysis.potentialImprovement * 100).toFixed(1)}%\n\n`;
      
      md += `### 内存效率\n`;
      md += `- 内存利用率: ${(efficiency.memoryEfficiency.utilization * 100).toFixed(1)}%\n`;
      md += `- 浪费空间: ${(efficiency.memoryEfficiency.wastedSpace * 100).toFixed(1)}%\n\n`;
      
      md += `### 优化建议\n\n`;
      efficiency.recommendations.forEach(rec => {
        md += `- ${rec}\n`;
      });
      md += `\n`;
    }
    
    return md;
  }

  /**
   * 生成报告ID
   */
  private generateReportId(): string {
    const timestamp = Date.now();
    const counter = ++this.reportCounter;
    return `CACHE_REPORT_${timestamp}_${counter.toString().padStart(3, '0')}`;
  }

  /**
   * 获取趋势CSS类名
   */
  private getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'up';
      case 'down': return 'down';
      default: return 'stable';
    }
  }

  /**
   * 获取趋势文本
   */
  private getTrendText(trend: string): string {
    switch (trend) {
      case 'up': return '上升';
      case 'down': return '下降';
      default: return '稳定';
    }
  }

  /**
   * 获取趋势表情符号
   */
  private getTrendEmoji(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  }

  /**
   * 生成性能对比报告
   */
  public generateComparisonReport(
    baseline: ReportData,
    comparison: ReportData,
    config: ReportConfig
  ): string {
    const reportId = this.generateReportId();
    const timestamp = new Date();

    let report = '';

    switch (config.format) {
      case 'markdown':
        report = this.generateComparisonMarkdown(baseline, comparison, reportId, timestamp);
        break;
      case 'html':
        report = this.generateComparisonHtml(baseline, comparison, reportId, timestamp);
        break;
      case 'json':
        report = JSON.stringify({
          reportId,
          timestamp,
          baseline: baseline.summary,
          comparison: comparison.summary,
          differences: this.calculateDifferences(baseline.summary, comparison.summary)
        }, null, 2);
        break;
      default:
        throw new Error(`Unsupported comparison report format: ${config.format}`);
    }

    this.emit('comparisonReportGenerated', {
      reportId,
      format: config.format,
      baselineInstance: baseline.metadata.instanceType,
      comparisonInstance: comparison.metadata.instanceType
    });

    return report;
  }

  /**
   * 生成对比Markdown报告
   */
  private generateComparisonMarkdown(
    baseline: ReportData,
    comparison: ReportData,
    reportId: string,
    timestamp: Date
  ): string {
    const differences = this.calculateDifferences(baseline.summary, comparison.summary);
    
    let md = `# 缓存性能对比报告\n\n`;
    md += `**报告ID:** ${reportId}\n`;
    md += `**生成时间:** ${timestamp.toLocaleString('zh-CN')}\n\n`;
    
    md += `## 对比概览\n\n`;
    md += `| 指标 | ${baseline.metadata.instanceType} | ${comparison.metadata.instanceType} | 差异 |\n`;
    md += `|------|------------|------------|------|\n`;
    
    Object.entries(differences).forEach(([metric, diff]) => {
      const baseValue = this.getMetricValue(metric, baseline.summary);
      const compValue = this.getMetricValue(metric, comparison.summary);
      const diffText = this.formatDifference(diff);
      md += `| ${this.getMetricDisplayName(metric)} | ${this.formatMetricValue(metric, baseValue)} | ${this.formatMetricValue(metric, compValue)} | ${diffText} |\n`;
    });
    
    return md;
  }

  /**
   * 生成对比HTML报告
   */
  private generateComparisonHtml(
    baseline: ReportData,
    comparison: ReportData,
    reportId: string,
    timestamp: Date
  ): string {
    // 简化的HTML对比报告实现
    return `
<!DOCTYPE html>
<html>
<head>
    <title>缓存性能对比报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .positive { color: green; }
        .negative { color: red; }
    </style>
</head>
<body>
    <h1>缓存性能对比报告</h1>
    <p>报告ID: ${reportId}</p>
    <p>生成时间: ${timestamp.toLocaleString('zh-CN')}</p>
    
    <h2>性能对比</h2>
    <table>
        <tr>
            <th>指标</th>
            <th>${baseline.metadata.instanceType}</th>
            <th>${comparison.metadata.instanceType}</th>
            <th>差异</th>
        </tr>
        <!-- 这里应该填充实际的对比数据 -->
    </table>
</body>
</html>
`;
  }

  /**
   * 计算指标差异
   */
  private calculateDifferences(baseline: StatisticsSummary, comparison: StatisticsSummary): Record<string, number> {
    return {
      hitRate: comparison.metrics.hitRate.current - baseline.metrics.hitRate.current,
      averageLatency: comparison.metrics.latency.average - baseline.metrics.latency.average,
      throughput: comparison.metrics.throughput.current - baseline.metrics.throughput.current,
      memoryUsage: comparison.metrics.memoryUsage.current - baseline.metrics.memoryUsage.current
    };
  }

  /**
   * 获取指标值
   */
  private getMetricValue(metric: string, summary: StatisticsSummary): number {
    switch (metric) {
      case 'hitRate':
        return summary.metrics.hitRate.current;
      case 'averageLatency':
        return summary.metrics.latency.average;
      case 'throughput':
        return summary.metrics.throughput.current;
      case 'memoryUsage':
        return summary.metrics.memoryUsage.current;
      default:
        return 0;
    }
  }

  /**
   * 格式化指标值
   */
  private formatMetricValue(metric: string, value: any): string {
    if (typeof value !== 'number') return 'N/A';
    
    switch (metric) {
      case 'hitRate':
      case 'memoryUsage':
        return `${(value * 100).toFixed(1)}%`;
      case 'averageLatency':
        return `${value.toFixed(1)}ms`;
      case 'throughput':
        return `${value.toFixed(0)} ops/s`;
      default:
        return value.toString();
    }
  }

  /**
   * 格式化差异值
   */
  private formatDifference(diff: number): string {
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)}`;
  }

  /**
   * 获取指标显示名称
   */
  private getMetricDisplayName(metric: string): string {
    const names: Record<string, string> = {
      hitRate: '命中率',
      averageLatency: '平均延迟',
      throughput: '吞吐量',
      memoryUsage: '内存使用率'
    };
    return names[metric] || metric;
  }

  /**
   * 销毁报告生成器
   */
  public destroy(): void {
    this.removeAllListeners();
  }
}