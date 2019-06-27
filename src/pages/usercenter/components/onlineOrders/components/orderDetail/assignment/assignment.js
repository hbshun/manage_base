import { Block, View, Navigator, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import constant from '../../../../../../../config/constant.js'
import util from '../../../../../../../utils/util.js'
import orderProduct from '../../../../../../../component/orderProduct/orderProduct.js'

import OrderProductTmpl from '../../../../../../../imports/OrderProductTmpl.js'
import OrderAddressTmpl from '../../../../../../../imports/OrderAddressTmpl.js'
import OrderTraceTmpl from '../../../../../../../imports/OrderTraceTmpl.js'
import './assignment.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    status: {},
    assignmentId: '' // 发货单号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      assignmentId: options.assignment_id
    })
    this.getAssignmentInfo(options.assignment_id)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 获得配货单信息
   */
  getAssignmentInfo: function(id) {
    const _this = this
    util.request({
      url: constant.assignmentInfo + id + '/',
      method: 'GET',
      success: function(res) {
        let proGift = _this.initialAssignment(res.line_assignments)
        let address = res.shipping_address
        let status = {}
        status.status = res.shipping_status
        status.updatedTime = util.formatTimeString(res.updated_time)
        if (res.shipping_method == 'express') {
          // 快递
          status.shippingMethod = 'express'
          if (res.express_order && res.express_order.express_name) {
            // 有物流信息了
            status.hasExpressInfo = true
            status.express = res.express_order.express_name
            status.expressNum = res.express_order.shipping_number
            status.expressCode = res.express_order.express_code
            status.traceUrl =
              '../assignmentTrace/assignmentTrace?express_code=' +
              res.express_order.express_code +
              '&express_num=' +
              res.express_order.shipping_number +
              '&express_name=' +
              res.express_order.express_name +
              '&order_number=' +
              res.express_order.order_number
          } else {
            // 还没物流信息
            status.hasExpressInfo = false
          }
        } else if (res.shipping_method == 'self_service') {
          // 自提
          status.shippingMethod = 'self_service'
        }
        status.isAssignmentPage = true
        _this.setData({
          proGift,
          address,
          status,
          orderType: 'line'
        })
      },
      fail: function(e) {
        console.log(e)
        console.log('失败了')
      }
    })
  },

  /**
   * 规范化商品列表
   */
  initialAssignment: function(products) {
    let productObj = {}
    products.forEach(product => {
      if (!productObj[product.line.brand.id]) {
        productObj[product.line.brand.id] = {
          brandName: product.line.brand.name,
          proGift: []
        }
      }
      let tempObj = {
        // promotion_type_name: constant.promotions[product.promotion_type_name],
        main_image: product.line.main_image,
        title: product.line.title,
        sku_attr: product.line.sku_attr,
        retail_price: product.retail_price,
        original_price: product.original_price,
        quantity: product.quantity,
        productGiftId: product.product_id
      }
      productObj[product.line.brand.id].proGift.push(tempObj)
    })
    return productObj
  }
}

const assignedObject = util.assignObject(pageData, orderProduct)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '查看包裹',
    enablePullDownRefresh: false
  }

  render() {
    const {
      status: status,
      orderType: orderType,
      address: address,
      assignmentId: assignmentId,
      proGift: proGift
    } = this.state
    return (
      <Block>
        <OrderTraceTmpl
          data={{
            status: (status, orderType)
          }}
        ></OrderTraceTmpl>
        {status.shippingMethod == 'express' && (
          <OrderAddressTmpl
            data={{
              address: address
            }}
          ></OrderAddressTmpl>
        )}
        <View className="assignment-number">
          <View className="assignment-num-item">
            <View className="assignment-num-item-l">发货单号：</View>
            <View className="assignment-num-item-r">{assignmentId}</View>
          </View>
          <View className="assignment-num-item">
            <View className="assignment-num-item-l">发货方式：</View>
            <View className="assignment-num-item-r">
              {status.shippingMethod == 'express' ? '快递' : '自提'}
            </View>
          </View>
        </View>
        <View className="mt20">
          <OrderProductTmpl
            data={{
              proGift: proGift
            }}
          ></OrderProductTmpl>
        </View>
      </Block>
    )
  }
}

export default _C
