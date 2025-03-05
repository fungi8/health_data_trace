// pages/blood-pressure/blood-pressure.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    systolic: '',
    diastolic: '',
    pulse: '',
    date: '',
    time: '',
    note: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置默认日期和时间为当前时间
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    this.setData({
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    });
  },

  /**
   * 收缩压输入事件
   */
  onSystolicInput: function(e) {
    this.setData({
      systolic: e.detail.value
    });
  },

  /**
   * 舒张压输入事件
   */
  onDiastolicInput: function(e) {
    this.setData({
      diastolic: e.detail.value
    });
  },

  /**
   * 脉搏输入事件
   */
  onPulseInput: function(e) {
    this.setData({
      pulse: e.detail.value
    });
  },

  /**
   * 日期选择事件
   */
  onDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },

  /**
   * 时间选择事件
   */
  onTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    });
  },

  /**
   * 备注输入事件
   */
  onNoteInput: function(e) {
    this.setData({
      note: e.detail.value
    });
  },

  /**
   * 保存记录
   */
  saveRecord: function() {
    const { systolic, diastolic, pulse, date, time, note } = this.data;
    
    // 表单验证
    if (!systolic || !diastolic) {
      wx.showToast({
        title: '请输入收缩压和舒张压',
        icon: 'none'
      });
      return;
    }
    
    if (isNaN(systolic) || isNaN(diastolic)) {
      wx.showToast({
        title: '血压值必须是数字',
        icon: 'none'
      });
      return;
    }
    
    // 构建记录对象
    const record = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : null,
      datetime: `${date} ${time}`,
      note: note,
      timestamp: new Date().getTime()
    };
    
    // 获取现有记录
    const records = wx.getStorageSync('bloodPressureRecords') || [];
    
    // 添加新记录
    records.unshift(record);
    
    // 保存到本地存储
    wx.setStorageSync('bloodPressureRecords', records);
    
    // 显示成功提示
    wx.showToast({
      title: '记录已保存',
      icon: 'success'
    });
    
    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  /**
   * 判断血压状态
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
  }
}) 