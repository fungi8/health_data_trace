// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息
    this.getUserInfo()
  },

  // 获取用户信息
  getUserInfo() {
    // 尝试从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      return
    }

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          // 这里可以发送 res.code 到自己的服务器进行登录验证
          // 示例代码，实际项目中需要替换为真实的服务器地址
          /*
          wx.request({
            url: 'https://your-server.com/api/login',
            data: {
              code: res.code
            },
            success: (result) => {
              if (result.data.openid) {
                this.globalData.openid = result.data.openid
                // 获取用户信息
                this.getWxUserInfo()
              }
            }
          })
          */
          
          // 由于没有后端服务器，这里模拟一个openid和基本用户信息
          this.globalData.openid = 'simulated_openid_' + new Date().getTime()
          this.globalData.userInfo = {
            nickName: '用户' + Math.floor(Math.random() * 1000)
          }
          console.log('模拟登录成功，openid:', this.globalData.openid)
          
          // 保存到本地存储
          wx.setStorageSync('userInfo', this.globalData.userInfo)
          
          // 触发回调
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback({userInfo: this.globalData.userInfo})
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  // 获取微信用户信息
  getWxUserInfo() {
    // 检查用户是否授权获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // 只保留必要的用户信息，不包含头像URL
              this.globalData.userInfo = {
                nickName: res.userInfo.nickName || '用户'
              }
              wx.setStorageSync('userInfo', this.globalData.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback({userInfo: this.globalData.userInfo})
              }
            }
          })
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    openid: null
  }
})
