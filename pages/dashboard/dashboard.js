// pages/dashboard/dashboard.js
const app = getApp()

Page({
    /**
     * 页面的初始数据
     */
    data: {
      greeting: '您好',
      welcomeMessage: '今天是您的血压测量日，别忘了记录哦',
      lastRecordTime: '今天',
      showAddMenu: false,
      userInfo: {
        name: '用户'
      },
      bloodPressureRecords: [
        {
          id: 1,
          value: '120/80',
          status: '正常',
          date: '今天 08:30'
        },
        {
          id: 2,
          value: '135/85',
          status: '偏高',
          date: '昨天 20:15'
        }
      ],
      reminders: [
        {
          id: 1,
          title: '测量血压',
          time: '今天 20:00'
        },
        {
          id: 2,
          title: '服用降压药',
          time: '今天 08:00'
        }
      ]
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.updateGreeting();
      this.getUserInfo();
    },
  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      // 每次显示页面时更新问候语
      this.updateGreeting();
      
      // 获取用户信息
      this.getUserInfo();
      
      // 这里可以从本地存储或服务器获取最新数据
      // this.loadBloodPressureRecords();
      // this.loadReminders();
      
      // 更新自定义tabBar的选中状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init();
      }
    },

    /**
     * 获取用户信息
     */
    getUserInfo: function() {
      // 从全局数据获取用户信息
      const userInfo = app.globalData.userInfo;
      
      // 如果全局数据中有用户信息，则更新页面数据
      if (userInfo) {
        this.setData({
          'userInfo.name': userInfo.nickName || '用户'
        });
      } else {
        // 如果全局数据中没有用户信息，则从本地存储获取
        const localUserInfo = wx.getStorageSync('userInfo');
        if (localUserInfo) {
          this.setData({
            'userInfo.name': localUserInfo.name || '用户'
          });
        }
        
        // 监听用户信息获取成功的回调
        app.userInfoReadyCallback = res => {
          this.setData({
            'userInfo.name': res.userInfo.nickName || '用户'
          });
        };
      }
    },
  
    /**
     * 根据时间更新问候语
     */
    updateGreeting: function() {
      const hour = new Date().getHours();
      let greeting = '您好';
      
      if (hour >= 5 && hour < 12) {
        greeting = '早上好';
      } else if (hour >= 12 && hour < 18) {
        greeting = '下午好';
      } else {
        greeting = '晚上好';
      }
      
      this.setData({
        greeting: greeting
      });
    },
  
    /**
     * 显示添加记录菜单
     */
    showAddMenu: function() {
      this.setData({
        showAddMenu: true
      });
    },
  
    /**
     * 隐藏添加记录菜单
     */
    hideAddMenu: function() {
      this.setData({
        showAddMenu: false
      });
    },
  
    /**
     * 跳转到设置页面
     */
    goToSettings: function() {
      wx.navigateTo({
        url: '/pages/profile/profile',
      });
    },
  
    /**
     * 查看所有血压记录
     */
    viewAllBloodPressure: function() {
      wx.navigateTo({
        url: '/pages/history/history?type=blood-pressure',
      });
    },
  
    /**
     * 管理提醒
     */
    manageReminders: function() {
      wx.navigateTo({
        url: '/pages/reminders/reminders',
      });
    },
  
    /**
     * 跳转到数据可视化页面
     */
    goToDataVisualization: function() {
      wx.navigateTo({
        url: '/pages/data-visualization/data-visualization',
      });
    },
  
    /**
     * 跳转到数据管理页面
     */
    goToDataManagement: function() {
      wx.navigateTo({
        url: '/pages/data-management/data-management',
      });
    },
  
    /**
     * 跳转到提醒页面
     */
    goToReminders: function() {
      wx.navigateTo({
        url: '/pages/reminders/reminders',
      });
    },
  
    /**
     * 跳转到报告页面
     */
    goToReports: function() {
      wx.navigateTo({
        url: '/pages/reports/reports',
      });
    },
  
    /**
     * 跳转到血压记录页面
     */
    goToBloodPressure: function() {
      this.hideAddMenu();
      wx.navigateTo({
        url: '/pages/blood-pressure/blood-pressure',
      });
    },
  
    /**
     * 跳转到体重记录页面
     */
    goToWeightRecord: function() {
      this.hideAddMenu();
      wx.navigateTo({
        url: '/pages/weight-record/weight-record',
      });
    },
  
    /**
     * 跳转到大便记录页面
     */
    goToStoolRecord: function() {
      this.hideAddMenu();
      wx.navigateTo({
        url: '/pages/stool-record/stool-record',
      });
    },
  
    /**
     * 跳转到用药记录页面
     */
    goToMedication: function() {
      this.hideAddMenu();
      wx.navigateTo({
        url: '/pages/medication/medication',
      });
    }
  })