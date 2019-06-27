import constant from '../../config/constant.js'

const config = {
  data: {
    dialogService: {
      show: false,
      service: []
    },
    SERVICE_PHONE: constant.SERVICE_PHONE
  },

  /**
   * 初始化服务数据
   */
  initDialogService: function(service) {
    let dialogService = this.data.dialogService
    dialogService.service = service
    this.setData({
      dialogService: dialogService
    })
  },

  /**
   * 关闭弹框
   */
  handleCloseDialogService: function() {
    let dialogService = this.data.dialogService
    dialogService.show = false
    this.setData({
      dialogService: dialogService
    })
  },

  /**
   * 显示弹框
   */
  handleShowDialogService: function() {
    let dialogService = this.data.dialogService
    dialogService.show = true
    this.setData({
      dialogService: dialogService
    })
  }
}

export default config
