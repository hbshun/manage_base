import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/userInfo/components/parkingCouponList/index.js.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import moment from '../../../../../../common/js/moment.js'
import DisabledCouponCard from '../disabledCouponCard/index'
import CouponCard from '../couponCard/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    account_id: '',
    coupon_list: [],
    disabled_coupon_list: []
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id
    })
    this.getCarCouponList()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  getCarCouponList = () => {
    const _this = this
    const { account_id, coupon_list } = _this.data
    util.request({
      url: `${constant.getCarCouponList}?accountid=${account_id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          let new_coupon_list = _this.formateCouponList(res.data)
          _this.setData({
            coupon_list: coupon_list.concat(new_coupon_list)
          })
        }
      }
    })
  }
  formateCouponList = data => {
    const now = moment()
    const _this = this
    let coupon_list = []
    data.map((item, index) => {
      let conpou_item = {}
      //
      conpou_item.conpou_name = item.couponname
      conpou_item.conpou_title = item.tCouponTitle._title
      conpou_item.conpou_type = item.coupontype
      conpou_item.start_time = moment(item.begindate).format('YYYY.MM.DD')
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
      // 优惠券添加时间
      conpou_item.listid = item.listid
      conpou_item.roleid = item.roleid
      conpou_item.titleid = item.titleid
      conpou_item.userId = item.userId
      conpou_item.coupon_remark = item.tCouponTitle._remark
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
    const { coupon_list: coupon_list } = this.state
    return (
      <Block>
        <View>
          {coupon_list.map((item, index) => {
            return (
              <View key={'carcoupon-' + index}>
                <CouponCard couponInfo={item}></CouponCard>
              </View>
            )
          })}
        </View>
        <View className="no_more_coupon">--------- 没有更多啦 ---------</View>
      </Block>
    )
  }
}

export default _C
