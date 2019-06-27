const swiper = {
  data: {
    swiper: {
      images: [
        // 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
        // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
        // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
      ],
      title: 'aaaaa',
      current: 1,
      length: 3
    }
  },
  swiperHandleChange: function(event) {
    const swiperData = this.data.swiper
    swiperData.current = event.detail.current + 1

    this.setData({
      swiper: swiperData
    })
  },
  /**
   * 初始化轮播图 - swiper
   */
  initSwiperImages: function(images) {
    let swiper = this.data.swiper
    swiper.images = images
    swiper.length = images.length
    swiper.current = 1
    this.setData({
      swiper: swiper
    })
  }
}

export default swiper
