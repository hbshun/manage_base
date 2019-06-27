import Taro from '@tarojs/taro'
import QR from './util/qrcode.js'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'

const QRcode = {
  data: {
    canvasHidden: false,
    imagePath: '',
    placeholder: '', //默认二维码生成文本
    showQRCode: false,
    QRpickupInfo: {
      location: '',
      brand: '专柜'
    }, //二维码提货地址信息
    QRcodeId: 0 // 二维码id
  },

  /**
   * 点击查看二维码显示弹框
   */
  openQRCodePickupPopup: function(e) {
    const orderId = e.currentTarget.dataset.id
    const size = this.setCanvasSize() //动态设置画布大小
    var that = this

    Taro.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 2000,
      mask: true
    })

    this.getShopLocation(orderId)
    this.getQRcode(orderId, size)

    this.setData({
      showQRCode: true,
      imagePath: '',
      QRpickupInfo: {}
    })
  },

  /**
   * 获得专柜地址
   */
  getShopLocation: function(id) {
    const _this = this
    const data = {
      order_id: id
    }
    let pickupInfo = {}

    util.requestLoginUrl({
      url: constant.getScreenShopInfo,
      method: 'POST',
      data: data,
      success: function(res) {
        if (res) {
          pickupInfo.location =
            '汉光百货 ' + res.floor.name + ' ' + res.location
          pickupInfo.brand = res.name + ' 专柜'
          _this.setData({
            QRpickupInfo: pickupInfo
          })
        }
      }
    })
  },

  /**
   * 获得二维码
   */
  getQRcode: function(id, size) {
    const _this = this
    const data = {
      order_id: id
    }

    util.requestLoginUrl({
      url: constant.getQRcodeInfo,
      method: 'POST',
      data: data,
      success: function(res) {
        if (res) {
          const placeholder =
            'https://sparrow.hanguangbaihuo.com/wx-app-pickup/screen?order_info=' +
            res.qrcode_content
          Taro.hideToast()
          //绘制二维码
          _this.createQrCode(placeholder, 'mycanvas', size.w, size.h)
        }
      }
    })
  },

  /**
   * 点击关闭二维码显示弹框
   */
  closeQRCodePickupPopup: function() {
    this.setData({
      showQRCode: false
    })
  },

  //适配不同屏幕大小的canvas
  setCanvasSize: function() {
    var size = {}
    try {
      var res = Taro.getSystemInfoSync()
      //不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = 1.6304347826086956
      var width = res.windowWidth / scale
      var height = width //canvas画布为正方形
      size.w = width
      size.h = height
    } catch (e) {
      // Do something when catch error
      console.log('获取设备信息失败' + e)
    }
    return size
  },

  createQrCode: function(url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH)
    setTimeout(() => {
      this.canvasToTempImage()
    }, 1000)
  },

  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function() {
    var that = this
    Taro.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(res) {
        var tempFilePath = res.tempFilePath
        that.setData({
          imagePath: tempFilePath
          // canvasHidden:true
        })
      },
      fail: function(res) {
        console.log(res)
      }
    })
  }

  //点击图片进行预览，长按保存分享图片
  // previewImg: function (e) {
  //   var img = this.data.imagePath;
  //   console.log(img);
  //   wx.previewImage({
  //     current: img, // 当前显示图片的http链接
  //     urls: [img] // 需要预览的图片http链接列表
  //   })
  // },

  // formSubmit: function (e) {
  //   var that = this;
  //   var url = e.detail.value.url;

  //   wx.showToast({
  //     title: '生成中...',
  //     icon: 'loading',
  //     duration: 2000,
  //     mask: true
  //   });

  //   var st = setTimeout(function () {
  //     wx.hideToast()
  //     var size = that.setCanvasSize();
  //     //绘制二维码
  //     that.createQrCode(url, "mycanvas", size.w, size.h);

  //     clearTimeout(st);
  //   }, 2000)

  // }
}

export default QRcode
