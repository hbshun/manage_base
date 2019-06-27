import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

const classifyConfig = {
  data: {
    classify: {
      showClassify: false,
      value: '分类',
      data: [],
      // 默认显示列表第一项
      index: 1,
      // 当前显示的分类项
      item: Object.create(null),
      type: 'id',
      id: 0
    }
  },

  /**
   * 显示/隐藏分类弹层事件
   */
  classify_handleTaggleClassify: function() {
    let { pulldown } = this.data

    pulldown.showFloor = false
    pulldown.showSort = false
    pulldown.showClassify = !pulldown.showClassify

    this.setData({
      pulldown
    })
  },

  /**
   * 关闭分类弹层
   */
  classify_hideClassify: function() {
    let pulldown = this.data.pulldown
    pulldown.showClassify = false

    this.setData({
      pulldown
    })
  },

  /**
   * 获取分类数据
   */
  classify_getBrandCategories: function() {
    // brandcategories
    let that = this
    let classify = this.data.classify

    util.request({
      url: constant.brandcategories,
      hasToken: false,
      success: function(data) {
        classify.data = data.results
        // 添加全部分类
        classify.data.unshift({
          id: 0,
          name: '全部分类',
          brands_count: 0
        })
        classify.item = classify.data[classify.index]

        that.setData({
          classify
        })
      }
    })
  },

  /**
   * 点击父分类
   */
  classify_handleParentClick: function(e) {
    let { brandList, classify, pageSize, floor } = this.data
    const dataset = e.currentTarget.dataset

    classify.index = dataset.index
    classify.item = classify.data[dataset.index]

    // 点击全部分类时
    if (classify.index === 0) {
      this.data.resultList = brandList
      this.data.pageCurrent = 1

      this.classify_hideClassify()

      classify.value = '全部分类'
      classify.type = 'pid'
      classify.id = 0

      // 清除楼层数据
      floor.selectedFloor = []
      floor.value = '楼层'

      this.setData({
        floor,
        classify,
        brandListItemData: brandList.slice(0, pageSize),
        isLoading: true
      })
    }
    // 正常点击父分类
    else {
      this.setData({
        classify
      })
    }
  },

  /**
   * 点击子分类，获取专柜数据
   */
  classify_handleGetSortData: function(e) {
    const dataset = e.currentTarget.dataset
    this.classify_searchBrandOptions(dataset)
  },

  /**
   * search
   */
  classify_searchBrandOptions: function(dataset) {
    let { floor, brandList, classify, pageSize } = this.data
    let classifyArr = []
    // console.log('----> classify:', dataset);
    // 分类数据
    classify.value = dataset.name
    classify.type = dataset.type
    classify.id = dataset.id

    // 清除楼层数据
    floor.selectedFloor = []
    floor.value = '楼层'

    // classifyArr = this.searchBrand(data.brandList, classify, floor.selectedFloor);
    classifyArr = this.classify_searchBrand(brandList, classify)

    this.data.resultList = classifyArr
    this.data.pageCurrent = 1

    this.classify_hideClassify()

    this.setData({
      floor,
      classify,
      brandListItemData: classifyArr.slice(0, pageSize),
      isLoading: classifyArr.length > pageSize
    })
  },

  /**
   * 按分类筛选专柜
   */
  classify_searchBrand: function(data, classify) {
    let classifyArr = []

    if (classify.id === 0) {
      classifyArr = data.slice(0, data.length)
    } else {
      data.forEach(brand => {
        let i = 0,
          len = brand.categories.length,
          catefory
        for (; i < len; i++) {
          catefory = brand.categories[i]
          // 子分类
          if (classify.type === 'id') {
            if (catefory.id == classify.id) {
              classifyArr.push(brand)
              break
            }
          }
          // 父分类
          else {
            if (catefory.parent_id == classify.id) {
              classifyArr.push(brand)
              break
            }
          }
        }
      })
    }

    // 排序
    const sort = this.data.sort
    if (sort.value === '按热度') {
      classifyArr = this.sortByHot(classifyArr)
    } else {
      classifyArr = this.sortByNew(classifyArr)
    }

    return classifyArr
  }
}

export default classifyConfig
