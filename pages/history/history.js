// pages/history/history.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    recordType: 'blood-pressure',
    timeRange: 'all',
    recordTypeOptions: [
      { text: '血压记录', value: 'blood-pressure' },
      { text: '体重记录', value: 'weight' },
      { text: '大便记录', value: 'stool' },
      { text: '用药记录', value: 'medication' }
    ],
    timeRangeOptions: [
      { text: '全部时间', value: 'all' },
      { text: '最近一周', value: 'week' },
      { text: '最近一月', value: 'month' },
      { text: '最近三月', value: 'three-months' }
    ],
    bloodPressureRecords: [],
    weightRecords: [],
    stoolRecords: [],
    medicationRecords: [],
    currentRecords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果从其他页面传入了记录类型，则设置当前记录类型
    if (options.type) {
      this.setData({
        recordType: options.type
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadRecords();
    
    // 更新自定义tabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  /**
   * 加载记录数据
   */
  loadRecords: function() {
    // 加载血压记录
    const bloodPressureRecords = wx.getStorageSync('bloodPressureRecords') || [];
    
    // 处理血压记录数据，添加格式化的日期和时间
    const formattedBloodPressureRecords = bloodPressureRecords.map(record => {
      const datetime = new Date(record.timestamp);
      const dateFormatted = this.formatDate(datetime);
      const timeFormatted = this.formatTime(datetime);
      
      // 计算血压状态
      const statusText = this.getBloodPressureStatus(record.systolic, record.diastolic);
      const statusClass = this.getStatusClass(statusText);
      
      return {
        ...record,
        dateFormatted,
        timeFormatted,
        statusText,
        statusClass
      };
    });
    
    // 加载体重记录
    const weightRecords = wx.getStorageSync('weightRecords') || [];
    
    // 处理体重记录数据
    const formattedWeightRecords = weightRecords.map(record => {
      const datetime = new Date(record.timestamp);
      const dateFormatted = this.formatDate(datetime);
      const timeFormatted = this.formatTime(datetime);
      
      // 计算BMI状态
      const statusText = record.bmiStatus || '正常';
      const statusClass = this.getStatusClass(statusText);
      
      return {
        ...record,
        dateFormatted,
        timeFormatted,
        statusText,
        statusClass
      };
    });
    
    // 加载大便记录
    const stoolRecords = wx.getStorageSync('stoolRecords') || [];
    
    // 处理大便记录数据
    const formattedStoolRecords = stoolRecords.map(record => {
      const datetime = new Date(record.timestamp);
      const dateFormatted = this.formatDate(datetime);
      const timeFormatted = this.formatTime(datetime);
      
      // 根据布里斯托尔大便分类法判断状态
      const statusText = this.getStoolStatus(record.type);
      const statusClass = this.getStatusClass(statusText);
      
      return {
        ...record,
        dateFormatted,
        timeFormatted,
        statusText,
        statusClass
      };
    });
    
    // 加载用药记录
    const medicationRecords = wx.getStorageSync('medicationRecords') || [];
    
    // 处理用药记录数据
    const formattedMedicationRecords = medicationRecords.map(record => {
      const datetime = new Date(record.timestamp);
      const dateFormatted = this.formatDate(datetime);
      const timeFormatted = this.formatTime(datetime);
      
      return {
        ...record,
        dateFormatted,
        timeFormatted,
        statusText: '已服用',
        statusClass: 'normal'
      };
    });
    
    // 根据时间范围筛选记录
    const filteredBloodPressureRecords = this.filterRecordsByTimeRange(formattedBloodPressureRecords);
    const filteredWeightRecords = this.filterRecordsByTimeRange(formattedWeightRecords);
    const filteredStoolRecords = this.filterRecordsByTimeRange(formattedStoolRecords);
    const filteredMedicationRecords = this.filterRecordsByTimeRange(formattedMedicationRecords);
    
    // 更新数据
    this.setData({
      bloodPressureRecords: filteredBloodPressureRecords,
      weightRecords: filteredWeightRecords,
      stoolRecords: filteredStoolRecords,
      medicationRecords: filteredMedicationRecords
    });
    
    // 设置当前显示的记录
    this.updateCurrentRecords();
  },

  /**
   * 根据时间范围筛选记录
   */
  filterRecordsByTimeRange: function(records) {
    const { timeRange } = this.data;
    const now = new Date().getTime();
    
    if (timeRange === 'all') {
      return records;
    }
    
    let timeLimit;
    
    if (timeRange === 'week') {
      timeLimit = now - 7 * 24 * 60 * 60 * 1000; // 一周前
    } else if (timeRange === 'month') {
      timeLimit = now - 30 * 24 * 60 * 60 * 1000; // 一个月前
    } else if (timeRange === 'three-months') {
      timeLimit = now - 90 * 24 * 60 * 60 * 1000; // 三个月前
    }
    
    return records.filter(record => record.timestamp >= timeLimit);
  },

  /**
   * 更新当前显示的记录
   */
  updateCurrentRecords: function() {
    const { recordType } = this.data;
    
    let currentRecords = [];
    
    if (recordType === 'blood-pressure') {
      currentRecords = this.data.bloodPressureRecords;
    } else if (recordType === 'weight') {
      currentRecords = this.data.weightRecords;
    } else if (recordType === 'stool') {
      currentRecords = this.data.stoolRecords;
    } else if (recordType === 'medication') {
      currentRecords = this.data.medicationRecords;
    }
    
    this.setData({
      currentRecords
    });
  },

  /**
   * 记录类型变更事件
   */
  onRecordTypeChange: function(e) {
    this.setData({
      recordType: e.detail
    });
    
    this.updateCurrentRecords();
  },

  /**
   * 时间范围变更事件
   */
  onTimeRangeChange: function(e) {
    this.setData({
      timeRange: e.detail
    });
    
    this.loadRecords();
  },

  /**
   * 查看记录详情
   */
  viewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    const { recordType } = this.data;
    
    wx.navigateTo({
      url: `/pages/detail/detail?type=${recordType}&id=${id}`
    });
  },

  /**
   * 编辑记录
   */
  editRecord: function(e) {
    const id = e.currentTarget.dataset.id;
    const { recordType } = this.data;
    let url = '';
    
    if (recordType === 'blood-pressure') {
      url = `/pages/blood-pressure/blood-pressure?id=${id}`;
    } else if (recordType === 'weight') {
      url = `/pages/weight-record/weight-record?id=${id}`;
    } else if (recordType === 'stool') {
      url = `/pages/stool-record/stool-record?id=${id}`;
    } else if (recordType === 'medication') {
      url = `/pages/medication/medication?id=${id}`;
    }
    
    wx.navigateTo({
      url
    });
  },

  /**
   * 删除记录
   */
  deleteRecord: function(e) {
    const id = e.currentTarget.dataset.id;
    const { recordType } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(recordType, id);
        }
      }
    });
  },

  /**
   * 执行删除操作
   */
  performDelete: function(recordType, id) {
    let storageKey = '';
    
    if (recordType === 'blood-pressure') {
      storageKey = 'bloodPressureRecords';
    } else if (recordType === 'weight') {
      storageKey = 'weightRecords';
    } else if (recordType === 'stool') {
      storageKey = 'stoolRecords';
    } else if (recordType === 'medication') {
      storageKey = 'medicationRecords';
    }
    
    // 获取记录
    let records = wx.getStorageSync(storageKey) || [];
    
    // 过滤掉要删除的记录
    records = records.filter(record => record.timestamp != id);
    
    // 保存更新后的记录
    wx.setStorageSync(storageKey, records);
    
    // 重新加载记录
    this.loadRecords();
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  /**
   * 添加新记录
   */
  addRecord: function() {
    const { recordType } = this.data;
    let url = '';
    
    if (recordType === 'blood-pressure') {
      url = '/pages/blood-pressure/blood-pressure';
    } else if (recordType === 'weight') {
      url = '/pages/weight-record/weight-record';
    } else if (recordType === 'stool') {
      url = '/pages/stool-record/stool-record';
    } else if (recordType === 'medication') {
      url = '/pages/medication/medication';
    }
    
    wx.navigateTo({
      url
    });
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
   * 格式化时间
   */
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  },

  /**
   * 获取血压状态
   */
  getBloodPressureStatus: function(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
      return '理想血压';
    } else if ((systolic >= 120 && systolic <= 129) && diastolic < 85) {
      return '正常血压';
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 85 && diastolic <= 89)) {
      return '正常高值';
    } else if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
      return '轻度高血压';
    } else if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) {
      return '中度高血压';
    } else if (systolic >= 180 || diastolic >= 110) {
      return '重度高血压';
    } else {
      return '未知';
    }
  },

  /**
   * 获取大便状态
   */
  getStoolStatus: function(type) {
    const typeNum = parseInt(type);
    
    if (typeNum === 1 || typeNum === 2) {
      return '便秘';
    } else if (typeNum >= 3 && typeNum <= 5) {
      return '正常';
    } else if (typeNum === 6 || typeNum === 7) {
      return '腹泻';
    } else {
      return '未知';
    }
  },

  /**
   * 获取状态对应的CSS类
   */
  getStatusClass: function(status) {
    if (status.includes('正常') || status === '理想血压') {
      return 'normal';
    } else if (status.includes('高') || status.includes('便秘') || status.includes('腹泻')) {
      return 'warning';
    } else {
      return '';
    }
  }
}) 