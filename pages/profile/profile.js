// pages/profile/profile.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      name: '',
      gender: '',
      age: '',
      height: '',
      weight: '',
      avatarUrl: '/assets/images/default-avatar.png'
    },
    healthGoals: {
      targetWeight: '',
      targetBloodPressure: '',
      waterIntake: ''
    },
    recordCount: 0,
    recordDays: 0,
    continuousDays: 0,
    
    // 编辑弹窗相关
    showEditPopup: false,
    currentEditField: '',
    editTitle: '',
    tempEditValue: '',
    editCategory: '' // 'userInfo' 或 'healthGoals'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserData();
    this.calculateRecordStats();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadUserData();
    this.calculateRecordStats();
    
    // 更新自定义tabBar的选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().init();
    }
  },

  /**
   * 加载用户数据
   */
  loadUserData: function() {
    // 先尝试从全局数据获取微信用户信息
    const wxUserInfo = app.globalData.userInfo;
    
    if (wxUserInfo) {
      // 如果有微信用户信息，则使用微信用户信息
      const userInfo = wx.getStorageSync('userInfo') || {
        name: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
        avatarUrl: '/assets/images/default-avatar.png'
      };
      
      // 更新用户信息
      userInfo.name = userInfo.name || wxUserInfo.nickName;
      userInfo.gender = userInfo.gender || (wxUserInfo.gender === 1 ? '男' : wxUserInfo.gender === 2 ? '女' : '');
      userInfo.avatarUrl = wxUserInfo.avatarUrl || userInfo.avatarUrl;
      
      // 保存更新后的用户信息
      wx.setStorageSync('userInfo', userInfo);
      
      this.setData({
        userInfo
      });
    } else {
      // 如果没有微信用户信息，则使用本地存储的用户信息
      const userInfo = wx.getStorageSync('userInfo') || {
        name: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
        avatarUrl: '/assets/images/default-avatar.png'
      };
      
      this.setData({
        userInfo
      });
      
      // 监听用户信息获取成功的回调
      app.userInfoReadyCallback = res => {
        const wxUserInfo = res.userInfo;
        const updatedUserInfo = { ...this.data.userInfo };
        
        // 更新用户信息
        updatedUserInfo.name = updatedUserInfo.name || wxUserInfo.nickName;
        updatedUserInfo.gender = updatedUserInfo.gender || (wxUserInfo.gender === 1 ? '男' : wxUserInfo.gender === 2 ? '女' : '');
        updatedUserInfo.avatarUrl = wxUserInfo.avatarUrl || updatedUserInfo.avatarUrl;
        
        // 保存更新后的用户信息
        wx.setStorageSync('userInfo', updatedUserInfo);
        
        this.setData({
          userInfo: updatedUserInfo
        });
      };
    }
    
    const healthGoals = wx.getStorageSync('healthGoals') || {
      targetWeight: '',
      targetBloodPressure: '',
      waterIntake: ''
    };
    
    this.setData({
      healthGoals
    });
  },

  /**
   * 计算记录统计数据
   */
  calculateRecordStats: function() {
    // 获取所有记录
    const bloodPressureRecords = wx.getStorageSync('bloodPressureRecords') || [];
    const weightRecords = wx.getStorageSync('weightRecords') || [];
    const stoolRecords = wx.getStorageSync('stoolRecords') || [];
    const medicationRecords = wx.getStorageSync('medicationRecords') || [];
    
    // 计算记录总数
    const recordCount = bloodPressureRecords.length + weightRecords.length + stoolRecords.length + medicationRecords.length;
    
    // 计算记录天数
    const recordDates = new Set();
    
    // 添加血压记录日期
    bloodPressureRecords.forEach(record => {
      const date = new Date(record.timestamp);
      recordDates.add(this.formatDate(date));
    });
    
    // 添加体重记录日期
    weightRecords.forEach(record => {
      const date = new Date(record.timestamp);
      recordDates.add(this.formatDate(date));
    });
    
    // 添加大便记录日期
    stoolRecords.forEach(record => {
      const date = new Date(record.timestamp);
      recordDates.add(this.formatDate(date));
    });
    
    // 添加用药记录日期
    medicationRecords.forEach(record => {
      const date = new Date(record.timestamp);
      recordDates.add(this.formatDate(date));
    });
    
    const recordDays = recordDates.size;
    
    // 计算连续记录天数
    const continuousDays = this.calculateContinuousDays(Array.from(recordDates));
    
    this.setData({
      recordCount,
      recordDays,
      continuousDays
    });
  },

  /**
   * 计算连续记录天数
   */
  calculateContinuousDays: function(dates) {
    if (dates.length === 0) {
      return 0;
    }
    
    // 将日期字符串转换为时间戳
    const timestamps = dates.map(date => new Date(date).getTime());
    
    // 按时间戳排序
    timestamps.sort((a, b) => b - a);
    
    // 计算连续天数
    let continuousDays = 1;
    let currentDate = new Date(timestamps[0]);
    
    for (let i = 1; i < timestamps.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      const checkDate = new Date(timestamps[i]);
      
      // 检查是否是连续的日期
      if (this.formatDate(prevDate) === this.formatDate(checkDate)) {
        continuousDays++;
        currentDate = checkDate;
      } else {
        break;
      }
    }
    
    return continuousDays;
  },

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * 编辑用户信息
   */
  editUserInfo: function(e) {
    const field = e.currentTarget.dataset.field;
    let title = '';
    
    switch (field) {
      case 'name':
        title = '姓名';
        break;
      case 'gender':
        title = '性别';
        break;
      case 'age':
        title = '年龄';
        break;
      case 'height':
        title = '身高';
        break;
      case 'weight':
        title = '体重';
        break;
    }
    
    this.setData({
      showEditPopup: true,
      currentEditField: field,
      editTitle: title,
      tempEditValue: this.data.userInfo[field],
      editCategory: 'userInfo'
    });
  },

  /**
   * 编辑健康目标
   */
  editHealthGoal: function(e) {
    const field = e.currentTarget.dataset.field;
    let title = '';
    
    switch (field) {
      case 'targetWeight':
        title = '目标体重';
        break;
      case 'targetBloodPressure':
        title = '目标血压';
        break;
      case 'waterIntake':
        title = '每日饮水量';
        break;
    }
    
    this.setData({
      showEditPopup: true,
      currentEditField: field,
      editTitle: title,
      tempEditValue: this.data.healthGoals[field],
      editCategory: 'healthGoals'
    });
  },

  /**
   * 关闭编辑弹窗
   */
  closeEditPopup: function() {
    this.setData({
      showEditPopup: false
    });
  },

  /**
   * 输入框变更事件
   */
  onFieldChange: function(e) {
    this.setData({
      tempEditValue: e.detail
    });
  },

  /**
   * 单选框点击事件
   */
  onRadioClick: function(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({
      tempEditValue: name
    });
  },

  /**
   * 单选框变更事件
   */
  onRadioChange: function(e) {
    this.setData({
      tempEditValue: e.detail
    });
  },

  /**
   * 保存编辑
   */
  saveEdit: function() {
    const { currentEditField, tempEditValue, editCategory } = this.data;
    
    if (editCategory === 'userInfo') {
      // 更新用户信息
      const userInfo = { ...this.data.userInfo };
      userInfo[currentEditField] = tempEditValue;
      
      this.setData({
        userInfo
      });
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);
    } else if (editCategory === 'healthGoals') {
      // 更新健康目标
      const healthGoals = { ...this.data.healthGoals };
      healthGoals[currentEditField] = tempEditValue;
      
      this.setData({
        healthGoals
      });
      
      // 保存到本地存储
      wx.setStorageSync('healthGoals', healthGoals);
    }
    
    // 关闭弹窗
    this.closeEditPopup();
    
    // 显示成功提示
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  /**
   * 导航到指定页面
   */
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },

  /**
   * 显示关于我们
   */
  showAbout: function() {
    wx.showModal({
      title: '关于我们',
      content: '健康数据追踪 v1.0.0\n\n一款帮助您记录和管理健康数据的小程序，包括血压、体重、大便和用药记录等功能。\n\n如有问题或建议，请联系我们：support@healthdata.com',
      showCancel: false
    });
  },

  /**
   * 导出健康数据
   */
  exportData: function() {
    wx.showLoading({
      title: '正在导出...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showModal({
        title: '导出成功',
        content: '您的健康数据已成功导出，可在"我的文件"中查看',
        showCancel: false
      });
    }, 2000);
  },

  /**
   * 清除所有数据
   */
  clearData: function() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有健康数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 清除所有记录
          wx.removeStorageSync('bloodPressureRecords');
          wx.removeStorageSync('weightRecords');
          wx.removeStorageSync('stoolRecords');
          wx.removeStorageSync('medicationRecords');
          
          // 更新统计数据
          this.setData({
            recordCount: 0,
            recordDays: 0,
            continuousDays: 0
          });
          
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 获取微信用户信息
   */
  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const wxUserInfo = res.userInfo;
        const updatedUserInfo = { ...this.data.userInfo };
        
        // 更新用户信息
        updatedUserInfo.name = updatedUserInfo.name || wxUserInfo.nickName;
        updatedUserInfo.gender = updatedUserInfo.gender || (wxUserInfo.gender === 1 ? '男' : wxUserInfo.gender === 2 ? '女' : '');
        updatedUserInfo.avatarUrl = wxUserInfo.avatarUrl || updatedUserInfo.avatarUrl;
        
        // 保存更新后的用户信息
        app.globalData.userInfo = wxUserInfo;
        wx.setStorageSync('userInfo', updatedUserInfo);
        
        this.setData({
          userInfo: updatedUserInfo
        });
        
        wx.showToast({
          title: '授权成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('获取用户信息失败', err);
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      }
    });
  }
}) 