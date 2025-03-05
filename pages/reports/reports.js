// pages/reports/reports.js
// 引入图表组件
import * as echarts from '../../ec-canvas/echarts';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'weekly',
    weekStart: '',
    weekEnd: '',
    currentYear: 0,
    currentMonth: 0,
    
    // 图表配置
    bloodPressureEc: {
      lazyLoad: true
    },
    weightEc: {
      lazyLoad: true
    },
    stoolEc: {
      lazyLoad: true
    },
    monthlyBloodPressureEc: {
      lazyLoad: true
    },
    monthlyWeightEc: {
      lazyLoad: true
    },
    
    // 数据
    bloodPressureData: [],
    weightData: [],
    stoolData: [],
    medicationData: [],
    
    // 月度数据
    monthlyBloodPressureData: [],
    monthlyWeightData: [],
    
    // 统计数据
    bloodPressureStats: {
      avgSystolic: 0,
      avgDiastolic: 0,
      maxSystolic: 0,
      maxDiastolic: 0,
      minSystolic: 0,
      minDiastolic: 0
    },
    weightStats: {
      avgWeight: 0,
      maxWeight: 0,
      minWeight: 0
    },
    stoolStats: {
      totalCount: 0,
      normalCount: 0,
      abnormalCount: 0
    },
    
    // 月度统计
    monthlyStats: {
      bloodPressureCount: 0,
      weightCount: 0,
      stoolCount: 0,
      medicationCount: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化日期范围
    this.initDateRange();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 加载数据
    this.loadData();
    
    // 更新自定义tabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  /**
   * 初始化日期范围
   */
  initDateRange: function() {
    const now = new Date();
    
    // 设置周报告的日期范围
    const weekStart = this.getWeekStartDate(now);
    const weekEnd = this.getWeekEndDate(now);
    
    this.setData({
      weekStart: this.formatDate(weekStart),
      weekEnd: this.formatDate(weekEnd),
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    });
  },

  /**
   * 获取周的开始日期（周一）
   */
  getWeekStartDate: function(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  },

  /**
   * 获取周的结束日期（周日）
   */
  getWeekEndDate: function(date) {
    const weekStart = this.getWeekStartDate(new Date(date));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  },

  /**
   * 格式化日期
   */
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * 切换标签页
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    this.setData({
      activeTab: tab
    });
    
    // 加载对应标签页的数据
    this.loadData();
  },

  /**
   * 上一周
   */
  prevWeek: function() {
    const weekStart = new Date(this.data.weekStart);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekEnd = this.getWeekEndDate(weekStart);
    
    this.setData({
      weekStart: this.formatDate(weekStart),
      weekEnd: this.formatDate(weekEnd)
    });
    
    this.loadData();
  },

  /**
   * 下一周
   */
  nextWeek: function() {
    const weekStart = new Date(this.data.weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
    
    const weekEnd = this.getWeekEndDate(weekStart);
    
    this.setData({
      weekStart: this.formatDate(weekStart),
      weekEnd: this.formatDate(weekEnd)
    });
    
    this.loadData();
  },

  /**
   * 上一月
   */
  prevMonth: function() {
    let { currentYear, currentMonth } = this.data;
    
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    
    this.setData({
      currentYear,
      currentMonth
    });
    
    this.loadData();
  },

  /**
   * 下一月
   */
  nextMonth: function() {
    let { currentYear, currentMonth } = this.data;
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    
    this.setData({
      currentYear,
      currentMonth
    });
    
    this.loadData();
  },

  /**
   * 加载数据
   */
  loadData: function() {
    const { activeTab } = this.data;
    
    if (activeTab === 'weekly') {
      this.loadWeeklyData();
    } else if (activeTab === 'monthly') {
      this.loadMonthlyData();
    }
  },

  /**
   * 加载周报告数据
   */
  loadWeeklyData: function() {
    const { weekStart, weekEnd } = this.data;
    const startDate = new Date(weekStart).getTime();
    const endDate = new Date(weekEnd).getTime() + 24 * 60 * 60 * 1000 - 1; // 包含结束日期的整天
    
    // 加载血压数据
    const bloodPressureRecords = wx.getStorageSync('bloodPressureRecords') || [];
    const filteredBloodPressureRecords = bloodPressureRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理血压数据
    const bloodPressureData = filteredBloodPressureRecords.map(record => {
      const date = new Date(record.timestamp);
      return {
        date: this.formatDate(date),
        systolic: record.systolic,
        diastolic: record.diastolic
      };
    });
    
    // 计算血压统计数据
    const bloodPressureStats = this.calculateBloodPressureStats(filteredBloodPressureRecords);
    
    // 加载体重数据
    const weightRecords = wx.getStorageSync('weightRecords') || [];
    const filteredWeightRecords = weightRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理体重数据
    const weightData = filteredWeightRecords.map(record => {
      const date = new Date(record.timestamp);
      return {
        date: this.formatDate(date),
        weight: record.weight
      };
    });
    
    // 计算体重统计数据
    const weightStats = this.calculateWeightStats(filteredWeightRecords);
    
    // 加载大便记录
    const stoolRecords = wx.getStorageSync('stoolRecords') || [];
    const filteredStoolRecords = stoolRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理大便数据
    const stoolData = filteredStoolRecords.map(record => {
      const date = new Date(record.timestamp);
      return {
        date: this.formatDate(date),
        type: record.type
      };
    });
    
    // 计算大便统计数据
    const stoolStats = this.calculateStoolStats(filteredStoolRecords);
    
    // 加载用药记录
    const medicationRecords = wx.getStorageSync('medicationRecords') || [];
    const filteredMedicationRecords = medicationRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理用药数据
    const medicationData = this.processMedicationData(filteredMedicationRecords);
    
    // 更新数据
    this.setData({
      bloodPressureData,
      weightData,
      stoolData,
      medicationData,
      bloodPressureStats,
      weightStats,
      stoolStats
    });
    
    // 初始化图表
    this.initBloodPressureChart();
    this.initWeightChart();
    this.initStoolChart();
  },

  /**
   * 加载月报告数据
   */
  loadMonthlyData: function() {
    const { currentYear, currentMonth } = this.data;
    
    // 计算月份的开始和结束时间
    const startDate = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999).getTime();
    
    // 加载血压数据
    const bloodPressureRecords = wx.getStorageSync('bloodPressureRecords') || [];
    const filteredBloodPressureRecords = bloodPressureRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理血压数据
    const monthlyBloodPressureData = filteredBloodPressureRecords.map(record => {
      const date = new Date(record.timestamp);
      return {
        date: this.formatDate(date),
        systolic: record.systolic,
        diastolic: record.diastolic
      };
    });
    
    // 加载体重数据
    const weightRecords = wx.getStorageSync('weightRecords') || [];
    const filteredWeightRecords = weightRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 处理体重数据
    const monthlyWeightData = filteredWeightRecords.map(record => {
      const date = new Date(record.timestamp);
      return {
        date: this.formatDate(date),
        weight: record.weight
      };
    });
    
    // 加载大便记录
    const stoolRecords = wx.getStorageSync('stoolRecords') || [];
    const filteredStoolRecords = stoolRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 加载用药记录
    const medicationRecords = wx.getStorageSync('medicationRecords') || [];
    const filteredMedicationRecords = medicationRecords.filter(record => {
      return record.timestamp >= startDate && record.timestamp <= endDate;
    });
    
    // 更新月度统计数据
    const monthlyStats = {
      bloodPressureCount: filteredBloodPressureRecords.length,
      weightCount: filteredWeightRecords.length,
      stoolCount: filteredStoolRecords.length,
      medicationCount: filteredMedicationRecords.length
    };
    
    // 更新数据
    this.setData({
      monthlyBloodPressureData,
      monthlyWeightData,
      monthlyStats
    });
    
    // 初始化月度图表
    this.initMonthlyBloodPressureChart();
    this.initMonthlyWeightChart();
  },

  /**
   * 计算血压统计数据
   */
  calculateBloodPressureStats: function(records) {
    if (records.length === 0) {
      return {
        avgSystolic: 0,
        avgDiastolic: 0,
        maxSystolic: 0,
        maxDiastolic: 0,
        minSystolic: 0,
        minDiastolic: 0
      };
    }
    
    let totalSystolic = 0;
    let totalDiastolic = 0;
    let maxSystolic = records[0].systolic;
    let maxDiastolic = records[0].diastolic;
    let minSystolic = records[0].systolic;
    let minDiastolic = records[0].diastolic;
    
    records.forEach(record => {
      totalSystolic += record.systolic;
      totalDiastolic += record.diastolic;
      
      maxSystolic = Math.max(maxSystolic, record.systolic);
      maxDiastolic = Math.max(maxDiastolic, record.diastolic);
      
      minSystolic = Math.min(minSystolic, record.systolic);
      minDiastolic = Math.min(minDiastolic, record.diastolic);
    });
    
    return {
      avgSystolic: Math.round(totalSystolic / records.length),
      avgDiastolic: Math.round(totalDiastolic / records.length),
      maxSystolic,
      maxDiastolic,
      minSystolic,
      minDiastolic
    };
  },

  /**
   * 计算体重统计数据
   */
  calculateWeightStats: function(records) {
    if (records.length === 0) {
      return {
        avgWeight: 0,
        maxWeight: 0,
        minWeight: 0
      };
    }
    
    let totalWeight = 0;
    let maxWeight = records[0].weight;
    let minWeight = records[0].weight;
    
    records.forEach(record => {
      totalWeight += record.weight;
      maxWeight = Math.max(maxWeight, record.weight);
      minWeight = Math.min(minWeight, record.weight);
    });
    
    return {
      avgWeight: (totalWeight / records.length).toFixed(1),
      maxWeight: maxWeight.toFixed(1),
      minWeight: minWeight.toFixed(1)
    };
  },

  /**
   * 计算大便统计数据
   */
  calculateStoolStats: function(records) {
    const totalCount = records.length;
    
    let normalCount = 0;
    let abnormalCount = 0;
    
    records.forEach(record => {
      const type = parseInt(record.type);
      if (type >= 3 && type <= 5) {
        normalCount++;
      } else {
        abnormalCount++;
      }
    });
    
    return {
      totalCount,
      normalCount,
      abnormalCount
    };
  },

  /**
   * 处理用药数据
   */
  processMedicationData: function(records) {
    const medicationMap = {};
    
    records.forEach(record => {
      if (medicationMap[record.name]) {
        medicationMap[record.name]++;
      } else {
        medicationMap[record.name] = 1;
      }
    });
    
    const medicationData = [];
    for (const name in medicationMap) {
      medicationData.push({
        name,
        count: medicationMap[name]
      });
    }
    
    return medicationData;
  },

  /**
   * 初始化血压图表
   */
  initBloodPressureChart: function() {
    const { bloodPressureData } = this.data;
    
    if (bloodPressureData.length === 0) {
      return;
    }
    
    this.bloodPressureChart = this.selectComponent('#bloodPressureChart');
    this.bloodPressureChart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      const option = {
        color: ['#2D89EF', '#D13438'],
        legend: {
          data: ['收缩压', '舒张压'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: bloodPressureData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: 'mmHg'
        },
        series: [
          {
            name: '收缩压',
            type: 'line',
            data: bloodPressureData.map(item => item.systolic)
          },
          {
            name: '舒张压',
            type: 'line',
            data: bloodPressureData.map(item => item.diastolic)
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  /**
   * 初始化体重图表
   */
  initWeightChart: function() {
    const { weightData } = this.data;
    
    if (weightData.length === 0) {
      return;
    }
    
    this.weightChart = this.selectComponent('#weightChart');
    this.weightChart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      const option = {
        color: ['#107C10'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: weightData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: 'kg'
        },
        series: [
          {
            type: 'line',
            data: weightData.map(item => item.weight),
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  /**
   * 初始化大便图表
   */
  initStoolChart: function() {
    const { stoolData } = this.data;
    
    if (stoolData.length === 0) {
      return;
    }
    
    // 统计各类型数量
    const typeCount = [0, 0, 0, 0, 0, 0, 0];
    stoolData.forEach(item => {
      const type = parseInt(item.type);
      if (type >= 1 && type <= 7) {
        typeCount[type - 1]++;
      }
    });
    
    this.stoolChart = this.selectComponent('#stoolChart');
    this.stoolChart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      const option = {
        color: ['#D13438', '#D13438', '#107C10', '#107C10', '#107C10', '#D13438', '#D13438'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 0,
          data: ['类型1', '类型2', '类型3', '类型4', '类型5', '类型6', '类型7']
        },
        series: [
          {
            name: '大便类型',
            type: 'pie',
            radius: ['30%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: typeCount[0], name: '类型1' },
              { value: typeCount[1], name: '类型2' },
              { value: typeCount[2], name: '类型3' },
              { value: typeCount[3], name: '类型4' },
              { value: typeCount[4], name: '类型5' },
              { value: typeCount[5], name: '类型6' },
              { value: typeCount[6], name: '类型7' }
            ]
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  /**
   * 初始化月度血压图表
   */
  initMonthlyBloodPressureChart: function() {
    const { monthlyBloodPressureData } = this.data;
    
    if (monthlyBloodPressureData.length === 0) {
      return;
    }
    
    this.monthlyBloodPressureChart = this.selectComponent('#monthlyBloodPressureChart');
    this.monthlyBloodPressureChart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      const option = {
        color: ['#2D89EF', '#D13438'],
        legend: {
          data: ['收缩压', '舒张压'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: monthlyBloodPressureData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: 'mmHg'
        },
        series: [
          {
            name: '收缩压',
            type: 'line',
            data: monthlyBloodPressureData.map(item => item.systolic)
          },
          {
            name: '舒张压',
            type: 'line',
            data: monthlyBloodPressureData.map(item => item.diastolic)
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  /**
   * 初始化月度体重图表
   */
  initMonthlyWeightChart: function() {
    const { monthlyWeightData } = this.data;
    
    if (monthlyWeightData.length === 0) {
      return;
    }
    
    this.monthlyWeightChart = this.selectComponent('#monthlyWeightChart');
    this.monthlyWeightChart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      
      const option = {
        color: ['#107C10'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: monthlyWeightData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: 'kg'
        },
        series: [
          {
            type: 'line',
            data: monthlyWeightData.map(item => item.weight),
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ]
      };
      
      chart.setOption(option);
      return chart;
    });
  },

  /**
   * 生成完整报告
   */
  generateReport: function() {
    wx.showToast({
      title: '报告生成中...',
      icon: 'loading',
      duration: 2000
    });
    
    setTimeout(() => {
      wx.showModal({
        title: '报告已生成',
        content: '您的周健康报告已生成，可以在"我的-健康报告"中查看',
        showCancel: false
      });
    }, 2000);
  },

  /**
   * 分享报告
   */
  shareReport: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 生成月度报告
   */
  generateMonthlyReport: function() {
    wx.showToast({
      title: '报告生成中...',
      icon: 'loading',
      duration: 2000
    });
    
    setTimeout(() => {
      wx.showModal({
        title: '报告已生成',
        content: '您的月度健康报告已生成，可以在"我的-健康报告"中查看',
        showCancel: false
      });
    }, 2000);
  },

  /**
   * 分享月度报告
   */
  shareMonthlyReport: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我的健康报告',
      path: '/pages/reports/reports'
    };
  }
}) 