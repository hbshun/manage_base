import Taro from '@tarojs/taro'
/**
 * sort
 */

const sortConfig = {
  data: {
    sort: {
      showSort: false,
      value: '按热度'
    }
  },

  /**
   * 点击按钮打开／关闭分类选择项
   */
  sort_handleTaggleSort: function() {
    let { pulldown } = this.data

    pulldown.showFloor = false
    pulldown.showSort = !pulldown.showSort
    pulldown.showClassify = false

    this.setData({
      pulldown
    })
  },

  /**
   * 关闭分类选择项
   */
  sort_hideSort: function() {
    let pulldown = this.data.pulldown
    pulldown.showSort = false

    this.setData({
      pulldown
    })
  },

  /**
   * 按热度
   */
  sort_handleSortByHot: function(e) {
    const requestStart = Date.now()

    let data = this.data
    let sort = data.sort

    sort.value = e.currentTarget.dataset.value

    let hotData = this.sortByHot(data.resultList)
    this.data.resultList = hotData
    this.data.pageCurrent = 1
    // console.log(hotData);
    this.sort_hideSort()

    this.setData({
      sort,
      brandListItemData: hotData.slice(0, data.pageSize)
    })

    const requestEnd = Date.now()
    console.log('----> 按热度排序并设置数据的时间：', requestEnd - requestStart)
  },

  /**
   * 新进馆
   */
  sort_handleSortByNew: function(e) {
    const requestStart = Date.now()

    let data = this.data
    let sort = data.sort

    sort.value = e.currentTarget.dataset.value

    // let newData = data.resultList.sort((a, b) => {

    //   let aTime = new Date(a.created_time).getTime();
    //   let bTime = new Date(b.created_time).getTime();
    //   return bTime - aTime;

    // });

    let newData = this.sortByNew(data.resultList)
    // console.log(newData);
    const requestEnd = Date.now()
    console.log('----> 按新进馆排序时间：', requestEnd - requestStart)

    const requestStart2 = Date.now()

    this.data.resultList = newData
    this.data.pageCurrent = 1

    this.sort_hideSort()

    this.setData({
      sort: sort,
      brandListItemData: newData.slice(0, data.pageSize)
    })

    const requestEnd2 = Date.now()
    console.log('----> 新进馆设置数据的时间：', requestEnd2 - requestStart2)
  },

  /**
   * 按英文
   */
  sort_handleSortByEn: function(e) {
    Taro.navigateTo({
      url: '/pages/brand/letter/letter?sort=en'
    })
  },

  /**
   * 按中文
   */
  sort_handleSortByZh: function(e) {
    Taro.navigateTo({
      url: '/pages/brand/letter/letter?sort=zh'
    })
  },

  /**
   * 跳转按字母排序页面
   */
  sort_handleToLetter: function() {
    Taro.navigateTo({
      url: '/pages/brand/letter/letter?sort=zh'
    })
  }
}

export default sortConfig
