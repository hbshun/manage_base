import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

const floorConfig = {
  data: {
    floor: {
      showFloor: false,
      value: '楼层',
      selectedFloor: []
    }
  },

  /**
   * 点击按钮显示／隐藏楼层弹层
   */
  floor_handleToggleFloor: function() {
    let { pulldown } = this.data

    pulldown.showFloor = !pulldown.showFloor
    pulldown.showSort = false
    pulldown.showClassify = false

    this.setData({
      pulldown
    })
  },

  /**
   * 隐藏楼层弹框
   */
  floor_hideFloor: function() {
    let pulldown = this.data.pulldown
    pulldown.showFloor = false

    this.setData({
      pulldown
    })
  },

  /**
   * 获取楼层数据
   */
  floor_getFloors: function() {
    let that = this
    let floor = this.data.floor

    util.request({
      url: constant.floors,
      hasToken: false,
      success: function(data) {
        floor.data = data.results

        that.setData({
          floor
        })
      }
    })
  },

  /**
   * 选择楼层
   */
  floor_handleSelectFloor: function(e) {
    let index = e.currentTarget.dataset.index
    let floor = this.data.floor
    let floorData = floor.data

    floorData[index].isSelected = !floorData[index].isSelected

    this.setData({
      floor
    })
  },

  /**
   * 重置按钮
   */
  floor_handleResetFloor: function() {
    let floor = this.data.floor
    let floorData = floor.data

    if (floorData) {
      floorData.forEach(item => {
        item.isSelected = false
      })
      // floor.value = '楼层';

      this.setData({
        floor
      })

      this.floor_handleConfirmFloor()
    }
  },

  /**
   * 确定按钮
   */
  floor_handleConfirmFloor: function(options) {
    let { floor, brandList, resultList, classify, pageSize } = this.data
    let floorData = floor.data
    let selectedFloor = []
    let floorValue = []

    if (floorData) {
      floorData.forEach(item => {
        if (item.isSelected) {
          selectedFloor.push(item.id)
          floorValue.push(item.name)
        }
      })

      this.floor_searchBrandByFloor(selectedFloor, floorValue)
    }
  },

  // 帅选楼层
  floor_searchBrandByFloor: function(selectedFloor, floorValue) {
    let { floor, brandList, resultList, classify, pageSize } = this.data
    let floorBrand = []
    // console.log('----> floor: ', selectedFloor, floorValue);
    // 楼层数据
    floor.selectedFloor = selectedFloor
    floor.value = floorValue.length > 0 ? floorValue.join('、') : '楼层'

    // 清除分类数据
    classify.value = '分类'
    classify.type = null
    classify.id = -1

    // floorBrand = this.searchBrand(data.brandList, classify, floor.selectedFloor);
    floorBrand = this.floor_searchBrand(brandList, floor.selectedFloor)

    // 排序
    const sort = this.data.sort
    if (sort.value === '按热度') {
      floorBrand = this.sortByHot(floorBrand)
    } else {
      floorBrand = this.sortByNew(floorBrand)
    }

    this.data.resultList = floorBrand
    this.data.pageCurrent = 1

    this.floor_hideFloor()

    this.setData({
      classify,
      floor,
      brandListItemData: floorBrand.slice(0, pageSize),
      isLoading: floorBrand.length > this.data.pageSize
    })
  },

  /**
   * 按照楼层筛选专柜
   */
  floor_searchBrand: function(data, floor) {
    let floorArr = []

    if (floor.length > 0) {
      data.forEach(brand => {
        let i = 0,
          len = floor.length
        for (; i < len; i++) {
          if (brand.floor && brand.floor.id == floor[i]) {
            floorArr.push(brand)
          }
        }
      })
    } else {
      floorArr = data.slice(0, data.length)
    }

    return floorArr
  }
}

export default floorConfig
