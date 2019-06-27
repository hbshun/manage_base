import Taro from '@tarojs/taro'
let selectItem = {
  /**
   * 显示搜索框
   */
  showSearch: function() {
    let _this = this
    //显示搜索框且进行滚动
    this.setData(
      {
        isShowSearch: true,
        isScrollToTop: true
      },
      function() {
        _this.getDistanceForTop()
      }
    )
  },

  /**
   * 关闭搜索框
   */
  hideSearch: function() {
    //搜索关闭要将搜索内容情况，提交搜索
    this.setData({
      inputVal: '',
      isShowSearch: false
    })
    this.searchCommit()
  },

  /**
   * 获取用户的输入数据
   */
  inputTyping: function(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },

  /**
   * 清空输入的数据
   * 重新搜索
   */
  clearInput: function() {
    this.setData({
      inputVal: ''
    })
    this.searchCommit()
  },

  /**
   * 提交搜索信息
   */
  searchCommit: function() {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    const tab = this.data.tab
    tab.tabShow = ''
    const postObj = this.data.postObj
    postObj.keyword = this.data.inputVal
    //每次有新的搜索，需要重置页数和数据，失去光标焦点，将展开的筛选项关闭
    this.setData({
      productPage: 1,
      tab,
      isScrollToTop: true,
      postObj
    })
    // 获取商品列表
    this.getBrandProductsList()
  },

  /**
   * 处理后台数据给Tab
   */
  dataToTab: function(filters, productLength) {
    //分配titleName是为筛选时，选择选项并post给后台做准备
    let tab = {
      proAndSer: [
        {
          name: '活动',
          titleName: 'promotions',
          values: []
        },
        {
          name: '服务',
          titleName: 'service',
          values: []
        }
      ],
      filters: [],
      tabShow: '', // 显示的tab下拉panel
      arrangeType: 0, // 显示的顺序默认为综合排序
      other: [],
      price: {
        min: '',
        max: ''
      }
    }

    let categories = {
      name: '分类',
      titleName: 'categories',
      values: filters.categories
    }

    let hasTab = false
    if (productLength != 0) {
      hasTab = true
    }
    this.setData({
      hasTab
    })

    //因为品牌和分类要放到筛选的panel里，所以把他们都push到filters里，方便显示和选择、取消小标签功能
    // tab.filters.push(brands, categories, ...filters.filters);
    //由于这个是在品牌下的筛选，因此不需要品牌的选择
    tab.filters.push(categories, ...filters.filters)
    tab.proAndSer[0].values = filters.promotions
    tab.proAndSer[1].values = filters.service

    this.initChooseData(tab, filters.smart_tag.name)
  },

  /**
   * 把选项初始化成未选择状态（如brand:["YSL"]变为 brand"[{text:"YSL", isChoose:false}]）
   */
  initChooseData: function(tab, smartTag) {
    for (let k in tab) {
      for (let i = 0; i < tab[k].length; i++) {
        if (tab[k][i].values.length < 4) {
          tab[k][i].showHideType = 0 //0表示不需要隐藏,1表示需要隐藏，2表示隐藏的已经展开
        } else {
          tab[k][i].showHideType = 1
        }

        // 这个页面的品牌和购物车里的搜索引擎页面的品牌不一样，有id，筛选的时候传id（为了分享出去的url不报错，因为当品牌名字有&的时候，直接传品牌名字会报错）
        if (tab[k][i].name == '品牌') {
          for (let j = 0; j < tab[k][i].values.length; j++) {
            let obj = {}
            obj.text = tab[k][i].values[j].name
            obj.isChoose = false
            obj.id = tab[k][i].values[j].id
            tab[k][i].values[j] = obj
          }
        } else {
          for (let j = 0; j < tab[k][i].values.length; j++) {
            let obj = {}
            obj.text = tab[k][i].values[j]
            obj.isChoose = false
            tab[k][i].values[j] = obj
          }
        }
      }
    }

    //智能标签只能是品牌或者分类，需要在这里才赋值，否则数据结构会出现错误
    for (let i = 0; i < tab.filters.length; i++) {
      if (
        tab.filters[i].titleName == smartTag ||
        tab.filters[i].name == smartTag
      ) {
        // 把被标为smart标签的赋值给other数组，并把被标为smart标签的数组从filters里删除
        tab.other[0] = tab.filters[i]
        tab.filters.splice(i, 1)
      }
    }

    let tabShow = {}
    tabShow.arrange = {}
    tabShow.arrange.arrange = '排序'
    tabShow.arrange.showName = '综合排序'
    console.log(tab.other)
    if (tab.other[0] && tab.other[0].values.length > 0) {
      tabShow.other = {}
      tabShow.other.name = tab.other[0].name || tab.other[0].titleName
      tabShow.other.showName = tab.other[0].name || tab.other[0].titleName
    }

    tabShow.proAndSer = {}
    tabShow.proAndSer.name = '活动'
    tabShow.proAndSer.showName = '活动'

    tabShow.filters = {}
    tabShow.filters.name = '筛选'
    tabShow.filters.showName = '筛选'

    this.setData({
      tab: tab,
      tabShow
    })

    this.initTabDataFromShare()
  },

  /**
   * 初始化从别人分享的小程序中进来本页，所带上的已经筛好的tab信息
   */
  initTabDataFromShare: function() {
    // if (this.data.fromShareData) {
    if (this.data.share_search) {
      this.shareDataTurnTab()
    }
  },

  /**
   * 把postObj转成tab数据（初始化完就删掉，为了防止再次初始化）
   */
  shareDataTurnTab: function() {
    let tab = this.data.tab
    // let postObj = this.data.fromShareData;
    let postObj = this.data.postObj
    let tabShow = this.data.tabShow
    let isShowSearch = this.data.isShowSearch

    // 排序
    if (postObj.sort.created_time == 'desc') {
      tab.arrangeType = 1
      tabShow.arrange.showName = '最近上架'
    } else if (postObj.sort.retail_price) {
      tab.arrangeType = 2
      tabShow.arrange.showName = '价格低到高'
      if (postObj.sort.retail_price == 'desc') {
        tab.arrangeType = 3
        tabShow.arrange.showName = '价格高到低'
      }
    } else {
      tab.arrangeType = 0
      tabShow.arrange.showName = '综合排序'
    }

    if (postObj.filters) {
      // 价格
      if (postObj.filters.price) {
        const price = postObj.filters.price
        tab.price.min = price.min
        tab.price.max = price.max
      }

      // 不确定的筛选条件
      if (postObj.filters.filters) {
        const filters = postObj.filters.filters
        for (let i in filters) {
          for (let j = 0; j < tab.filters.length; j++) {
            if (tab.filters[j].id == i) {
              for (let k = 0; k < tab.filters[j].values.length; k++) {
                if (filters[i].indexOf(tab.filters[j].values[k].text) > -1) {
                  tab.filters[j].values[k].isChoose = true
                }
              }
            }
          }
          for (let j = 0; j < tab.other.length; j++) {
            if (tab.other[j].id == i) {
              for (let k = 0; k < tab.other[j].values.length; k++) {
                if (filters[i].indexOf(tab.other[j].values[k].text) > -1) {
                  tab.other[j].values[k].isChoose = true
                }
              }
            }
          }
        }
      }

      // 活动
      if (postObj.filters.promotions) {
        const promotion = postObj.filters.promotions

        for (let i = 0; i < tab.proAndSer[0].values.length; i++) {
          if (promotion.indexOf(tab.proAndSer[0].values[i].text) > -1) {
            tab.proAndSer[0].values[i].isChoose = true
          }
        }
      }

      // 类别
      if (postObj.filters.categories) {
        const categories = postObj.filters.categories

        // 因为categories 有可能在filters里 也有可能在 other里，所以俩for
        for (let i = 0; i < tab.filters.length; i++) {
          if (
            tab.filters[i].titleName &&
            tab.filters[i].titleName == 'categories'
          ) {
            for (let j = 0; j < tab.filters[i].values.length; j++) {
              if (categories.indexOf(tab.filters[i].values[j].text) > -1) {
                tab.filters[i].values[j].isChoose = true
              }
            }
          }
        }
        for (let i = 0; i < tab.other.length; i++) {
          if (
            tab.other[i].titleName &&
            tab.other[i].titleName == 'categories'
          ) {
            for (let j = 0; j < tab.other[i].values.length; j++) {
              if (categories.indexOf(tab.other[i].values[j].text) > -1) {
                tab.other[i].values[j].isChoose = true
              }
            }
          }
        }
      }

      // 品牌
      if (postObj.filters.brand_id) {
        const brand_id = postObj.filters.brand_id
        // 因为brands 有可能在filters里 也有可能在 other里，所以俩for
        for (let i = 0; i < tab.filters.length; i++) {
          if (
            tab.filters[i].titleName &&
            tab.filters[i].titleName == 'brands'
          ) {
            for (let j = 0; j < tab.filters[i].values.length; j++) {
              if (brand_id.indexOf(tab.filters[i].values[j].id) > -1) {
                tab.filters[i].values[j].isChoose = true
              }
            }
          }
        }
        for (let i = 0; i < tab.other.length; i++) {
          if (tab.other[i].titleName && tab.other[i].titleName == 'brands') {
            for (let j = 0; j < tab.other[i].values.length; j++) {
              console.log(
                'brand~~~~~~~~~~~',
                brand_id,
                tab.other[i].values[j].id
              )
              if (brand_id.indexOf(tab.other[i].values[j].id) > -1) {
                tab.other[i].values[j].isChoose = true
              }
            }
          }
        }
      }

      // 搜索框
      if (postObj.keyword) {
        isShowSearch = true
      }
    }

    const _this = this

    this.setData(
      {
        tab,
        tabShow,
        isShowSearch,
        inputVal: postObj.keyword
      },
      function() {
        // delete _this.data.fromShareData;
        // 这里可以再优化（因为有已经存在postObj数据了，就可以不用从tab组织postObj数据了，但是这里为了尽快上线，直接复用confirmChoose的方法）

        _this.confirmChoose()
      }
    )
  },
  /**
   * 输入价格区间
   */
  inputPrice: function(e) {
    const tab = this.data.tab

    if (e.target.dataset.price == 'min') {
      tab.price.min = parseInt(e.detail.value)
    } else {
      tab.price.max = parseInt(e.detail.value)
    }

    this.setData({
      tab: tab
    })
  },
  /**
   * 点击选择了筛选内容后，标签颜色变化(对应数据中的isChoose改为true)
   */
  chooseSpan: function(e) {
    const name = e.target.dataset.name
    const dataIndex = e.target.dataset.index
    const tabShow = this.data.tab.tabShow
    const tab = this.data.tab
    const data = tab[tabShow]

    for (let i = 0; i < data.length; i++) {
      if (data[i].name == name) {
        data[i].values[dataIndex].isChoose = !data[i].values[dataIndex].isChoose
      }
    }
    this.setData({
      tab: tab
    })
  },

  /**
   * 重置选项
   */
  resetChoose: function() {
    const tab = this.data.tab
    const tabShow = this.data.tabShow
    const str = this.data.tab.tabShow //正在打开的tab

    for (let i = 0; i < tab[str].length; i++) {
      for (let j = 0; j < tab[str][i].values.length; j++) {
        tab[str][i].values[j].isChoose = false
      }
    }

    if (str == 'filters') {
      // 把价格区间也归零
      tab.price.min = ''
      tab.price.max = ''
    }

    tabShow[str].showName = tabShow[str].name

    this.setData({
      tab: tab
    })

    this.confirmChoose()
  },

  /**
   * 点击任何一种排序
   */
  chooseArrange: function(e) {
    let _this = this

    const tab = _this.data.tab
    const tabShow = _this.data.tabShow

    tab.arrangeType = e.target.dataset.type
    tab.tabShow = ''
    tabShow.arrange.showName = e.target.dataset.text

    _this.setData({
      tab,
      tabShow
    })

    _this.confirmChoose()
  },

  /**
   * 提交筛选条件
   */
  confirmChoose: function() {
    let _this = this

    //为了防止触底事件，在商品清空前前滚动
    // _this.setData({
    //   isScrollToTop: true,
    // })
    // _this.getDistanceForTop();

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    // const tab = lodash.clone(this.data.tab);
    const tab = _this.data.tab
    let brand_id = []
    brand_id.push(_this.data.id)
    let data = {
      keyword: _this.data.inputVal,
      page_size: 20,
      filters: {
        brand_id: brand_id,
        filters: {}
      },
      sort: {}
    }

    // console.log("筛选数据",data);
    // 整理排序tab的数据
    switch (tab.arrangeType) {
      case 0:
        data.sort = {
          default: ''
        }
        break

      case 1:
        data.sort = {
          created_time: 'desc'
        }
        break

      case 2:
        data.sort = {
          retail_price: 'asc'
        }
        break

      case 3:
        data.sort = {
          retail_price: 'desc'
        }
        break
    }

    // 整理各种tab选项的数据（不用整理tab.other，因为filters中的一项和tab.other指向同一个地址）
    // 本来不需要整理tab.other，但是因为returnChoose里添加了一个功能（tab标签下，有筛选条件被选中，那么该tab标签的showName和name不一样，在页面体现出来的就是颜色变红），所以需要整理tab.other
    _this.returnChoose(data.filters, tab.proAndSer, 'proAndSer')
    _this.returnChoose(data.filters, tab.filters, 'filters')
    if (tab.other) {
      // 如果有smartag标签
      _this.returnChoose(data.filters, tab.other, 'other')
    }

    data.filters.price = tab.price
    if (tab.price.min || tab.price.max) {
      // 因为只要筛选里有价格变动，或者点击了筛选里的小标签，tab里的筛选字变红色（与前几个不一样），所以直接showName等于price就行
      _this.data.tabShow.filters.showName = 'price'
    }

    // 如果是点击分类进入的搜索页面，并且没有选择筛选里的分类，那么在post的数据里添加上分类
    if (_this.data.categoryText && !data.filters.categories) {
      data.filters.categories = []
      data.filters.categories.push(_this.data.categoryText)
    }

    tab.tabShow = ''
    let tabShow = _this.data.tabShow
    _this.setData(
      {
        tab,
        page: 1,
        // shopData: [],
        postObj: data,
        tabShow,
        productPage: 1,
        // brandProducts: [],
        isScrollToTop: true,
        share_search: false
      },
      function() {
        _this.getBrandProductsList()
      }
    )
  },

  /**
   * 挑选出已选择的选项组成相应的格式。传入array格式为[{ name: '活动', titleName: 'promotions', values: []}，...]
   */
  returnChoose: function(data, arr, str) {
    let tabShow = this.data.tabShow
    let showName = ''
    // 修改arr，就是直接修改this.data.tab对象里的内容
    for (let i = 0; i < arr.length; i++) {
      let values = []

      for (let j = 0; j < arr[i].values.length; j++) {
        const item = arr[i].values[j]

        if (item.isChoose == true) {
          if (arr[i].name == '品牌') {
            values.push(item.id)
            data['brand_id'] = values
            showName += item.text + ','
          } else {
            values.push(item.text)

            if (arr[i].titleName) {
              //一般固定的分类如：brand，categories，service，promotions，这类有设定的titleName

              data[arr[i].titleName] = values

              showName += item.text + ','
            } else {
              //筛选中不固定的分类，
              data.filters[arr[i].id] = values
              showName += item.text + ','
            }
          }
        }
      }
    }

    if (showName) {
      showName = showName.substr(0, showName.length - 1)
      tabShow[str].showName = showName
      this.setData({
        showName
      })
    } else {
      if (arr.length > 0 && tabShow[str]) {
        // 如果没有smarttag，那么这里不能赋值
        tabShow[str].showName = tabShow[str].name
      }
    }
  },

  /**
   * 展示选择商品下拉panel
   */
  showTab: function(event) {
    this.getDistanceForTop()
    // 设置是否打开下拉列表
    const tab = this.data.tab
    if (tab.tabShow == event.target.dataset.hi) {
      tab.tabShow = ''
    } else {
      tab.tabShow = event.target.dataset.hi
      // console.log("tab.tabShow =", tab.tabShow);
    }

    this.setData({
      tab: tab
    })
  },

  /**
   * 点击灰色区域隐藏tab
   */
  hideTab: function() {
    const tab = this.data.tab
    tab.tabShow = ''
    this.setData({
      tab
    })
  }
}

export default selectItem
