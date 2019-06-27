import {
  Block,
  View,
  RadioGroup,
  Label,
  Radio,
  Input,
  Picker,
  Button
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/fillInInvoiceInfo/index.js
import util from '../../../../../utils/util.js'
import constant from '../../../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    chosenValue: '2',
    invoice_title_list: [],
    invoice_title_index: 0,
    invoice_url: '发票地址信息',
    // 账户id
    account_id: '',
    // 发票类型
    invoiceTypeId: '',
    // 订单号
    order_id: '',
    invoice_info: {},
    title: '',
    tax_id: '',
    address: '',
    tel: '',
    bank_title: '',
    bank_account: '',
    invoice_type: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    console.log(options)
    this.setData({
      account_id: options.account_id,
      invoiceTypeId: options.invoiceTypeId,
      order_id: options.order_id
    })
    this.getInvoiceTitleList()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  radioChange = e => {
    this.setData({
      chosenValue: e.detail.value,
      title: '',
      tax_id: '',
      address: '',
      tel: '',
      bank_title: '',
      bank_account: '',
      invoice_type: ''
    })
  }
  getInvoiceTitleList = () => {
    const _this = this

    let { account_id, invoice_list } = _this.data

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: `${constant.getInvoiceTitleList}?accountid=${account_id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        console.log('res', res)
        if (res.success) {
          _this.setData({
            invoice_title_list: _this.formatData(res.data)
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  }
  formatData = data => {
    const newData = [
      {
        id: 0,
        title: '请选择'
      }
    ]
    data.map((item, index) => {
      let newDataItem = {}
      newDataItem.id = item.id
      newDataItem.title = item.title
      newData.push(newDataItem)
    })
    console.log('newData', newData)
    return newData
  }
  bindCountryChange = e => {
    console.log('eeeeeee', e)
    console.log('picker country 发生选择改变，携带值为', e.detail.value)
    this.getInvoiceTitleInfo(e.detail.value)
  }
  getInvoiceTitleInfo = id => {
    const _this = this

    let { invoice_info } = _this.data

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: `${constant.getInvoiceTitleInfo}?id=${id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        console.log('res', res)
        if (res.success) {
          let invoice_info = {
            account_id: res.data.accountid,
            address: res.data.address,
            bank_title: res.data.bankaccount,
            bank_account: res.data.bankno,
            id: res.data.id,
            invoice_type: res.data.invtype,
            openid: res.data.openid,
            tax_id: res.data.taxno,
            tel: res.data.tel,
            title: res.data.title,
            unionid: res.data.unionid
          }
          _this.setData({
            invoice_info
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  }
  invoiceTitleChange = e => {
    console.log(e)
    this.setData({
      title: e.detail.value
    })
  }
  invoiceTaxIDChange = e => {
    this.setData({
      tax_id: e.detail.value
    })
  }
  invoiceAddressChange = e => {
    this.setData({
      address: e.detail.value
    })
  }
  invoiceTelChange = e => {
    this.setData({
      tel: e.detail.value
    })
  }
  invoiceBankTitleChange = e => {
    this.setData({
      bank_title: e.detail.value
    })
  }
  invoiceBankAccountChange = e => {
    this.setData({
      bank_account: e.detail.value
    })
  }
  confirmToInvoice = () => {
    const _this = this
    const {
      order_id,
      invoiceTypeId,
      account_id,
      title,
      tax_id,
      address,
      tel,
      bank_title,
      bank_account
    } = _this.data

    // 发票抬头类型：1为单位，2为个人
    let invoice_type = tax_id === '' ? 1 : 2

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.requestInvoice,
      data: {
        order_number: order_id, // 订单号
        buyer_id: tax_id, // 纳税人识别号
        buyer_name: title, // 发票抬头名称
        buyer_phone: tel, // 联系电话
        source: 1, // 来源：写死1
        buyer_type: invoice_type, // 发票抬头类型： 1 个人 2 单位
        buyer_address: address, // 地址
        invoice_id: invoiceTypeId // 发票类型
      },
      method: 'POST',
      success: function(res) {
        _this.turnToShortUrl(res.pdf_url)
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
        _this.setData({
          invoice_url: res.short_url
        })
      }
    })
  }
  invoiceSucess = () => {
    const { invoice_url } = this.data
    Taro.redirectTo({
      url: `/pages/usercenter/invoiceOpening/components/invoicedSucess/index?invoice_url=${invoice_url}`
    })
  }
  redirectToInvoiceTitleManage = () => {
    Taro.chooseInvoiceTitle({
      success: res => {
        console.log(res)
        // this.setData({
        //   type: res.type,
        //   title: res.title,
        //   taxNumber: res.taxNumber,
        //   companyAddress: res.companyAddress,
        //   telephone: res.telephone,
        //   bankName: res.bankName,
        //   bankAccount: res.bankAccount
        // })
      },
      fail: err => {
        console.error(err)
      }
    })

    // const account_id = this.data.account_id;
    // wx.redirectTo({
    //   url: `/pages/usercenter/invoiceOpening/components/invoiceTitleManage/index?account_id${account_id}`,
    // })
  }
  config = {}

  render() {
    const {
      chosenValue: chosenValue,
      invoice_info: invoice_info,
      invoice_title_list: invoice_title_list,
      invoice_title_index: invoice_title_index,
      countryIndex: countryIndex,
      countries: countries
    } = this.state
    return (
      <Block>
        <View className="title-content">
          <View className="invoice-title">开立发票</View>
          <View
            className="invoice-rise-manage"
            onClick={this.redirectToInvoiceTitleManage}
          >
            开票信息管理
          </View>
        </View>
        <RadioGroup className="invoice-content" onChange={this.radioChange}>
          <Label>
            <Radio
              className="invoice-item"
              value="2"
              color="#e64340"
              checked={chosenValue == '2'}
            >
              单位
            </Radio>
          </Label>
          <Label>
            <Radio
              className="invoice-item"
              value="1"
              color="#e64340"
              checked={chosenValue == '1'}
            >
              个人
            </Radio>
          </Label>
        </RadioGroup>
        {/*  选择单位  */}
        {chosenValue == 2 ? (
          <View>
            <View className="weui-cells weui-cells_after-title">
              <View className="weui-cell weui-cell_input weui-cell_vcode">
                <View className="weui-cell__hd">
                  <View className="weui-label">抬头</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入抬头名称（必填）"
                    value={invoice_info.title}
                    onInput={this.invoiceTitleChange}
                  ></Input>
                </View>
                <View className="weui-cell__ft">
                  <Picker
                    onChange={this.bindCountryChange}
                    value={invoice_title_list[invoice_title_index].id}
                    range={invoice_title_list}
                  >
                    <View className="weui-select weui-select_in-select-after">
                      选择已有
                    </View>
                  </Picker>
                </View>
              </View>
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">税号</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入纳税人识别号（必填）"
                    value={invoice_info.tax_id}
                    onInput={this.invoiceTaxIDChange}
                  ></Input>
                </View>
              </View>
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">地址</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入公司地址"
                    value={invoice_info.address}
                    onInput={this.invoiceAddressChange}
                  ></Input>
                </View>
              </View>
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">电话号码</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入联系电话"
                    value={invoice_info.tel}
                    onInput={this.invoiceTelChange}
                  ></Input>
                </View>
              </View>
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">开户银行</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入开户银行名称"
                    value={invoice_info.bank_title}
                    onInput={this.invoiceBankTitleChange}
                  ></Input>
                </View>
              </View>
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">银行账号</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    placeholder="填入银行账号"
                    value={invoice_info.bank_account}
                    onInput={this.invoiceBankAccountChange}
                  ></Input>
                </View>
              </View>
            </View>
            <View className="weui-btn-area button">
              <Button
                className="weui-btn"
                type="warn"
                onClick={this.confirmToInvoice}
              >
                确认开票
              </Button>
            </View>
          </View>
        ) : (
          chosenValue == 1 && (
            <View>
              <View className="weui-cells weui-cells_after-title">
                <View className="weui-cell weui-cell_input weui-cell_vcode">
                  <View className="weui-cell__hd">
                    <View className="weui-label">抬头</View>
                  </View>
                  <View className="weui-cell__bd">
                    <Input
                      className="weui-input"
                      placeholder="填入抬头名称（必填）"
                      value={invoice_info.title}
                      onInput={this.invoiceTitleChange}
                    ></Input>
                  </View>
                  <View className="weui-cell__ft">
                    <Picker
                      onChange={this.bindCountryChange}
                      value={countryIndex}
                      range={countries}
                    >
                      <View className="weui-select weui-select_in-select-after">
                        {countries[countryIndex]}
                      </View>
                    </Picker>
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">地址</View>
                  </View>
                  <View className="weui-cell__bd">
                    <Input
                      className="weui-input"
                      placeholder="填入地址"
                      value={invoice_info.address}
                      onInput={this.invoiceAddressChange}
                    ></Input>
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">电话号码</View>
                  </View>
                  <View className="weui-cell__bd">
                    <Input
                      className="weui-input"
                      placeholder="填入联系电话"
                      value={invoice_info.tel}
                      onInput={this.invoiceTelChange}
                    ></Input>
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">开户银行</View>
                  </View>
                  <View className="weui-cell__bd">
                    <Input
                      className="weui-input"
                      placeholder="填入开户银行"
                      value={invoice_info.bank_title}
                      onInput={this.invoiceBankTitleChange}
                    ></Input>
                  </View>
                </View>
                <View className="weui-cell weui-cell_input">
                  <View className="weui-cell__hd">
                    <View className="weui-label">银行账号</View>
                  </View>
                  <View className="weui-cell__bd">
                    <Input
                      className="weui-input"
                      placeholder="填入银行账号"
                      value={invoice_info.bank_account}
                      onInput={this.invoiceBankAccountChange}
                    ></Input>
                  </View>
                </View>
              </View>
              <View className="weui-btn-area button">
                <Button
                  className="weui-btn"
                  type="warn"
                  onClick={this.confirmToInvoice}
                >
                  确认开票
                </Button>
              </View>
            </View>
          )
        )}
        {/*  选择个人  */}
      </Block>
    )
  }
}

export default _C
