Component({
  data: {
    active: 0,
    list: [
      {
        pagePath: "/pages/dashboard/dashboard",
        text: "首页",
        icon: "home-o",
        activeIcon: "home-o"
      },
      {
        pagePath: "/pages/history/history",
        text: "历史",
        icon: "clock-o",
        activeIcon: "clock-o"
      },
      {
        pagePath: "/pages/reports/reports",
        text: "报告",
        icon: "chart-trending-o",
        activeIcon: "chart-trending-o"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        icon: "user-o",
        activeIcon: "user-o"
      }
    ]
  },
  methods: {
    onChange(event) {
      const index = event.detail;
      const tabData = this.data.list[index];
      wx.switchTab({
        url: tabData.pagePath
      });
    },
    init() {
      const page = getCurrentPages().pop();
      const route = page ? page.route : 'pages/dashboard/dashboard';
      const active = this.data.list.findIndex(item => item.pagePath.includes(route));
      this.setData({ active: active !== -1 ? active : 0 });
    }
  },
  lifetimes: {
    attached() {
      this.init();
    },
    ready() {
      this.init();
    }
  },
  pageLifetimes: {
    show() {
      this.init();
    }
  }
}); 