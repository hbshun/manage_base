import { Block, View, ScrollView, Image, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/onlineOrders/components/orderList/orderList.js
import constant from '../../../../../../config/constant.js'
import util from '../../../../../../utils/util.js'
import onlineOrderUtil from '../../../../../../utils/onlineOrderUtil.js'
import QRcode from '../../../../../../component/QRcode/QRcode.js'
import OrderCard from './components/orderCard/index'
import QrcodeTmpl from '../../../../../../imports/QrcodeTmpl.js'
import './index.scss'
let pageConfig = {
  /**
   * 页面的初始数据
   */
  data: {
    orderStatusOptions: constant.orderStatusOptions, // 所有订单类型
    orderStatus: '', // 订单状态：默认全部
    orderData: [], // 订单数据
    loadStatus: '', // noorder loading baseline
    // 当前页数
    pageIndex: 1,
    // 每页数量
    pageSize: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.type)
    this.setData({
      orderStatus: options.type || ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      orderData: [],
      pageIndex: 1
    })
    // 根据订单类型请求数据
    this.loadingData(this.data.orderStatus)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      orderData: [],
      pageIndex: 1
    })

    this.loadingData(this.data.orderStatus)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let { pageSize, pageIndex, count } = this.data
    if (pageSize * pageIndex >= count) {
      return
    } else {
      this.data.pageIndex++
      this.loadingData(this.data.orderStatus)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  /**
   * 重新加载订单列表数据
   */
  reloadOrderList: function(e) {
    this.setData({
      orderData: [],
      pageIndex: 1
    })
    this.loadingData(e.detail.status)
  },

  /**
   * 订单状态筛选切换
   */
  handleOrderStatusChange: function(e) {
    // 获取当前订单状态
    let currentOrderStatus = e.target.dataset.name
    // 获取data中订单状态
    let { orderStatus } = this.data
    // 当前订单状态和data中订单状态一致，直接return
    if (currentOrderStatus === orderStatus) {
      return
    }
    // 打印日志-方便地主查看
    util.printLog('wechat_app', 'go_order_' + currentOrderStatus, '')
    this.setData({
      // 设置订单状态
      orderStatus: currentOrderStatus,
      // 初始化数据
      orderData: [],
      loadStatus: '',
      pageIndex: 1
    })
    // 请求当前订单状态数据
    this.loadingData(currentOrderStatus)
  },

  /**
   * 判断订单状态，加载数据
   * 全部all：不添加任何筛选条件
   * 待支付unpaid：status=unpaid
   * 待发货init：准备中+快递订单待发货   status=to_ship
   * 可自提to_pickup：自提订单可自提  status=to_pickup
   * 售后after_sale：status=after_sale
   * 已完成completed：status=completed
   */
  loadingData: function(params) {
    let searchParams = {
      status: ''
    }
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 2000
    })
    switch (params) {
      case 'unpaid':
        searchParams.status = 'unpaid'
        break
      case 'init':
        searchParams.status = 'to_ship'
        break
      case 'to_pickup':
        searchParams.status = 'to_pickup'
        break
      case 'after_sale':
        searchParams.status = 'after_sale'
        break
      case 'completed':
        searchParams.status = 'completed'
        break
      default:
        searchParams.status = ''
    }
    this.getOrderListData(searchParams)
  },

  /**
   * 获取订单数据
   */
  getOrderListData: function(searchParams) {
    let _this = this
    let { pageSize, pageIndex, loadStatus, orderData } = _this.data
    util.request({
      url: `${constant.orderLine}?page_size=${pageSize}&page=${pageIndex}&status=${searchParams.status}`,
      success: function(data) {
        Taro.hideToast()
        Taro.stopPullDownRefresh()
        // 加载状态
        if (data.count <= 0) {
          // 没有订单
          loadStatus = 'noorder'
          orderData = []
        } else {
          if (pageSize * pageIndex >= data.count) {
            // 上拉加载 - 没有更多数据
            loadStatus = 'no_more_order'
          }
          let orderDataCurrent = _this.formatOrderData(data.results)
          orderData = orderData.concat(orderDataCurrent)
        }
        console.log('loadStatus', loadStatus)
        _this.setData({
          orderData,
          loadStatus,
          count: data.count
        })
      }
    })
  },

  /**
   * 格式化订单数据
   */
  formatOrderData: function(data) {
    let _this = this
    let orderData = data.map(order => {
      let brands = (() => {
        let arr = []
        order.brands.forEach(brand => {
          arr.push(brand.name)
        })
        return arr.join('，')
      })()
      let images = (() => {
        let arr = []
        order.lines.forEach(item => {
          arr.push(item.main_image)
        })
        const len = arr.length
        if (len > 5) {
          arr.splice(4, len - 5)
        }
        return arr
      })()
      let orderObj = {
        id: order.id,
        brands:
          brands.length > 18 ? `${util.substring(brands, 0, 17)}...` : brands,
        images: images,
        products_count: order.products_count,
        shipping_status: order.shipping_status,
        total_amount: order.total_amount,
        number: order.number,
        invoice: order.invoice,
        invoice_url: order.invoice ? order.invoice.pdf_url : '',
        // 订单状态
        status: order.status,
        aftersale_status: order.aftersale_status,
        statusText: onlineOrderUtil.translateOrderStatusText(
          order.status,
          order.aftersale_status
        ),
        title: order.lines[0] && order.lines[0].title,
        cash_pay_amount: order.cash_pay_amount,
        cash_total_amount: order.cash_total_amount,
        orderType: order.order_type
      }

      switch (order.order_type) {
        case 'flashsale':
          orderObj.url =
            '/pages/usercenter/components/onlineOrders/components/orderDetail/index?id=' +
            order.id
          break
        case 'online':
          orderObj.url =
            '/pages/usercenter/components/onlineOrders/components/orderDetail/index?id=' +
            order.id
          break
        case 'vending':
          orderObj.url =
            '/vendingMachine/order/detail?id=' + order.id + '&type=vending'
          break
        case 'screen':
          orderObj.url =
            '/electronicScreen/order/detail?id=' + order.id + '&type=screen'
          break
        case 'rfid':
          orderObj.url = '/rfid/order/detail?id=' + order.id + '&type=rfid'
      }
      return orderObj
    })
    return orderData
  }
}
const assignedObject = util.assignObject(pageConfig, QRcode)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '订单列表',
    backgroundColor: '#efeff4'
  }

  render() {
    const {
      orderData: orderData,
      imagePath: imagePath,
      QRpickupInfo: QRpickupInfo,
      loadStatus: loadStatus,
      orderStatusOptions: orderStatusOptions,
      index: index,
      orderStatus: orderStatus,
      item: item
    } = this.state
    return (
      <Block>
        <View className="page">
          <View className="header-screen">
            {orderStatusOptions.map((item, index) => {
              return (
                <View
                  key={'list-search-' + index}
                  className={
                    'screen-item ' +
                    (orderStatus === item.name ? 'selected' : ' ')
                  }
                  data-value={item.value}
                  data-name={item.name}
                  onClick={this.handleOrderStatusChange}
                >
                  {item.value}
                </View>
              )
            })}
          </View>
          {/*  订单/退单列表  */}
          <ScrollView className="order-card-content">
            <OrderCard
              orderData={orderData}
              onReloadOrderList={this.reloadOrderList}
            ></OrderCard>
          </ScrollView>
        </View>
        {/*  二维码提货提示弹窗  */}
        <QRcodeTmpl
          data={{
            imagePath: (imagePath, QRpickupInfo)
          }}
        ></QRcodeTmpl>
        {/*  没有订单显示  */}
        {loadStatus === 'noorder' ? (
          <View className="order-nocontent">
            <I className="sparrow-icon icon-noorder"></I>
            <View>暂时没有此类订单</View>
          </View>
        ) : (
          loadStatus === 'no_more_order' && (
            <View className="weui-loadmore weui-loadmore_line">
              <View className="weui-loadmore__tips weui-loadmore__tips_in-line">
                没有更多订单啦
              </View>
            </View>
          )
        )}
      </Block>
    )
  }
}

export default _C
