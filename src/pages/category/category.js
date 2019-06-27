import { Block, View, Image, Icon, Input, Label } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/category/category.js
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import searchModule from './module/searchModule/searchModule.js'
import GIO_utils from '../../utils/GIO_utils.js'
import './category.scss'
const app = Taro.getApp()
const categoryData = {
  /**
   * 页面的初始数据
   */
  data: {
    categoryList: [], // 热销分类数组(本来)
    categDescObj: {}, // 热销分类——大类下的多个item——小类，与categoryList可以用 categoryId 来对应上
    currentId: 0,
    tabbar: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCategoryListData()
    // app.changeTabBar();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    util.printLog('wechat_app', 'go_to_category', '')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '分类页面'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    const url_options = {
      channel: '小程序分享',
      pageName: '分类页面'
    }
    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    const _this = this

    this.setData(
      {
        categoryList: [], // 热销分类数组(本来)
        categDescObj: {}, // 热销分类——大类下的多个item——小类，与categoryList可以用 categoryId 来对应上
        currentId: 0
      },
      function() {
        _this.getCategoryListData()
      }
    )
  },

  /**
   * 获得热销分类列表
   */
  getCategoryListData: function() {
    const _this = this

    Taro.showToast({
      icon: 'loading',
      title: '正在加载中...',
      mask: true,
      duration: 2000
    })

    util.request({
      url: constant.getCategoryListData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        Taro.stopPullDownRefresh()
        Taro.hideToast()
        _this.handleCategoryListData(res.results)
      }
    })
  },

  /**
   * 处理热销分类列表数据
   */
  handleCategoryListData: function(data) {
    let categoryList = [] // 大类数组

    for (let i = 0; i < data.length; i++) {
      let obj = {}
      const category = data[i]

      obj.categoryId = category.id
      obj.name = category.name
      categoryList.push(obj)

      // 把大类中的小类整合到categDescObj中，用大类的id来获得小类arr展示
      this.addToCategDescObj(obj.categoryId, category.children)
    }

    this.setData({
      categDescObj: this.data.categDescObj,
      categoryList: categoryList,
      currentId: categoryList[0].categoryId
    })

    // (和购物车一样)不知道为什么，只有这里再加上这一行，才不会出错，否则购物车里每刷新一次都不能完全收回（不许改哟(＾Ｕ＾））
    Taro.hideToast()
  },

  /**
   * 把大类中的小类别添加到categDescObj
   */
  addToCategDescObj: function(id, categoryChildren) {
    let { categDescObj } = this.data
    let childrenArr = []
    for (let i = 0; i < categoryChildren.length; i++) {
      let obj = {}
      const categDesc = categoryChildren[i]

      obj.image = categDesc.image
      obj.name = categDesc.name
      obj.id = categDesc.id
      obj.fatherCategoryId = id
      childrenArr.push(obj)
    }
    categDescObj[id] = childrenArr
  },

  /**
   * 点击左边的category栏后，右边的分类会变化
   */
  clickChangeCurrentCategory: function(e) {
    const currentId = e.currentTarget.dataset.categoryId
    this.setData({
      currentId
    })
  },

  /**
   * 点击category右边的小分类
   */
  clickCategoryDesc: function(e) {
    const categoryName = e.currentTarget.dataset.categoryName

    Taro.navigateTo({
      url: '/packageA/product/list/list?category=' + categoryName
    })
  }
}

const assignedObject = util.assignObject(categoryData, searchModule)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '所有分类'
  }

  render() {
    const {
      categoryList: categoryList,
      currentId: currentId,
      categDescObj: categDescObj,
      inputVal: inputVal,
      inputShowed: inputShowed
    } = this.state
    return (
      <View className="page">
        <View className="weui-search-bar search-big-div">
          <View className="weui-search-bar__form">
            <View className="weui-search-bar__box list-page">
              <Icon
                className="weui-icon-search_in-box"
                type="search"
                size="14"
              ></Icon>
              <Input
                type="text"
                className="weui-search-bar__input"
                placeholder="搜索"
                value={inputVal}
                focus={inputShowed}
                onInput={this.inputTyping}
                onConfirm={this.searchSend}
                confirmType="send"
              ></Input>
              {inputVal.length > 0 && (
                <View className="weui-icon-clear" onClick={this.clearInput}>
                  <Icon type="clear" size="14"></Icon>
                </View>
              )}
            </View>
            <Label
              className="weui-search-bar__label searchModule"
              hidden={inputShowed}
              onClick={this.showInput}
            >
              <Icon className="sparrow-icon icon-search"></Icon>
              <View className="weui-search-bar__text">搜索商品</View>
            </Label>
          </View>
        </View>
        <View className="category-container clearfix">
          <View className="category-first">
            {categoryList.map((item, index) => {
              return (
                <View
                  key={'category-list-' + index}
                  data-category-id={item.categoryId}
                  className="category-first-item-out"
                  onClick={this.clickChangeCurrentCategory}
                >
                  <View
                    className={
                      'category-first-item ' +
                      (item.categoryId == currentId ? 'current' : '')
                    }
                  >
                    {item.name}
                  </View>
                </View>
              )
            })}
          </View>
          <View className="category-second">
            {/*  <image src='https://ts-image.dongyouliang.com/media%2Fsparrow_homebase%2F%E7%84%A6%E7%82%B9%E5%9B%BE1.jpg' mode="widthFix" style='width: 100%'></image>  */}
            <View className="category-name-div">
              <View className="category-name">
                <Span className="red-line">——</Span>
                {categoryList[currentId - 1].name}
                <Span className="red-line">——</Span>
              </View>
            </View>
            <View className="category-second-list">
              {categDescObj[currentId].map((item, index) => {
                return (
                  <View
                    key={'categ-desc-obj-' + index}
                    className="category-second-item"
                    data-category-name={item.name}
                    onClick={this.clickCategoryDesc}
                  >
                    <Image src={item.image}></Image>
                    <View>{item.name}</View>
                  </View>
                )
              })}
            </View>
          </View>
        </View>
        {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
      </View>
    )
  }
}

export default _C
