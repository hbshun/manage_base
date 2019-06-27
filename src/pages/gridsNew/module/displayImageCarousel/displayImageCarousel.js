const displayImageCarousel = {
  data: {},

  /**
   * 轮播图改变
   */
  imageSwiperChange: function(e) {
    const rowIndex = e.currentTarget.dataset.rowIndex
    if (this.data.gridsRows[rowIndex]) {
      this.data.gridsRows[rowIndex].current = e.detail.current
      this.setData({
        gridsRows: this.data.gridsRows
      })
    }
  }
}

export default displayImageCarousel
