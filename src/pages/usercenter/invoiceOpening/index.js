import {
  Block,
  View,
  RadioGroup,
  Label,
  Checkbox,
  Icon,
  Button,
  Form
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/index.js
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    service_phone: constant.SERVICE_PHONE,
    //开发票步骤：1，选择发票类型；2，确认信息；3，开立成功
    currentStep: 1,
    type: '',
    invoice_data: {},
    invoiceTypeOptions: [],
    invoiceType: '',
    invoiceValue: 0,
    invoiceTypeTitle: '',
    invoiceTypeId: 0,
    account_id: '',
    order_number: '',
    invoice_title_info: {},
    // 线下开发票明细条目
    invoice_detail: []
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id | '',
      order_number: options.order_number,
      type: options.type,
      phone: wx.globalData.phone
    })
    this.goToInvocie()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  goToInvocie = () => {
    const _this = this
    let { type } = _this.data
    if (type === 'online') {
      _this.getOnlineInvoiceValue()
    } else if (type === 'offline') {
      _this.getOfflineInvoiceType()
    } else {
      util.showModalMsg({
        content: '参数错误，请联系客服'
      })
    }
  }
  getOnlineInvoiceValue = () => {
    const _this = this
    let { order_number, invoiceValue } = _this.data
    util.request({
      url: constant.getOnlineInvoiceValue + '?number=' + order_number,
      method: 'GET',
      success: function(res) {
        // 如果可开立发票金额为0，直接返回订单列表
        if ((res.cash_pay_amount === 0) | (res.cash_pay_amount === '')) {
          util.showModalMsg({
            content: '您的可开立发票金额为0'
          })
          Taro.navigateBack({
            detla: 1
          })
        } else {
          _this.setData({
            invoiceValue: res.cash_pay_amount
          })
          _this.getOnlineInvoiceType()
        }
      }
    })
  }
  getOnlineInvoiceType = () => {
    const _this = this
    let { order_number, invoice_data, invoiceTypeOptions } = _this.data
    util.request({
      url: constant.getInvoiceType + '?order_num=' + order_number,
      method: 'GET',
      success: function(res) {
        console.log('res', res.length)
        if (res.length === 0) {
          Taro.showModal({
            title: '提示',
            content: `本单不可开立电子发票，如有疑问请致电${_this.data.service_phone}`,
            showCancel: false,
            confirmText: '返回',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                Taro.navigateBack({
                  delta: 1
                })
              }
            }
          })
          return
        }
        _this.setData({
          invoiceTypeOptions: _this.formatOnlineInvoiceTypeData(res)
        })
      }
    })
  }
  formatOnlineInvoiceTypeData = data => {
    let { invoiceValue } = this.data
    let newData = []
    data.map((item, index) => {
      let newItem = {}
      newItem.id = `${item.id}*${item.industry}`
      newItem.industry = item.industry
      newItem.title = `整单开${item.industry}：${invoiceValue}元`
      newData.push(newItem)
    })
    return newData
  }
  getOfflineInvoiceType = e => {
    const _this = this
    let {
      order_number,
      invoice_data,
      invoiceTypeOptions,
      invoiceValue
    } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 2000
    })
    util.request({
      url: `${constant.getInvoiceInfo}?billno=${order_number}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          _this.setData({
            invoice_data: res.data,
            invoiceValue: res.data.Invoiceamt,
            invoice_detail: _this.formatOfflineInvoiceDetailData(
              res.data.Items
            ),
            invoiceTypeOptions: _this.formatOfflineInvoiceTypeData(res.data)
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
          Taro.navigateBack({
            delta: 1
          })
        }
      }
    })
  }
  formatOfflineInvoiceDetailData = data => {
    let newData = []
    data.map((item, index) => {
      let newItem = {}
      newItem.invoiceamt = item.Invoiceamt
      newItem.itemname = item.Itemname
      newItem.itemno = item.Itemno
      newItem.payamt = item.Payamt
      newData.push(newItem)
    })
    return newData
  }
  formatOfflineInvoiceTypeData = data => {
    let title = ''
    data.Items.map((item, index) => {
      title += `${item.Itemname}${item.Invoiceamt}元 `
    })
    let newData = [
      {
        industry: '实买实开',
        id: '实买实开*实买实开',
        title: `实买实开：${title}`
      }
    ]
    data.Project.map((item, index) => {
      let newItem = {}
      newItem.id = `${item.Itemno}*${item.Itemname}`
      newItem.industry = item.Itemname
      newItem.title = `整单开${item.Itemname}：${data.Invoiceamt}元`
      newData.push(newItem)
    })
    return newData
  }
  handlerInvoiceTypeChange = e => {
    console.log('e', e)
    this.setData({
      invoiceTypeId: e.detail.value
    })
  }
  confirmInvoiceType = () => {
    const _this = this
    const {
      invoiceTypeId,
      invoiceType,
      invoiceValue,
      account_id,
      order_number
    } = _this.data
    if (invoiceTypeId === '') {
      Taro.showModal({
        title: '提示',
        content: '请选择发票类型',
        showCancel: false
      })
    } else {
      Taro.chooseInvoiceTitle({
        success: res => {
          // console.log(res);
          let invoice_title_info = {
            type: res.type,
            title: res.title,
            taxNumber: res.taxNumber,
            companyAddress: res.companyAddress,
            telephone: res.telephone,
            bankName: res.bankName,
            bankAccount: res.bankAccount
          }
          _this.setData({
            invoice_title_info,
            currentStep: 2,
            invoiceType: util.returnEndSubstr(invoiceTypeId, '*'),
            invoiceTypeTitle: _this.getInvoiceTypeTitle(invoiceTypeId)
          })
        },
        fail: err => {
          console.error(err)
        }
      })
    }
  }
  getInvoiceTypeTitle = invoiceTypeId => {
    let { invoiceTypeOptions } = this.data
    let invoiceTypeTitle = invoiceTypeOptions.map((item, index) => {
      if (item.id === invoiceTypeId) {
        return item.title
      }
    })
    return util.removeStringMark(invoiceTypeTitle.toString(), ',')
  }
  requestOnlineInvoice = () => {
    const _this = this
    let { invoice_title_info, order_number, invoiceTypeId } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    let data = {
      order_number: order_number, //# 订单号
      // buyer_id: util.removeStringMark(invoice_title_info.taxNumber," "), //# 纳税人识别号
      buyer_name: invoice_title_info.title, //# 发票抬头
      buyer_phone: invoice_title_info.telephone, //# 手机号
      source: 1, //# 来源：写死1
      buyer_bank_account: invoice_title_info.bankAccount, //# 开户行账号
      // buyer_bank_name: invoice_title_info.bankName, //# 开户行名称
      buyer_type:
        invoice_title_info.type == '0'
          ? 2
          : invoice_title_info.type == '1'
          ? 1
          : '', //# 发票类型： 1 个人 2 单位
      buyer_address: invoice_title_info.companyAddress, //# 购买方地址，电话
      invoice_id: util.returnStartSubstr(invoiceTypeId, '*') //# 发票类型：get请求获取
    }
    util.request({
      url: constant.requestOnlineInvoice,
      data: data,
      method: 'POST',
      success: function(res) {
        _this.turnToShortUrl(res.pdf_url)
      }
    })
  }
  requestOfflineInvoice = () => {
    const _this = this
    let {
      account_id,
      invoice_title_info,
      order_number,
      invoice_data,
      invoice_detail,
      phone,
      invoiceTypeId
    } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    let eInvoiceAppUserLogDetails = []
    if (invoiceTypeId === '实买实开*实买实开') {
      eInvoiceAppUserLogDetails = invoice_detail
    } else {
      eInvoiceAppUserLogDetails = [
        //发票明细项目
        {
          invoiceamt: invoice_data.Invoiceamt, //明细项开票金额，单位:元(2位小数)，必填
          itemname: util.returnEndSubstr(invoiceTypeId, '*'), //项目名称，长度90，必填
          itemno: util.returnStartSubstr(invoiceTypeId, '*'), //项目编码，长度19，必填
          payamt: invoice_data.Payamt //明细项原始售价，单位:元(2位小数)，必填
        }
      ]
    }
    util.request({
      url: constant.requestOfflineInvoice,
      data: {
        accountId: account_id, //会员账户id，非会员传0，必填
        title: invoice_title_info.title, //购买方名称，长度100，必填
        taxpayerIdentityNumber: util.removeStringMark(
          invoice_title_info.taxNumber,
          ' '
        ), //购买方纳税人识别号，长度20，非必填
        addressAndTel: invoice_title_info.companyAddress, //购买方地址、电话，长度100，非必填
        amt: invoice_data.Invoiceamt, //开票金额，单位:元(2位小数)，必填
        payamt: invoice_data.Payamt, //原始售价，单位:元(2位小数)，必填
        bankAccount:
          invoice_title_info.bankName + invoice_title_info.bankAccount, //购买方开户行及账号，长度100，非必填
        email: '', //购买方电子邮箱，长度100，电子邮箱与手机号至少填写其中一个
        mobile: phone, //购买方手机号，电子邮箱与手机号至少填写其中一个
        billno: order_number, //购物小票单号，长度15，必填
        buyertype:
          invoice_title_info.type == 0
            ? 2
            : invoice_title_info.type == 1
            ? 1
            : '', //开票人类型，（1个人，2单位），必填
        source: 1, //小票来源，1，必填
        eInvoiceAppUserLogDetails: eInvoiceAppUserLogDetails,
        // eInvoiceAppUserLogDetails: [ //发票明细项目
        //   {
        //     invoiceamt: "100.00", //明细项开票金额，单位:元(2位小数)，必填
        //     itemname: "服装", //项目名称，长度90，必填
        //     itemno: "1040201150000000000", //项目编码，长度19，必填
        //     payamt: "100.00" //明细项原始售价，单位:元(2位小数)，必填
        //   }
        // ],
        unionId: ''
      },
      method: 'POST',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          _this.turnToShortUrl(res.result.PDF_URL)
        } else {
          util.showModalError(res.errmsg)
        }
      }
    })
  }
  turnToShortUrl = url => {
    const _this = this
    util.request({
      url: constant.turnToShortUrl,
      data: {
        long_url: url
      },
      method: 'POST',
      success: function(res) {
        Taro.hideToast()
        _this.invoiceSucess(res.short_url)
      }
    })
  }
  invoiceSucess = invoice_url => {
    let { type, account_id } = this.data
    Taro.redirectTo({
      url: `/pages/usercenter/invoiceOpening/components/invoicedSucess/index?invoice_url=${invoice_url}&type=${type}&account_id=${account_id}`
    })
  }
  confirmToInvoice = e => {
    // 传递formId给后台
    util.postFormId(e.detail.formId, 'invoice_opening')
    const _this = this
    let { type, invoice_title_info, order_number, invoiceTypeId } = _this.data
    // console.log('invoice_title_info', invoice_title_info)
    // let data = {
    //   order_number: order_number, //# 订单号
    //   // buyer_id: util.removeStringMark(invoice_title_info.taxNumber," "), //# 纳税人识别号
    //   buyer_name: invoice_title_info.title, //# 发票抬头
    //   buyer_phone: invoice_title_info.telephone, //# 手机号
    //   source: 1, //# 来源：写死1
    //   buyer_bank_account: invoice_title_info.bankAccount, //# 开户行账号
    //   // buyer_bank_name: invoice_title_info.bankName, //# 开户行名称
    //   buyer_type: invoice_title_info.type === '0' ? 2 : (invoice_title_info.type === '1' ? 1 : ''), //# 发票类型： 1 个人 2 单位
    //   buyer_address: invoice_title_info.companyAddress, //# 购买方地址，电话
    //   invoice_id: invoiceTypeId, //# 发票类型：get请求获取
    // };
    Taro.showModal({
      title: '提示',
      content: '请确认所填信息无误，一经确认，发票信息不可更改！',
      success: res => {
        if (res.confirm) {
          if (type === 'online') {
            _this.requestOnlineInvoice()
          } else if (type === 'offline') {
            _this.requestOfflineInvoice()
          }
        }
      }
    })
  }
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const {
      invoiceTypeOptions: invoiceTypeOptions,
      invoiceTypeId: invoiceTypeId,
      currentStep: currentStep,
      invoiceType: invoiceType,
      invoiceValue: invoiceValue,
      invoiceTypeTitle: invoiceTypeTitle,
      invoice_title_info: invoice_title_info
    } = this.state
    return currentStep === 1 ? (
      <View>
        <View className="invoice-title">请选择发票类型</View>
        <View className="invoice-type">
          <View className="weui-cells weui-cells_after-title">
            <RadioGroup onChange={this.handlerInvoiceTypeChange}>
              {invoiceTypeOptions.map((item, index) => {
                return (
                  <Label
                    className="weui-cell weui-check__label"
                    key="value"
                    data-id={item.title}
                  >
                    <Checkbox className="weui-check" value={item.id}></Checkbox>
                    <View
                      className="weui-cell__hd weui-check__hd_in-checkbox"
                      style="line-height:30rpx;"
                    >
                      {invoiceTypeId != item.id && (
                        <Icon
                          className="weui-icon-checkbox_circle"
                          type="circle"
                          size="23"
                        ></Icon>
                      )}
                      {invoiceTypeId == item.id && (
                        <Icon
                          className="weui-icon-checkbox_success"
                          type="success"
                          size="23"
                          color="#e64340"
                        ></Icon>
                      )}
                    </View>
                    <View className="weui-cell__bd">{item.title}</View>
                  </Label>
                )
              })}
            </RadioGroup>
          </View>
        </View>
        <View className="weui-btn-area confirm-button">
          <Button
            className="weui-btn"
            type="warn"
            onClick={this.confirmInvoiceType}
          >
            下一步，选择发票抬头
          </Button>
        </View>
      </View>
    ) : (
      currentStep === 2 && (
        <View>
          <View className="invoice-title">请确认发票信息</View>
          <View className="invoice-info">
            <Form onSubmit={this.storageFormId} reportSubmit="true">
              <View className="page-section">
                <View className="weui-cells weui-cells_after-title">
                  <View className="weui-cell weui-cell_input">
                    <View className="weui-cell__hd">
                      <View className="weui-label">发票类型</View>
                    </View>
                    <View className="weui-cell__bd">{invoiceType}</View>
                  </View>
                  <View className="weui-cell weui-cell_input">
                    <View className="weui-cell__hd">
                      <View className="weui-label">可开立金额</View>
                    </View>
                    <View className="weui-cell__bd">{invoiceValue + '元'}</View>
                  </View>
                </View>
              </View>
              <View className="weui-cells__tips">{invoiceTypeTitle}</View>
            </Form>
          </View>
          <Form onSubmit={this.confirmToInvoice} reportSubmit="true">
            <View className="page-section">
              <View className="weui-cells weui-cells_after-title">
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">抬头类型</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.type !== ''
                      ? invoice_title_info.type == '0'
                        ? '单位'
                        : '个人'
                      : ''}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">抬头名称</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.title}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">抬头税号</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.taxNumber}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">单位地址</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.companyAddress}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">手机号码</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.telephone}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">银行名称</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.bankName}
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">银行账号</View>
                  </View>
                  <View className="weui-cell__bd">
                    {invoice_title_info.bankAccount}
                  </View>
                </View>
              </View>
            </View>
            <View className="weui-btn-area confirm-button">
              <Button className="weui-btn" type="warn" formType="submit">
                确认开立
              </Button>
            </View>
          </Form>
        </View>
      )
    )
  }
}

export default _C
