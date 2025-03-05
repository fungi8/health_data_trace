Page({
  data: {
    active: 0, // 当前选中的 Tab
    formData: {
      bloodPressure: '',
      heartRate: '',
      weight: ''
    }
  },

  // 处理 Tab 切换
  onTabChange(event) {
    this.setData({ active: event.detail });
  },

  // 处理输入
  onInput(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: event.detail
    });
  },

  // 提交数据
  submitData() {
    wx.showToast({
      title: '数据提交成功！',
      icon: 'success'
    });

    console.log('提交的数据:', this.data.formData);
  }
});
