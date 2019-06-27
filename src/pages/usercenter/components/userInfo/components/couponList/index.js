import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/userInfo/components/couponList/index.js

import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import moment from 'moment'
import DisabledCouponCard from '../disabledCouponCard/index'
import CouponCard from '../couponCard/index'
import Navbar from '../../../../../../component/narbar/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    account_id: '',
    coupon_list: [],
    used_coupon_list: [],
    expired_coupon_list: [],
    navbar_options: [
      {
        name: '1',
        value: '未使用'
      },
      {
        name: '2',
        value: '已使用'
      },
      {
        name: '3',
        value: '已过期'
      }
    ],
    navbar_value: '1',
    page_size: 10,
    page_index: 1,
    loadStatus: '',
    total_pages: 0
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id
    })
    this.judgeConpouType()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {
    this.setData({
      coupon_list: [],
      used_coupon_list: [],
      expired_coupon_list: [],
      page_index: 1
    })
    this.judgeConpouType()
    Taro.stopPullDownRefresh()
  }
  onReachBottom = () => {
    const _this = this
    let { page_index, page_size, total_pages } = _this.data
    if (page_index >= total_pages) {
      _this.setData({
        loadStatus: 'noorder'
      })
      return
    } else {
      _this.data.page_index++
      _this.judgeConpouType()
    }
  }
  onShareAppMessage = () => {}
  handlerNavbarValueChange = e => {
    const _this = this
    _this.setData({
      navbar_value: e.detail.current_navbar_value,
      page_index: 1,
      page_size: 10,
      coupon_list: [],
      used_coupon_list: [],
      expired_coupon_list: []
    })
    _this.judgeConpouType()
  }
  judgeConpouType = () => {
    const _this = this
    let { navbar_value } = _this.data
    if (navbar_value === '1') {
      _this.getUsableCouponList()
    } else if (navbar_value === '2') {
      _this.getUsedCouponList()
    } else if (navbar_value === '3') {
      _this.getExpiredCouponList()
    }
  }
  getUsableCouponList = () => {
    const _this = this
    const { account_id, coupon_list, page_index, page_size } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getUsableCouponList}?accountid=${account_id}&pagesize=${page_size}&pageindex=${page_index}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          let new_coupon_list = _this.formateCouponList(res.data.data)
          _this.setData({
            coupon_list: coupon_list.concat(new_coupon_list),
            total_pages: res.data.pages
          })
        } else {
          _this.setData({
            loadStatus: 'noorder'
          })
        }
      }
    })
  }
  getUsedCouponList = () => {
    const _this = this
    const { account_id, used_coupon_list, page_index, page_size } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getUsedCouponList}?accountid=${account_id}&pagesize=${page_size}&pageindex=${page_index}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          let new_used_coupon_list = _this.formateCouponList(res.data.data)
          _this.setData({
            used_coupon_list: used_coupon_list.concat(new_used_coupon_list),
            total_pages: res.data.pages
          })
        } else {
          _this.setData({
            loadStatus: 'noorder'
          })
        }
      }
    })
  }
  getExpiredCouponList = () => {
    const _this = this
    const {
      account_id,
      expired_coupon_list,
      page_index,
      page_size
    } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getExpiredCouponList}?accountid=${account_id}&pagesize=${page_size}&pageindex=${page_index}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          let new_expired_coupon_list = _this.formateCouponList(res.data.data)
          _this.setData({
            expired_coupon_list: expired_coupon_list.concat(
              new_expired_coupon_list
            ),
            total_pages: res.data.pages
          })
        } else {
          _this.setData({
            loadStatus: 'noorder'
          })
        }
      }
    })
  }
  formateCouponList = data => {
    const now = moment()
    let coupon_list = []
    data.map((item, index) => {
      let conpou_item = {}
      // 优惠券名称
      conpou_item.conpou_name =
        item.couponname.length > 16
          ? `${util.substring(item.couponname, 0, 15)}...`
          : item.couponname
      // 优惠券标题
      conpou_item.conpou_title =
        item.tCouponTitle._title.length > 16
          ? `${util.substring(item.tCouponTitle._title, 0, 15)}...`
          : item.tCouponTitle._title
      // 优惠券类型
      conpou_item.conpou_type = item.coupontype
      // 优惠券生效时间
      conpou_item.start_time = moment(item.begindate).format('YYYY.MM.DD')
      // 优惠券失效时间
      conpou_item.end_time = moment(item.endate).format('YYYY.MM.DD')
      // 优惠券是否即将过期
      conpou_item.about_to_expire =
        moment(item.endate).diff(now, 'days') <= 3 ? true : false
      // 使用限制
      conpou_item.usage_restriction = item.paymin
      // 优惠券状态
      conpou_item.status = item.status
      // 优惠券金额
      conpou_item.conpou_value = item.faceamt
      conpou_item.conpou_code = item.code
      conpou_item.listid = item.listid
      conpou_item.roleid = item.roleid
      conpou_item.titleid = item.titleid
      conpou_item.userId = item.userId
      conpou_item.coupon_remark =
        item.tCouponTitle._remark.length > 16
          ? `${util.substring(item.tCouponTitle._remark, 0, 15)}...`
          : item.tCouponTitle._remark
      conpou_item.coupon_limitremark = util.removeStringMark(
        item.tCouponTitle._limitremark,
        '<br/>'
      )
      coupon_list.push(conpou_item)
    })
    return coupon_list
  }
  config = {}

  render() {
    const {
      navbar_options: navbar_options,
      navbar_value: navbar_value,
      coupon_list: coupon_list,
      used_coupon_list: used_coupon_list,
      expired_coupon_list: expired_coupon_list,
      loadStatus: loadStatus
    } = this.state
    return (
      <View>
        <Navbar
          navbarOptions={navbar_options}
          onHandlerNavbarValueChange={this.handlerNavbarValueChange}
        ></Navbar>
        <View className="coupon-list">
          {navbar_value === '1' ? (
            <View>
              {coupon_list.map((item, index) => {
                return (
                  <View key={'coupon_' + index}>
                    <CouponCard couponInfo={item}></CouponCard>
                  </View>
                )
              })}
            </View>
          ) : navbar_value === '2' ? (
            <View>
              {used_coupon_list.map((item, index) => {
                return (
                  <View key={'used_coupon_' + index}>
                    <DisabledCouponCard
                      couponInfo={item}
                      type="used_coupon_list"
                    ></DisabledCouponCard>
                  </View>
                )
              })}
            </View>
          ) : (
            navbar_value === '3' && (
              <View>
                {expired_coupon_list.map((item, index) => {
                  return (
                    <View key={'expired_coupon_' + index}>
                      <DisabledCouponCard
                        couponInfo={item}
                        type="expired_coupon_list"
                      ></DisabledCouponCard>
                    </View>
                  )
                })}
              </View>
            )
          )}
          {loadStatus === 'noorder' ? (
            <View className="no_more_coupon">
              --------- 没有更多啦 ---------
            </View>
          ) : (
            loadStatus === 'loading' && (
              <View className="weui-loadmore">
                <View className="weui-loading"></View>
                <View className="weui-loadmore__tips">正在加载</View>
              </View>
            )
          )}
        </View>
      </View>
    )
  }
}

export default _C
