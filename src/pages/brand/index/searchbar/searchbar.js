/**
 * search bar
 */
import util from '../../../../utils/util.js'

const searchConfig = {
  data: {
    search: {
      inputShowed: false,
      inputVal: ''
    }
  },
  /**
   * 显示搜索框
   */
  search_showInput: function() {
    let searchData = this.data.search
    searchData.inputShowed = true
    this.setData({
      search: searchData
    })

    // wx.pageScrollTo({
    //   scrollTop: 0,
    // });
  },
  /**
   * 隐藏搜索框
   */
  search_hideInput: function() {
    let { pageSize, brandList, search } = this.data

    search.inputShowed = false
    search.inputVal = ''

    this.data.resultList = brandList
    this.data.pageCurrent = 1

    this.setData({
      search,
      brandListItemData: brandList.slice(0, pageSize)
    })
  },
  /**
   * 清空输入框
   */
  search_clearInput: function() {
    let { pageSize, brandList, search } = this.data

    search.inputVal = ''

    this.data.resultList = brandList
    this.data.pageCurrent = 1

    this.setData({
      search,
      brandListItemData: brandList.slice(0, pageSize),
      isLoading: true
    })
  },
  /**
   * 获取搜索字符串
   */
  search_inputTyping: function(e) {
    const val = e.detail.value
    if (val && val.length > 0) {
      this.searchBrandByKeyWord(val)
    }
  },

  // 根据关键字搜索品牌
  searchBrandByKeyWord: function(keyWord) {
    const { brandList, search, pageSize } = this.data
    let searchResults = util.search(brandList, keyWord)
    let searchData = { ...search }
    searchData.inputVal = keyWord

    this.data.resultList = searchResults
    this.data.pageCurrent = 1

    this.setData({
      search: searchData,
      brandListItemData: searchResults.slice(0, pageSize),
      isLoading: searchResults.length > pageSize
    })
  }
}

export default searchConfig
